import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ sessions: [] });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 20,
      },
    },
  });

  return NextResponse.json({ sessions: user?.sessions ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();

  const { duration, peakRiskScore, finalBankroll, aceTriggered, userAccepted } = body;

  // Only save to DB if user is signed in
  if (session?.user?.email) {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      await db.session.create({
        data: {
          userId: user.id,
          endedAt: new Date(),
          duration,
          peakRiskScore,
          finalBankroll,
          aceTriggered,
          userAccepted,
        },
      });

      await db.user.update({
        where: { id: user.id },
        data: {
          totalSessions: { increment: 1 },
          lastSessionAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}
