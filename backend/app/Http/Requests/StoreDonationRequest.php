<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1'],
            'donor_name' => ['nullable', 'string', 'max:120'],
            'donor_email' => ['nullable', 'email', 'max:255'],
            'message' => ['nullable', 'string', 'max:500'],
            'is_anonymous' => ['sometimes', 'boolean'],
            'payment_method' => ['required', 'string', Rule::in(['ecoCash', 'redirect'])],
            'customer_phone' => [
                Rule::requiredIf(fn () => $this->input('payment_method') === 'ecoCash'),
                'nullable',
                'string',
                'regex:/^0(7[7-8]|71)\d{7}$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_phone.required' => 'Enter your EcoCash phone number.',
            'customer_phone.regex' => 'Use a valid EcoCash number, e.g. 0771234567.',
        ];
    }
}
