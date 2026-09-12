<?php
declare(strict_types=1);

namespace App\Models;

use Database;
use PDO;

class ManualReview {
    public static function queue(string $orderId, ?int $proofId, ?string $notes = null): int {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO manual_reviews (order_id, proof_id, review_status, admin_notes, created_at)
            VALUES (:order_id, :proof_id, 'queued', :notes, NOW())
        ");
        $stmt->execute([
            ':order_id' => $orderId,
            ':proof_id' => $proofId,
            ':notes'    => $notes
        ]);
        return (int)$db->lastInsertId();
    }

    public static function process(string $orderId, string $status, int $adminId, ?string $notes = null): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            UPDATE manual_reviews 
            SET review_status = :status, reviewed_by = :admin_id, admin_notes = :notes, reviewed_at = NOW() 
            WHERE order_id = :order_id AND review_status IN ('queued', 'under_review')
        ");
        return $stmt->execute([
            ':status'   => $status,
            ':admin_id' => $adminId,
            ':notes'    => $notes,
            ':order_id' => $orderId
        ]);
    }
}
