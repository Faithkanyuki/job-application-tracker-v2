"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface SessionUser {
  name: string;
  email: string;
  image?: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data) {
        router.push("/signin");
        return;
      }
      setUser(data.user);
    });
  }, [router]);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/signin");
  }

  const navItems = [
    { href: "/dashboard", label: "All applications" },
    { href: "/dashboard/new", label: "Add a job" },
  ];

  const navLinks = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileNavOpen(false)}
            className={
              "block px-3 py-2 rounded-md text-sm " +
              (active ? "bg-ink text-paper" : "text-ink hover:bg-hairline")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="w-64 border-r border-hairline bg-paper hidden md:flex md:flex-col">
        <Link href="/" className="px-6 py-5 border-b border-hairline">
          <span className="font-serif text-lg text-ink">Tracker</span>
        </Link>
        {navLinks}
      </aside>

      {/* Mobile drawer + backdrop */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-paper border-r border-hairline flex flex-col">
            <div className="px-6 py-5 border-b border-hairline flex items-center justify-between">
              <span className="font-serif text-lg text-ink">Tracker</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="text-ink text-xl leading-none"
                aria-label="Close menu"
              >
                &times;
              </button>
            </div>
            {navLinks}
          </aside>
        </div>
      ) : null}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-hairline flex items-center justify-between px-4 md:px-6 relative bg-white">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden text-ink"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <span className="font-serif text-lg text-ink md:hidden">Tracker</span>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 text-sm text-ink ml-auto"
          >
            <span className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center text-xs font-medium">
              {user ? user.name.charAt(0).toUpperCase() : "?"}
            </span>
            <span className="hidden sm:inline">{user?.name}</span>
          </button>

          {menuOpen ? (
            <div className="absolute right-4 md:right-6 top-14 w-48 bg-white border border-hairline rounded-md shadow-xs py-1 z-10">
              <div className="px-4 py-2 text-xs text-stone border-b border-hairline">
                {user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-hairline"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </header>

        <main className="flex-1 bg-paper">{children}</main>
      </div>
    </div>
  );
}
