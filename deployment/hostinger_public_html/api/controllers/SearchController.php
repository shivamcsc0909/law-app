<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class SearchController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Unified Global Search across Platform Entities
     */
    public function globalSearch(): void {
        $q = trim($_GET['q'] ?? '');
        if (empty($q)) {
            Response::success('Empty search query', [
                'lawyers' => [],
                'firms' => [],
                'jobs' => [],
                'posts' => [],
                'questions' => []
            ]);
            return;
        }

        $term = "%$q%";

        // 1. Lawyers & Professionals
        $stmt = $this->db->prepare("
            SELECT u.id, u.role, p.full_name, p.avatar_url, p.headline, p.city, p.state, p.experience_years,
                   pp.professional_type, pp.primary_court, pp.bar_council_number, pp.verified_badge
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE u.is_active = 1 AND (LOWER(p.full_name) LIKE LOWER(?) OR LOWER(p.headline) LIKE LOWER(?) OR LOWER(pp.primary_court) LIKE LOWER(?))
            LIMIT 10
        ");
        $stmt->execute([$term, $term, $term]);
        $lawyers = $stmt->fetchAll();

        // 2. Law Firms & Organizations
        $stmt = $this->db->prepare("
            SELECT id, name, slug, org_type, logo_url, city, state, team_size, is_verified
            FROM organizations
            WHERE LOWER(name) LIKE LOWER(?) OR LOWER(about) LIKE LOWER(?)
            LIMIT 5
        ");
        $stmt->execute([$term, $term]);
        $firms = $stmt->fetchAll();

        // 3. Jobs & Internships
        $stmt = $this->db->prepare("
            SELECT id, title, job_type, city, state, stipend_salary, experience_level
            FROM jobs
            WHERE status = 'open' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))
            LIMIT 10
        ");
        $stmt->execute([$term, $term]);
        $jobs = $stmt->fetchAll();

        // 4. Posts & Legal Knowledge Articles
        $stmt = $this->db->prepare("
            SELECT p.id, p.content_type, p.title, p.body, p.category, p.created_at, pr.full_name as author_name
            FROM posts p
            JOIN profiles pr ON p.user_id = pr.user_id
            WHERE p.visibility = 'public' AND (LOWER(p.title) LIKE LOWER(?) OR LOWER(p.body) LIKE LOWER(?))
            LIMIT 10
        ");
        $stmt->execute([$term, $term]);
        $posts = $stmt->fetchAll();

        // 5. Legal Community Questions
        $stmt = $this->db->prepare("
            SELECT q.id, q.title, q.details, q.answers_count, lc.name as category_name
            FROM legal_qa_questions q
            LEFT JOIN legal_categories lc ON q.category_id = lc.id
            WHERE LOWER(q.title) LIKE LOWER(?) OR LOWER(q.details) LIKE LOWER(?)
            LIMIT 10
        ");
        $stmt->execute([$term, $term]);
        $questions = $stmt->fetchAll();

        Response::success('Search results retrieved', [
            'query' => $q,
            'lawyers' => $lawyers,
            'firms' => $firms,
            'jobs' => $jobs,
            'posts' => $posts,
            'questions' => $questions
        ]);
    }
}
