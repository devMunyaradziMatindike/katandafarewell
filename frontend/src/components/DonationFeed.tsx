import { formatMoney } from "@/lib/api";
import type { PublicDonation } from "@/types";

type Props = {
  donations: PublicDonation[];
  currency: string;
};

export function DonationFeed({ donations, currency }: Props) {
  if (donations.length === 0) {
    return (
      <p className="text-sm text-muted">Be the first to contribute to this farewell tribute.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {donations.map((donation) => (
        <li
          key={donation.id}
          className="border-b border-[var(--line)] pb-4 last:border-0 last:pb-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">{donation.donor_name}</p>
              {donation.message ? (
                <p className="mt-1 text-sm leading-relaxed text-muted">&ldquo;{donation.message}&rdquo;</p>
              ) : null}
            </div>
            <p className="shrink-0 font-semibold text-leaf">
              {formatMoney(donation.amount, donation.currency || currency)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
