import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { DonationFeed } from "@/components/DonationFeed";
import { ImageFan } from "@/components/ImageFan";
import { ProgressCard } from "@/components/ProgressCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { api, formatMoney } from "@/lib/api";
import type { Campaign, PublicDonation } from "@/types";

export const instant = false;

async function getCampaign() {
  try {
    const res = await api<{ data: Campaign }>("/campaign");
    return res.data;
  } catch {
    return null;
  }
}

async function getDonations() {
  try {
    const res = await api<{ data: PublicDonation[] }>("/donations?limit=12");
    return res.data;
  } catch {
    return [];
  }
}

async function CampaignContent() {
  const [campaign, donations] = await Promise.all([getCampaign(), getDonations()]);

  if (!campaign) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="display text-2xl text-forest">Campaign unavailable</h1>
          <p className="mt-3 text-muted">
            Start the Laravel API on port 8000, then refresh this page.
          </p>
        </div>
      </div>
    );
  }

  const paragraphs = campaign.story.split(/\n\n+/).filter(Boolean);

  return (
    <>
      {/* GoFundMe-style intro: centered copy + arched image fan */}
      <section className="intro-stage overflow-hidden bg-paper">
        <div className="mx-auto max-w-2xl px-4 pb-2 pt-8 text-center sm:px-6 sm:pt-12 md:pt-14">
          <h1 className="display fade-up text-2xl leading-tight text-ink sm:text-3xl md:text-4xl">
            Honouring {campaign.beneficiary}
          </h1>

          <p className="fade-up-delay mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Join staff, parents, alumni, and students in celebrating after 27 years of leadership
            with a farewell tribute on 22 November 2026.
          </p>

          <div className="fade-up-delay mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/donate"
              className="rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-paper transition hover:bg-leaf"
            >
              Donate to the tribute
            </Link>
            <a
              href="#progress"
              className="rounded-full border border-[var(--line)] px-5 py-2.5 text-xs font-semibold text-forest transition hover:bg-mist"
            >
              See amount raised
            </a>
          </div>

          <p className="fade-up-delay-2 mt-4 text-xs text-muted">
            {formatMoney(campaign.raised_amount, campaign.currency)} raised · {campaign.donor_count}{" "}
            donor{campaign.donor_count === 1 ? "" : "s"}
          </p>
          <p className="motto fade-up-delay-2 mt-6 text-3xl font-bold text-gold sm:text-4xl">
            &ldquo;For minds ahead of their times...........&rdquo;
          </p>
        </div>

        <ImageFan />
      </section>

      {/* Progress */}
      <section id="progress" className="border-y border-[var(--line)] bg-cream/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              The tribute fund
            </p>
            <h2 className="display mt-2 text-xl text-forest md:text-2xl">
              Every gift adds to a farewell worthy of his service
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              Contributions support the gathering, a gift of appreciation, and a lasting thank-you
              from the Mazowe High community.
            </p>
            <p className="mt-4 max-w-lg text-xs leading-relaxed text-muted">
              Bank transfer: <span className="font-medium text-ink">ZB Bank · Avondale</span>
              {" · "}
              <span className="font-medium tracking-wide text-ink">4113-00238291-406</span>
            </p>
          </div>
          <ProgressCard campaign={campaign} />
        </div>
      </section>

      {/* Story */}
      <section
        id="story"
        className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.9fr] lg:gap-10 lg:py-12"
      >
        <article className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">The story</p>
          <h2 className="display mt-2 text-xl text-forest md:text-2xl">{campaign.title}</h2>

          <figure className="portrait-frame relative mt-7 overflow-hidden">
            <Image
              src="/images/mr-katanda.jpeg"
              alt="Mr Thompson Katanda at his desk"
              width={1280}
              height={890}
              sizes="(max-width: 1024px) 100vw, 640px"
              className="portrait-image h-auto w-full object-cover object-[center_20%]"
            />
            <figcaption className="mt-3 text-sm text-muted">
              Mr Thompson Katanda · Headmaster, Mazowe High School
            </figcaption>
          </figure>

          <div className="mt-5 space-y-3 text-sm leading-6 text-ink/90">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--line)] pt-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Organized by</p>
            <p className="mt-1 text-sm font-semibold text-forest">
              {campaign.organizer_name ?? "Fundraising Committee"}
            </p>
            <p className="mt-1.5 text-xs text-muted">
              Event date: 22 November 2026 · Beneficiary: {campaign.beneficiary}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              To verify this fundraiser is genuine, contact{" "}
              <span className="font-medium text-ink">Ms Chiroodza</span> on{" "}
              <a
                href="tel:+263776059273"
                className="font-medium text-forest underline decoration-forest/30 underline-offset-2 hover:decoration-forest"
              >
                +263 77 605 9273
              </a>
              .
            </p>
          </div>
        </article>

        <aside
          id="donations"
          className="h-fit scroll-mt-24 border-t border-[var(--line)] pt-5 lg:sticky lg:top-20 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0"
        >
          <h3 className="display text-lg text-forest">Recent donations</h3>
          <p className="mt-1 text-xs text-muted">Community support in motion</p>
          <div className="mt-6">
            <DonationFeed donations={donations} currency={campaign.currency} />
          </div>
        </aside>
      </section>

      {/* Closing CTA — clean, not photo-heavy */}
      <section className="bg-forest">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-paper sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="display text-xl md:text-2xl">Share a gift of gratitude</h2>
            <p className="mt-1.5 max-w-xl text-sm text-paper/80">
              Help make 22 November 2026 a farewell worthy of Mr Katanda&apos;s 27 years of service.
            </p>
          </div>
          <Link
            href="/donate"
            className="rounded-full bg-gold px-5 py-2.5 text-xs font-semibold text-paper transition hover:bg-gold-soft"
          >
            Donate now
          </Link>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-paper/95 p-2.5 backdrop-blur md:hidden">
        <Link
          href="/donate"
          className="flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-paper"
        >
          Donate now · {formatMoney(campaign.raised_amount, campaign.currency)} raised
        </Link>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center text-muted">
              Loading campaign…
            </div>
          }
        >
          <CampaignContent />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
