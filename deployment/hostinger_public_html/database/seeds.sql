-- ==========================================================
-- NyayaSetu - Realistic Indian Legal Seed Data
-- ==========================================================

-- 1. Practice Areas
INSERT INTO practice_areas (id, name, hindi_name, slug, icon, category_group, description) VALUES
(1, 'Criminal Law', 'आपराधिक कानून', 'criminal-law', 'gavel', 'Litigation', 'Bail, FIR quashing, trial defense, IPC, CrPC, BNSS, NDPS, POCSO matters.'),
(2, 'Civil & Property Law', 'दीवानी और संपत्ति कानून', 'civil-property', 'home-city', 'Civil', 'Title disputes, partition suits, RERA, property registration, tenant-landlord issues.'),
(3, 'Family & Matrimonial', 'पारिवारिक और वैवाहिक कानून', 'family-matrimonial', 'account-group', 'Family', 'Divorce, child custody, domestic violence, maintenance, restitution of conjugal rights.'),
(4, 'Corporate & Commercial', 'कॉर्पोरेट और व्यापारिक कानून', 'corporate-commercial', 'briefcase', 'Corporate', 'Contract drafting, company incorporation, NCLT, IBC, mergers and acquisitions.'),
(5, 'Constitutional & Writ', 'संवैधानिक कानून', 'constitutional-writ', 'scale-balance', 'Public Law', 'Article 226/32 Writs, PIL, fundamental rights enforcement before High Courts & Supreme Court.'),
(6, 'Cyber & Tech Law', 'साइबर और तकनीक कानून', 'cyber-tech-law', 'shield-lock', 'Technology', 'Cyber fraud, IT Act, data protection, privacy, online defamation, digital evidence.'),
(7, 'Labour & Employment', 'श्रम और रोजगार कानून', 'labour-employment', 'account-hard-hat', 'Employment', 'Wrongful termination, gratuity, POSH compliance, industrial disputes, labour codes.'),
(8, 'Consumer Protection', 'उपभोक्ता संरक्षण कानून', 'consumer-protection', 'cart', 'Consumer', 'Deficiency in service, builder delays, medical negligence, District & State Consumer Forums.'),
(9, 'Intellectual Property (IPR)', 'बौद्धिक संपदा कानून', 'ipr', 'lightbulb', 'Corporate', 'Trademark registration, copyright infringement, patent filing, design protection.'),
(10, 'Banking, Debt & NI Act 138', 'बैंकिंग और चेक बाउंस कानून', 'banking-ni-act', 'cash', 'Commercial', 'Section 138 cheque bounce, DRT, SARFAESI, loan recovery defense, banking ombudsman.');

-- 2. Legal Categories (Knowledge & Problems)
INSERT INTO legal_categories (id, name, hindi_name, slug, icon, description) VALUES
(1, 'Property & Rent Disputes', 'संपत्ति एवं किराया विवाद', 'property-rent', 'home', 'Land ownership, tenant eviction, security deposit recovery, RERA complaints.'),
(2, 'Police & Criminal Matters', 'पुलिस एवं आपराधिक मामले', 'police-criminal', 'police-badge', 'Filing FIR, Anticipatory bail, police harassment, e-FIR procedure in India.'),
(3, 'Marriage, Divorce & Custody', 'विवाह, तलाक एवं संरक्षण', 'family-divorce', 'heart-broken', 'Mutual consent divorce, Hindu Marriage Act, Special Marriage Act, alimony guidelines.'),
(4, 'Cheque Bounce & Financial Frauds', 'चेक बाउंस और वित्तीय धोखाधड़ी', 'cheque-bounce', 'cash-multiple', 'Section 138 NI Act notices, online UPI scams, loan harassment remedies.'),
(5, 'Employment & Workplace Issues', 'नौकरी और कार्यस्थल के मामले', 'employment-workplace', 'briefcase-account', 'Salary withheld, unapproved layoffs, POSH committee procedures, severance.'),
(6, 'Cyber Crime & Online Frauds', 'साइबर अपराध एवं डिजिटल फ्रॉड', 'cyber-crime', 'laptop', 'SIM swap fraud, extortion, deepfake remedies, national cyber crime portal (1930).'),
(7, 'Startup & Contract Drafting', 'स्टार्टअप एवं अनुबंध ड्राफ्टिंग', 'startup-contracts', 'file-document-edit', 'NDAs, Founders Agreements, Vendor Contracts, ESOP policies.');

