import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    ageVerified,
    budgetLimit,
    timeLimit,
    mood,
    stress,
    intent,
  } = body;

  // Calculate baseline risk modifier from mental health check-in
  let baselineRiskModifier = 0;
  if (mood === "not_great") baselineRiskModifier += 15;
  if (stress === "very_high") baselineRiskModifier += 20;
  if (intent === "escaping") baselineRiskModifier += 25;

  const user = await db.user.upsert({
    where: { email: session.user.email },
    update: {
      name,
      ageVerified,
      budgetLimit,
      timeLimit,
      onboardingMood: mood,
      onboardingStress: stress,
      onboardingIntent: intent,
      baselineRiskModifier,
    },
    create: {
      email: session.user.email,
      name,
      ageVerified,
      budgetLimit,
      timeLimit,
      onboardingMood: mood,
      onboardingStress: stress,
      onboardingIntent: intent,
      baselineRiskModifier,
    },
  });

  return NextResponse.json({ success: true, user });
}
