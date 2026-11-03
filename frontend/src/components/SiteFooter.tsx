export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-forest pb-20 text-paper md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
        <p className="text-xs text-paper/85">
          <span aria-hidden="true">©</span> 2026 Katanda Farewell Fund · Mazowe High School
        </p>
        <p className="text-xs text-paper/75">
          Developed by{" "}
          <a
            href="https://nessosystems.co.zw"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-paper underline decoration-paper/40 underline-offset-2 transition hover:decoration-paper"
          >
            nessosystems.co.zw
          </a>
        </p>
      </div>
    </footer>
  );
}
