"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatDate, formatMoney } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Overview } from "@/types";

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api<{ data: Overview }>("/admin/overview", { token })
      .then((res) => setOverview(res.data))
      .catch(() => setError("Could not load overview."));
  }, []);

  if (error) {
    return <p className="text-red-700">{error}</p>;
  }

  if (!overview) {
    return <p className="text-muted">Loading overview…</p>;
  }

  const { campaign, stats, recent_donations, by_payment_method } = overview;

  const cards = [
    {
      label: "Total raised",
      value: formatMoney(stats.total_raised, campaign.currency),
      hint: `${stats.progress_percent}% of goal`,
    },
    {
      label: "Confirmed donors",
      value: String(stats.confirmed_donations),
      hint: `Avg ${formatMoney(stats.average_donation, campaign.currency)}`,
    },
    {
      label: "Pending review",
      value: String(stats.pending_donations),
      hint: formatMoney(stats.pending_amount, campaign.currency),
    },
    {
      label: "Raised today",
      value: formatMoney(stats.raised_today, campaign.currency),
      hint: `Event ${formatDate(campaign.event_date)}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-2xl text-forest">General overview</h1>
          <p className="mt-1 text-muted">{campaign.title}</p>
        </div>
        <Link
          href="/admin/donations"
          className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-paper hover:bg-leaf"
        >
          Review donations
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[var(--line)] bg-paper p-5 shadow-sm"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="display mt-2 text-2xl text-forest">{card.value}</p>
            <p className="mt-1 text-xs text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-paper p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="display text-xl text-forest">Goal progress</h2>
          <span className="text-sm text-muted">
            {formatMoney(stats.total_raised, campaign.currency)} /{" "}
            {formatMoney(stats.goal_amount, campaign.currency)}
          </span>
        </div>
        <div className="progress-track mt-4">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(stats.progress_percent, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] bg-paper p-6">
          <h2 className="display text-xl text-forest">Recent activity</h2>
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {recent_donations.map((donation) => (
              <li key={donation.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{donation.donor_name}</p>
                  <p className="text-xs capitalize text-muted">
                    {donation.status}
                    {donation.payment_method ? ` · ${donation.payment_method}` : ""}
                  </p>
                </div>
                <p className="font-semibold text-leaf">
                  {formatMoney(donation.amount, campaign.currency)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-paper p-6">
          <h2 className="display text-xl text-forest">By payment method</h2>
          <ul className="mt-4 space-y-3">
            {by_payment_method.length === 0 ? (
              <li className="text-sm text-muted">No confirmed payments yet.</li>
            ) : (
              by_payment_method.map((row) => (
                <li
                  key={row.payment_method ?? "none"}
                  className="flex items-center justify-between rounded-xl bg-mist/70 px-4 py-3"
                >
                  <span className="capitalize">
                    {row.payment_method ?? "Unspecified"} · {row.count}
                  </span>
                  <span className="font-semibold">
                    {formatMoney(Number(row.total), campaign.currency)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
