"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatMoney } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { AdminDonation } from "@/types";

type Paginated = {
  data: AdminDonation[];
  current_page: number;
  last_page: number;
};

export default function AdminDonationsPage() {
  const [status, setStatus] = useState("all");
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const query = status === "all" ? "" : `?status=${status}`;
      const res = await api<Paginated>(`/admin/donations${query}`, { token });
      setDonations(res.data);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm(id: number) {
    const token = getToken();
    if (!token) return;
    setBusyId(id);
    setMessage(null);
    try {
      await api(`/admin/donations/${id}/confirm`, { method: "POST", token });
      setMessage("Donation confirmed and totals updated.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: number) {
    const token = getToken();
    if (!token) return;
    setBusyId(id);
    setMessage(null);
    try {
      await api(`/admin/donations/${id}/reject`, { method: "POST", token });
      setMessage("Donation marked as failed.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-2xl text-forest">Donations</h1>
          <p className="mt-1 text-muted">Confirm payments to update the public total.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[var(--line)] bg-paper px-4 py-2.5 outline-none ring-forest focus:ring-2"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {message ? (
        <p className="rounded-xl bg-mist px-4 py-3 text-sm text-forest">{message}</p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-paper">
        {loading ? (
          <p className="p-6 text-muted">Loading donations…</p>
        ) : donations.length === 0 ? (
          <p className="p-6 text-muted">No donations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-mist/60 text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Donor</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {donation.is_anonymous || !donation.donor_name
                          ? "Anonymous"
                          : donation.donor_name}
                      </p>
                      {donation.message ? (
                        <p className="mt-1 max-w-xs text-xs text-muted">{donation.message}</p>
                      ) : null}
                      {donation.payment_reference ? (
                        <p className="mt-1 text-xs text-muted">Ref: {donation.payment_reference}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 font-semibold text-leaf">
                      {formatMoney(Number(donation.amount), donation.currency)}
                    </td>
                    <td className="px-4 py-4">
                      {donation.payment_method === "ecoCash"
                        ? "EcoCash"
                        : donation.payment_method === "redirect"
                          ? "Card & other"
                          : donation.payment_method
                            ? donation.payment_method
                            : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          donation.status === "confirmed"
                            ? "bg-mist text-forest"
                            : donation.status === "pending"
                              ? "bg-cream text-gold"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {donation.status !== "confirmed" ? (
                          <button
                            type="button"
                            disabled={busyId === donation.id}
                            onClick={() => confirm(donation.id)}
                            className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-paper disabled:opacity-50"
                          >
                            Confirm
                          </button>
                        ) : null}
                        {donation.status !== "failed" ? (
                          <button
                            type="button"
                            disabled={busyId === donation.id}
                            onClick={() => reject(donation.id)}
                            className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                          >
                            Reject
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
