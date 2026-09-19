import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { getCurrentSession } from "@/lib/getSession";

const updateApplicationSchema = z.object({
  status: z
    .enum(["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"])
    .optional(),
  appliedDate: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional(),
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
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, params.id));

    if (!application || application.userId !== session.user.id) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    console.error("Get application error:", error);
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
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const [existing] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, params.id));

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateApplicationSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { status, appliedDate, notes } = parsed.data;

    const [updatedApplication] = await db
      .update(applications)
      .set({
        ...(status !== undefined ? { status } : {}),
        ...(appliedDate !== undefined ? { appliedDate: new Date(appliedDate) } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(applications.id, params.id))
      .returning();

    return NextResponse.json({ application: updatedApplication }, { status: 200 });
  } catch (error) {
    console.error("Update application error:", error);
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
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const [existing] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, params.id));

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    await db.delete(applications).where(eq(applications.id, params.id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}