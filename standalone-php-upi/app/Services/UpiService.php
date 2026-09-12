<?php
declare(strict_types=1);

namespace App\Services;

class UpiService {
    public static function buildPayload(string $vpa, string $payeeName, float $amount, string $orderId, string $note = ''): array {
        $cleanVpa = trim($vpa);
        $cleanName = trim($payeeName);
        $cleanAmount = number_format($amount, 2, '.', '');
        $cleanNote = $note ?: "Order {$orderId}";

        $params = http_build_query([
            'pa' => $cleanVpa,
            'pn' => $cleanName,
            'am' => $cleanAmount,
            'cu' => 'INR',
            'tn' => $cleanNote,
            'tr' => $orderId
        ]);

        $genericIntent = "upi://pay?{$params}";

        return [
            'generic' => $genericIntent,
            'phonepe' => "phonepe://pay?{$params}",
            'paytm'   => "paytmmp://pay?{$params}",
            'gpay'    => "gpay://upi/pay?{$params}",
            'bhim'    => "bhim://pay?{$params}",
            'cred'    => "cred://pay?{$params}"
        ];
    }
}
