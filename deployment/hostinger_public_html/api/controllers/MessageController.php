<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class MessageController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Get All Conversations for Auth User
     */
    public function getConversations(array $authUser): void {
        $userId = $authUser['id'];

        $stmt = $this->db->prepare("
            SELECT c.*, cp.unread_count,
                   (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
                   other_p.user_id as peer_id,
                   prof.full_name as peer_name, prof.avatar_url as peer_avatar, prof.headline as peer_headline,
                   pp.verified_badge as is_peer_verified
            FROM conversations c
            JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ?
            LEFT JOIN conversation_participants other_p ON c.id = other_p.conversation_id AND other_p.user_id != ?
            LEFT JOIN profiles prof ON other_p.user_id = prof.user_id
            LEFT JOIN professional_profiles pp ON other_p.user_id = pp.user_id
            ORDER BY last_message_at DESC
        ");
        $stmt->execute([$userId, $userId]);
        $conversations = $stmt->fetchAll();

        Response::success('Conversations retrieved', $conversations);
    }

    /**
     * Get Messages in a Conversation
     */
    public function getMessages(array $authUser, int $convId): void {
        $userId = $authUser['id'];

        // Verify participant
        $stmt = $this->db->prepare("SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?");
        $stmt->execute([$convId, $userId]);
        if (!$stmt->fetch()) {
            Response::forbidden('Not a participant in this conversation');
            return;
        }

        // Reset unread count
        $this->db->prepare("UPDATE conversation_participants SET unread_count = 0, last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND user_id = ?")->execute([$convId, $userId]);

        $stmt = $this->db->prepare("
            SELECT m.*, pr.full_name as sender_name, pr.avatar_url as sender_avatar
            FROM messages m
            JOIN profiles pr ON m.sender_id = pr.user_id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        ");
        $stmt->execute([$convId]);
        $messages = $stmt->fetchAll();

        Response::success('Messages retrieved', $messages);
    }

    /**
     * Send a Message (Direct or Case)
     */
    public function sendMessage(array $authUser): void {
        $body = Validator::getJsonBody();
        $senderId = $authUser['id'];

        $convId = !empty($body['conversation_id']) ? (int) $body['conversation_id'] : null;
        $recipientId = !empty($body['recipient_id']) ? (int) $body['recipient_id'] : null;
        $messageText = Validator::sanitize($body['message_text'] ?? '');
        $attachmentUrl = $body['attachment_url'] ?? null;
        $attachmentType = $body['attachment_type'] ?? null;

        if (empty($messageText) && empty($attachmentUrl)) {
            Response::error('Message text or attachment is required.');
            return;
        }

        // If no conversation exists yet, create one
        if (!$convId && $recipientId) {
            $stmt = $this->db->prepare("
                SELECT c.id FROM conversations c
                JOIN conversation_participants p1 ON c.id = p1.conversation_id AND p1.user_id = ?
                JOIN conversation_participants p2 ON c.id = p2.conversation_id AND p2.user_id = ?
                WHERE c.conv_type = 'direct'
                LIMIT 1
            ");
            $stmt->execute([$senderId, $recipientId]);
            $existing = $stmt->fetch();

            if ($existing) {
                $convId = (int) $existing['id'];
            } else {
                $this->db->prepare("INSERT INTO conversations (conv_type) VALUES ('direct')")->execute();
                $convId = (int) $this->db->lastInsertId();

                $stmt = $this->db->prepare("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)");
                $stmt->execute([$convId, $senderId, $convId, $recipientId]);
            }
        }

        if (!$convId) {
            Response::error('Conversation or recipient required');
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO messages (conversation_id, sender_id, message_text, attachment_url, attachment_type)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$convId, $senderId, $messageText, $attachmentUrl, $attachmentType]);
        $messageId = (int) $this->db->lastInsertId();

        // Increment unread for other participants
        $this->db->prepare("
            UPDATE conversation_participants 
            SET unread_count = unread_count + 1 
            WHERE conversation_id = ? AND user_id != ?
        ")->execute([$convId, $senderId]);

        Response::success('Message sent', [
            'message_id' => $messageId,
            'conversation_id' => $convId
        ], 201);
    }
}
