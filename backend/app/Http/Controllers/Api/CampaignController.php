<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;

class CampaignController extends Controller
{
    public function show(): JsonResponse
    {
        $campaign = Campaign::query()->where('is_active', true)->latest()->firstOrFail();

        $donorCount = $campaign->confirmedDonations()->count();

        return response()->json([
            'data' => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'beneficiary' => $campaign->beneficiary,
                'story' => $campaign->story,
                'goal_amount' => (float) $campaign->goal_amount,
                'raised_amount' => (float) $campaign->raised_amount,
                'currency' => $campaign->currency,
                'event_date' => $campaign->event_date->toDateString(),
                'hero_image' => $campaign->hero_image,
                'organizer_name' => $campaign->organizer_name,
                'payment_instructions' => $campaign->payment_instructions,
                'progress_percent' => $campaign->progressPercent(),
                'donor_count' => $donorCount,
            ],
        ]);
    }
}
