"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearAuth, getStoredUser, getToken } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/campaign", label: "Campaign" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const stored = getStoredUser();
    if (stored?.name) setUserName(stored.name);

    api("/admin/me", { token })
      .then(() => setReady(true))
      .catch(() => {
        clearAuth();
        router.replace("/admin/login");
      });
  }, [router]);

  async function logout() {
    const token = getToken();
    if (token) {
      try {
        await api("/admin/logout", { method: "POST", token });
      } catch {
        // ignore
      }
    }
    clearAuth();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading admin…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist/50">
      <header className="border-b border-[var(--line)] bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logomhsss.png"
              alt="Mazowe High School Scholarship Service"
              width={44}
              height={44}
              className="h-10 w-10 rounded-sm object-contain"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gold">Admin</p>
              <p className="display text-lg text-forest">Katanda Farewell</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">{userName}</span>
            <Link href="/" className="text-sm text-muted hover:text-forest">
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm hover:bg-mist"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "border-forest text-forest"
                    : "border-transparent text-muted hover:text-forest"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
