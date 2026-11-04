"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ApiError, api, formatMoney } from "@/lib/api";
import { pollDonationUntilSettled, showPaymentError, showProcessing, showThankYou } from "@/lib/swal";
import type { Campaign } from "@/types";
import Swal from "sweetalert2";

const PRESETS = [10, 25, 50, 100, 200];

const PAYMENT_METHODS = [
  {
    id: "ecoCash",
    label: "EcoCash",
    description: "Pay with EcoCash — PIN prompt on your phone",
    logo: "/payments/ecocash.png",
    logoClass: "h-7 w-auto object-contain",
  },
  {
    id: "redirect",
    label: "Card & other",
    description: "Visa, Mastercard, Zimswitch, InnBucks, O'mari",
    logo: "/payments/redirect.png",
    logoClass: "h-11 w-auto object-contain",
  },
] as const;

type DonateResponse = {
  next?: "poll" | "redirect";
  checkout_url?: string;
  message?: string;
  data: {
    id: number;
    public_ref: string;
    amount: number;
    status: string;
    payment_method: string;
  };
};

function DonateForm() {
  const searchParams = useSearchParams();
  const paymentNotice = searchParams.get("payment");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENT_METHODS)[number]["id"]>("ecoCash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const bankAccount = "4113-00238291-406";

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(bankAccount);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  useEffect(() => {
    api<{ data: Campaign }>("/campaign")
      .then((res) => setCampaign(res.data))
      .catch(() => setError("Could not load campaign details."));
  }, []);

  const selectedAmount = customAmount ? Number(customAmount) : amount;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!selectedAmount || selectedAmount < 1) {
      setError("Please enter a valid amount.");
      return;
    }

    if (paymentMethod === "ecoCash" && !/^0(7[7-8]|71)\d{7}$/.test(customerPhone)) {
      setError("Enter a valid EcoCash number, e.g. 0771234567.");
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    void showProcessing("Processing…", "Please wait while we start your payment").then(
      (result) => {
        if (result.isDenied) {
          controller.abort();
          setLoading(false);
        }
      }
    );

    try {
      const res = await api<DonateResponse>("/donations", {
        method: "POST",
        body: {
          amount: selectedAmount,
          donor_name: isAnonymous ? null : donorName || null,
          message: message || null,
          is_anonymous: isAnonymous,
          payment_method: paymentMethod,
          customer_phone: paymentMethod === "ecoCash" ? customerPhone : null,
        },
      });

      if (controller.signal.aborted) {
        return;
      }

      if (res.next === "redirect" && res.checkout_url) {
        Swal.update({
          title: "Redirecting…",
          text: "Opening secure checkout",
        });
        window.location.href = res.checkout_url;
        return;
      }

      Swal.update({
        title: "Processing…",
        text: "Approve the EcoCash PIN prompt on your phone",
      });
      Swal.showLoading();

      const result = await pollDonationUntilSettled(
        res.data.public_ref,
        controller.signal
      );

      if (result === "cancelled" || controller.signal.aborted) {
        return;
      }

      if (result === "confirmed") {
        await showThankYou();
        window.location.href = "/#donations";
        return;
      }

      if (result === "failed") {
        await showPaymentError("Payment was not completed. Please try again.");
      } else {
        await Swal.fire({
          icon: "info",
          title: "Still processing",
          text: "If you approved the PIN, your gift will appear once confirmed.",
          confirmButtonColor: "#0b1f3a",
        });
      }
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      Swal.close();
      const msg = err instanceof ApiError ? err.message : "Donation failed. Please try again.";
      setError(msg);
      await showPaymentError(msg);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-3 py-5 sm:px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-mist/60 px-3.5 py-2 text-xs font-semibold text-forest transition hover:border-leaf hover:bg-mist"
        >
          <span aria-hidden className="text-sm leading-none">
            ←
          </span>
          Back to campaign
        </Link>
        <h1 className="display mt-4 text-xl text-forest">Make a donation</h1>
        <p className="mt-1 text-sm text-muted">
          No sign-up required. Pay with EcoCash, card, or bank transfer.
        </p>

        {paymentNotice === "cancelled" ? (
          <p className="mt-3 rounded-lg border border-[var(--line)] bg-mist/70 px-3 py-2.5 text-xs text-muted">
            Payment was cancelled or not completed. You can try again below.
          </p>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="mt-4 space-y-4 rounded-2xl border border-[var(--line)] bg-paper p-4 shadow-[0_10px_28px_rgba(20,32,26,0.05)]"
        >
          <div>
            <label className="text-xs font-medium text-ink">Choose an amount (USD)</label>
            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount("");
                  }}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                    !customAmount && amount === preset
                      ? "border-forest bg-forest text-paper"
                      : "border-[var(--line)] hover:border-leaf"
                  }`}
                >
                  {formatMoney(preset, campaign?.currency ?? "USD")}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              step="1"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--line)] bg-cream/40 px-3 py-2.5 text-sm outline-none ring-forest focus:ring-2"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Your name</label>
            <input
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              disabled={isAnonymous}
              className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-cream/40 px-3 py-2.5 text-sm outline-none ring-forest focus:ring-2 disabled:opacity-50"
              placeholder="Optional"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="size-3.5 accent-forest"
            />
            Donate anonymously
          </label>

          <div>
            <label className="text-xs font-medium">Message of appreciation</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-cream/40 px-3 py-2.5 text-sm outline-none ring-forest focus:ring-2"
              placeholder="Share a short note for Mr Katanda"
            />
          </div>

          <div>
            <p className="text-xs font-medium">Payment method</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    aria-pressed={selected}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border bg-white px-2 py-3 text-center transition ${
                      selected
                        ? "border-forest ring-2 ring-forest/30 shadow-sm"
                        : "border-[var(--line)] hover:border-leaf"
                    }`}
                  >
                    <Image
                      src={method.logo}
                      alt={method.label}
                      width={method.id === "ecoCash" ? 120 : 100}
                      height={method.id === "ecoCash" ? 65 : 100}
                      className={method.logoClass}
                    />
                    <span className="text-xs font-semibold text-ink">{method.label}</span>
                    <span className="text-[10px] leading-snug text-muted">{method.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === "ecoCash" ? (
            <div>
              <label className="text-xs font-medium">EcoCash phone number</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\s+/g, ""))}
                className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-cream/40 px-3 py-2.5 text-sm outline-none ring-forest focus:ring-2"
                placeholder="0771234567"
                inputMode="tel"
                required
              />
              <p className="mt-1.5 text-[10px] text-muted">
                You will receive an EcoCash PIN prompt on this number.
              </p>
            </div>
          ) : (
            <p className="rounded-lg bg-mist/80 px-3 py-2.5 text-xs text-muted">
              You will be redirected to Pesepay&apos;s secure page to complete card or other
              payment methods.
            </p>
          )}

          {error ? <p className="text-xs text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-forest px-4 py-3 text-sm font-semibold text-paper transition hover:bg-leaf disabled:opacity-60"
          >
            {loading
              ? "Processing…"
              : `Donate ${formatMoney(selectedAmount || 0, "USD")}`}
          </button>

          <p className="text-center text-[10px] leading-relaxed text-muted">
            By donating you agree to our{" "}
            <Link href="/privacy" className="underline decoration-[var(--line)] underline-offset-2 hover:text-forest">
              privacy policy
            </Link>
            . To verify this fundraiser, call Ms Chiroodza on{" "}
            <a href="tel:+263776059273" className="font-medium text-forest">
              +263 77 605 9273
            </a>
            .
          </p>
        </form>

        <aside className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-gradient-to-br from-cream/80 to-mist/50 shadow-[0_10px_28px_rgba(20,32,26,0.04)]">
          <div className="border-l-4 border-gold px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
              Or transfer directly
            </p>
            <h2 className="mt-1.5 text-base font-semibold text-forest">ZB Bank</h2>

            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-paper/80 px-3 py-2.5">
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted">Branch</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink">Avondale</dd>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-paper/80 px-3 py-2.5">
                <div className="min-w-0">
                  <dt className="text-[10px] uppercase tracking-wide text-muted">
                    Account number
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm font-semibold tracking-wide text-ink">
                    {bankAccount}
                  </dd>
                </div>
                <button
                  type="button"
                  onClick={copyAccountNumber}
                  className="shrink-0 rounded-lg border border-[var(--line)] bg-paper px-2.5 py-1.5 text-[11px] font-semibold text-forest transition hover:border-leaf hover:bg-mist"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </dl>

            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Use your name as the payment reference so the committee can credit your gift.
            </p>
          </div>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <>
          <SiteHeader />
          <main className="mx-auto max-w-lg px-3 py-10 text-center text-muted sm:px-4">
            Loading…
          </main>
          <SiteFooter />
        </>
      }
    >
      <DonateForm />
    </Suspense>
  );
}
