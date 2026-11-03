"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { getToken, setAuth } from "@/lib/auth";
import type { AdminUser } from "@/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@katandafarewell.test");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/admin");
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api<{ token: string; user: AdminUser }>("/admin/login", {
        method: "POST",
        body: { email, password },
      });
      setAuth(res.token, res.user);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-paper p-8 shadow-[0_20px_50px_rgba(20,32,26,0.08)]">
        <Image
          src="/images/logomhsss.png"
          alt="Mazowe High School Scholarship Service"
          width={72}
          height={72}
          className="mb-4 h-16 w-16 rounded-sm object-contain"
          priority
        />
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin access</p>
        <h1 className="display mt-2 text-2xl text-forest">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          View fundraising overview, confirm donations, and update the campaign.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-cream/40 px-4 py-3 outline-none ring-forest focus:ring-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-cream/40 px-4 py-3 outline-none ring-forest focus:ring-2"
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-forest py-3.5 font-semibold text-paper transition hover:bg-leaf disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="hover:text-forest">
            ← Back to public campaign
          </Link>
        </p>
      </div>
    </div>
  );
}
