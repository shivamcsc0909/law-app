-- ==========================================================
-- NyayaSetu (न्यायसेतु) - Complete MySQL Database Schema & Seed
-- Target: Hostinger MySQL 8.0+ / phpMyAdmin
-- Database: u834013214_ndbafhd
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(64) NOT NULL UNIQUE,
    primary_email VARCHAR(255) NULL,
    primary_phone VARCHAR(32) NULL,
    password_hash VARCHAR(255) NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'public_user', -- 'public_user', 'student', 'junior_lawyer', 'advocate', 'senior_advocate', 'law_firm', 'recruiter', 'admin', 'guest'
    firebase_uid VARCHAR(128) NULL UNIQUE,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_phone (primary_phone),
    INDEX idx_user_email (primary_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USER AUTH IDENTIFIERS (Unified Phone + Email)
DROP TABLE IF EXISTS user_auth_identifiers;
CREATE TABLE user_auth_identifiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    identifier_type VARCHAR(20) NOT NULL, -- 'phone', 'email'
    identifier_value VARCHAR(255) NOT NULL,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    verified_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_identifier (identifier_type, identifier_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PROFILES
DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    cover_url VARCHAR(500) NULL,
    headline VARCHAR(255) NULL,
    bio TEXT NULL,
    gender VARCHAR(20) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    pincode VARCHAR(10) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    experience_years INT DEFAULT 0,
    languages VARCHAR(255) DEFAULT 'Hindi, English',
    is_profile_public TINYINT(1) DEFAULT 1,
    show_phone TINYINT(1) DEFAULT 0,
    show_email TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_profile_city (city),
    INDEX idx_profile_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PROFESSIONAL PROFILES (Bar Council & Practice details)
DROP TABLE IF EXISTS professional_profiles;
CREATE TABLE professional_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    professional_type VARCHAR(50) NOT NULL, -- 'law_student', 'junior_lawyer', 'advocate', 'senior_advocate', 'legal_consultant', 'paralegal', 'academic'
    bar_council_number VARCHAR(100) NULL,
    bar_council_state VARCHAR(100) NULL,
    enrollment_year INT NULL,
    primary_court VARCHAR(150) NULL,
    practice_courts TEXT NULL,
    consultation_mode VARCHAR(50) DEFAULT 'both', -- 'in_person', 'online', 'both'
    consultation_fee_min DECIMAL(10, 2) DEFAULT 0.00,
    consultation_fee_max DECIMAL(10, 2) DEFAULT 0.00,
    verification_status VARCHAR(30) DEFAULT 'pending', -- 'unsubmitted', 'pending', 'verified', 'rejected'
    verified_badge TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_prof_type (professional_type),
    INDEX idx_prof_court (primary_court),
    INDEX idx_prof_verified (verified_badge)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ORGANIZATIONS (Law Firms / Chambers / Institutions)
DROP TABLE IF EXISTS organizations;
CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    org_type VARCHAR(50) NOT NULL DEFAULT 'law_firm', -- 'law_firm', 'legal_dept', 'agency', 'chamber', 'ngo', 'institution'
    logo_url VARCHAR(500) NULL,
    banner_url VARCHAR(500) NULL,
    about TEXT NULL,
    website VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(32) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    team_size INT DEFAULT 1,
    is_verified TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PRACTICE AREAS
DROP TABLE IF EXISTS practice_areas;
CREATE TABLE practice_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    hindi_name VARCHAR(100) NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(60) DEFAULT 'scale-balance',
    category_group VARCHAR(60) DEFAULT 'General',
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. USER PRACTICE AREAS
DROP TABLE IF EXISTS user_practice_areas;
CREATE TABLE user_practice_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    practice_area_id INT NOT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (practice_area_id) REFERENCES practice_areas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_area (user_id, practice_area_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. POSTS & SOCIAL FEED
DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    org_id INT NULL,
    content_type VARCHAR(30) NOT NULL DEFAULT 'text', -- 'text', 'image', 'video', 'pdf', 'poll', 'article', 'news', 'requirement'
    title VARCHAR(255) NULL,
    body TEXT NOT NULL,
    category VARCHAR(60) DEFAULT 'For You', -- 'For You', 'Following', 'Legal News', 'Legal Knowledge', 'Discussions', 'Careers'
    visibility VARCHAR(30) DEFAULT 'public',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    is_pinned TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL,
    INDEX idx_post_category (category),
    INDEX idx_post_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. POLLS & POLL OPTIONS
DROP TABLE IF EXISTS polls;
CREATE TABLE polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL UNIQUE,
    question VARCHAR(255) NOT NULL,
    allows_multiple TINYINT(1) DEFAULT 0,
    total_votes INT DEFAULT 0,
    ends_at DATETIME NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS poll_options;
CREATE TABLE poll_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    option_text VARCHAR(200) NOT NULL,
    votes_count INT DEFAULT 0,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS poll_votes;
CREATE TABLE poll_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    option_id INT NOT NULL,
    user_id INT NOT NULL,
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_vote (poll_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. COMMENTS & REACTIONS
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT NULL,
    comment_text TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS reactions;
CREATE TABLE reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_type VARCHAR(30) NOT NULL, -- 'post', 'comment', 'article'
    target_id INT NOT NULL,
    reaction_type VARCHAR(20) DEFAULT 'like',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reaction (user_id, target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. LEGAL CATEGORIES & PROBLEM INTAKE
DROP TABLE IF EXISTS legal_categories;
CREATE TABLE legal_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hindi_name VARCHAR(100) NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(60) DEFAULT 'book-open',
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS legal_problems;
CREATE TABLE legal_problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    urgency VARCHAR(30) DEFAULT 'normal', -- 'normal', 'urgent', 'immediate'
    visibility VARCHAR(30) DEFAULT 'professionals_only',
    is_resolved TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES legal_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. LEGAL Q&A
DROP TABLE IF EXISTS legal_qa_questions;
CREATE TABLE legal_qa_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    is_anonymous TINYINT(1) DEFAULT 0,
    answers_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES legal_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS legal_qa_answers;
CREATE TABLE legal_qa_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    user_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    is_advocate_response TINYINT(1) DEFAULT 0,
    upvotes_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES legal_qa_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. CAREERS, JOBS & REQUIREMENTS
DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poster_id INT NOT NULL,
    org_id INT NULL,
    job_type VARCHAR(50) NOT NULL DEFAULT 'job', -- 'job', 'internship', 'chamber_association', 'fellowship'
    title VARCHAR(200) NOT NULL,
    practice_area_id INT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    is_remote TINYINT(1) DEFAULT 0,
    experience_level VARCHAR(60) DEFAULT '0-2 years',
    stipend_salary VARCHAR(100) NULL,
    description TEXT NOT NULL,
    requirements TEXT NULL,
    deadline DATE NULL,
    status VARCHAR(30) DEFAULT 'open',
    applications_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poster_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL,
    FOREIGN KEY (practice_area_id) REFERENCES practice_areas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS requirements;
CREATE TABLE requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    req_type VARCHAR(60) NOT NULL, -- 'client_lawyer', 'lawyer_junior', 'firm_researcher', 'student_internship', 'contract_drafting'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    budget VARCHAR(100) NULL,
    urgency VARCHAR(30) DEFAULT 'normal',
    status VARCHAR(30) DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. CASES, HEARINGS, WORKSPACES & DOCUMENTS
DROP TABLE IF EXISTS cases;
CREATE TABLE cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    client_id INT NOT NULL,
    lawyer_id INT NOT NULL,
    practice_area_id INT NULL,
    court_name VARCHAR(150) NULL,
    judge_name VARCHAR(150) NULL,
    status VARCHAR(30) DEFAULT 'active',
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (practice_area_id) REFERENCES practice_areas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS case_hearings;
CREATE TABLE case_hearings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    hearing_date DATETIME NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    notes TEXT NULL,
    outcome VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS case_documents;
CREATE TABLE case_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NULL,
    uploader_id INT NOT NULL,
    folder_name VARCHAR(60) DEFAULT 'General',
    title VARCHAR(200) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(30) DEFAULT 'pdf',
    file_size INT NULL,
    is_private TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. LAWYER VERIFICATION QUEUE & ADMIN REPORTS
DROP TABLE IF EXISTS lawyer_verification_requests;
CREATE TABLE lawyer_verification_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    id_proof_url VARCHAR(500) NULL,
    bar_council_cert_url VARCHAR(500) NULL,
    enrollment_number VARCHAR(100) NOT NULL,
    bar_state VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    rejection_reason TEXT NULL,
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS reports;
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    reported_type VARCHAR(30) NOT NULL,
    reported_id INT NOT NULL,
    reason_category VARCHAR(60) NOT NULL,
    description TEXT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DATA INITIALIZATION
-- ==========================================================

-- Practice Areas
INSERT INTO practice_areas (id, name, hindi_name, slug, icon, category_group, description) VALUES
(1, 'Criminal Law', 'आपराधिक कानून', 'criminal-law', 'gavel', 'Litigation', 'Bail, FIR quashing, trial defense, BNSS, BNS, NDPS, POCSO matters.'),
(2, 'Civil & Property Law', 'दीवानी और संपत्ति कानून', 'civil-property', 'home-city', 'Civil', 'Title disputes, partition suits, RERA, property registration, tenant-landlord issues.'),
(3, 'Family & Matrimonial', 'पारिवारिक और वैवाहिक कानून', 'family-matrimonial', 'account-group', 'Family', 'Divorce, child custody, domestic violence, maintenance, restitution of conjugal rights.'),
(4, 'Corporate & Commercial', 'कॉर्पोरेट और व्यापारिक कानून', 'corporate-commercial', 'briefcase', 'Corporate', 'Contract drafting, company incorporation, NCLT, IBC, mergers and acquisitions.'),
(5, 'Constitutional & Writ', 'संवैधानिक कानून', 'constitutional-writ', 'scale-balance', 'Public Law', 'Article 226/32 Writs, PIL, fundamental rights enforcement before High Courts & Supreme Court.'),
(6, 'Cyber & Tech Law', 'साइबर और तकनीक कानून', 'cyber-tech-law', 'shield-lock', 'Technology', 'Cyber fraud, IT Act, data protection, privacy, online defamation, digital evidence.'),
(7, 'Labour & Employment', 'श्रम और रोजगार कानून', 'labour-employment', 'account-hard-hat', 'Employment', 'Wrongful termination, gratuity, POSH compliance, industrial disputes, labour codes.'),
(8, 'Consumer Protection', 'उपभोक्ता संरक्षण कानून', 'consumer-protection', 'cart', 'Consumer', 'Deficiency in service, builder delays, medical negligence, District & State Consumer Forums.'),
(9, 'Intellectual Property (IPR)', 'बौद्धिक संपदा कानून', 'ipr', 'lightbulb', 'Corporate', 'Trademark registration, copyright infringement, patent filing, design protection.'),
(10, 'Banking, Debt & NI Act 138', 'बैंकिंग और चेक बाउंस कानून', 'banking-ni-act', 'cash', 'Commercial', 'Section 138 cheque bounce, DRT, SARFAESI, loan recovery defense, banking ombudsman.');

-- Legal Categories
INSERT INTO legal_categories (id, name, hindi_name, slug, icon, description) VALUES
(1, 'Property & Rent Disputes', 'संपत्ति एवं किराया विवाद', 'property-rent', 'home', 'Land ownership, tenant eviction, security deposit recovery, RERA complaints.'),
(2, 'Police & Criminal Matters', 'पुलिस एवं आपराधिक मामले', 'police-criminal', 'police-badge', 'Filing FIR, Anticipatory bail, police harassment, e-FIR procedure in India.'),
(3, 'Marriage, Divorce & Custody', 'विवाह, तलाक एवं संरक्षण', 'family-divorce', 'heart-broken', 'Mutual consent divorce, Hindu Marriage Act, Special Marriage Act, alimony guidelines.'),
(4, 'Cheque Bounce & Financial Frauds', 'चेक बाउंस और वित्तीय धोखाधड़ी', 'cheque-bounce', 'cash-multiple', 'Section 138 NI Act notices, online UPI scams, loan harassment remedies.'),
(5, 'Employment & Workplace Issues', 'नौकरी और कार्यस्थल के मामले', 'employment-workplace', 'briefcase-account', 'Salary withheld, unapproved layoffs, POSH committee procedures, severance.'),
(6, 'Cyber Crime & Online Frauds', 'साइबर अपराध एवं डिजिटल फ्रॉड', 'cyber-crime', 'laptop', 'SIM swap fraud, extortion, deepfake remedies, national cyber crime portal (1930).'),
(7, 'Startup & Contract Drafting', 'स्टार्टअप एवं अनुबंध ड्राफ्टिंग', 'startup-contracts', 'file-document-edit', 'NDAs, Founders Agreements, Vendor Contracts, ESOP policies.');

-- Users
INSERT INTO users (id, uuid, primary_email, primary_phone, password_hash, role, is_active, is_verified) VALUES
(1, 'usr_adv_vikram_01', 'adv.vikram.sharma@nyayasetu.in', '+919810123456', '$2y$10$e8w.dummyhashforpassword', 'senior_advocate', 1, 1),
(2, 'usr_adv_ananya_02', 'ananya.deshmukh@lawchambers.in', '+919820234567', '$2y$10$e8w.dummyhashforpassword', 'advocate', 1, 1),
(3, 'usr_student_rohit_03', 'rohit.verma@nludelhi.ac.in', '+919830345678', '$2y$10$e8w.dummyhashforpassword', 'student', 1, 1),
(4, 'usr_client_rahul_04', 'rahul.mehta.delhi@gmail.com', '+919840456789', '$2y$10$e8w.dummyhashforpassword', 'public_user', 1, 1),
(5, 'usr_admin_master_00', 'admin@nyayasetu.in', '+919800000001', '$2y$10$e8w.dummyhashforpassword', 'admin', 1, 1),
(6, 'usr_firm_shardul_06', 'contact@lexbharatchambers.com', '+919850567890', '$2y$10$e8w.dummyhashforpassword', 'law_firm', 1, 1);

-- User Identifiers
INSERT INTO user_auth_identifiers (user_id, identifier_type, identifier_value, is_verified, verified_at) VALUES
(1, 'phone', '+919810123456', 1, CURRENT_TIMESTAMP),
(1, 'email', 'adv.vikram.sharma@nyayasetu.in', 1, CURRENT_TIMESTAMP),
(2, 'phone', '+919820234567', 1, CURRENT_TIMESTAMP),
(2, 'email', 'ananya.deshmukh@lawchambers.in', 1, CURRENT_TIMESTAMP),
(3, 'phone', '+919830345678', 1, CURRENT_TIMESTAMP),
(3, 'email', 'rohit.verma@nludelhi.ac.in', 1, CURRENT_TIMESTAMP),
(4, 'phone', '+919840456789', 1, CURRENT_TIMESTAMP),
(4, 'email', 'rahul.mehta.delhi@gmail.com', 1, CURRENT_TIMESTAMP),
(5, 'email', 'admin@nyayasetu.in', 1, CURRENT_TIMESTAMP),
(6, 'email', 'contact@lexbharatchambers.com', 1, CURRENT_TIMESTAMP);

-- Profiles
INSERT INTO profiles (id, user_id, full_name, avatar_url, cover_url, headline, bio, gender, city, state, pincode, latitude, longitude, experience_years, languages) VALUES
(1, 1, 'Adv. Vikram Sharma', 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&q=80', 'Senior Advocate | High Court of Delhi & Supreme Court of India', 'Practicing criminal defense, constitutional litigation, and commercial arbitration for over 18 years. Former standing counsel for civic authorities. Passionate about legal education and mentoring young advocates.', 'Male', 'New Delhi', 'Delhi', '110001', 28.6139, 77.2090, 18, 'Hindi, English, Punjabi'),
(2, 2, 'Adv. Ananya Deshmukh', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80', 'Corporate & IPR Lawyer | Bombay High Court | Ex-Shardul Amarchand', 'Specializing in tech contracts, trademark litigation, startup advisory, and dispute resolution. Dedicated to simplifying commercial law for Indian entrepreneurs and creators.', 'Female', 'Mumbai', 'Maharashtra', '400001', 18.9220, 72.8347, 8, 'English, Hindi, Marathi'),
(3, 3, 'Rohit Verma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1000&q=80', '4th Year B.A. LL.B (Hons.) | NLU Delhi | Commercial Law Enthusiast', 'Editor at NLU Law Review. Keen interest in Competition Law, Insolvency and Bankruptcy Code (IBC), and Legal Technology. Seeking 2027 judicial clerkship / chamber association.', 'Male', 'New Delhi', 'Delhi', '110078', 28.6010, 77.0500, 0, 'Hindi, English'),
(4, 4, 'Rahul Mehta', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', NULL, 'Founder & Tech Entrepreneur | Delhi NCR', 'Building tech solutions. Seeking legal guidance on commercial leases, RERA tenancy disputes, and standard software SaaS agreements.', 'Male', 'Noida', 'Uttar Pradesh', '201301', 28.5355, 77.3910, 0, 'Hindi, English'),
(5, 5, 'NyayaSetu System Admin', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', NULL, 'Platform Administrator & Content Moderator', 'Ensuring verified legal credentials and authentic compliance across India.', 'Other', 'New Delhi', 'Delhi', '110001', 28.6139, 77.2090, 0, 'Hindi, English'),
(6, 6, 'Lex Bharat Chambers LLP', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80', 'Premier Full-Service Law Firm | New Delhi • Mumbai • Bengaluru', 'Full-service Indian law firm with practice spanning dispute resolution, corporate M&A, real estate, and white-collar defense.', NULL, 'New Delhi', 'Delhi', '110001', 28.6139, 77.2090, 25, 'English, Hindi');

-- Professional Profiles
INSERT INTO professional_profiles (id, user_id, professional_type, bar_council_number, bar_council_state, enrollment_year, primary_court, practice_courts, consultation_mode, consultation_fee_min, consultation_fee_max, verification_status, verified_badge) VALUES
(1, 1, 'senior_advocate', 'D/1248/2006', 'Bar Council of Delhi', 2006, 'Delhi High Court', 'Supreme Court of India, Delhi High Court, Patiala House Courts, Saket District Courts', 'both', 3000.00, 7500.00, 'verified', 1),
(2, 2, 'advocate', 'MAH/5829/2016', 'Bar Council of Maharashtra & Goa', 2016, 'Bombay High Court', 'Bombay High Court, City Civil Court Mumbai, NCLT Mumbai', 'both', 1500.00, 4000.00, 'verified', 1),
(3, 3, 'law_student', NULL, NULL, 2022, 'NLU Delhi Moot Court', NULL, 'online', 0.00, 0.00, 'unsubmitted', 0);

-- Organizations
INSERT INTO organizations (id, creator_id, slug, name, org_type, logo_url, banner_url, about, website, email, phone, city, state, team_size, is_verified) VALUES
(1, 6, 'lex-bharat-chambers', 'Lex Bharat Chambers LLP', 'law_firm', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80', 'Established in 1999, Lex Bharat Chambers is recognized among top tier Indian litigation chambers with over 45 advocates handling High Court, NCLT, and Supreme Court matters.', 'https://lexbharatchambers.com', 'contact@lexbharatchambers.com', '+911123389000', 'New Delhi', 'Delhi', 45, 1);

-- User Practice Areas
INSERT INTO user_practice_areas (user_id, practice_area_id, is_primary) VALUES
(1, 1, 1),
(1, 5, 0),
(1, 2, 0),
(2, 4, 1),
(2, 9, 0),
(2, 6, 0);

-- Posts
INSERT INTO posts (id, user_id, org_id, content_type, title, body, category, visibility, likes_count, comments_count, shares_count, is_pinned) VALUES
(1, 1, NULL, 'article', 'Key Changes in Criminal Procedure: Transitioning from CrPC to Bharatiya Nagarik Suraksha Sanhita (BNSS)', 'As the new criminal laws take effect across Indian courts, several procedural safeguards and electronic record provisions require every litigator to update their practice protocols. Key points every junior advocate must note: 1. Mandatory videography during search and seizure (Section 105 BNSS). 2. Electronic summons and notices via messaging/email. 3. Zero FIR mandatory recording within 24 hours. What has been your court experience in implementation?', 'Legal Knowledge', 'public', 142, 28, 45, 1),
(2, 2, NULL, 'poll', 'For Tech Startups: Which clause creates the most dispute during seed-stage term sheet negotiations?', 'Negotiating founder equity and anti-dilution clauses often delays crucial early-stage closings.', 'Discussions', 'public', 89, 14, 12, 0),
(3, 3, NULL, 'text', 'Grateful to receive the Best Speaker Citation at the National Insolvency Moot 2026! 🏆', 'Honored to argue before retired High Court judges on Section 9 IBC threshold limitations for operational creditors. Immense learning experience with our team!', 'For You', 'public', 215, 34, 9, 0),
(4, 1, NULL, 'news', 'Supreme Court clarifies Section 138 NI Act limitation period calculation', 'A three-judge bench has reiterated that the 15-day notice period must expire before the cause of action arises for filing a cheque bounce complaint under Section 138 of the Negotiable Instruments Act.', 'Legal News', 'public', 98, 11, 20, 0);

-- Polls
INSERT INTO polls (id, post_id, question, allows_multiple, total_votes, ends_at) VALUES
(1, 2, 'Which term sheet clause causes maximum conflict in Indian startup deals?', 0, 187, '2027-12-31 23:59:59');

INSERT INTO poll_options (id, poll_id, option_text, votes_count) VALUES
(1, 1, 'Liquidation Preference & Waterfall', 72),
(2, 1, 'Founder Vesting & Reverse Dilution', 64),
(3, 1, 'Information & Board Observer Rights', 29),
(4, 1, 'Right of First Refusal (ROFR / Tag-along)', 22);

-- Comments
INSERT INTO comments (id, post_id, user_id, parent_id, comment_text, likes_count) VALUES
(1, 1, 2, NULL, 'Insightful analysis, Adv. Vikram Sir. The videography rule under Sec 105 has drastically improved transparency during panchnama in Mumbai trial courts.', 18),
(2, 1, 3, NULL, 'Thank you Sir! In law school clinics, students are actively studying digital evidence compliance under Section 63 BSA.', 9),
(3, 2, 1, NULL, 'In my experience with tech disputes, reverse vesting triggers generate substantial friction if unaddressed early.', 14);

-- Legal Problems
INSERT INTO legal_problems (id, user_id, category_id, title, description, city, state, urgency, visibility, is_resolved) VALUES
(1, 4, 1, 'Landlord refusing to refund ₹1,20,000 security deposit after peaceful vacating in Sector 62 Noida', 'I vacated my rented apartment on 15th January after giving 30-day notice as per agreement. The flat was handed over in clean condition without damage. The landlord keeps delaying repayment and now claims arbitrary painting charges of ₹40,000 without bills.', 'Noida', 'Uttar Pradesh', 'urgent', 'professionals_only', 0);

-- Legal Q&A
INSERT INTO legal_qa_questions (id, user_id, category_id, title, details, is_anonymous, answers_count, views_count) VALUES
(1, 4, 1, 'Can a residential landlord deduct painting charges without prior written agreement clause?', 'Is there a legal obligation on tenant in NCR to pay for full flat painting when moving out after 11-month registered lease?', 0, 2, 420),
(2, 4, 4, 'What is the first step if an online vendor takes ₹35,000 advance and switches off phone?', 'UPI payment was made with transaction ID. Vendor is based in Jaipur. Should I file cyber complaint or 138 notice?', 1, 1, 310);

INSERT INTO legal_qa_answers (id, question_id, user_id, answer_text, is_advocate_response, upvotes_count) VALUES
(1, 1, 1, 'Under standard tenancy jurisprudence and Model Tenancy guidelines, normal wear-and-tear cannot be deducted unless explicitly agreed upon in the registered rent agreement. Send a formal legal notice granting 15 days to refund the balance with interest.', 1, 32),
(2, 1, 2, 'Ensure you have dated handover photos/videos. If not resolved post notice, you can approach the local Rent Authority or Consumer Forum for deficiency of service.', 1, 19);

-- Jobs
INSERT INTO jobs (id, poster_id, org_id, job_type, title, practice_area_id, city, state, is_remote, experience_level, stipend_salary, description, requirements, deadline, status, applications_count) VALUES
(1, 6, 1, 'job', 'Junior Litigation Associate (Civil & Commercial)', 2, 'New Delhi', 'Delhi', 0, '1-3 years', '₹45,000 - ₹65,000 / month', 'We are looking for a dedicated Junior Advocate to join our High Court litigation practice. The candidate will draft plaints, writ petitions, conduct research, and assist Senior Partners in court.', 'LL.B from recognized university, enrolled with Bar Council, strong drafting skills.', '2027-12-31', 'open', 14),
(2, 6, 1, 'internship', 'Summer Legal Intern (Corporate & IPR Division)', 4, 'New Delhi', 'Delhi', 0, 'Law Students (3rd-5th Year)', '₹15,000 / month stipend', '4-week internship program offering hands-on exposure to transaction documents, trademark filings, and due diligence reports.', 'Enrolled in 5-year or 3-year LL.B program with excellent academic standing.', '2027-12-31', 'open', 29);

-- Requirements
INSERT INTO requirements (id, user_id, req_type, title, description, city, state, budget, urgency, status) VALUES
(1, 4, 'client_lawyer', 'Need Property Advocate for Title Verification & Sale Deed Drafting in Dwarka', 'Purchasing an apartment in Sector 10 Dwarka. Need experienced advocate to verify 30-year chain deeds, encumbrance certificate, and draft the conveyance deed.', 'New Delhi', 'Delhi', '₹15,000 - ₹25,000', 'normal', 'open'),
(2, 1, 'lawyer_junior', 'Looking for Junior Advocate with BNSS/CrPC trial drafting background', 'Chambers of Adv. Vikram Sharma is seeking a junior associate with 1-2 years experience in Delhi District Courts.', 'New Delhi', 'Delhi', '₹40,000/mo', 'urgent', 'open');

-- Cases
INSERT INTO cases (id, case_number, title, client_id, lawyer_id, practice_area_id, court_name, judge_name, status, description) VALUES
(1, 'CS/COMM/2026/0481', 'Rahul Mehta vs M/s Skyline Urban Housing Pvt Ltd', 4, 1, 2, 'Delhi High Court', 'Hon''ble Justice S. K. Kaul Bench', 'active', 'Commercial suit for recovery of delayed possession interest and refund of security deposits under RERA provisions.');

INSERT INTO case_hearings (id, case_id, hearing_date, purpose, notes, outcome) VALUES
(1, 1, '2027-02-15 10:30:00', 'First Notice Returnable & Written Statement Submission', 'Respondents summoned with original tenancy ledger and completion certificate.', 'Notice served; Respondent sought 2 weeks time for Reply.');

INSERT INTO case_documents (id, case_id, uploader_id, folder_name, title, file_url, file_type, file_size, is_private) VALUES
(1, 1, 4, 'Property', 'Original_Registered_Lease_Agreement_2025.pdf', 'https://example.com/docs/lease_deed_2025.pdf', 'pdf', 2450000, 1),
(2, 1, 1, 'Court', 'Plaint_Copy_CS_COMM_0481.pdf', 'https://example.com/docs/plaint_copy.pdf', 'pdf', 1840000, 1);

-- Verification Requests
INSERT INTO lawyer_verification_requests (id, user_id, enrollment_number, bar_state, status) VALUES
(1, 2, 'MAH/5829/2016', 'Bar Council of Maharashtra & Goa', 'pending');

SET FOREIGN_KEY_CHECKS = 1;
