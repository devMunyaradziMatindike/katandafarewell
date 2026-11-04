"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { api, formatMoney } from "@/lib/api";
import { showThankYou } from "@/lib/swal";

const POLL_DELAYS_MS = [1500, 2500, 3500, 4500, 6000, 8000, 10000, 12000, 15000, 20000];

type StatusResponse = {
  data: {
    public_ref: string;
    amount: number;
    currency: string;
    status: string;
    paid: boolean;
  };
};

function ThankYouContent() {
  const params = useSearchParams();
  const ref = params.get("ref");
  const amount = Number(params.get("amount") ?? 0);
  const shouldPoll = params.get("poll") === "1";
  const method = params.get("method");
  const thankYouShown = useRef(false);

  const [status, setStatus] = useState<"checking" | "confirmed" | "failed" | "pending">(
    shouldPoll ? "checking" : "pending"
  );
  const [message, setMessage] = useState(
    shouldPoll
      ? "Confirming your payment…"
      : "Thank you. If payment is still pending, it will update shortly."
  );

  useEffect(() => {
    if (!shouldPoll || !ref) {
      setStatus("pending");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function poll() {
      const Swal = (await import("sweetalert2")).default;
      void Swal.fire({
        title: "Processing…",
        text:
          method === "ecoCash"
            ? "Approve the EcoCash PIN prompt on your phone"
            : "Confirming your payment",
        allowOutsideClick: false,
        allowEscapeKey: true,
        showConfirmButton: false,
        showDenyButton: true,
        denyButtonText: "Cancel waiting",
        denyButtonColor: "#7a1f2b",
        didOpen: () => Swal.showLoading(),
      }).then((result) => {
        if (result.isDenied) {
          cancelled = true;
          controller.abort();
          setStatus("pending");
          setMessage(
            "Waiting cancelled. If you completed payment, it will appear once Pesepay confirms."
          );
        }
      });

      for (const delay of POLL_DELAYS_MS) {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(() => resolve(), delay);
          controller.signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timer);
              resolve();
            },
            { once: true }
          );
        });
        if (cancelled || controller.signal.aborted) return;

        try {
          const res = await api<StatusResponse>(`/donations/${ref}/status`);
          if (res.data.paid || res.data.status === "confirmed") {
            setStatus("confirmed");
            setMessage("Payment confirmed. Thank you for honouring Mr Katanda.");
            if (!thankYouShown.current) {
              thankYouShown.current = true;
              await showThankYou();
              window.location.href = "/#donations";
            }
            return;
          }
          if (res.data.status === "failed") {
            Swal.close();
            // Cancelled / failed Pesepay checkout → send donors back to donate.
            window.location.replace("/donate?payment=cancelled");
            return;
          }
          setMessage(
            method === "ecoCash"
              ? "Still waiting for EcoCash approval…"
              : "Payment is still processing…"
          );
        } catch {
          // keep trying
        }
      }

      if (!cancelled && !controller.signal.aborted) {
        Swal.close();
        // Redirect checkouts that never confirm (including Pesepay cancel) go back to donate.
        if (method === "redirect") {
          window.location.replace("/donate?payment=cancelled");
          return;
        }
        setStatus("pending");
        setMessage(
          "Payment is still pending. If you completed it, it will appear once Pesepay confirms."
        );
      }
    }

    poll();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [shouldPoll, ref, method]);

  const title =
    status === "confirmed"
      ? "Payment received"
      : status === "failed"
        ? "Payment not completed"
        : status === "checking"
          ? "Confirming payment"
          : "Thank you";

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-12 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">
        {status === "confirmed" ? "Success" : "Donation"}
      </p>
      <h1 className="display mt-2 text-2xl text-forest md:text-3xl">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {amount > 0 ? `Amount: ${formatMoney(amount)}. ` : null}
        {message}
      </p>
      {ref ? <p className="mt-3 text-xs text-muted">Reference {ref}</p> : null}

      {status === "checking" ? (
        <div className="mt-6 h-8 w-8 animate-spin rounded-full border-4 border-mist border-t-forest" />
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/#donations"
          className="rounded-lg bg-forest px-4 py-2.5 text-xs font-semibold text-paper transition hover:bg-leaf"
        >
          Back to campaign
        </Link>
        {status === "failed" ? (
          <Link
            href="/donate"
            className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-xs font-semibold text-forest transition hover:bg-mist"
          >
            Try again
          </Link>
        ) : (
          <Link
            href="/donate"
            className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-xs font-semibold text-forest transition hover:bg-mist"
          >
            Donate again
          </Link>
        )}
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <main className="mx-auto max-w-2xl px-4 py-20 text-center text-muted">
            Loading…
          </main>
        }
      >
        <ThankYouContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}
