<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class ProfessionalController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Lawyer / Professional Discovery Search with filters
     */
    public function discover(): void {
        $practiceAreaId = isset($_GET['practice_area_id']) ? (int) $_GET['practice_area_id'] : null;
        $city = isset($_GET['city']) ? trim($_GET['city']) : null;
        $state = isset($_GET['state']) ? trim($_GET['state']) : null;
        $court = isset($_GET['court']) ? trim($_GET['court']) : null;
        $profType = isset($_GET['type']) ? trim($_GET['type']) : null;
        $search = isset($_GET['q']) ? trim($_GET['q']) : null;
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = min(50, (int) ($_GET['limit'] ?? 15));
        $offset = ($page - 1) * $limit;

        $sql = "
            SELECT u.id, u.uuid, u.role,
                   p.full_name, p.avatar_url, p.cover_url, p.headline, p.bio, p.city, p.state, p.experience_years, p.languages,
                   pp.professional_type, pp.bar_council_number, pp.bar_council_state, pp.enrollment_year, pp.primary_court, pp.practice_courts, pp.consultation_mode, pp.consultation_fee_min, pp.consultation_fee_max, pp.verification_status, pp.verified_badge
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE u.is_active = 1
        ";
        $params = [];

        if ($profType) {
            $sql .= " AND pp.professional_type = ?";
            $params[] = $profType;
        }

        if ($city) {
            $sql .= " AND LOWER(p.city) LIKE LOWER(?)";
            $params[] = "%$city%";
        }

        if ($state) {
            $sql .= " AND LOWER(p.state) LIKE LOWER(?)";
            $params[] = "%$state%";
        }

        if ($court) {
            $sql .= " AND (LOWER(pp.primary_court) LIKE LOWER(?) OR LOWER(pp.practice_courts) LIKE LOWER(?))";
            $params[] = "%$court%";
            $params[] = "%$court%";
        }

        if ($search) {
            $sql .= " AND (LOWER(p.full_name) LIKE LOWER(?) OR LOWER(p.headline) LIKE LOWER(?) OR LOWER(p.bio) LIKE LOWER(?))";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        if ($practiceAreaId) {
            $sql .= " AND u.id IN (SELECT user_id FROM user_practice_areas WHERE practice_area_id = ?)";
            $params[] = $practiceAreaId;
        }

        $sql .= " ORDER BY pp.verified_badge DESC, p.experience_years DESC LIMIT $limit OFFSET $offset";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $lawyers = $stmt->fetchAll();

        // Attach practice areas for each lawyer
        foreach ($lawyers as &$lawyer) {
            $stmt = $this->db->prepare("
                SELECT pa.id, pa.name, pa.hindi_name, pa.slug, upa.is_primary
                FROM user_practice_areas upa
                JOIN practice_areas pa ON upa.practice_area_id = pa.id
                WHERE upa.user_id = ?
            ");
            $stmt->execute([$lawyer['id']]);
            $lawyer['practice_areas'] = $stmt->fetchAll();
        }

        Response::success('Professionals fetched', [
            'professionals' => $lawyers,
            'page' => $page,
            'limit' => $limit
        ]);
    }

    /**
     * Get All Practice Areas
     */
    public function getPracticeAreas(): void {
        $stmt = $this->db->query("SELECT * FROM practice_areas ORDER BY id ASC");
        Response::success('Practice areas fetched', $stmt->fetchAll());
    }

    /**
     * Submit Professional Verification Request (Bar Certificate & Enrollment details)
     */
    public function submitVerification(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $enrollmentNumber = Validator::sanitize($body['enrollment_number'] ?? '');
        $barState = Validator::sanitize($body['bar_state'] ?? '');
        $idProofUrl = $body['id_proof_url'] ?? null;
        $barCertUrl = $body['bar_council_cert_url'] ?? null;

        if (empty($enrollmentNumber) || empty($barState)) {
            Response::error('Bar enrollment number and state are required.');
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO lawyer_verification_requests (user_id, enrollment_number, bar_state, id_proof_url, bar_council_cert_url, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([$userId, $enrollmentNumber, $barState, $idProofUrl, $barCertUrl]);

        // Update professional_profiles status
        $stmt = $this->db->prepare("
            UPDATE professional_profiles 
            SET verification_status = 'pending', bar_council_number = ?, bar_council_state = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ");
        $stmt->execute([$enrollmentNumber, $barState, $userId]);

        Response::success('Verification request submitted for admin review.');
    }
}
