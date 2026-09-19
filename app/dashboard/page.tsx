"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  createdAt: string;
}

interface Application {
  jobId: string;
  status: "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
}

const statusStyles: Record<string, string> = {
  SAVED: "bg-gray-100 text-gray-700",
  APPLIED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-amber-100 text-amber-700",
  OFFER: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const jobsRes = await fetch("/api/jobs");
      if (jobsRes.status === 401) {
        router.push("/signin");
        return;
      }
      if (!jobsRes.ok) throw new Error("Failed to load jobs");
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs);

      const appsRes = await fetch("/api/applications");
      const appsData = await appsRes.json();
      setApplications(appsData.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    loadData();
  }, [loadData]);

  function statusFor(jobId: string) {
    return applications.find((a) => a.jobId === jobId)?.status ?? null;
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading your applications...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Your applications</h1>
        <Link
          href="/dashboard/new"
          className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Add a job
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {jobs.length === 0 ? (
        <div className="border border-gray-200 rounded-lg px-6 py-12 text-center">
          <p className="text-lg font-medium mb-2">Nothing tracked yet</p>
          <p className="text-sm text-gray-500 mb-5">
            Add the first job you&apos;re interested in to start keeping track.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-block bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Add a job
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => {
            const status = statusFor(job.id);
            return (
              <li key={job.id}>
                <Link
                  href={`/dashboard/${job.id}`}
                  className="flex items-center justify-between border border-gray-200 rounded-lg px-5 py-4 hover:border-gray-400 transition"
                >
                  <div>
                    <h2 className="font-medium">{job.title}</h2>
                    <p className="text-sm text-gray-500">
                      {job.company}
                      {job.location ? ` — ${job.location}` : ""}
                    </p>
                  </div>
                  {status ? (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[status]}`}>
                      {status}
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
                      Not tracked
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}