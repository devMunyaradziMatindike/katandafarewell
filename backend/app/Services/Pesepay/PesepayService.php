<?php

namespace App\Services\Pesepay;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class PesepayService
{
    private PesepayCrypto $crypto;

    public function __construct()
    {
        $key = (string) config('pesepay.encryption_key');
        $this->crypto = new PesepayCrypto($key);
    }

    public function enabled(): bool
    {
        return (bool) config('pesepay.enabled')
            && filled(config('pesepay.integration_key'))
            && filled(config('pesepay.encryption_key'));
    }

    public function initiateRedirect(array $payload): array
    {
        return $this->postEncrypted('/v1/payments/initiate', $payload);
    }

    public function makePayment(array $payload): array
    {
        return $this->postEncrypted('/v2/payments/make-payment', $payload);
    }

    public function checkPayment(string $pollUrl): array
    {
        $response = Http::withHeaders($this->headers())
            ->acceptJson()
            ->timeout(30)
            ->get($pollUrl);

        if (! $response->successful()) {
            Log::warning('Pesepay poll failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new RuntimeException('Unable to check Pesepay payment status.');
        }

        $body = $response->json();

        if (isset($body['payload']) && is_string($body['payload'])) {
            return $this->crypto->decrypt($body['payload']);
        }

        return is_array($body) ? $body : [];
    }

    public function checkByReference(string $referenceNumber): array
    {
        $url = rtrim((string) config('pesepay.base_url'), '/')
            .'/v1/payments/check-payment?referenceNumber='.urlencode($referenceNumber);

        return $this->checkPayment($url);
    }

    public static function isPaidStatus(?string $status): bool
    {
        return in_array(strtoupper((string) $status), ['SUCCESS', 'PAID'], true);
    }

    public static function isFailedStatus(?string $status): bool
    {
        return in_array(strtoupper((string) $status), ['FAILED', 'CANCELLED', 'CANCELED'], true);
    }

    private function postEncrypted(string $path, array $payload): array
    {
        $url = rtrim((string) config('pesepay.base_url'), '/').$path;
        $encrypted = $this->crypto->encrypt($payload);

        try {
            $response = Http::withHeaders($this->headers())
                ->acceptJson()
                ->timeout(45)
                ->post($url, ['payload' => $encrypted])
                ->throw();
        } catch (RequestException $e) {
            Log::error('Pesepay request failed', [
                'path' => $path,
                'status' => $e->response?->status(),
                'body' => $e->response?->body(),
            ]);

            throw new RuntimeException(
                $this->friendlyError($e->response?->json() ?? [], $e->getMessage())
            );
        }

        $body = $response->json();

        if (! isset($body['payload']) || ! is_string($body['payload'])) {
            throw new RuntimeException('Unexpected Pesepay response.');
        }

        return $this->crypto->decrypt($body['payload']);
    }

    private function headers(): array
    {
        return [
            'authorization' => (string) config('pesepay.integration_key'),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    private function friendlyError(array $json, string $fallback): string
    {
        if (isset($json['message']) && is_string($json['message'])) {
            return $json['message'];
        }

        if (isset($json['payload']) && is_string($json['payload'])) {
            try {
                $decoded = $this->crypto->decrypt($json['payload']);
                if (isset($decoded['message']) && is_string($decoded['message'])) {
                    return $decoded['message'];
                }
            } catch (\Throwable) {
                // ignore
            }
        }

        return 'Payment provider error. Please try again.';
    }
}
