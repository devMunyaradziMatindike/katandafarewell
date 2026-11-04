import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-forest pb-20 text-paper md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <p className="text-xs text-paper/85">
            <span aria-hidden="true">©</span> 2026 Katanda Farewell Fund · Mazowe High School
          </p>
          <p className="text-xs text-paper/75">
            Developed by{" "}
            <Link
              href="/developer"
              className="font-medium text-paper underline decoration-paper/40 underline-offset-2 transition hover:decoration-paper"
            >
              Munyaradzi Matindike
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-paper/15 pt-3 text-xs text-paper/80 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4">
          <p>
            Verify authenticity: Ms Chiroodza{" "}
            <a
              href="tel:+263776059273"
              className="font-medium text-paper underline decoration-paper/40 underline-offset-2 transition hover:decoration-paper"
            >
              +263 77 605 9273
            </a>
          </p>
          <Link
            href="/privacy"
            className="font-medium text-paper underline decoration-paper/40 underline-offset-2 transition hover:decoration-paper"
          >
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
