# NyayaSetu (न्यायसेतु) — India's Legal Social, Professional & Legal-Help Platform

> **Product Vision**: A production-ready, mobile-first legal ecosystem designed for India that unites LinkedIn-style professional networking, advocate and practice-area discovery, voice/guided legal problem intake, a legal careers and internship marketplace, requirement posting, case workspaces, and encrypted document storage.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │      NYAYASETU ECOSYSTEM    │
                                  └──────────────┬──────────────┘
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
       ┌───────────────────────┐     ┌───────────────────────┐     ┌───────────────────────┐
       │   React Native Expo   │     │  React + Vite Admin   │     │  Firebase Auth Layer  │
       │ (Android & iOS App)   │     │  (Verification Portal)│     │(Mobile + Email Unified│
       └───────────┬───────────┘     └───────────┬───────────┘     └───────────┬───────────┘
                   │                             │                             │
                   └─────────────────────────────┼─────────────────────────────┘
                                                 ▼
                               ┌───────────────────────────────────┐
                               │     PHP 8.x Hostinger REST API    │
                               │        (public_html / api /)      │
                               └─────────────────┬─────────────────┘
                                                 ▼
                               ┌───────────────────────────────────┐
                               │        MySQL 8.0+ Database        │
                               │      (30+ Normalized Tables)      │
                               └───────────────────────────────────┘
```

---

## 📂 Repository Structure

```
├── backend/
│   ├── database/
│   │   ├── schema.sql                 # Complete MySQL 8+ / SQLite normalized database schema
│   │   └── seeds.sql                  # Realistic Indian legal seed data (High Courts, Advocates, Seed Posts)
│   └── public_html/                   # Direct upload target for Hostinger Shared Hosting
│       ├── .htaccess                  # Apache mod_rewrite rules for clean REST API endpoints
│       ├── index.php                  # Shared hosting root entry & health check
│       ├── api/
│       │   ├── index.php              # REST API gateway and dynamic router
│       │   ├── config/                # Database (PDO), JWT, App Constants, CORS
│       │   ├── controllers/           # Auth, Profile, Professional, Post, LegalHelp, Job, Case, Document, Search, Admin
│       │   ├── middleware/            # AuthMiddleware (JWT), CorsMiddleware, Role RBAC
│       │   ├── helpers/               # Response, Validator, Security
│       │   └── services/              # JWTService, FirebaseAuthService
│       └── uploads/                   # Secure storage for avatars, documents, certificates
├── admin/                             # React + TypeScript + Vite + Material UI Admin Portal
│   ├── src/
│   │   ├── pages/                     # Dashboard, Bar Verifications, Users, Moderation
│   │   ├── services/api.ts            # API connector
│   │   └── App.tsx                    # Master admin layout & theme
│   └── vite.config.ts
└── mobile/                            # React Native + TypeScript Expo Mobile App
    ├── src/
    │   ├── theme/                     # Indian Legal Design Tokens (Deep Navy, Saffron Gold, Slate)
    │   ├── context/                   # AuthContext (Unified Phone/Email & Role switching)
    │   ├── services/api.ts            # Mobile REST client with offline resilience
    │   ├── components/                # PostCard, LawyerCard, VoiceIntakeModal, JobCard, CaseCard
    │   ├── screens/                   # Feed, Discover, Legal Help, Careers, Workspace, Profile, Auth
    │   └── navigation/AppNavigator.tsx# 6-Tab Bottom Navigator & App Stacks
    ├── app.json
    └── package.json
```

---

## 🚀 Deployment & Setup Guide

### 1. Backend Deployment on Hostinger Shared Hosting
1. Upload the contents of `backend/public_html/` into your Hostinger `public_html/` folder using FTP / Hostinger File Manager.
2. Create a MySQL database in Hostinger cPanel (e.g. `u123456_nyayasetu`).
3. Import `backend/database/schema.sql` and `backend/database/seeds.sql` via phpMyAdmin.
4. Update `backend/public_html/api/config/Config.php`:
   ```php
   public static string $DB_DRIVER = 'mysql';
   public static string $DB_HOST = 'localhost';
   public static string $DB_NAME = 'your_hostinger_db_name';
   public static string $DB_USER = 'your_hostinger_db_user';
   public static string $DB_PASS = 'your_hostinger_db_password';
   ```
5. Your REST API is live at `https://yourdomain.com/api/health`.

### 2. Running the Backend Locally
```bash
cd backend/public_html
php -S localhost:8000
```

### 3. Running the Admin Portal
```bash
cd admin
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Running the React Native Mobile App
```bash
cd mobile
npm install
npx expo start
```
Scan the QR code with the **Expo Go** app on Android or iOS.

---

## 🛡️ Key Compliance & Indian Legal Ecosystem Features
- **Bar Council Credential Verification**: Strict review workflow for state enrollment certificates (`D/1248/2006`, `MAH/5829/2016`, etc.) with admin approval queue.
- **Privacy Safeguards**: Automated warnings prohibiting Aadhaar, PAN, and banking credentials in public problem postings.
- **Distinction of Legal Advice**: Prominent disclaimers distinguishing general community discussions from formal attorney-client representation.
- **Regional Accessibility**: Bilingual support for practice areas and legal problem categories (Hindi & English).
