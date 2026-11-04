<?php

namespace App\Console\Commands;

use App\Models\Donation;
use App\Services\Pesepay\PesepayService;
use Illuminate\Console\Command;
use Throwable;

class ReconcilePendingDonations extends Command
{
    protected $signature = 'donations:reconcile-pending {--hours=48 : Only check donations created within this many hours}';

    protected $description = 'Re-check pending Pesepay donations (especially redirect/card) and confirm paid ones';

    public function handle(PesepayService $pesepay): int
    {
        if (! $pesepay->enabled()) {
            $this->warn('Pesepay is not configured.');

            return self::FAILURE;
        }

        $hours = max(1, (int) $this->option('hours'));

        $donations = Donation::query()
            ->where('status', 'pending')
            ->where('payment_provider', 'pesepay')
            ->where('created_at', '>=', now()->subHours($hours))
            ->where(function ($query) {
                $query->whereNotNull('poll_url')
                    ->orWhereNotNull('provider_reference');
            })
            ->orderBy('id')
            ->get();

        if ($donations->isEmpty()) {
            $this->info('No pending donations to reconcile.');

            return self::SUCCESS;
        }

        $confirmed = 0;
        $failed = 0;
        $unchanged = 0;

        foreach ($donations as $donation) {
            try {
                $payload = $donation->poll_url
                    ? $pesepay->checkPayment($donation->poll_url)
                    : $pesepay->checkByReference((string) $donation->provider_reference);

                [$status, $statusCode] = PesepayService::extractStatus($payload);

                $donation->update([
                    'provider_meta' => array_merge($donation->provider_meta ?? [], [
                        'last_status_check' => $payload,
                        'last_reconcile_at' => now()->toIso8601String(),
                    ]),
                    'provider_reference' => isset($payload['referenceNumber']) && is_string($payload['referenceNumber'])
                        ? trim($payload['referenceNumber'])
                        : $donation->provider_reference,
                    'poll_url' => $payload['pollUrl'] ?? $donation->poll_url,
                ]);

                if (PesepayService::isPaidStatus($status, $statusCode)) {
                    $donation->markConfirmed();
                    $confirmed++;
                    $this->info("Confirmed #{$donation->id} ({$donation->public_ref})");
                } elseif (PesepayService::isFailedStatus($status, $statusCode)) {
                    $donation->markFailed();
                    $failed++;
                    $this->warn("Failed #{$donation->id} ({$donation->public_ref}) status=".($status ?? 'n/a'));
                } else {
                    $unchanged++;
                    $this->line("Still pending #{$donation->id} status=".($status ?? 'n/a'));
                }
            } catch (Throwable $e) {
                $unchanged++;
                $this->error("Error #{$donation->id}: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info("Done. confirmed={$confirmed} failed={$failed} unchanged={$unchanged}");

        return self::SUCCESS;
    }
}