-- 3. Users
INSERT INTO users (id, uuid, primary_email, primary_phone, password_hash, role, is_active, is_verified) VALUES
(1, 'usr_adv_vikram_01', 'adv.vikram.sharma@nyayasetu.in', '+919810123456', '$2y$10$e8w.dummyhashforpassword', 'senior_advocate', 1, 1),
(2, 'usr_adv_ananya_02', 'ananya.deshmukh@lawchambers.in', '+919820234567', '$2y$10$e8w.dummyhashforpassword', 'advocate', 1, 1),
(3, 'usr_student_rohit_03', 'rohit.verma@nludelhi.ac.in', '+919830345678', '$2y$10$e8w.dummyhashforpassword', 'student', 1, 1),
(4, 'usr_client_rahul_04', 'rahul.mehta.delhi@gmail.com', '+919840456789', '$2y$10$e8w.dummyhashforpassword', 'public_user', 1, 1),
(5, 'usr_admin_master_00', 'admin@nyayasetu.in', '+919800000001', '$2y$10$e8w.dummyhashforpassword', 'admin', 1, 1),
(6, 'usr_firm_shardul_06', 'contact@lexbharatchambers.com', '+919850567890', '$2y$10$e8w.dummyhashforpassword', 'law_firm', 1, 1);

-- 4. User Auth Identifiers
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

