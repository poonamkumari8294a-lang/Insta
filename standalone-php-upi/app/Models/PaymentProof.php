<?php
declare(strict_types=1);

namespace App\Models;

use Database;
use PDO;

class PaymentProof {
    public static function create(array $data): int {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO payment_proofs (
                order_id, filename, file_path, mime_type, file_size,
                utr_reference, ip_address, status, created_at
            ) VALUES (
                :order_id, :filename, :file_path, :mime_type, :file_size,
                :utr_reference, :ip_address, 'pending', NOW()
            )
        ");

        $stmt->execute([
            ':order_id'      => $data['order_id'],
            ':filename'      => $data['filename'],
            ':file_path'     => $data['file_path'],
            ':mime_type'     => $data['mime_type'],
            ':file_size'     => $data['file_size'],
            ':utr_reference' => $data['utr_reference'] ?? null,
            ':ip_address'    => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        ]);

        return (int)$db->lastInsertId();
    }

    public static function findByOrderId(string $orderId): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM payment_proofs WHERE order_id = :order_id ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([':order_id' => $orderId]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public static function updateStatus(int $proofId, string $status): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE payment_proofs SET status = :status, updated_at = NOW() WHERE id = :id");
        return $stmt->execute([':status' => $status, ':id' => $proofId]);
    }
}
