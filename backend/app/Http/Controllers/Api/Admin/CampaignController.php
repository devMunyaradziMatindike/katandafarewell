<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCampaignRequest;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;

class CampaignController extends Controller
{
    public function show(): JsonResponse
    {
        $campaign = Campaign::query()->latest()->firstOrFail();

        return response()->json(['data' => $campaign]);
    }

    public function update(UpdateCampaignRequest $request): JsonResponse
    {
        $campaign = Campaign::query()->latest()->firstOrFail();
        $campaign->update($request->validated());

        return response()->json([
            'message' => 'Campaign updated.',
            'data' => $campaign->fresh(),
        ]);
    }
}
