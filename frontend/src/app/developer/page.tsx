import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function DeveloperPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-10 text-center sm:px-6 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
          Developed by
        </p>
        <h1 className="motto mt-3 text-4xl text-forest sm:text-5xl">Munyaradzi Matindike</h1>

        <div className="relative mt-8 aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl">
          <Image
            src="/images/profile.jpeg"
            alt="Munyaradzi Matindike"
            fill
            priority
            sizes="(max-width: 640px) 80vw, 320px"
            className="object-cover object-top"
          />
        </div>

        <div className="motto mt-8 space-y-3 text-xl leading-snug text-ink sm:text-2xl">
          <p>Mazowe High School</p>
          <p className="text-gold">{"{6 January 2013 - 23 November 2018}"}</p>
          <p>custom software solutions</p>
          <p>
            contact :{" "}
            <a
              href="tel:+263774984359"
              className="text-forest underline decoration-forest/30 underline-offset-4 transition hover:decoration-forest"
            >
              +263 77 498 4359
            </a>
          </p>
        </div>

        <div className="mt-10 flex w-full justify-center rounded-2xl bg-forest px-6 py-8">
          <Image
            src="/images/signature.png"
            alt="Munyaradzi Matindike signature"
            width={320}
            height={120}
            className="h-auto w-full max-w-xs object-contain"
          />
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-mist/60 px-3.5 py-2 text-xs font-semibold text-forest transition hover:border-leaf hover:bg-mist"
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
