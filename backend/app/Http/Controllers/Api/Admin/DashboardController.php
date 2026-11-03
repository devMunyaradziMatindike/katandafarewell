<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function overview(): JsonResponse
    {
        $campaign = Campaign::query()->latest()->first();

        if (! $campaign) {
            return response()->json([
                'message' => 'No campaign found.',
            ], 404);
        }

        $confirmedQuery = Donation::query()
            ->where('campaign_id', $campaign->id)
            ->where('status', 'confirmed');

        $pendingQuery = Donation::query()
            ->where('campaign_id', $campaign->id)
            ->where('status', 'pending');

        $confirmedCount = (clone $confirmedQuery)->count();
        $pendingCount = (clone $pendingQuery)->count();
        $pendingAmount = (float) (clone $pendingQuery)->sum('amount');
        $averageDonation = (float) ((clone $confirmedQuery)->avg('amount') ?? 0);

        $today = Donation::query()
            ->where('campaign_id', $campaign->id)
            ->where('status', 'confirmed')
            ->whereDate('confirmed_at', Carbon::today())
            ->sum('amount');

        $recent = Donation::query()
            ->where('campaign_id', $campaign->id)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Donation $donation) => [
                'id' => $donation->id,
                'donor_name' => $donation->displayName(),
                'amount' => (float) $donation->amount,
                'status' => $donation->status,
                'payment_method' => $donation->payment_method,
                'created_at' => $donation->created_at->toIso8601String(),
            ]);

        $byMethod = Donation::query()
            ->where('campaign_id', $campaign->id)
            ->where('status', 'confirmed')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();

        return response()->json([
            'data' => [
                'campaign' => [
                    'id' => $campaign->id,
                    'title' => $campaign->title,
                    'goal_amount' => (float) $campaign->goal_amount,
                    'raised_amount' => (float) $campaign->raised_amount,
                    'currency' => $campaign->currency,
                    'event_date' => $campaign->event_date->toDateString(),
                    'progress_percent' => $campaign->progressPercent(),
                    'is_active' => $campaign->is_active,
                ],
                'stats' => [
                    'total_raised' => (float) $campaign->raised_amount,
                    'goal_amount' => (float) $campaign->goal_amount,
                    'progress_percent' => $campaign->progressPercent(),
                    'confirmed_donations' => $confirmedCount,
                    'pending_donations' => $pendingCount,
                    'pending_amount' => $pendingAmount,
                    'raised_today' => (float) $today,
                    'average_donation' => $averageDonation,
                    'donor_count' => $confirmedCount,
                ],
                'by_payment_method' => $byMethod,
                'recent_donations' => $recent,
            ],
        ]);
    }
}
