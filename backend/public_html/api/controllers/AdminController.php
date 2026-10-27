<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class AdminController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Platform Dashboard Statistics
     */
    public function getDashboardMetrics(): void {
        $stats = [];

        $stats['total_users'] = (int) $this->db->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $stats['total_lawyers'] = (int) $this->db->query("SELECT COUNT(*) FROM professional_profiles WHERE professional_type IN ('advocate', 'senior_advocate', 'junior_lawyer')")->fetchColumn();
        $stats['verified_lawyers'] = (int) $this->db->query("SELECT COUNT(*) FROM professional_profiles WHERE verified_badge = 1")->fetchColumn();
        $stats['pending_verifications'] = (int) $this->db->query("SELECT COUNT(*) FROM lawyer_verification_requests WHERE status = 'pending'")->fetchColumn();
        $stats['total_posts'] = (int) $this->db->query("SELECT COUNT(*) FROM posts")->fetchColumn();
        $stats['total_jobs'] = (int) $this->db->query("SELECT COUNT(*) FROM jobs WHERE status = 'open'")->fetchColumn();
        $stats['total_cases'] = (int) $this->db->query("SELECT COUNT(*) FROM cases")->fetchColumn();
        $stats['pending_reports'] = (int) $this->db->query("SELECT COUNT(*) FROM reports WHERE status = 'pending'")->fetchColumn();

        // Recent verification requests
        $stmt = $this->db->query("
            SELECT vr.*, p.full_name, p.avatar_url, p.city, p.state, u.primary_email, u.primary_phone
            FROM lawyer_verification_requests vr
            JOIN users u ON vr.user_id = u.id
            JOIN profiles p ON u.id = p.user_id
            WHERE vr.status = 'pending'
            ORDER BY vr.created_at DESC LIMIT 5
        ");
        $stats['recent_verification_queue'] = $stmt->fetchAll();

        // Recent user registrations
        $stmt = $this->db->query("
            SELECT u.id, u.uuid, u.primary_email, u.primary_phone, u.role, u.is_active, u.created_at,
                   p.full_name, p.city, p.state
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            ORDER BY u.created_at DESC LIMIT 6
        ");
        $stats['recent_users'] = $stmt->fetchAll();

        Response::success('Dashboard metrics retrieved', $stats);
    }

    /**
     * Get All Verification Requests
     */
    public function getVerificationRequests(): void {
        $status = $_GET['status'] ?? 'pending';

        $stmt = $this->db->prepare("
            SELECT vr.*, 
                   p.full_name, p.avatar_url, p.city, p.state, p.experience_years,
                   u.primary_email, u.primary_phone, u.role,
                   pp.primary_court, pp.bar_council_number, pp.bar_council_state
            FROM lawyer_verification_requests vr
            JOIN users u ON vr.user_id = u.id
            JOIN profiles p ON u.id = p.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE vr.status = ?
            ORDER BY vr.created_at DESC
        ");
        $stmt->execute([$status]);
        Response::success('Verification requests fetched', $stmt->fetchAll());
    }

    /**
     * Review Verification Request (Approve / Reject)
     */
    public function reviewVerification(array $adminUser, int $requestId): void {
        $body = Validator::getJsonBody();
        $action = $body['action'] ?? ''; // 'approve' or 'reject'
        $rejectionReason = Validator::sanitize($body['rejection_reason'] ?? '');

        if (!in_array($action, ['approve', 'reject'])) {
            Response::error('Action must be either "approve" or "reject"');
            return;
        }

        $stmt = $this->db->prepare("SELECT * FROM lawyer_verification_requests WHERE id = ?");
        $stmt->execute([$requestId]);
        $req = $stmt->fetch();

        if (!$req) {
            Response::notFound('Verification request not found');
            return;
        }

        $targetUserId = (int) $req['user_id'];

        if ($action === 'approve') {
            // Update request
            $stmt = $this->db->prepare("UPDATE lawyer_verification_requests SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$adminUser['id'], $requestId]);

            // Update professional_profiles
            $stmt = $this->db->prepare("UPDATE professional_profiles SET verification_status = 'verified', verified_badge = 1 WHERE user_id = ?");
            $stmt->execute([$targetUserId]);

            // Update user is_verified
            $stmt = $this->db->prepare("UPDATE users SET is_verified = 1 WHERE id = ?");
            $stmt->execute([$targetUserId]);

            // Create notification for user
            $this->db->prepare("INSERT INTO notifications (user_id, notif_type, title, message) VALUES (?, 'verification_approved', 'Professional Profile Verified', 'Congratulations! Your Bar Council credentials have been verified. Your profile now displays the Verified Advocate badge.')")->execute([$targetUserId]);

            Response::success('Lawyer verification approved successfully');
        } else {
            // Reject
            $stmt = $this->db->prepare("UPDATE lawyer_verification_requests SET status = 'rejected', rejection_reason = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$rejectionReason, $adminUser['id'], $requestId]);

            $stmt = $this->db->prepare("UPDATE professional_profiles SET verification_status = 'rejected', verified_badge = 0 WHERE user_id = ?");
            $stmt->execute([$targetUserId]);

            // Create notification for user
            $this->db->prepare("INSERT INTO notifications (user_id, notif_type, title, message) VALUES (?, 'verification_rejected', 'Verification Update', ?)")->execute([$targetUserId, 'Your verification request was rejected. Reason: ' . $rejectionReason]);

            Response::success('Lawyer verification rejected');
        }
    }

    /**
     * Get Users List for Admin
     */
    public function getUsers(): void {
        $role = $_GET['role'] ?? null;
        $search = $_GET['q'] ?? null;

        $sql = "
            SELECT u.id, u.uuid, u.primary_email, u.primary_phone, u.role, u.is_active, u.is_verified, u.created_at,
                   p.full_name, p.avatar_url, p.city, p.state,
                   pp.verified_badge, pp.verification_status, pp.bar_council_number
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE 1=1
        ";
        $params = [];

        if ($role) {
            $sql .= " AND u.role = ?";
            $params[] = $role;
        }

        if ($search) {
            $sql .= " AND (LOWER(p.full_name) LIKE LOWER(?) OR LOWER(u.primary_email) LIKE LOWER(?) OR LOWER(u.primary_phone) LIKE LOWER(?))";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $sql .= " ORDER BY u.created_at DESC LIMIT 50";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        Response::success('Users list fetched', $stmt->fetchAll());
    }

    /**
     * Toggle User Suspension (Active/Inactive)
     */
    public function toggleUserStatus(array $adminUser, int $userId): void {
        $stmt = $this->db->prepare("SELECT is_active FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('User not found');
            return;
        }

        $newStatus = $user['is_active'] ? 0 : 1;
        $stmt = $this->db->prepare("UPDATE users SET is_active = ? WHERE id = ?");
        $stmt->execute([$newStatus, $userId]);

        Response::success($newStatus ? 'User activated' : 'User suspended', ['is_active' => $newStatus]);
    }
}
