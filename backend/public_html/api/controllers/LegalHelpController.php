<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class LegalHelpController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Get All Legal Problem & Knowledge Categories
     */
    public function getCategories(): void {
        $stmt = $this->db->query("SELECT * FROM legal_categories ORDER BY id ASC");
        Response::success('Legal categories fetched', $stmt->fetchAll());
    }

    /**
     * Post a Public/Confidential Legal Problem
     */
    public function postProblem(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $categoryId = !empty($body['category_id']) ? (int) $body['category_id'] : null;
        $title = Validator::sanitize($body['title'] ?? '');
        $description = Validator::sanitize($body['description'] ?? '');
        $city = Validator::sanitize($body['city'] ?? '');
        $state = Validator::sanitize($body['state'] ?? '');
        $urgency = $body['urgency'] ?? 'normal';
        $visibility = $body['visibility'] ?? 'professionals_only';

        if (empty($title) || empty($description)) {
            Response::error('Title and Problem Description are required.');
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO legal_problems (user_id, category_id, title, description, city, state, urgency, visibility)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $categoryId, $title, $description, $city, $state, $urgency, $visibility]);
        $problemId = (int) $this->db->lastInsertId();

        Response::success('Legal problem posted successfully. Matched advocates in your area will review your request.', [
            'problem_id' => $problemId,
            'disclaimer' => 'NyayaSetu provides legal information and connectivity to verified advocates. This platform does not provide automated legal representation.'
        ], 201);
    }

    /**
     * Get Legal Q&A Feed / Questions
     */
    public function getQuestions(): void {
        $categoryId = isset($_GET['category_id']) ? (int) $_GET['category_id'] : null;
        $search = isset($_GET['q']) ? trim($_GET['q']) : null;

        $sql = "
            SELECT q.*, 
                   lc.name as category_name, lc.hindi_name as category_hindi,
                   pr.full_name as asker_name, pr.avatar_url as asker_avatar
            FROM legal_qa_questions q
            LEFT JOIN legal_categories lc ON q.category_id = lc.id
            JOIN users u ON q.user_id = u.id
            JOIN profiles pr ON u.id = pr.user_id
            WHERE 1=1
        ";
        $params = [];

        if ($categoryId) {
            $sql .= " AND q.category_id = ?";
            $params[] = $categoryId;
        }

        if ($search) {
            $sql .= " AND (LOWER(q.title) LIKE LOWER(?) OR LOWER(q.details) LIKE LOWER(?))";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $sql .= " ORDER BY q.created_at DESC LIMIT 30";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $questions = $stmt->fetchAll();

        // Mask names for anonymous questions
        foreach ($questions as &$q) {
            if ($q['is_anonymous']) {
                $q['asker_name'] = 'Anonymous Citizen';
                $q['asker_avatar'] = null;
            }
        }

        Response::success('Questions fetched', $questions);
    }

    /**
     * Ask a Legal Community Question
     */
    public function askQuestion(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $categoryId = !empty($body['category_id']) ? (int) $body['category_id'] : null;
        $title = Validator::sanitize($body['title'] ?? '');
        $details = Validator::sanitize($body['details'] ?? '');
        $isAnonymous = !empty($body['is_anonymous']) ? 1 : 0;

        if (empty($title) || empty($details)) {
            Response::error('Question title and details are required.');
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO legal_qa_questions (user_id, category_id, title, details, is_anonymous)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $categoryId, $title, $details, $isAnonymous]);
        $questionId = (int) $this->db->lastInsertId();

        Response::success('Question published to the legal community.', ['question_id' => $questionId], 201);
    }

    /**
     * Get Question Details with Verified Advocate Answers
     */
    public function getQuestionDetail(int $questionId): void {
        $stmt = $this->db->prepare("
            SELECT q.*, lc.name as category_name, lc.hindi_name as category_hindi,
                   pr.full_name as asker_name, pr.avatar_url as asker_avatar
            FROM legal_qa_questions q
            LEFT JOIN legal_categories lc ON q.category_id = lc.id
            JOIN users u ON q.user_id = u.id
            JOIN profiles pr ON u.id = pr.user_id
            WHERE q.id = ?
        ");
        $stmt->execute([$questionId]);
        $question = $stmt->fetch();

        if (!$question) {
            Response::notFound('Question not found');
            return;
        }

        if ($question['is_anonymous']) {
            $question['asker_name'] = 'Anonymous Citizen';
            $question['asker_avatar'] = null;
        }

        // Fetch Answers
        $stmt = $this->db->prepare("
            SELECT a.*, 
                   pr.full_name as author_name, pr.avatar_url as author_avatar, pr.headline as author_headline,
                   pp.verified_badge as is_author_verified, pp.primary_court as author_court, pp.professional_type
            FROM legal_qa_answers a
            JOIN users u ON a.user_id = u.id
            JOIN profiles pr ON u.id = pr.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE a.question_id = ?
            ORDER BY a.is_advocate_response DESC, a.upvotes_count DESC, a.created_at ASC
        ");
        $stmt->execute([$questionId]);
        $question['answers'] = $stmt->fetchAll();

        Response::success('Question detail fetched', $question);
    }

    /**
     * Answer a Question (Distinguishes Verified Advocate Answers)
     */
    public function answerQuestion(array $authUser, int $questionId): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];
        $answerText = Validator::sanitize($body['answer_text'] ?? '');

        if (empty($answerText)) {
            Response::error('Answer text cannot be empty');
            return;
        }

        $isAdvocate = in_array($authUser['role'] ?? '', ['advocate', 'senior_advocate', 'junior_lawyer']) ? 1 : 0;

        $stmt = $this->db->prepare("
            INSERT INTO legal_qa_answers (question_id, user_id, answer_text, is_advocate_response)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$questionId, $userId, $answerText, $isAdvocate]);
        $answerId = (int) $this->db->lastInsertId();

        $this->db->prepare("UPDATE legal_qa_questions SET answers_count = answers_count + 1 WHERE id = ?")->execute([$questionId]);

        Response::success('Answer posted successfully', ['answer_id' => $answerId], 201);
    }
}
