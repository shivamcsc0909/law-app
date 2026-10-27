# NyayaSetu (न्यायसेतु) — Deployment & Release Manual

This document provides step-by-step instructions for deploying the backend to **Hostinger Shared Hosting** and generating the Android **APK** (direct installation) and **AAB** (Google Play Store bundle).

---

## 📦 1. Hostinger Shared Hosting Deployment (Backend + Admin)

A pre-packaged, ready-to-upload ZIP is available at:
`deployment/nyayasetu_hostinger_deployment.zip`

### Step 1: Upload to Hostinger
1. Log in to your **Hostinger hPanel**.
2. Open **File Manager** and navigate into `public_html/`.
3. Upload `nyayasetu_hostinger_deployment.zip` and click **Extract** into `public_html/`.

### Step 2: Database Setup
1. In Hostinger hPanel, go to **Databases → MySQL Databases** and create a new database (e.g., `u123456_nyayasetu`).
2. Open **phpMyAdmin** for that database.
3. Import `database/schema.sql` followed by `database/seeds.sql`.

### Step 3: Configure Database Credentials
Edit `public_html/api/config/Config.php` in Hostinger File Manager:
```php
public static string $DB_DRIVER = 'mysql';
public static string $DB_HOST = 'localhost';
public static string $DB_NAME = 'your_hostinger_database_name';
public static string $DB_USER = 'your_hostinger_database_user';
public static string $DB_PASS = 'your_hostinger_database_password';
```

### Step 4: Verification
- Your REST API is live at: `https://yourdomain.com/api/health`
- Your Admin Verification Portal is live at: `https://yourdomain.com/admin/`

---

## 📱 2. Mobile App Build: Standalone APK & Play Store AAB

The mobile app includes complete Android production configs, permissions (`RECORD_AUDIO`, `CAMERA`, `STORAGE`, `LOCATION`), and build scripts.

### Option A: Cloud EAS Build (Recommended, No Android Studio needed)

Make sure you are logged into your free Expo account:
```bash
npx eas-cli login
```

#### 1. Generate Standalone APK (for Direct Phone Installation / WhatsApp Sharing)
Run the automated script:
```bash
./deployment/android_build_scripts/build_apk.sh
```
*Or execute manually:*
```bash
cd mobile
npx eas-cli build --platform android --profile preview
```
> **Output**: Direct download URL for the `.apk` file that installs directly on any Android device.

---

#### 2. Generate Production AAB (for Google Play Console Release)
Run the automated script:
```bash
./deployment/android_build_scripts/build_aab.sh
```
*Or execute manually:*
```bash
cd mobile
npx eas-cli build --platform android --profile production
```
> **Output**: Signed `.aab` file ready to be uploaded directly to the Google Play Console under **Production / Internal Testing**.

---

### Option B: Local Android Studio / Gradle Build (Offline)

If you have Android Studio & Android SDK installed locally:
```bash
./deployment/android_build_scripts/build_local_gradle.sh
```

**Output Artifact Locations:**
- **APK**: `mobile/android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `mobile/android/app/build/outputs/bundle/release/app-release.aab`

---

## 📂 Deployment File Directory Map

```
deployment/
├── nyayasetu_hostinger_deployment.zip  <-- Upload & Extract directly in Hostinger public_html/
├── DEPLOYMENT_GUIDE.md                <-- This guide
├── hostinger_public_html/             <-- Unzipped Hostinger files & folders
│   ├── .htaccess                      <-- Apache API rewrites
│   ├── index.php                      <-- Root API status
│   ├── admin/index.html               <-- Production Admin SPA
│   ├── api/                           <-- Complete PHP 8.x REST API
│   ├── database/                      <-- SQL Schema & Seeds
│   └── uploads/                       <-- Storage for PDFs, Avatars, Certificates
└── android_build_scripts/
    ├── build_apk.sh                   <-- One-click Standalone APK compilation
    ├── build_aab.sh                   <-- One-click Google Play AAB compilation
    └── build_local_gradle.sh          <-- Local Gradle offline compilation
```
