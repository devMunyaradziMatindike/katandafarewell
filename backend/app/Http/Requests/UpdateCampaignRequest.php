<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'beneficiary' => ['sometimes', 'string', 'max:255'],
            'story' => ['sometimes', 'string'],
            'goal_amount' => ['sometimes', 'numeric', 'min:1'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'event_date' => ['sometimes', 'date'],
            'hero_image' => ['nullable', 'string', 'max:500'],
            'organizer_name' => ['nullable', 'string', 'max:255'],
            'payment_instructions' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
