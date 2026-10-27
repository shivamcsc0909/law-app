<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class ProfileController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getProfile(int $userId): void {
        $stmt = $this->db->prepare("
            SELECT u.id, u.uuid, u.role, u.is_verified,
                   p.full_name, p.avatar_url, p.cover_url, p.headline, p.bio, p.gender, p.city, p.state, p.pincode, p.experience_years, p.languages, p.is_profile_public,
                   pp.professional_type, pp.bar_council_number, pp.bar_council_state, pp.enrollment_year, pp.primary_court, pp.practice_courts, pp.consultation_mode, pp.consultation_fee_min, pp.consultation_fee_max, pp.verification_status, pp.verified_badge
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE u.id = ?
        ");
        $stmt->execute([$userId]);
        $profile = $stmt->fetch();

        if (!$profile) {
            Response::notFound('Profile not found');
            return;
        }

        // Fetch user practice areas
        $stmt = $this->db->prepare("
            SELECT pa.*, upa.is_primary 
            FROM user_practice_areas upa
            JOIN practice_areas pa ON upa.practice_area_id = pa.id
            WHERE upa.user_id = ?
        ");
        $stmt->execute([$userId]);
        $profile['practice_areas'] = $stmt->fetchAll();

        // Fetch education
        $stmt = $this->db->prepare("SELECT * FROM education WHERE user_id = ? ORDER BY end_year DESC");
        $stmt->execute([$userId]);
        $profile['education'] = $stmt->fetchAll();

        // Fetch experience
        $stmt = $this->db->prepare("SELECT * FROM experience WHERE user_id = ? ORDER BY is_current DESC");
        $stmt->execute([$userId]);
        $profile['experience'] = $stmt->fetchAll();

        // Fetch articles published by user
        $stmt = $this->db->prepare("SELECT id, title, slug, summary, cover_image, reading_time_minutes, views_count, created_at FROM legal_articles WHERE author_id = ? AND is_published = 1 ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $profile['articles'] = $stmt->fetchAll();

        // Stats: Posts count, Followers count
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ?");
        $stmt->execute([$userId]);
        $profile['posts_count'] = (int) $stmt->fetch()['count'];

        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM followers WHERE following_id = ? AND target_type = 'user'");
        $stmt->execute([$userId]);
        $profile['followers_count'] = (int) $stmt->fetch()['count'];

        Response::success('Profile retrieved', $profile);
    }

    public function updateProfile(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $fullName = Validator::sanitize($body['full_name'] ?? '');
        $headline = Validator::sanitize($body['headline'] ?? '');
        $bio = Validator::sanitize($body['bio'] ?? '');
        $city = Validator::sanitize($body['city'] ?? '');
        $state = Validator::sanitize($body['state'] ?? '');
        $experienceYears = (int) ($body['experience_years'] ?? 0);
        $languages = Validator::sanitize($body['languages'] ?? 'Hindi, English');
        $avatarUrl = $body['avatar_url'] ?? null;
        $coverUrl = $body['cover_url'] ?? null;

        $stmt = $this->db->prepare("
            UPDATE profiles 
            SET full_name = ?, headline = ?, bio = ?, city = ?, state = ?, experience_years = ?, languages = ?, 
                avatar_url = COALESCE(?, avatar_url), cover_url = COALESCE(?, cover_url), updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ");
        $stmt->execute([$fullName, $headline, $bio, $city, $state, $experienceYears, $languages, $avatarUrl, $coverUrl, $userId]);

        // If professional credentials submitted
        if (isset($body['professional_type'])) {
            $profType = Validator::sanitize($body['professional_type']);
            $barNumber = Validator::sanitize($body['bar_council_number'] ?? '');
            $barState = Validator::sanitize($body['bar_council_state'] ?? '');
            $enrollmentYear = !empty($body['enrollment_year']) ? (int) $body['enrollment_year'] : null;
            $primaryCourt = Validator::sanitize($body['primary_court'] ?? '');
            $practiceCourts = Validator::sanitize($body['practice_courts'] ?? '');
            $consultationMode = $body['consultation_mode'] ?? 'both';
            $feeMin = (float) ($body['consultation_fee_min'] ?? 0);
            $feeMax = (float) ($body['consultation_fee_max'] ?? 0);

            $stmt = $this->db->prepare("
                INSERT INTO professional_profiles (user_id, professional_type, bar_council_number, bar_council_state, enrollment_year, primary_court, practice_courts, consultation_mode, consultation_fee_min, consultation_fee_max)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    professional_type = excluded.professional_type,
                    bar_council_number = excluded.bar_council_number,
                    bar_council_state = excluded.bar_council_state,
                    enrollment_year = excluded.enrollment_year,
                    primary_court = excluded.primary_court,
                    practice_courts = excluded.practice_courts,
                    consultation_mode = excluded.consultation_mode,
                    consultation_fee_min = excluded.consultation_fee_min,
                    consultation_fee_max = excluded.consultation_fee_max,
                    updated_at = CURRENT_TIMESTAMP
            ");
            $stmt->execute([$userId, $profType, $barNumber, $barState, $enrollmentYear, $primaryCourt, $practiceCourts, $consultationMode, $feeMin, $feeMax]);
        }

        Response::success('Profile updated successfully');
    }

    public function addEducation(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $institution = Validator::sanitize($body['institution'] ?? '');
        $degree = Validator::sanitize($body['degree'] ?? '');
        $field = Validator::sanitize($body['field_of_study'] ?? '');
        $startYear = !empty($body['start_year']) ? (int) $body['start_year'] : null;
        $endYear = !empty($body['end_year']) ? (int) $body['end_year'] : null;
        $desc = Validator::sanitize($body['description'] ?? '');

        if (empty($institution) || empty($degree)) {
            Response::error('Institution and Degree are required');
            return;
        }

        $stmt = $this->db->prepare("INSERT INTO education (user_id, institution, degree, field_of_study, start_year, end_year, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $institution, $degree, $field, $startYear, $endYear, $desc]);

        Response::success('Education added successfully', ['id' => $this->db->lastInsertId()]);
    }

    public function addExperience(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $title = Validator::sanitize($body['title'] ?? '');
        $organization = Validator::sanitize($body['organization'] ?? '');
        $location = Validator::sanitize($body['location'] ?? '');
        $startDate = Validator::sanitize($body['start_date'] ?? '');
        $endDate = Validator::sanitize($body['end_date'] ?? '');
        $isCurrent = !empty($body['is_current']) ? 1 : 0;
        $desc = Validator::sanitize($body['description'] ?? '');

        if (empty($title) || empty($organization)) {
            Response::error('Title and Organization are required');
            return;
        }

        $stmt = $this->db->prepare("INSERT INTO experience (user_id, title, organization, location, start_date, end_date, is_current, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $title, $organization, $location, $startDate, $endDate, $isCurrent, $desc]);

        Response::success('Experience added successfully', ['id' => $this->db->lastInsertId()]);
    }
}
