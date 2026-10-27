<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class DocumentController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Get All Documents for Current User (with folder filter)
     */
    public function getDocuments(array $authUser): void {
        $userId = $authUser['id'];
        $folder = $_GET['folder'] ?? null;

        $sql = "SELECT * FROM case_documents WHERE uploader_id = ?";
        $params = [$userId];

        if ($folder && $folder !== 'All') {
            $sql .= " AND folder_name = ?";
            $params[] = $folder;
        }

        $sql .= " ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $docs = $stmt->fetchAll();

        // Get folder counts
        $stmt = $this->db->prepare("SELECT folder_name, COUNT(*) as count FROM case_documents WHERE uploader_id = ? GROUP BY folder_name");
        $stmt->execute([$userId]);
        $folderCounts = $stmt->fetchAll();

        Response::success('Documents retrieved', [
            'documents' => $docs,
            'folder_counts' => $folderCounts
        ]);
    }

    /**
     * Upload / Add Document Metadata
     */
    public function addDocument(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $title = Validator::sanitize($body['title'] ?? '');
        $folderName = Validator::sanitize($body['folder_name'] ?? 'General');
        $fileUrl = $body['file_url'] ?? '';
        $fileType = $body['file_type'] ?? 'pdf';
        $fileSize = (int) ($body['file_size'] ?? 1024);
        $caseId = !empty($body['case_id']) ? (int) $body['case_id'] : null;

        if (empty($title) || empty($fileUrl)) {
            Response::error('Title and file URL are required.');
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO case_documents (case_id, uploader_id, folder_name, title, file_url, file_type, file_size)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$caseId, $userId, $folderName, $title, $fileUrl, $fileType, $fileSize]);

        Response::success('Document stored securely in vault', ['document_id' => $this->db->lastInsertId()], 201);
    }
}
