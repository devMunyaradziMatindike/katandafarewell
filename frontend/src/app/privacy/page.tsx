import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Privacy Policy · Katanda Farewell Fund",
  description:
    "How the Katanda Farewell Fund website collects and protects personal information when you donate.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
          Data protection
        </p>
        <h1 className="display mt-2 text-2xl text-forest md:text-3xl">Privacy policy</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This page explains how the Katanda Farewell Fund website
          (mrkatandafarewell.co.zw) handles information you share when you visit or donate.
          Last updated: 4 November 2026.
        </p>

        <div className="mt-8 space-y-7 text-sm leading-relaxed text-ink/90">
          <section>
            <h2 className="display text-lg text-forest">Who runs this site</h2>
            <p className="mt-2 text-muted">
              This fundraiser is organised for the Mazowe High School farewell tribute for Mr
              Thompson Katanda. For questions about authenticity or the campaign, contact{" "}
              <span className="font-medium text-ink">Ms Chiroodza</span> on{" "}
              <a
                href="tel:+263776059273"
                className="font-medium text-forest underline decoration-forest/30 underline-offset-2 hover:decoration-forest"
              >
                +263 77 605 9273
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="display text-lg text-forest">What we collect</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
              <li>
                Optional donor name and farewell message (you may donate anonymously).
              </li>
              <li>
                EcoCash phone number when you choose EcoCash, so Pesepay can send the payment
                prompt.
              </li>
              <li>Donation amount, currency, payment method, and payment status.</li>
              <li>
                Technical logs needed to run the site securely (for example, basic server or
                error logs).
              </li>
            </ul>
            <p className="mt-3 text-muted">
              We do not ask for card numbers on this website. Card and other redirected payments
              are completed on Pesepay&apos;s secure checkout.
            </p>
          </section>

          <section>
            <h2 className="display text-lg text-forest">How we use information</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
              <li>To process your donation and confirm payment status.</li>
              <li>
                To show confirmed gifts on the public tribute page (name unless anonymous, amount,
                and optional message).
              </li>
              <li>To administer the campaign and prevent fraud or abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="display text-lg text-forest">Who receives your data</h2>
            <p className="mt-2 text-muted">
              Payment processing is handled by{" "}
              <span className="font-medium text-ink">Pesepay</span>. Campaign organisers and
              authorised administrators can view donation records to manage the fund. We do not
              sell your personal information.
            </p>
          </section>

          <section>
            <h2 className="display text-lg text-forest">Public display</h2>
            <p className="mt-2 text-muted">
              Confirmed donations may appear on the homepage feed. If you mark the gift as
              anonymous, your name is not shown. Messages you choose to leave may be visible to
              visitors.
            </p>
          </section>

          <section>
            <h2 className="display text-lg text-forest">Retention and security</h2>
            <p className="mt-2 text-muted">
              Donation records are kept for campaign administration and accounting for as long as
              reasonably needed for the farewell tribute. We use HTTPS and standard server
              protections. No method of transmission is perfectly secure; please only share what
              you are comfortable providing.
            </p>
          </section>

          <section>
            <h2 className="display text-lg text-forest">Your choices</h2>
            <p className="mt-2 text-muted">
              You may donate without a name, leave the message blank, or choose anonymous display.
              To ask about a donation record or request a correction, contact Ms Chiroodza on the
              number above, or the site developer via the developer page.
            </p>
          </section>
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-mist/60 px-3.5 py-2 text-xs font-semibold text-forest transition hover:border-leaf hover:bg-mist"
        >
          <span aria-hidden className="text-sm leading-none">
            ←
          </span>
          Back to campaign
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
