<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->uuid('public_ref')->nullable()->unique()->after('id');
            $table->string('payment_provider')->nullable()->after('payment_reference');
            $table->string('provider_reference')->nullable()->after('payment_provider');
            $table->string('poll_url', 500)->nullable()->after('provider_reference');
            $table->string('redirect_url', 500)->nullable()->after('poll_url');
            $table->string('customer_phone')->nullable()->after('donor_email');
            $table->json('provider_meta')->nullable()->after('redirect_url');
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn([
                'public_ref',
                'payment_provider',
                'provider_reference',
                'poll_url',
                'redirect_url',
                'customer_phone',
                'provider_meta',
            ]);
        });
    }
};
