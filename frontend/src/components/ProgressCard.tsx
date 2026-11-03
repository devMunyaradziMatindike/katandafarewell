import Link from "next/link";
import { formatMoney } from "@/lib/api";
import type { Campaign } from "@/types";

type Props = {
  campaign: Campaign;
};

export function ProgressCard({ campaign }: Props) {
  return (
    <aside className="border border-[var(--line)] bg-paper p-4 shadow-[0_10px_28px_rgba(11,31,58,0.06)] sm:rounded-2xl sm:p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Raised so far</p>
      <p className="display mt-1.5 text-2xl text-forest md:text-3xl">
        {formatMoney(campaign.raised_amount, campaign.currency)}
      </p>
      <p className="mt-1.5 text-xs text-muted">
        {campaign.donor_count} donor{campaign.donor_count === 1 ? "" : "s"}
      </p>

      <Link
        href="/donate"
        className="mt-4 flex w-full items-center justify-center rounded-full bg-forest px-4 py-2.5 text-center text-xs font-semibold text-paper transition hover:bg-leaf"
      >
        Donate now
      </Link>
      <p className="mt-2 text-center text-[10px] text-muted">
        No account needed · Takes under a minute
      </p>
    </aside>
  );
}
