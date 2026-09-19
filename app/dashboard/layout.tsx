"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/signin");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold">Job Tracker</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{session?.user?.email}</span>
          <button
            onClick={handleSignOut}
            className="text-gray-700 hover:text-black"
          >
            Sign out
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}