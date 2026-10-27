<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class CaseController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Get Cases for Current User (Client or Lawyer)
     */
    public function getCases(array $authUser): void {
        $userId = $authUser['id'];

        $stmt = $this->db->prepare("
            SELECT c.*, 
                   pa.name as practice_area_name,
                   cp.full_name as client_name, cp.avatar_url as client_avatar,
                   lp.full_name as lawyer_name, lp.avatar_url as lawyer_avatar,
                   lpp.primary_court as lawyer_court, lpp.bar_council_number
            FROM cases c
            LEFT JOIN practice_areas pa ON c.practice_area_id = pa.id
            JOIN profiles cp ON c.client_id = cp.user_id
            JOIN profiles lp ON c.lawyer_id = lp.user_id
            LEFT JOIN professional_profiles lpp ON c.lawyer_id = lpp.user_id
            WHERE c.client_id = ? OR c.lawyer_id = ?
            ORDER BY c.updated_at DESC
        ");
        $stmt->execute([$userId, $userId]);
        $cases = $stmt->fetchAll();

        // Attach next hearing date
        foreach ($cases as &$c) {
            $stmt = $this->db->prepare("
                SELECT hearing_date, purpose, notes 
                FROM case_hearings 
                WHERE case_id = ? AND hearing_date >= CURRENT_TIMESTAMP 
                ORDER BY hearing_date ASC LIMIT 1
            ");
            $stmt->execute([$c['id']]);
            $c['next_hearing'] = $stmt->fetch() ?: null;
        }

        Response::success('Cases retrieved', $cases);
    }

    /**
     * Get Detailed Case Workspace (Overview, Hearings, Tasks, Documents)
     */
    public function getCaseDetail(array $authUser, int $caseId): void {
        $userId = $authUser['id'];

        $stmt = $this->db->prepare("
            SELECT c.*, 
                   pa.name as practice_area_name,
                   cp.full_name as client_name, cp.avatar_url as client_avatar, cp.city as client_city,
                   lp.full_name as lawyer_name, lp.avatar_url as lawyer_avatar,
                   lpp.primary_court as lawyer_court, lpp.bar_council_number
            FROM cases c
            LEFT JOIN practice_areas pa ON c.practice_area_id = pa.id
            JOIN profiles cp ON c.client_id = cp.user_id
            JOIN profiles lp ON c.lawyer_id = lp.user_id
            LEFT JOIN professional_profiles lpp ON c.lawyer_id = lpp.user_id
            WHERE c.id = ? AND (c.client_id = ? OR c.lawyer_id = ?)
        ");
        $stmt->execute([$caseId, $userId, $userId]);
        $case = $stmt->fetch();

        if (!$case) {
            Response::notFound('Case not found or unauthorized');
            return;
        }

        // Hearings
        $stmt = $this->db->prepare("SELECT * FROM case_hearings WHERE case_id = ? ORDER BY hearing_date ASC");
        $stmt->execute([$caseId]);
        $case['hearings'] = $stmt->fetchAll();

        // Tasks
        $stmt = $this->db->prepare("SELECT * FROM case_tasks WHERE case_id = ? ORDER BY due_date ASC");
        $stmt->execute([$caseId]);
        $case['tasks'] = $stmt->fetchAll();

        // Documents
        $stmt = $this->db->prepare("SELECT * FROM case_documents WHERE case_id = ? ORDER BY created_at DESC");
        $stmt->execute([$caseId]);
        $case['documents'] = $stmt->fetchAll();

        Response::success('Case workspace retrieved', $case);
    }

    /**
     * Add Hearing to Case
     */
    public function addHearing(array $authUser, int $caseId): void {
        $body = Validator::getJsonBody();
        $hearingDate = $body['hearing_date'] ?? null;
        $purpose = Validator::sanitize($body['purpose'] ?? '');
        $notes = Validator::sanitize($body['notes'] ?? '');

        if (!$hearingDate || empty($purpose)) {
            Response::error('Hearing date and purpose are required.');
            return;
        }

        $stmt = $this->db->prepare("INSERT INTO case_hearings (case_id, hearing_date, purpose, notes) VALUES (?, ?, ?, ?)");
        $stmt->execute([$caseId, $hearingDate, $purpose, $notes]);

        Response::success('Hearing scheduled', ['hearing_id' => $this->db->lastInsertId()], 201);
    }

    /**
     * Add Task to Case
     */
    public function addTask(array $authUser, int $caseId): void {
        $body = Validator::getJsonBody();
        $title = Validator::sanitize($body['title'] ?? '');
        $dueDate = $body['due_date'] ?? null;
        $assignedTo = !empty($body['assigned_to']) ? (int) $body['assigned_to'] : $authUser['id'];

        if (empty($title)) {
            Response::error('Task title is required.');
            return;
        }

        $stmt = $this->db->prepare("INSERT INTO case_tasks (case_id, assigned_to, title, due_date, status) VALUES (?, ?, ?, ?, 'pending')");
        $stmt->execute([$caseId, $assignedTo, $title, $dueDate]);

        Response::success('Task created', ['task_id' => $this->db->lastInsertId()], 201);
    }
}
