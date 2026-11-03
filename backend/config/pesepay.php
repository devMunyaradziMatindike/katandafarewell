<?php

$sandbox = filter_var(env('PESEPAY_SANDBOX', true), FILTER_VALIDATE_BOOLEAN);

return [
    'enabled' => filter_var(env('PESEPAY_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
    'sandbox' => $sandbox,
    'integration_key' => env('PESEPAY_INTEGRATION_KEY'),
    'encryption_key' => env('PESEPAY_ENCRYPTION_KEY'),
    'currency' => env('PESEPAY_CURRENCY', 'USD'),
    'ecocash_method_code' => env('PESEPAY_ECOCASH_METHOD_CODE', 'PZW211'),
    'base_url' => $sandbox
        ? 'https://api.test.sandbox.pesepay.com/payments-engine'
        : 'https://api.pesepay.com/api/payments-engine',
];
