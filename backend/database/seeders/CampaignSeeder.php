<?php

namespace Database\Seeders;

use App\Models\Campaign;
use Illuminate\Database\Seeder;

class CampaignSeeder extends Seeder
{
    public function run(): void
    {
        $campaign = Campaign::query()->updateOrCreate(
            ['title' => 'Farewell Tribute for Mr Thompson Katanda'],
            [
                'beneficiary' => 'Mr Thompson Katanda',
                'story' => "After 27 years of dedicated leadership, service, and care for our school community, we gather to honour Mr Thompson Katanda as he embarks on the next chapter of his journey.\n\nThis farewell fundraiser helps us celebrate him properly on 22 November 2026 — covering the farewell gathering, a meaningful gift of appreciation, and a lasting tribute from staff, parents, alumni, and students whose lives he has shaped.\n\nEvery contribution, large or small, is a thank-you for the guidance, discipline, and warmth he has given so freely. Join us in sending Mr Katanda off with the dignity and gratitude he deserves.",
                'goal_amount' => 5000,
                'raised_amount' => 0,
                'currency' => 'USD',
                'event_date' => '2026-11-22',
                'hero_image' => null,
                'organizer_name' => 'Fundraising Committee',
                'payment_instructions' => "Please send your contribution via:\n\nEcoCash: 07X XXX XXXX (Name: Farewell Committee)\nBank Transfer: Account Name — Katanda Farewell | Bank — CBZ | Acc — XXXXXXXXXX\n\nAfter paying, keep your reference and submit the donation form so we can confirm and thank you.",
                'is_active' => true,
            ]
        );

        $campaign->raised_amount = 0;
        $campaign->save();
    }
}
