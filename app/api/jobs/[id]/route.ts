import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { getCurrentSession } from "@/lib/getSession";

const updateJobSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  company: z.string().trim().min(1).max(200).optional(),
  location: z.string().trim().max(200).optional(),
  url: z.string().trim().url("Invalid URL").max(500).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional(),
});

const uuidSchema = z.string().uuid();

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idCheck = uuidSchema.safeParse(params.id);
    if (!idCheck.success) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, params.id));

    if (!job || job.userId !== session.user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idCheck = uuidSchema.safeParse(params.id);
    if (!idCheck.success) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const [existing] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, params.id));

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateJobSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const [updatedJob] = await db
      .update(jobs)
      .set(parsed.data)
      .where(eq(jobs.id, params.id))
      .returning();

    return NextResponse.json({ job: updatedJob }, { status: 200 });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idCheck = uuidSchema.safeParse(params.id);
    if (!idCheck.success) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const [existing] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, params.id));

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await db.delete(jobs).where(eq(jobs.id, params.id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
