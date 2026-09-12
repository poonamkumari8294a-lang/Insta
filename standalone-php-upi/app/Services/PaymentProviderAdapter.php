<?php
declare(strict_types=1);

namespace App\Services;

interface PaymentProviderInterface {
    public function createPaymentOrder(array $orderData): array;
    public function verifyWebhook(string $payload, string $signature): bool;
    public function parseWebhook(string $payload): array;
}

class UpiDirectAdapter implements PaymentProviderInterface {
    private array $config;

    public function __construct(array $config) {
        $this->config = $config;
    }

    public function createPaymentOrder(array $orderData): array {
        $vpa = $this->config['upi_vpa'] ?? 'payee@upi';
        $merchant = $this->config['merchant_name'] ?? 'Exclusive Content Hub';
        
        $urls = UpiService::buildPayload(
            $vpa,
            $merchant,
            (float)$orderData['amount'],
            $orderData['order_id'],
            "Order {$orderData['order_id']}"
        );

        $qrUrl = QrService::getQrImageUrl($urls['generic'], 300);

        return [
            'provider'       => 'upi_direct',
            'upi_string'     => $urls['generic'],
            'qr_image_url'   => $qrUrl,
            'app_urls'       => $urls,
            'expires_in_sec' => ($this->config['timeout_minutes'] ?? 30) * 60
        ];
    }

    public function verifyWebhook(string $payload, string $signature): bool {
        $secret = $this->config['webhook_secret'] ?? '';
        if (empty($secret)) return false;
        $expected = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected, $signature);
    }

    public function parseWebhook(string $payload): array {
        $data = json_decode($payload, true) ?: [];
        return [
            'order_id'       => $data['order_id'] ?? null,
            'transaction_id' => $data['transaction_id'] ?? null,
            'amount'         => $data['amount'] ?? null,
            'status'         => $data['status'] ?? 'failed'
        ];
    }
}
