<?php
declare(strict_types=1);

namespace App\Models;

use Database;
use PDO;

class Payment {
    public static function create(array $data): int {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO payments (
                order_id, provider, provider_payment_id, transaction_id,
                amount, currency, payment_method, status, raw_reference, created_at
            ) VALUES (
                :order_id, :provider, :provider_payment_id, :transaction_id,
                :amount, :currency, :payment_method, :status, :raw_reference, NOW()
            )
        ");

        $stmt->execute([
            ':order_id'            => $data['order_id'],
            ':provider'            => $data['provider'] ?? 'upi_direct',
            ':provider_payment_id' => $data['provider_payment_id'] ?? null,
            ':transaction_id'      => $data['transaction_id'] ?? null,
            ':amount'              => $data['amount'],
            ':currency'            => $data['currency'] ?? 'INR',
            ':payment_method'      => $data['payment_method'] ?? 'upi',
            ':status'              => $data['status'] ?? 'pending',
            ':raw_reference'       => $data['raw_reference'] ?? null
        ]);

        return (int)$db->lastInsertId();
    }

    public static function findByOrderId(string $orderId): ?array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM payments WHERE order_id = :order_id ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([':order_id' => $orderId]);
        $res = $stmt->fetch();
        return $res ?: null;
    }
}
