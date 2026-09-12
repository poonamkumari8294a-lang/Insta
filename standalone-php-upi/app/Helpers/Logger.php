<?php
declare(strict_types=1);

namespace App\Helpers;

use Database;
use PDO;

class Logger {
    public static function logEvent(?string $orderId, string $eventType, array $payload, ?string $signature = null): void {
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                INSERT INTO payment_events (order_id, event_type, payload, signature, ip_address, created_at)
                VALUES (:order_id, :event_type, :payload, :signature, :ip_address, NOW())
            ");
            $stmt->execute([
                ':order_id' => $orderId,
                ':event_type' => $eventType,
                ':payload' => json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                ':signature' => $signature,
                ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);
        } catch (\Throwable $e) {
            error_log("Failed to log payment event: " . $e->getMessage());
        }
    }

    public static function logAdminAction(int $adminId, string $action, string $targetType, string $targetId, ?string $details = null): void {
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address, created_at)
                VALUES (:admin_id, :action, :target_type, :target_id, :details, :ip_address, NOW())
            ");
            $stmt->execute([
                ':admin_id' => $adminId,
                ':action' => $action,
                ':target_type' => $targetType,
                ':target_id' => $targetId,
                ':details' => $details,
                ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);
        } catch (\Throwable $e) {
            error_log("Failed to log admin action: " . $e->getMessage());
        }
    }
}
