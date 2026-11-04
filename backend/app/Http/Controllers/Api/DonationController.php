<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDonationRequest;
use App\Models\Campaign;
use App\Models\Donation;
use App\Services\Pesepay\PesepayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class DonationController extends Controller
{
    public function __construct(private PesepayService $pesepay) {}

    public function index(Request $request): JsonResponse
    {
        $campaign = Campaign::query()->where('is_active', true)->latest()->firstOrFail();
        $limit = min((int) $request->query('limit', 20), 50);

        $donations = $campaign->confirmedDonations()
            ->latest('confirmed_at')
            ->limit($limit)
            ->get()
            ->map(fn (Donation $donation) => [
                'id' => $donation->id,
                'donor_name' => $donation->displayName(),
                'amount' => (float) $donation->amount,
                'currency' => $donation->currency,
                'message' => $donation->message,
                'confirmed_at' => optional($donation->confirmed_at)->toIso8601String(),
            ]);

        return response()->json(['data' => $donations]);
    }

    public function store(StoreDonationRequest $request): JsonResponse
    {
        if (! $this->pesepay->enabled()) {
            return response()->json([
                'message' => 'Online payments are not configured yet.',
            ], 503);
        }

        $campaign = Campaign::query()->where('is_active', true)->latest()->firstOrFail();
        $method = $request->string('payment_method')->toString();

        $donation = $campaign->donations()->create([
            'donor_name' => $request->input('donor_name'),
            'donor_email' => $request->input('donor_email'),
            'customer_phone' => $request->input('customer_phone'),
            'amount' => $request->input('amount'),
            'currency' => config('pesepay.currency', 'USD'),
            'message' => $request->input('message'),
            'is_anonymous' => $request->boolean('is_anonymous'),
            'status' => 'pending',
            'payment_method' => $method,
            'payment_provider' => 'pesepay',
        ]);

        try {
            if ($method === 'ecoCash') {
                return $this->startEcoCash($donation, $campaign);
            }

            return $this->startRedirect($donation, $campaign);
        } catch (Throwable $e) {
            Log::error('Pesepay initiate failed', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
            ]);

            $donation->update(['status' => 'failed']);

            return response()->json([
                'message' => $e instanceof RuntimeException
                    ? $e->getMessage()
                    : 'Could not start payment. Please try again.',
            ], 422);
        }
    }

    public function status(string $publicRef): JsonResponse
    {
        $donation = Donation::query()->where('public_ref', $publicRef)->firstOrFail();

        if ($donation->status === 'pending' && ($donation->poll_url || $donation->provider_reference)) {
            try {
                $payload = $donation->poll_url
                    ? $this->pesepay->checkPayment($donation->poll_url)
                    : $this->pesepay->checkByReference((string) $donation->provider_reference);
                $this->applyPesepayStatus($donation, $payload);
                $donation->refresh();
            } catch (Throwable $e) {
                Log::warning('Pesepay status poll failed', [
                    'donation_id' => $donation->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'data' => [
                'id' => $donation->id,
                'public_ref' => $donation->public_ref,
                'amount' => (float) $donation->amount,
                'currency' => $donation->currency,
                'status' => $donation->status,
                'paid' => $donation->status === 'confirmed',
                'payment_method' => $donation->payment_method,
            ],
        ]);
    }

    public function result(Request $request, string $publicRef): JsonResponse
    {
        $donation = Donation::query()->where('public_ref', $publicRef)->firstOrFail();

        // Acknowledge quickly; Pesepay does not retry failed deliveries.
        try {
            // Callback body is plain JSON (not encrypted). Prefer an authoritative poll.
            $callbackBody = $request->all();
            if ($request->filled('payload') && is_string($request->input('payload'))) {
                try {
                    $crypto = new \App\Services\Pesepay\PesepayCrypto((string) config('pesepay.encryption_key'));
                    $callbackBody = $crypto->decrypt($request->input('payload'));
                } catch (Throwable $e) {
                    Log::warning('Pesepay result payload decrypt failed', [
                        'donation_id' => $donation->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if (is_array($callbackBody) && $callbackBody !== []) {
                $donation->update([
                    'provider_meta' => array_merge($donation->provider_meta ?? [], [
                        'last_result_callback' => $callbackBody,
                    ]),
                    'provider_reference' => $callbackBody['referenceNumber']
                        ?? $donation->provider_reference,
                    'poll_url' => $callbackBody['pollUrl'] ?? $donation->poll_url,
                ]);
            }

            $payload = null;
            if ($donation->poll_url) {
                $payload = $this->pesepay->checkPayment($donation->poll_url);
            } elseif ($donation->provider_reference) {
                $payload = $this->pesepay->checkByReference($donation->provider_reference);
            } elseif (is_array($callbackBody) && isset($callbackBody['transactionStatus'])) {
                $payload = $callbackBody;
            }

            if (is_array($payload)) {
                $this->applyPesepayStatus($donation, $payload);
            }
        } catch (Throwable $e) {
            Log::warning('Pesepay result callback failed', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json(['message' => 'ok']);
    }

    private function startEcoCash(Donation $donation, Campaign $campaign): JsonResponse
    {
        $phone = (string) $donation->customer_phone;
        $urls = $this->callbackUrls($donation);

        $response = $this->pesepay->makePayment([
            'amountDetails' => [
                'amount' => (float) $donation->amount,
                'currencyCode' => config('pesepay.currency', 'USD'),
            ],
            'merchantReference' => 'donation-'.$donation->public_ref,
            'reasonForPayment' => 'Farewell donation #'.$donation->id,
            'resultUrl' => $urls['result'],
            'returnUrl' => $urls['return'],
            'paymentMethodCode' => config('pesepay.ecocash_method_code', 'PZW211'),
            'customer' => [
                'email' => $donation->donor_email ?: 'donor@katandafarewell.test',
                'phoneNumber' => $phone,
                'name' => $donation->donor_name ?: 'Anonymous Donor',
            ],
            'paymentMethodRequiredFields' => [
                'customerPhoneNumber' => $phone,
            ],
        ]);

        $donation->update([
            'provider_reference' => $response['referenceNumber'] ?? null,
            'poll_url' => $response['pollUrl'] ?? null,
            'provider_meta' => $response,
        ]);

        return response()->json([
            'message' => 'Approve the EcoCash PIN prompt on your phone.',
            'next' => 'poll',
            'data' => [
                'id' => $donation->id,
                'public_ref' => $donation->public_ref,
                'amount' => (float) $donation->amount,
                'status' => $donation->status,
                'payment_method' => $donation->payment_method,
            ],
        ], 201);
    }

    private function startRedirect(Donation $donation, Campaign $campaign): JsonResponse
    {
        $urls = $this->callbackUrls($donation);

        $response = $this->pesepay->initiateRedirect([
            'amountDetails' => [
                'amount' => (float) $donation->amount,
                'currencyCode' => config('pesepay.currency', 'USD'),
            ],
            'reasonForPayment' => 'Farewell donation #'.$donation->id,
            'resultUrl' => $urls['result'],
            'returnUrl' => $urls['return'],
            'merchantReference' => 'donation-'.$donation->public_ref,
        ]);

        $redirectUrl = $response['redirectUrl'] ?? null;

        if (! $redirectUrl) {
            throw new RuntimeException('Pesepay did not return a checkout URL.');
        }

        $donation->update([
            'provider_reference' => $response['referenceNumber'] ?? null,
            'poll_url' => $response['pollUrl'] ?? null,
            'redirect_url' => $redirectUrl,
            'provider_meta' => $response,
        ]);

        return response()->json([
            'message' => 'Redirecting to secure checkout.',
            'next' => 'redirect',
            'checkout_url' => $redirectUrl,
            'data' => [
                'id' => $donation->id,
                'public_ref' => $donation->public_ref,
                'amount' => (float) $donation->amount,
                'status' => $donation->status,
                'payment_method' => $donation->payment_method,
            ],
        ], 201);
    }

    private function callbackUrls(Donation $donation): array
    {
        $apiBase = rtrim((string) config('app.url'), '/');
        $frontBase = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');

        return [
            'result' => $apiBase.'/api/donations/'.$donation->public_ref.'/pesepay/result',
            'return' => $frontBase.'/thank-you?ref='.$donation->public_ref
                .'&amount='.$donation->amount
                .'&poll=1',
        ];
    }

    private function applyPesepayStatus(Donation $donation, array $payload): void
    {
        [$status, $statusCode] = PesepayService::extractStatus($payload);

        $donation->update([
            'provider_meta' => array_merge($donation->provider_meta ?? [], [
                'last_status_check' => $payload,
            ]),
            'provider_reference' => isset($payload['referenceNumber']) && is_string($payload['referenceNumber'])
                ? trim($payload['referenceNumber'])
                : $donation->provider_reference,
            'poll_url' => $payload['pollUrl'] ?? $donation->poll_url,
        ]);

        if (PesepayService::isPaidStatus($status, $statusCode)) {
            $donation->markConfirmed();

            return;
        }

        if (PesepayService::isFailedStatus($status, $statusCode)) {
            $donation->markFailed();
        }
    }
}
