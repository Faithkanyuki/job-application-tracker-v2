"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, company, location, url, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      router.push(`/dashboard/${data.job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <Link href="/dashboard" className="text-sm text-sage hover:underline">
        ← Back to dashboard
      </Link>

      <h1 className="font-serif text-2xl text-ink mt-4 mb-6">Add a job</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-hairline rounded-lg p-6">
        <div>
          <label htmlFor="title" className="block text-sm text-ink mb-1">
            Job title
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm text-ink mb-1">
            Company
          </label>
          <input
            id="company"
            type="text"
            required
            maxLength={200}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm text-ink mb-1">
            Location (optional)
          </label>
          <input
            id="location"
            type="text"
            maxLength={200}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber"
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm text-ink mb-1">
            Job posting URL (optional)
          </label>
          <input
            id="url"
            type="url"
            maxLength={500}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm text-ink mb-1">
            Notes / description (optional)
          </label>
          <textarea
            id="description"
            rows={4}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-hairline px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-amber text-paper rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add job"}
        </button>
      </form>
    </div>
  );
}
