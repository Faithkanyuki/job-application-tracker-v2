import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { getCurrentSession } from "@/lib/getSession";

const createJobSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  company: z.string().trim().min(1, "Company is required").max(200),
  location: z.string().trim().max(200).optional(),
  url: z.string().trim().url("Invalid URL").max(500).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.userId, session.user.id));

    return NextResponse.json({ jobs: userJobs }, { status: 200 });
  } catch (error) {
    console.error("List jobs error:", error);
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
    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const [newJob] = await db
      .insert(jobs)
      .values({
        ...parsed.data,
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json({ job: newJob }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
