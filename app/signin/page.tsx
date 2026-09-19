"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message || "Sign in failed");
      return;
    }

    router.push("/dashboard");
  }

  async function handleSocial(provider: "google" | "github") {
    setError("");
    await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif text-xl text-ink">
          Tracker
        </Link>
        <h1 className="font-serif text-3xl text-ink mt-6 mb-2">Welcome back</h1>
        <p className="text-sm text-stone mb-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-sage font-medium hover:underline">
            Sign up
          </Link>
        </p>

        {!showEmailForm ? (
          <div className="space-y-3">
            <button
              onClick={() => handleSocial("google")}
              className="w-full flex items-center justify-center gap-3 border border-hairline rounded-full py-3 text-sm text-ink hover:border-ink transition"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.79 2.73v2.27h2.9c1.7-1.56 2.69-3.87 2.69-6.64z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.27c-.8.54-1.83.86-3.06.86-2.36 0-4.35-1.6-5.06-3.74H.96v2.35C2.44 15.98 5.48 18 9 18z" />
                <path fill="#FBBC05" d="M3.94 10.67A5.4 5.4 0 0 1 3.65 9c0-.58.1-1.14.29-1.67V4.98H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.02l2.98-2.35z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.98l2.98 2.35C4.65 5.18 6.64 3.58 9 3.58z" />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleSocial("github")}
              className="w-full flex items-center justify-center gap-3 border border-hairline rounded-full py-3 text-sm text-ink hover:border-ink transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1C2B3A">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>

            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-amber text-paper rounded-full py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Continue with email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-ink mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-ink mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber text-paper rounded-full py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              className="w-full text-sm text-stone hover:text-ink"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
