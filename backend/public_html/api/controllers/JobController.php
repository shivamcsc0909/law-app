<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class JobController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Get Jobs & Internships with filters
     */
    public function getJobs(): void {
        $jobType = $_GET['type'] ?? null; // 'job', 'internship', 'chamber_association'
        $city = $_GET['city'] ?? null;
        $practiceAreaId = isset($_GET['practice_area_id']) ? (int) $_GET['practice_area_id'] : null;
        $search = $_GET['q'] ?? null;

        $sql = "
            SELECT j.*, 
                   pa.name as practice_area_name,
                   o.name as org_name, o.logo_url as org_logo,
                   pr.full_name as poster_name, pr.avatar_url as poster_avatar
            FROM jobs j
            LEFT JOIN practice_areas pa ON j.practice_area_id = pa.id
            LEFT JOIN organizations o ON j.org_id = o.id
            JOIN users u ON j.poster_id = u.id
            JOIN profiles pr ON u.id = pr.user_id
            WHERE j.status = 'open'
        ";
        $params = [];

        if ($jobType) {
            $sql .= " AND j.job_type = ?";
            $params[] = $jobType;
        }

        if ($city) {
            $sql .= " AND LOWER(j.city) LIKE LOWER(?)";
            $params[] = "%$city%";
        }

        if ($practiceAreaId) {
            $sql .= " AND j.practice_area_id = ?";
            $params[] = $practiceAreaId;
        }

        if ($search) {
            $sql .= " AND (LOWER(j.title) LIKE LOWER(?) OR LOWER(j.description) LIKE LOWER(?))";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $sql .= " ORDER BY j.created_at DESC LIMIT 30";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        Response::success('Jobs fetched', $stmt->fetchAll());
    }

    /**
     * Post a Job or Internship vacancy
     */
    public function createJob(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $title = Validator::sanitize($body['title'] ?? '');
        $jobType = $body['job_type'] ?? 'job';
        $practiceAreaId = !empty($body['practice_area_id']) ? (int) $body['practice_area_id'] : null;
        $city = Validator::sanitize($body['city'] ?? 'New Delhi');
        $state = Validator::sanitize($body['state'] ?? 'Delhi');
        $isRemote = !empty($body['is_remote']) ? 1 : 0;
        $expLevel = Validator::sanitize($body['experience_level'] ?? '0-2 years');
        $stipendSalary = Validator::sanitize($body['stipend_salary'] ?? '');
        $description = Validator::sanitize($body['description'] ?? '');
        $requirements = Validator::sanitize($body['requirements'] ?? '');
        $orgId = !empty($body['org_id']) ? (int) $body['org_id'] : null;

        if (empty($title) || empty($description)) {
            Response::error('Title and description are required.');
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO jobs (poster_id, org_id, job_type, title, practice_area_id, city, state, is_remote, experience_level, stipend_salary, description, requirements)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $orgId, $jobType, $title, $practiceAreaId, $city, $state, $isRemote, $expLevel, $stipendSalary, $description, $requirements]);
        $jobId = (int) $this->db->lastInsertId();

        Response::success('Job vacancy published', ['job_id' => $jobId], 201);
    }

    /**
     * Apply for a Job / Internship
     */
    public function applyJob(array $authUser, int $jobId): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];
        $cvUrl = $body['cv_url'] ?? null;
        $coverLetter = Validator::sanitize($body['cover_letter'] ?? '');

        $stmt = $this->db->prepare("SELECT id FROM job_applications WHERE job_id = ? AND applicant_id = ?");
        $stmt->execute([$jobId, $userId]);
        if ($stmt->fetch()) {
            Response::error('You have already applied for this position.');
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO job_applications (job_id, applicant_id, cv_url, cover_letter, status)
            VALUES (?, ?, ?, ?, 'applied')
        ");
        $stmt->execute([$jobId, $userId, $cvUrl, $coverLetter]);
        $appId = (int) $this->db->lastInsertId();

        $this->db->prepare("UPDATE jobs SET applications_count = applications_count + 1 WHERE id = ?")->execute([$jobId]);

        Response::success('Application submitted successfully', ['application_id' => $appId], 201);
    }

    /**
     * Get Requirements Marketplace listings
     */
    public function getRequirements(): void {
        $reqType = $_GET['type'] ?? null;
        $city = $_GET['city'] ?? null;

        $sql = "
            SELECT r.*, 
                   pr.full_name as poster_name, pr.avatar_url as poster_avatar, pr.headline as poster_headline,
                   pp.verified_badge as is_poster_verified, pp.professional_type as poster_role
            FROM requirements r
            JOIN users u ON r.user_id = u.id
            JOIN profiles pr ON u.id = pr.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE r.status = 'open'
        ";
        $params = [];

        if ($reqType) {
            $sql .= " AND r.req_type = ?";
            $params[] = $reqType;
        }

        if ($city) {
            $sql .= " AND LOWER(r.city) LIKE LOWER(?)";
            $params[] = "%$city%";
        }

        $sql .= " ORDER BY r.created_at DESC LIMIT 30";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        Response::success('Requirements fetched', $stmt->fetchAll());
    }

    /**
     * Create Requirement
     */
    public function createRequirement(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $reqType = $body['req_type'] ?? 'client_lawyer';
        $title = Validator::sanitize($body['title'] ?? '');
        $description = Validator::sanitize($body['description'] ?? '');
        $city = Validator::sanitize($body['city'] ?? '');
        $state = Validator::sanitize($body['state'] ?? '');
        $budget = Validator::sanitize($body['budget'] ?? '');
        $urgency = $body['urgency'] ?? 'normal';

        if (empty($title) || empty($description)) {
            Response::error('Title and description are required.');
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO requirements (user_id, req_type, title, description, city, state, budget, urgency)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $reqType, $title, $description, $city, $state, $budget, $urgency]);

        Response::success('Requirement posted to marketplace', ['requirement_id' => $this->db->lastInsertId()], 201);
    }
}
