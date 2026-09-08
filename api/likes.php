<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const ALLOWED_TYPES = ['notes'];
const DB_FILE = __DIR__ . '/../data/likes.db';

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('sqlite:' . DB_FILE);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_TIMEOUT, 5);
        $pdo->exec('CREATE TABLE IF NOT EXISTS likes (
            type    TEXT NOT NULL,
            item_id TEXT NOT NULL,
            count   INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (type, item_id)
        )');
    }
    return $pdo;
}

function fail(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $type = $_GET['type'] ?? 'notes';
        if (!in_array($type, ALLOWED_TYPES, true)) fail(400, 'invalid type');
        $stmt = db()->prepare('SELECT item_id, count FROM likes WHERE type = ?');
        $stmt->execute([$type]);
        $counts = new stdClass();
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $counts->{$row['item_id']} = (int)$row['count'];
        }
        echo json_encode(['ok' => true, 'counts' => $counts]);
        exit;
    }

    if ($method === 'POST') {
        $in = json_decode(file_get_contents('php://input'), true);
        if (!is_array($in)) fail(400, 'invalid json');
        $type = $in['type'] ?? 'notes';
        $id = isset($in['id']) ? trim((string)$in['id']) : '';
        $action = $in['action'] ?? 'like';
        if (!in_array($type, ALLOWED_TYPES, true) || $id === '' || !in_array($action, ['like', 'unlike'], true)) {
            fail(400, 'invalid params');
        }
        $delta = $action === 'like' ? 1 : -1;

        $pdo = db();
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('SELECT count FROM likes WHERE type = ? AND item_id = ?');
        $stmt->execute([$type, $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            $count = max(0, $delta);
            $pdo->prepare('INSERT INTO likes (type, item_id, count) VALUES (?, ?, ?)')
                ->execute([$type, $id, $count]);
        } else {
            $count = max(0, (int)$row['count'] + $delta);
            $pdo->prepare('UPDATE likes SET count = ? WHERE type = ? AND item_id = ?')
                ->execute([$count, $type, $id]);
        }
        $pdo->commit();

        echo json_encode(['ok' => true, 'count' => $count]);
        exit;
    }

    fail(405, 'method not allowed');
} catch (Throwable $e) {
    error_log('likes.php: ' . $e->getMessage());
    fail(500, 'server error');
}
