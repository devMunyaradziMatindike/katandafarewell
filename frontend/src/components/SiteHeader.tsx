import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 flex-1 items-center gap-2 sm:flex-none sm:justify-self-start"
        >
          <Image
            src="/images/logomhsss.png"
            alt="Mazowe High School Scholarship Service"
            width={44}
            height={44}
            priority
            className="h-10 w-10 shrink-0 rounded-sm object-contain"
          />
          <p className="motto truncate text-xl text-gold transition group-hover:text-gold-soft sm:text-2xl">
            Mr. T. Katanda Tribute
          </p>
        </Link>

        <Link
          href="/donate"
          className="ml-auto shrink-0 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-leaf sm:ml-0 sm:justify-self-center sm:px-7 sm:py-3 sm:text-base"
        >
          Donate
        </Link>

        <span className="hidden sm:block" aria-hidden />
      </div>
    </header>
  );
}
