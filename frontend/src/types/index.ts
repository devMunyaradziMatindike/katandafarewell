export type Campaign = {
  id: number;
  title: string;
  beneficiary: string;
  story: string;
  goal_amount: number;
  raised_amount: number;
  currency: string;
  event_date: string;
  hero_image: string | null;
  organizer_name: string | null;
  payment_instructions: string | null;
  progress_percent: number;
  donor_count: number;
};

export type PublicDonation = {
  id: number;
  donor_name: string;
  amount: number;
  currency: string;
  message: string | null;
  confirmed_at: string | null;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
};

export type Overview = {
  campaign: {
    id: number;
    title: string;
    goal_amount: number;
    raised_amount: number;
    currency: string;
    event_date: string;
    progress_percent: number;
    is_active: boolean;
  };
  stats: {
    total_raised: number;
    goal_amount: number;
    progress_percent: number;
    confirmed_donations: number;
    pending_donations: number;
    pending_amount: number;
    raised_today: number;
    average_donation: number;
    donor_count: number;
  };
  by_payment_method: Array<{
    payment_method: string | null;
    count: number;
    total: string | number;
  }>;
  recent_donations: Array<{
    id: number;
    donor_name: string;
    amount: number;
    status: string;
    payment_method: string | null;
    created_at: string;
  }>;
};

export type AdminDonation = {
  id: number;
  campaign_id: number;
  donor_name: string | null;
  donor_email: string | null;
  amount: string | number;
  currency: string;
  message: string | null;
  is_anonymous: boolean;
  status: "pending" | "confirmed" | "failed";
  payment_method: string | null;
  payment_reference: string | null;
  confirmed_at: string | null;
  created_at: string;
};
