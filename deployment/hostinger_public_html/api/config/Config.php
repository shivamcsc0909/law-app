<?php
// NyayaSetu API Configuration for Hostinger Shared Hosting

class Config {
    // Database Configuration for Hostinger MySQL
    public static string $DB_DRIVER = 'mysql'; // 'mysql' for Hostinger, 'sqlite' for local fallback
    public static string $DB_HOST = 'localhost';
    public static string $DB_PORT = '3306';
    public static string $DB_NAME = 'u834013214_ndbafhd';
    public static string $DB_USER = 'u834013214_amncchd';
    public static string $DB_PASS = 'Cser@123';
    public static string $SQLITE_PATH = __DIR__ . '/../../database/nyayasetu.sqlite';

    // Application & Security
    public static string $APP_NAME = 'NyayaSetu India';
    public static string $BASE_URL = 'https://slateblue-albatross-712793.hostingersite.com';
    public static string $JWT_SECRET = 'nyayasetu_india_legal_super_secret_jwt_key_2026_x99_hostinger';
    public static int $JWT_EXPIRATION_SECONDS = 604800; // 7 days

    // File Uploads
    public static string $UPLOAD_DIR = __DIR__ . '/../../uploads/';
    public static int $MAX_UPLOAD_SIZE = 15728640; // 15MB
    public static array $ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'mp4'];

    // CORS Whitelist
    public static array $ALLOWED_ORIGINS = [
        'https://slateblue-albatross-712793.hostingersite.com',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8081',
        'http://localhost:19006',
        '*'
    ];
}
