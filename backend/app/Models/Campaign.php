<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    protected $fillable = [
        'title',
        'beneficiary',
        'story',
        'goal_amount',
        'raised_amount',
        'currency',
        'event_date',
        'hero_image',
        'organizer_name',
        'payment_instructions',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'goal_amount' => 'decimal:2',
            'raised_amount' => 'decimal:2',
            'event_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function confirmedDonations(): HasMany
    {
        return $this->hasMany(Donation::class)->where('status', 'confirmed');
    }

    public function progressPercent(): float
    {
        if ((float) $this->goal_amount <= 0) {
            return 0;
        }

        return min(100, round(((float) $this->raised_amount / (float) $this->goal_amount) * 100, 1));
    }

    public function recalculateRaisedAmount(): void
    {
        $this->raised_amount = $this->confirmedDonations()->sum('amount');
        $this->save();
    }
}
