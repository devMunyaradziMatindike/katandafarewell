"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

type CampaignForm = {
  title: string;
  beneficiary: string;
  story: string;
  goal_amount: number;
  currency: string;
  event_date: string;
  organizer_name: string;
  payment_instructions: string;
  is_active: boolean;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-[var(--line)] bg-cream/40 px-4 py-3 outline-none ring-forest focus:ring-2";

export default function AdminCampaignPage() {
  const [form, setForm] = useState<CampaignForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api<{ data: CampaignForm & { id: number } }>("/admin/campaign", { token })
      .then((res) => {
        const c = res.data;
        setForm({
          title: c.title,
          beneficiary: c.beneficiary,
          story: c.story,
          goal_amount: Number(c.goal_amount),
          currency: c.currency,
          event_date: String(c.event_date).slice(0, 10),
          organizer_name: c.organizer_name ?? "",
          payment_instructions: c.payment_instructions ?? "",
          is_active: Boolean(c.is_active),
        });
      })
      .catch(() => setError("Could not load campaign."));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    const token = getToken();
    if (!token) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await api("/admin/campaign", {
        method: "PUT",
        token,
        body: form,
      });
      setMessage("Campaign updated successfully.");
    } catch {
      setError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !form) return <p className="text-red-700">{error}</p>;
  if (!form) return <p className="text-muted">Loading campaign…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl text-forest">Campaign settings</h1>
        <p className="mt-1 text-muted">Update story, goal, and payment instructions.</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-[var(--line)] bg-paper p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={fieldClass}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Beneficiary
            <input
              value={form.beneficiary}
              onChange={(e) => setForm({ ...form, beneficiary: e.target.value })}
              className={fieldClass}
              required
            />
          </label>
        </div>

        <label className="block text-sm font-medium">
          Story
          <textarea
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
            rows={8}
            className={fieldClass}
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium">
            Goal amount
            <input
              type="number"
              min={1}
              value={form.goal_amount}
              onChange={(e) => setForm({ ...form, goal_amount: Number(e.target.value) })}
              className={fieldClass}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Currency
            <input
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              className={fieldClass}
              maxLength={3}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Event date
            <input
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className={fieldClass}
              required
            />
          </label>
        </div>

        <label className="block text-sm font-medium">
          Organizer name
          <input
            value={form.organizer_name}
            onChange={(e) => setForm({ ...form, organizer_name: e.target.value })}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm font-medium">
          Payment instructions
          <textarea
            value={form.payment_instructions}
            onChange={(e) => setForm({ ...form, payment_instructions: e.target.value })}
            rows={5}
            className={fieldClass}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="size-4 accent-forest"
          />
          Campaign is active
        </label>

        {message ? <p className="text-sm text-forest">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-forest px-5 py-3 font-semibold text-paper hover:bg-leaf disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
