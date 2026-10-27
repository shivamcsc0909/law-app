<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class PostController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Get Feed Posts (with category filters: 'For You', 'Legal News', 'Legal Knowledge', 'Discussions', etc.)
     */
    public function getFeed(?array $authUser = null): void {
        $category = $_GET['category'] ?? null;
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = min(50, (int) ($_GET['limit'] ?? 20));
        $offset = ($page - 1) * $limit;
        $currentUserId = $authUser['id'] ?? 0;

        $sql = "
            SELECT p.*, 
                   u.uuid as author_uuid, u.role as author_role,
                   pr.full_name as author_name, pr.avatar_url as author_avatar, pr.headline as author_headline,
                   pp.verified_badge as is_author_verified, pp.primary_court as author_court,
                   o.name as org_name, o.logo_url as org_logo
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN profiles pr ON u.id = pr.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            LEFT JOIN organizations o ON p.org_id = o.id
            WHERE p.visibility = 'public'
        ";
        $params = [];

        if ($category && $category !== 'For You') {
            $sql .= " AND p.category = ?";
            $params[] = $category;
        }

        $sql .= " ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT $limit OFFSET $offset";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $posts = $stmt->fetchAll();

        // Enrich with Media, Polls, and User Reaction State
        foreach ($posts as &$post) {
            // Media
            $stmt = $this->db->prepare("SELECT * FROM post_media WHERE post_id = ?");
            $stmt->execute([$post['id']]);
            $post['media'] = $stmt->fetchAll();

            // Poll
            if ($post['content_type'] === 'poll') {
                $stmt = $this->db->prepare("SELECT * FROM polls WHERE post_id = ?");
                $stmt->execute([$post['id']]);
                $poll = $stmt->fetch();
                if ($poll) {
                    $stmt = $this->db->prepare("SELECT * FROM poll_options WHERE poll_id = ?");
                    $stmt->execute([$poll['id']]);
                    $poll['options'] = $stmt->fetchAll();

                    if ($currentUserId > 0) {
                        $stmt = $this->db->prepare("SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?");
                        $stmt->execute([$poll['id'], $currentUserId]);
                        $userVote = $stmt->fetch();
                        $poll['user_voted_option_id'] = $userVote ? (int) $userVote['option_id'] : null;
                    }
                    $post['poll'] = $poll;
                }
            }

            // User Reaction
            $post['user_reacted'] = false;
            $post['user_reaction_type'] = null;
            if ($currentUserId > 0) {
                $stmt = $this->db->prepare("SELECT reaction_type FROM reactions WHERE target_type = 'post' AND target_id = ? AND user_id = ?");
                $stmt->execute([$post['id'], $currentUserId]);
                $reaction = $stmt->fetch();
                if ($reaction) {
                    $post['user_reacted'] = true;
                    $post['user_reaction_type'] = $reaction['reaction_type'];
                }
            }
        }

        Response::success('Feed fetched', [
            'posts' => $posts,
            'page' => $page,
            'limit' => $limit
        ]);
    }

    /**
     * Create a New Post / Article / Poll
     */
    public function createPost(array $authUser): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];

        $title = Validator::sanitize($body['title'] ?? '');
        $postBody = Validator::sanitize($body['body'] ?? '');
        $contentType = $body['content_type'] ?? 'text';
        $category = $body['category'] ?? 'For You';
        $visibility = $body['visibility'] ?? 'public';
        $mediaUrls = $body['media_urls'] ?? []; // array of { url, type, name }
        $pollData = $body['poll'] ?? null; // { question, options: [] }

        if (empty($postBody) && empty($title) && empty($pollData)) {
            Response::error('Post content or poll cannot be empty.');
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO posts (user_id, content_type, title, body, category, visibility) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $contentType, $title, $postBody, $category, $visibility]);
        $postId = (int) $this->db->lastInsertId();

        // Attach Media
        if (!empty($mediaUrls) && is_array($mediaUrls)) {
            $stmt = $this->db->prepare("INSERT INTO post_media (post_id, media_type, file_url, file_name) VALUES (?, ?, ?, ?)");
            foreach ($mediaUrls as $m) {
                $stmt->execute([$postId, $m['type'] ?? 'image', $m['url'], $m['name'] ?? null]);
            }
        }

        // Attach Poll
        if ($contentType === 'poll' && !empty($pollData['options'])) {
            $stmt = $this->db->prepare("INSERT INTO polls (post_id, question) VALUES (?, ?)");
            $stmt->execute([$postId, $pollData['question'] ?? $title]);
            $pollId = (int) $this->db->lastInsertId();

            $stmtOpt = $this->db->prepare("INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)");
            foreach ($pollData['options'] as $opt) {
                if (!empty(trim($opt))) {
                    $stmtOpt->execute([$pollId, trim($opt)]);
                }
            }
        }

        Response::success('Post created successfully', ['post_id' => $postId], 201);
    }

    /**
     * React / Like a post
     */
    public function reactPost(array $authUser, int $postId): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];
        $reactionType = $body['reaction_type'] ?? 'like';

        $stmt = $this->db->prepare("SELECT id FROM reactions WHERE target_type = 'post' AND target_id = ? AND user_id = ?");
        $stmt->execute([$postId, $userId]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Unlike / Remove reaction
            $stmt = $this->db->prepare("DELETE FROM reactions WHERE id = ?");
            $stmt->execute([$existing['id']]);
            $this->db->prepare("UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?")->execute([$postId]);
            Response::success('Reaction removed', ['reacted' => false]);
        } else {
            // Add reaction
            $stmt = $this->db->prepare("INSERT INTO reactions (user_id, target_type, target_id, reaction_type) VALUES (?, 'post', ?, ?)");
            $stmt->execute([$userId, $postId, $reactionType]);
            $this->db->prepare("UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?")->execute([$postId]);
            Response::success('Reaction added', ['reacted' => true, 'reaction_type' => $reactionType]);
        }
    }

    /**
     * Vote on a Poll
     */
    public function votePoll(array $authUser, int $pollId): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];
        $optionId = (int) ($body['option_id'] ?? 0);

        if ($optionId <= 0) {
            Response::error('Invalid poll option');
            return;
        }

        // Check if already voted
        $stmt = $this->db->prepare("SELECT id FROM poll_votes WHERE poll_id = ? AND user_id = ?");
        $stmt->execute([$pollId, $userId]);
        if ($stmt->fetch()) {
            Response::error('You have already voted on this poll.');
            return;
        }

        $stmt = $this->db->prepare("INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)");
        $stmt->execute([$pollId, $optionId, $userId]);

        $this->db->prepare("UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = ?")->execute([$optionId]);
        $this->db->prepare("UPDATE polls SET total_votes = total_votes + 1 WHERE id = ?")->execute([$pollId]);

        Response::success('Vote recorded successfully');
    }

    /**
     * Get Comments for a Post
     */
    public function getComments(int $postId): void {
        $stmt = $this->db->prepare("
            SELECT c.*, 
                   pr.full_name as author_name, pr.avatar_url as author_avatar, pr.headline as author_headline,
                   pp.verified_badge as is_author_verified
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN profiles pr ON u.id = pr.user_id
            LEFT JOIN professional_profiles pp ON u.id = pp.user_id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        ");
        $stmt->execute([$postId]);
        Response::success('Comments fetched', $stmt->fetchAll());
    }

    /**
     * Add Comment to Post
     */
    public function addComment(array $authUser, int $postId): void {
        $body = Validator::getJsonBody();
        $userId = $authUser['id'];
        $commentText = Validator::sanitize($body['comment_text'] ?? '');
        $parentId = !empty($body['parent_id']) ? (int) $body['parent_id'] : null;

        if (empty($commentText)) {
            Response::error('Comment text cannot be empty');
            return;
        }

        $stmt = $this->db->prepare("INSERT INTO comments (post_id, user_id, parent_id, comment_text) VALUES (?, ?, ?, ?)");
        $stmt->execute([$postId, $userId, $parentId, $commentText]);
        $commentId = (int) $this->db->lastInsertId();

        $this->db->prepare("UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?")->execute([$postId]);

        Response::success('Comment added', ['comment_id' => $commentId], 201);
    }
}
