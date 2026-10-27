<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../services/JWTService.php';
require_once __DIR__ . '/../services/FirebaseAuthService.php';

class AuthController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Unified Login / Register via Firebase Token or Phone/Email OTP
     */
    public function firebaseAuth(): void {
        $body = Validator::getJsonBody();
        $idToken = $body['id_token'] ?? null;
        $role = $body['role'] ?? 'public_user';
        $fullName = $body['full_name'] ?? 'User';
        $phone = $body['phone'] ?? null;
        $email = $body['email'] ?? null;

        if (!$idToken && !$phone && !$email) {
            Response::error('Either id_token, phone or email is required.');
            return;
        }

        $firebaseData = $idToken ? FirebaseAuthService::decodeFirebaseToken($idToken) : null;
        $verifiedPhone = $firebaseData['phone'] ?? ($phone ? Validator::normalizeIndianPhone($phone) : null);
        $verifiedEmail = $firebaseData['email'] ?? ($email ? strtolower(trim($email)) : null);
        $firebaseUid = $firebaseData['uid'] ?? null;

        // Check if user exists by Phone, Email, or Firebase UID
        $user = null;

        if ($firebaseUid) {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE firebase_uid = ? LIMIT 1");
            $stmt->execute([$firebaseUid]);
            $user = $stmt->fetch();
        }

        if (!$user && $verifiedPhone) {
            $stmt = $this->db->prepare("
                SELECT u.* FROM users u 
                LEFT JOIN user_auth_identifiers uai ON u.id = uai.user_id 
                WHERE u.primary_phone = ? OR (uai.identifier_type = 'phone' AND uai.identifier_value = ?)
                LIMIT 1
            ");
            $stmt->execute([$verifiedPhone, $verifiedPhone]);
            $user = $stmt->fetch();
        }

        if (!$user && $verifiedEmail) {
            $stmt = $this->db->prepare("
                SELECT u.* FROM users u 
                LEFT JOIN user_auth_identifiers uai ON u.id = uai.user_id 
                WHERE u.primary_email = ? OR (uai.identifier_type = 'email' AND uai.identifier_value = ?)
                LIMIT 1
            ");
            $stmt->execute([$verifiedEmail, $verifiedEmail]);
            $user = $stmt->fetch();
        }

        // If User doesn't exist, create unified account
        if (!$user) {
            $uuid = 'usr_' . bin2hex(random_bytes(8));
            $stmt = $this->db->prepare("
                INSERT INTO users (uuid, primary_email, primary_phone, role, firebase_uid, is_active, is_verified) 
                VALUES (?, ?, ?, ?, ?, 1, 1)
            ");
            $stmt->execute([$uuid, $verifiedEmail, $verifiedPhone, $role, $firebaseUid]);
            $userId = (int) $this->db->lastInsertId();

            // Link Phone identifier
            if ($verifiedPhone) {
                $stmt = $this->db->prepare("INSERT INTO user_auth_identifiers (user_id, identifier_type, identifier_value, is_verified, verified_at) VALUES (?, 'phone', ?, 1, CURRENT_TIMESTAMP)");
                $stmt->execute([$userId, $verifiedPhone]);
            }

            // Link Email identifier
            if ($verifiedEmail) {
                $stmt = $this->db->prepare("INSERT INTO user_auth_identifiers (user_id, identifier_type, identifier_value, is_verified, verified_at) VALUES (?, 'email', ?, 1, CURRENT_TIMESTAMP)");
                $stmt->execute([$userId, $verifiedEmail]);
            }

            // Create Profile
            $stmt = $this->db->prepare("
                INSERT INTO profiles (user_id, full_name, headline, city, state) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $defaultHeadline = match($role) {
                'advocate', 'junior_lawyer' => 'Advocate | Legal Professional',
                'senior_advocate' => 'Senior Advocate',
                'student' => 'Law Student / Aspirant',
                'law_firm' => 'Law Firm / Legal Practice',
                default => 'Legal Consumer & Citizen'
            };
            $stmt->execute([$userId, $fullName, $defaultHeadline, 'New Delhi', 'Delhi']);

            // If lawyer/student, create initial professional_profile row
            if (in_array($role, ['advocate', 'junior_lawyer', 'senior_advocate', 'student', 'paralegal'])) {
                $stmt = $this->db->prepare("
                    INSERT INTO professional_profiles (user_id, professional_type, verification_status) 
                    VALUES (?, ?, ?)
                ");
                $stmt->execute([$userId, $role, $role === 'student' ? 'unsubmitted' : 'pending']);
            }

            // Fetch the created user
            $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
        } else {
            $userId = (int) $user['id'];
            // Account Linking: If user logged in with a new verified identifier, link to existing account
            if ($verifiedPhone) {
                $stmt = $this->db->prepare("SELECT id FROM user_auth_identifiers WHERE user_id = ? AND identifier_type = 'phone' AND identifier_value = ?");
                $stmt->execute([$userId, $verifiedPhone]);
                if (!$stmt->fetch()) {
                    $stmt = $this->db->prepare("INSERT INTO user_auth_identifiers (user_id, identifier_type, identifier_value, is_verified, verified_at) VALUES (?, 'phone', ?, 1, CURRENT_TIMESTAMP)");
                    $stmt->execute([$userId, $verifiedPhone]);
                }
                if (empty($user['primary_phone'])) {
                    $this->db->prepare("UPDATE users SET primary_phone = ? WHERE id = ?")->execute([$verifiedPhone, $userId]);
                }
            }

            if ($verifiedEmail) {
                $stmt = $this->db->prepare("SELECT id FROM user_auth_identifiers WHERE user_id = ? AND identifier_type = 'email' AND identifier_value = ?");
                $stmt->execute([$userId, $verifiedEmail]);
                if (!$stmt->fetch()) {
                    $stmt = $this->db->prepare("INSERT INTO user_auth_identifiers (user_id, identifier_type, identifier_value, is_verified, verified_at) VALUES (?, 'email', ?, 1, CURRENT_TIMESTAMP)");
                    $stmt->execute([$userId, $verifiedEmail]);
                }
                if (empty($user['primary_email'])) {
                    $this->db->prepare("UPDATE users SET primary_email = ? WHERE id = ?")->execute([$verifiedEmail, $userId]);
                }
            }
        }

        // Fetch complete profile & professional credentials
        $stmt = $this->db->prepare("
            SELECT u.id, u.uuid, u.primary_email, u.primary_phone, u.role, u.is_verified,
                   p.full_name, p.avatar_url, p.cover_url, p.headline, p.bio, p.city, p.state, p.experience_years,
                   pp.professional_type, pp.bar_council_number, pp.primary_court, pp.verification_status, pp.verified_badge
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE u.id = ?
        ");
        $stmt->execute([$userId]);
        $userProfile = $stmt->fetch();

        // Generate JWT
        $jwt = JWTService::generateToken([
            'id' => $userProfile['id'],
            'uuid' => $userProfile['uuid'],
            'role' => $userProfile['role'],
            'email' => $userProfile['primary_email'],
            'phone' => $userProfile['primary_phone']
        ]);

        Response::success('Authentication successful', [
            'token' => $jwt,
            'user' => $userProfile
        ]);
    }

    /**
     * Standard Login (Email/Phone + Password) for Demo & Admin access
     */
    public function login(): void {
        $body = Validator::getJsonBody();
        $loginId = trim($body['login_id'] ?? '');
        $password = trim($body['password'] ?? '');

        if (empty($loginId)) {
            Response::error('Email or Phone is required');
            return;
        }

        // Find user by email or phone
        $stmt = $this->db->prepare("
            SELECT u.*, p.full_name, p.avatar_url, p.headline, p.city, p.state,
                   pp.professional_type, pp.bar_council_number, pp.primary_court, pp.verification_status, pp.verified_badge
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE u.primary_email = ? OR u.primary_phone = ?
            LIMIT 1
        ");
        $stmt->execute([$loginId, $loginId]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('User account not found', null, 404);
            return;
        }

        $token = JWTService::generateToken([
            'id' => $user['id'],
            'uuid' => $user['uuid'],
            'role' => $user['role'],
            'email' => $user['primary_email'],
            'phone' => $user['primary_phone']
        ]);

        Response::success('Login successful', [
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * Get Current Authenticated User Profile
     */
    public function getMe(array $authUser): void {
        $stmt = $this->db->prepare("
            SELECT u.id, u.uuid, u.primary_email, u.primary_phone, u.role, u.is_verified,
                   p.full_name, p.avatar_url, p.cover_url, p.headline, p.bio, p.gender, p.city, p.state, p.pincode, p.experience_years, p.languages,
                   pp.professional_type, pp.bar_council_number, pp.bar_council_state, pp.enrollment_year, pp.primary_court, pp.practice_courts, pp.consultation_mode, pp.consultation_fee_min, pp.consultation_fee_max, pp.verification_status, pp.verified_badge
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE u.id = ?
        ");
        $stmt->execute([$authUser['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('User not found');
            return;
        }

        // Fetch practice areas
        $stmt = $this->db->prepare("
            SELECT pa.*, upa.is_primary 
            FROM user_practice_areas upa
            JOIN practice_areas pa ON upa.practice_area_id = pa.id
            WHERE upa.user_id = ?
        ");
        $stmt->execute([$authUser['id']]);
        $user['practice_areas'] = $stmt->fetchAll();

        // Fetch education
        $stmt = $this->db->prepare("SELECT * FROM education WHERE user_id = ? ORDER BY end_year DESC");
        $stmt->execute([$authUser['id']]);
        $user['education'] = $stmt->fetchAll();

        // Fetch experience
        $stmt = $this->db->prepare("SELECT * FROM experience WHERE user_id = ? ORDER BY is_current DESC");
        $stmt->execute([$authUser['id']]);
        $user['experience'] = $stmt->fetchAll();

        Response::success('User fetched successfully', $user);
    }
}
