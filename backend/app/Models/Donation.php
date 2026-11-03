<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Donation extends Model
{
    protected $fillable = [
        'campaign_id',
        'public_ref',
        'donor_name',
        'donor_email',
        'customer_phone',
        'amount',
        'currency',
        'message',
        'is_anonymous',
        'status',
        'payment_method',
        'payment_reference',
        'payment_provider',
        'provider_reference',
        'poll_url',
        'redirect_url',
        'provider_meta',
        'confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_anonymous' => 'boolean',
            'confirmed_at' => 'datetime',
            'provider_meta' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Donation $donation) {
            if (blank($donation->public_ref)) {
                $donation->public_ref = (string) Str::uuid();
            }
        });
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function displayName(): string
    {
        if ($this->is_anonymous || blank($this->donor_name)) {
            return 'Anonymous';
        }

        return $this->donor_name;
    }

    public function markConfirmed(): void
    {
        if ($this->status === 'confirmed') {
            return;
        }

        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        $this->campaign->recalculateRaisedAmount();
    }

    public function markFailed(): void
    {
        if ($this->status === 'failed') {
            return;
        }

        $wasConfirmed = $this->status === 'confirmed';

        $this->update([
            'status' => 'failed',
            'confirmed_at' => null,
        ]);

        if ($wasConfirmed) {
            $this->campaign->recalculateRaisedAmount();
        }
    }
}
