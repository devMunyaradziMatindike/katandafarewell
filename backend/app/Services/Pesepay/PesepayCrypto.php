<?php

namespace App\Services\Pesepay;

use RuntimeException;

final class PesepayCrypto
{
    private const ALGO = 'AES-256-CBC';

    public function __construct(private string $encryptionKey)
    {
        if (strlen($this->encryptionKey) !== 32) {
            throw new RuntimeException('Pesepay encryption key must be exactly 32 characters.');
        }
    }

    public function encrypt(array $payload): string
    {
        $iv = substr($this->encryptionKey, 0, 16);
        $json = json_encode($payload, JSON_UNESCAPED_SLASHES);
        $encrypted = openssl_encrypt($json, self::ALGO, $this->encryptionKey, 0, $iv);

        if ($encrypted === false) {
            throw new RuntimeException('Pesepay encrypt failed.');
        }

        return $encrypted;
    }

    public function decrypt(string $encryptedBase64): array
    {
        $iv = substr($this->encryptionKey, 0, 16);
        $cipherRaw = base64_decode($encryptedBase64, true);

        if ($cipherRaw === false) {
            throw new RuntimeException('Invalid Pesepay payload encoding.');
        }

        $decrypted = openssl_decrypt($cipherRaw, self::ALGO, $this->encryptionKey, OPENSSL_RAW_DATA, $iv);

        if ($decrypted === false) {
            $iv = substr($cipherRaw, 0, 16);
            $cipher = substr($cipherRaw, 16);
            $decrypted = openssl_decrypt($cipher, self::ALGO, $this->encryptionKey, OPENSSL_RAW_DATA, $iv);
        }

        if ($decrypted === false) {
            throw new RuntimeException('Pesepay decrypt failed.');
        }

        $data = json_decode($decrypted, true);

        if (! is_array($data)) {
            throw new RuntimeException('Invalid JSON after Pesepay decrypt.');
        }

        return $data;
    }
}
