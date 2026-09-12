<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentProof;
use App\Models\ManualReview;
use App\Helpers\Logger;
use Exception;

class PaymentService {
    private array $config;
    private PaymentProviderInterface $provider;

    public function __construct(array $config) {
        $this->config = $config;
        $this->provider = new UpiDirectAdapter($config);
    }

    public function initializePayment(array $customerData, float $amount, int $productId, string $productName): array {
        $orderId = Order::create([
            'customer_name'  => $customerData['name'] ?? null,
            'customer_email' => $customerData['email'] ?? null,
            'customer_phone' => $customerData['phone'] ?? null,
            'product_id'     => $productId,
            'product_name'   => $productName,
            'amount'         => $amount,
            'currency'       => 'INR'
        ]);

        $order = Order::findByOrderId($orderId);
        if (!$order) {
            throw new Exception("Order creation failed");
        }

        $paymentDetails = $this->provider->createPaymentOrder($order);

        Payment::create([
            'order_id'       => $orderId,
            'provider'       => $paymentDetails['provider'],
            'amount'         => $amount,
            'currency'       => 'INR',
            'payment_method' => 'upi',
            'status'         => 'pending'
        ]);

        Logger::logEvent($orderId, 'order_initialized', [
            'amount'   => $amount,
            'provider' => $paymentDetails['provider']
        ]);

        return [
            'order_id'       => $orderId,
            'amount'         => $amount,
            'currency'       => 'INR',
            'status'         => 'pending',
            'payment'        => $paymentDetails
        ];
    }

    public function processScreenshotProof(string $orderId, array $file, ?string $utr): array {
        $order = Order::findByOrderId($orderId);
        if (!$order) {
            throw new Exception("Invalid order ID");
        }

        // Validate file error
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("File upload failed with error code: " . $file['error']);
        }

        // Validate size (5MB max)
        if ($file['size'] > $this->config['max_upload_bytes']) {
            throw new Exception("Screenshot exceeds maximum allowed size of 5MB");
        }

        // Validate MIME type with finfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, $this->config['allowed_mimes'], true)) {
            throw new Exception("Invalid image type ({$mime}). Only JPG, PNG, and WebP are allowed.");
        }

        $ext = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            default      => 'bin'
        };

        // Secure randomized filename
        $safeFilename = 'proof_' . $orderId . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
        $targetDir = $this->config['storage_dir'];
        
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $targetPath = $targetDir . '/' . $safeFilename;
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception("Could not save screenshot to storage");
        }

        $proofId = PaymentProof::create([
            'order_id'      => $orderId,
            'filename'      => $safeFilename,
            'file_path'     => '/storage/uploads/' . $safeFilename,
            'mime_type'     => $mime,
            'file_size'     => $file['size'],
            'utr_reference' => $utr
        ]);

        // Transition order status to manual_review
        Order::updateStatus($orderId, 'manual_review');
        ManualReview::queue($orderId, $proofId, "Screenshot submitted. Queued for manual verification.");

        Logger::logEvent($orderId, 'proof_uploaded', [
            'proof_id' => $proofId,
            'filename' => $safeFilename,
            'utr'      => $utr
        ]);

        return [
            'success'   => true,
            'order_id'  => $orderId,
            'status'    => 'manual_review',
            'proof_id'  => $proofId,
            'message'   => 'Screenshot received. Order moved to manual review queue.'
        ];
    }
}
