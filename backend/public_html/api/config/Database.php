<?php
require_once __DIR__ . '/Config.php';

class Database {
    private static ?PDO $pdo = null;

    public static function getConnection(): PDO {
        if (self::$pdo === null) {
            try {
                if (Config::$DB_DRIVER === 'mysql') {
                    $dsn = sprintf(
                        "mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4",
                        Config::$DB_HOST,
                        Config::$DB_PORT,
                        Config::$DB_NAME
                    );
                    self::$pdo = new PDO($dsn, Config::$DB_USER, Config::$DB_PASS, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]);
                } else {
                    $dbDir = dirname(Config::$SQLITE_PATH);
                    if (!is_dir($dbDir)) {
                        mkdir($dbDir, 0777, true);
                    }
                    $isNew = !file_exists(Config::$SQLITE_PATH);
                    $dsn = 'sqlite:' . Config::$SQLITE_PATH;
                    self::$pdo = new PDO($dsn, null, null, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ]);

                    if ($isNew) {
                        self::initializeDatabase();
                    }
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Database connection failed: ' . $e->getMessage()
                ]);
                exit;
            }
        }
        return self::$pdo;
    }

    public static function initializeDatabase(): void {
        if (self::$pdo === null) return;
        $schemaPath = __DIR__ . '/../../../database/schema.sql';
        $seedsPath = __DIR__ . '/../../../database/seeds.sql';

        if (file_exists($schemaPath)) {
            $sql = file_get_contents($schemaPath);
            self::$pdo->exec($sql);
        }
        if (file_exists($seedsPath)) {
            $sql = file_get_contents($seedsPath);
            self::$pdo->exec($sql);
        }
    }
}
