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
  SAVED: "bg-hairline text-ink",
  APPLIED: "bg-ink text-paper",
  INTERVIEW: "bg-amber text-paper",
  OFFER: "bg-sage text-paper",
  REJECTED: "bg-stone text-paper",
};

const statusLabels: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
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
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-stone text-sm">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-ink">Your applications</h1>
        <Link
          href="/dashboard/new"
          className="bg-amber text-paper rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Add a job
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6">
          {error}
        </p>
      ) : null}

      {jobs.length === 0 ? (
        <div className="border border-hairline rounded-lg px-6 py-12 text-center bg-white">
          <p className="font-serif text-xl text-ink mb-2">
            Nothing tracked yet
          </p>
          <p className="text-sm text-stone mb-5">
            Add the first job you&apos;re interested in to start keeping track.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-block bg-amber text-paper rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
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
                  className="flex items-center justify-between border border-hairline rounded-lg px-5 py-4 hover:border-ink transition bg-white"
                >
                  <div>
                    <h2 className="text-ink font-medium">{job.title}</h2>
                    <p className="text-sm text-stone">
                      {job.company}
                      {job.location ? " — " + job.location : ""}
                    </p>
                  </div>
                  {status ? (
                    <span
                      className={
                        "text-xs px-2.5 py-1 rounded-full font-medium " +
                        statusStyles[status]
                      }
                    >
                      {statusLabels[status]}
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-hairline text-stone">
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
