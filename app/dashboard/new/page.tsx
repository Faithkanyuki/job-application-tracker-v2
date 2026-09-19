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
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Back to dashboard
      </Link>

      <h1 className="text-2xl font-semibold mt-4 mb-6">Add a job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1">Company</label>
          <input
            id="company"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">Location (optional)</label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-1">Job posting URL (optional)</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add job"}
        </button>
      </form>
    </div>
  );
}