<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = Donation::query()->with('campaign:id,title')->latest();

        if (in_array($status, ['pending', 'confirmed', 'failed'], true)) {
            $query->where('status', $status);
        }

        $donations = $query->paginate(20);

        return response()->json($donations);
    }

    public function confirm(Donation $donation): JsonResponse
    {
        $donation->markConfirmed();

        return response()->json([
            'message' => 'Donation confirmed.',
            'data' => $donation->fresh(),
        ]);
    }

    public function reject(Donation $donation): JsonResponse
    {
        $donation->markFailed();

        return response()->json([
            'message' => 'Donation marked as failed.',
            'data' => $donation->fresh(),
        ]);
    }
}
