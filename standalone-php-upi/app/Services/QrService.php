<?php
declare(strict_types=1);

namespace App\Services;

class QrService {
    public static function getQrImageUrl(string $upiString, int $size = 300): string {
        $encoded = urlencode($upiString);
        return "https://api.qrserver.com/v1/create-qr-code/?size={$size}x{$size}&margin=10&data={$encoded}";
    }
}
