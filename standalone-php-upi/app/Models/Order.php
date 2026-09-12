<?php
declare(strict_types=1);

namespace App\Models;

use Database;
use PDO;

class Order {
    public static function create(array $data): string {
        $db = Database::getConnection();
        
        // Generate Order ID matching reference: VVV-XXXXXXXXXXXX (12 hex characters)
        $orderId = 'VVV-' . strtoupper(bin2hex(random_bytes(6)));
        
        $stmt = $db->prepare("
            INSERT INTO orders (
                order_id, customer_name, customer_email, customer_phone,
                product_id, product_name, amount, currency, status,
                customer_session_id, created_at, expires_at
            ) VALUES (
                :order_id, :customer_name, :customer_email, :customer_phone,
                :product_id, :product_name, :amount, :currency, 'pending',
                :session_id, NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE)
            )
        ");

        $stmt->execute([
            ':order_id'       => $orderId,
            ':customer_name'  => $data['customer_name'] ?? null,
            ':customer_email' => $data['customer_email'] ?? null,
            ':customer_phone' => $data['customer_phone'] ?? null,
            ':product_id'     => $data['product_id'],
            ':product_name'   => $data['product_name'],
            ':amount'         => $data['amount'],
            ':currency'       => $data['currency'] ?? 'INR',
            ':session_id'     => session_id() ?: null
        ]);

        return $orderId;
    }

    public static function findByOrderId(string $orderId): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM orders WHERE order_id = :order_id LIMIT 1");
        $stmt->execute([':order_id' => $orderId]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public static function updateStatus(string $orderId, string $status): bool {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE orders SET status = :status, updated_at = NOW() WHERE order_id = :order_id");
        return $stmt->execute([':status' => $status, ':order_id' => $orderId]);
    }

    public static function getAll(int $limit = 50, ?string $status = null): array {
        $db = Database::getConnection();
        if ($status && $status !== 'all') {
            $stmt = $db->prepare("
                SELECT o.*, pp.file_path as proof_path, pp.utr_reference 
                FROM orders o 
                LEFT JOIN payment_proofs pp ON o.order_id = pp.order_id 
                WHERE o.status = :status 
                ORDER BY o.created_at DESC LIMIT :limit
            ");
            $stmt->bindValue(':status', $status, PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $stmt = $db->prepare("
                SELECT o.*, pp.file_path as proof_path, pp.utr_reference 
                FROM orders o 
                LEFT JOIN payment_proofs pp ON o.order_id = pp.order_id 
                ORDER BY o.created_at DESC LIMIT :limit
            ");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
        }
        return $stmt->fetchAll();
    }
}