-- 5. Profiles
INSERT INTO profiles (id, user_id, full_name, avatar_url, cover_url, headline, bio, gender, city, state, pincode, latitude, longitude, experience_years, languages) VALUES
(1, 1, 'Adv. Vikram Sharma', 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&q=80', 'Senior Advocate | High Court of Delhi & Supreme Court of India', 'Practicing criminal defense, constitutional litigation, and commercial arbitration for over 18 years. Former standing counsel for civic authorities. Passionate about legal education and mentoring young advocates.', 'Male', 'New Delhi', 'Delhi', '110001', 28.6139, 77.2090, 18, 'Hindi, English, Punjabi'),
(2, 2, 'Adv. Ananya Deshmukh', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80', 'Corporate & IPR Lawyer | Bombay High Court | Ex-Shardul Amarchand', 'Specializing in tech contracts, trademark litigation, startup advisory, and dispute resolution. Dedicated to simplifying commercial law for Indian entrepreneurs and creators.', 'Female', 'Mumbai', 'Maharashtra', '400001', 18.9220, 72.8347, 8, 'English, Hindi, Marathi'),
(3, 3, 'Rohit Verma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1000&q=80', '4th Year B.A. LL.B (Hons.) | NLU Delhi | Commercial Law Enthusiast', 'Editor at NLU Law Review. Keen interest in Competition Law, Insolvency and Bankruptcy Code (IBC), and Legal Technology. Seeking 2027 judicial clerkship / chamber association.', 'Male', 'New Delhi', 'Delhi', '110078', 28.6010, 77.0500, 0, 'Hindi, English'),
(4, 4, 'Rahul Mehta', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', NULL, 'Founder & Tech Entrepreneur | Delhi NCR', 'Building tech solutions. Seeking legal guidance on commercial leases, RERA tenancy disputes, and standard software SaaS agreements.', 'Male', 'Noida', 'Uttar Pradesh', '201301', 28.5355, 77.3910, 0, 'Hindi, English'),
(5, 5, 'NyayaSetu System Admin', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', NULL, 'Platform Administrator & Content Moderator', 'Ensuring verified legal credentials and authentic compliance across India.', 'Other', 'New Delhi', 'Delhi', '110001', 28.6139, 77.2090, 0, 'Hindi, English'),
(6, 6, 'Lex Bharat Chambers LLP', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80', 'Premier Full-Service Law Firm | New Delhi • Mumbai • Bengaluru', 'Full-service Indian law firm with practice spanning dispute resolution, corporate M&A, real estate, and white-collar defense.', NULL, 'New Delhi', 'Delhi', '110001', 28.6139, 77.2090, 25, 'English, Hindi');

-- 6. Professional Profiles (Verified credentials)
INSERT INTO professional_profiles (id, user_id, professional_type, bar_council_number, bar_council_state, enrollment_year, primary_court, practice_courts, consultation_mode, consultation_fee_min, consultation_fee_max, verification_status, verified_badge) VALUES
(1, 1, 'senior_advocate', 'D/1248/2006', 'Bar Council of Delhi', 2006, 'Delhi High Court', 'Supreme Court of India, Delhi High Court, Patiala House Courts, Saket District Courts', 'both', 3000, 7500, 'verified', 1),
(2, 2, 'advocate', 'MAH/5829/2016', 'Bar Council of Maharashtra & Goa', 2016, 'Bombay High Court', 'Bombay High Court, City Civil Court Mumbai, NCLT Mumbai', 'both', 1500, 4000, 'verified', 1),
(3, 3, 'law_student', NULL, NULL, 2022, 'NLU Delhi Moot Court', NULL, 'online', 0, 0, 'unsubmitted', 0);

-- 7. Organizations
INSERT INTO organizations (id, creator_id, slug, name, org_type, logo_url, banner_url, about, website, email, phone, city, state, team_size, is_verified) VALUES
(1, 6, 'lex-bharat-chambers', 'Lex Bharat Chambers LLP', 'law_firm', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80', 'Established in 1999, Lex Bharat Chambers is recognized among top tier Indian litigation chambers with over 45 advocates handling High Court, NCLT, and Supreme Court matters.', 'https://lexbharatchambers.com', 'contact@lexbharatchambers.com', '+911123389000', 'New Delhi', 'Delhi', 45, 1);

-- 8. User Practice Areas
INSERT INTO user_practice_areas (user_id, practice_area_id, is_primary) VALUES
(1, 1, 1),
(1, 5, 0),
(1, 2, 0),
(2, 4, 1),
(2, 9, 0),
(2, 6, 0);

-- 9. Posts (LinkedIn-Style Legal Social Feed)
INSERT INTO posts (id, user_id, org_id, content_type, title, body, category, visibility, likes_count, comments_count, shares_count, is_pinned) VALUES
(1, 1, NULL, 'article', 'Key Changes in Criminal Procedure: Transitioning from CrPC to Bharatiya Nagarik Suraksha Sanhita (BNSS)', 'As the new criminal laws take effect across Indian courts, several procedural safeguards and electronic record provisions require every litigator to update their practice protocols. Key points every junior advocate must note: 1. Mandatory videography during search and seizure (Section 105 BNSS). 2. Electronic summons and notices via messaging/email. 3. Zero FIR mandatory recording within 24 hours. What has been your court experience in implementation?', 'Legal Knowledge', 'public', 142, 28, 45, 1),
(2, 2, NULL, 'poll', 'For Tech Startups: Which clause creates the most dispute during seed-stage term sheet negotiations?', 'Negotiating founder equity and anti-dilution clauses often delays crucial early-stage closings.', 'Discussions', 'public', 89, 14, 12, 0),
(3, 3, NULL, 'text', 'Grateful to receive the Best Speaker Citation at the National Insolvency Moot 2026! 🏆', 'Honored to argue before retired High Court judges on Section 9 IBC threshold limitations for operational creditors. Immense learning experience with our team!', 'For You', 'public', 215, 34, 9, 0),
(4, 1, NULL, 'news', 'Supreme Court clarifies Section 138 NI Act limitation period calculation', 'A three-judge bench has reiterated that the 15-day notice period must expire before the cause of action arises for filing a cheque bounce complaint under Section 138 of the Negotiable Instruments Act.', 'Legal News', 'public', 98, 11, 20, 0);

-- 10. Polls
INSERT INTO polls (id, post_id, question, allows_multiple, total_votes, ends_at) VALUES
(1, 2, 'Which term sheet clause causes maximum conflict in Indian startup deals?', 0, 187, '2027-12-31 23:59:59');

INSERT INTO poll_options (id, poll_id, option_text, votes_count) VALUES
(1, 1, 'Liquidation Preference & Waterfall', 72),
(2, 1, 'Founder Vesting & Reverse Dilution', 64),
(3, 1, 'Information & Board Observer Rights', 29),
(4, 1, 'Right of First Refusal (ROFR / Tag-along)', 22);

-- 11. Comments
INSERT INTO comments (id, post_id, user_id, parent_id, comment_text, likes_count) VALUES
(1, 1, 2, NULL, 'Insightful analysis, Adv. Vikram Sir. The videography rule under Sec 105 has drastically improved transparency during panchnama in Mumbai trial courts.', 18),
(2, 1, 3, NULL, 'Thank you Sir! In law school clinics, students are actively studying digital evidence compliance under Section 63 BSA.', 9),
(3, 2, 1, NULL, 'In my experience with tech disputes, reverse vesting triggers generate substantial friction if unaddressed early.', 14);

-- 12. Legal Problems (Public Legal Intake)
INSERT INTO legal_problems (id, user_id, category_id, title, description, city, state, urgency, visibility, is_resolved) VALUES
(1, 4, 1, 'Landlord refusing to refund ₹1,20,000 security deposit after peaceful vacating in Sector 62 Noida', 'I vacated my rented apartment on 15th January after giving 30-day notice as per agreement. The flat was handed over in clean condition without damage. The landlord keeps delaying repayment and now claims arbitrary painting charges of ₹40,000 without bills.', 'Noida', 'Uttar Pradesh', 'urgent', 'professionals_only', 0);

-- 13. Legal Q&A Questions & Answers
INSERT INTO legal_qa_questions (id, user_id, category_id, title, details, is_anonymous, answers_count, views_count) VALUES
(1, 4, 1, 'Can a residential landlord deduct painting charges without prior written agreement clause?', 'Is there a legal obligation on tenant in NCR to pay for full flat painting when moving out after 11-month registered lease?', 0, 2, 420),
(2, 4, 4, 'What is the first step if an online vendor takes ₹35,000 advance and switches off phone?', 'UPI payment was made with transaction ID. Vendor is based in Jaipur. Should I file cyber complaint or 138 notice?', 1, 1, 310);

INSERT INTO legal_qa_answers (id, question_id, user_id, answer_text, is_advocate_response, upvotes_count) VALUES
(1, 1, 1, 'Under standard tenancy jurisprudence and Model Tenancy guidelines, normal wear-and-tear cannot be deducted unless explicitly agreed upon in the registered rent agreement. Send a formal legal notice granting 15 days to refund the balance with interest.', 1, 32),
(2, 1, 2, 'Ensure you have dated handover photos/videos. If not resolved post notice, you can approach the local Rent Authority or Consumer Forum for deficiency of service.', 1, 19);

-- 14. Legal Articles
INSERT INTO legal_articles (id, author_id, org_id, category_id, title, slug, summary, content, cover_image, reading_time_minutes, views_count) VALUES
(1, 1, 1, 2, 'Comprehensive Guide to Bail Provisions in India (Bailable vs Non-Bailable Offenses)', 'guide-to-bail-provisions-india', 'An exhaustive practical manual for citizens and junior practitioners on Anticipatory Bail (Sec 482 BNSS / 438 CrPC) and Regular Bail.', 'Bail is the rule, jail is the exception - this cornerstone principle of Indian criminal jurisprudence was famously highlighted by Justice V.R. Krishna Iyer. Understanding how to approach trial courts and High Courts for swift bail relief is crucial...', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80', 6, 1280);

-- 15. Jobs & Internships
INSERT INTO jobs (id, poster_id, org_id, job_type, title, practice_area_id, city, state, is_remote, experience_level, stipend_salary, description, requirements, deadline, status, applications_count) VALUES
(1, 6, 1, 'job', 'Junior Litigation Associate (Civil & Commercial)', 2, 'New Delhi', 'Delhi', 0, '1-3 years', '₹45,000 - ₹65,000 / month', 'We are looking for a dedicated Junior Advocate to join our High Court litigation practice. The candidate will draft plaints, writ petitions, conduct research, and assist Senior Partners in court.', 'LL.B from recognized university, enrolled with Bar Council, strong drafting skills.', '2027-12-31', 'open', 14),
(2, 6, 1, 'internship', 'Summer Legal Intern (Corporate & IPR Division)', 4, 'New Delhi', 'Delhi', 0, 'Law Students (3rd-5th Year)', '₹15,000 / month stipend', '4-week internship program offering hands-on exposure to transaction documents, trademark filings, and due diligence reports.', 'Enrolled in 5-year or 3-year LL.B program with excellent academic standing.', '2027-12-31', 'open', 29);

-- 16. Requirements Marketplace
INSERT INTO requirements (id, user_id, req_type, title, description, city, state, budget, urgency, status) VALUES
(1, 4, 'client_lawyer', 'Need Property Advocate for Title Verification & Sale Deed Drafting in Dwarka', 'Purchasing an apartment in Sector 10 Dwarka. Need experienced advocate to verify 30-year chain deeds, encumbrance certificate, and draft the conveyance deed.', 'New Delhi', 'Delhi', '₹15,000 - ₹25,000', 'normal', 'open'),
(2, 1, 'lawyer_junior', 'Looking for Junior Advocate with BNSS/CrPC trial drafting background', 'Chambers of Adv. Vikram Sharma is seeking a junior associate with 1-2 years experience in Delhi District Courts.', 'New Delhi', 'Delhi', '₹40,000/mo', 'urgent', 'open');

-- 17. Cases & Workspaces
INSERT INTO cases (id, case_number, title, client_id, lawyer_id, practice_area_id, court_name, judge_name, status, description) VALUES
(1, 'CS/COMM/2026/0481', 'Rahul Mehta vs M/s Skyline Urban Housing Pvt Ltd', 4, 1, 2, 'Delhi High Court', 'Hon''ble Justice S. K. Kaul Bench', 'active', 'Commercial suit for recovery of delayed possession interest and refund of security deposits under RERA provisions.');

INSERT INTO case_hearings (id, case_id, hearing_date, purpose, notes, outcome) VALUES
(1, 1, '2027-02-15 10:30:00', 'First Notice Returnable & Written Statement Submission', 'Respondents summoned with original tenancy ledger and completion certificate.', 'Notice served; Respondent sought 2 weeks time for Reply.');

INSERT INTO case_tasks (id, case_id, assigned_to, title, due_date, status) VALUES
(1, 1, 1, 'File Replication to Respondent Written Statement', '2027-02-28', 'pending'),
(2, 1, 1, 'Verify original possession handover inspection report', '2027-02-20', 'completed');

INSERT INTO case_documents (id, case_id, uploader_id, folder_name, title, file_url, file_type, file_size, is_private) VALUES
(1, 1, 4, 'Property', 'Original_Registered_Lease_Agreement_2025.pdf', 'https://example.com/docs/lease_deed_2025.pdf', 'pdf', 2450000, 1),
(2, 1, 1, 'Court', 'Plaint_Copy_CS_COMM_0481.pdf', 'https://example.com/docs/plaint_copy.pdf', 'pdf', 1840000, 1);
