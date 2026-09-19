import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";
import { getCurrentSession } from "@/lib/getSession";

const createApplicationSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  status: z
    .enum(["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"])
    .optional(),
  appliedDate: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, session.user.id));

    return NextResponse.json(
      { applications: userApplications },
      { status: 200 }
    );
  } catch (error) {
    console.error("List applications error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createApplicationSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { jobId, status, appliedDate, notes } = parsed.data;

    // Authorization check on the JOB, before creating an application for it —
    // you can't create an application for a job you don't own
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
    if (!job || job.userId !== session.user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Enforce one application per job at the application layer too
    // (the database's UNIQUE constraint on jobId is the real backstop)
    const [existingApp] = await db
      .select()
      .from(applications)
      .where(eq(applications.jobId, jobId));
    if (existingApp) {
      return NextResponse.json(
        { error: "An application already exists for this job" },
        { status: 409 }
      );
    }

    const [newApplication] = await db
      .insert(applications)
      .values({
        jobId,
        userId: session.user.id,
        status: status ?? "SAVED",
        appliedDate: appliedDate ? new Date(appliedDate) : undefined,
        notes,
      })
      .returning();

    return NextResponse.json(
      { application: newApplication },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create application error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
