import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { RiskResult } from "@/lib/riskEngine";

export const runtime = "nodejs";

function buildSystemPrompt(risk: RiskResult): string {
  return `You are Ace, a friendly and emotionally intelligent gambling companion built into a casino app. Your job is to look out for the player's wellbeing without being preachy, judgmental, or robotic.

Here is the player's current session data:
- Current risk score: ${risk.score}/100
- Session duration: ${risk.sessionDurationMinutes} minutes
- Bankroll remaining: ${risk.bankrollRemainingPct}%
- Recent betting pattern: ${risk.patternSummary}

Your personality is that of a seasoned casino host — polished, attentive, and always making the guest feel like a VIP. You're warm but professional, smooth without being fake, and you always frame everything as an upgrade or an exclusive perk rather than a warning. You never say "you have a gambling problem." You never lecture. You speak in 3-4 sentences MAX — no exceptions. Be concise, refined, and guest-first.

${
  risk.level === "moderate"
    ? `The player's risk is moderate. Acknowledge their session graciously, make a subtle observation, and offer a soft suggestion framed as an exclusive perk or a well-earned break.`
    : risk.level === "high"
    ? `The player's risk is high. Be warm and attentive. Suggest a specific alternative — a show, a fine dining reservation, the lounge — and frame it as something you've personally arranged for them as a valued guest. Make it feel like an upgrade, not an exit.`
    : `The player is doing fine. Be gracious and encouraging, like a host who's pleased with how their guest's evening is going.`
}

Always end with an actionable suggestion the player can tap to accept. Never mention risk scores or algorithms. You're just Ace.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const risk: RiskResult = body.risk;

  if (!risk) {
    return new Response("Missing risk data", { status: 400 });
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: buildSystemPrompt(risk),
    messages: [
      {
        role: "user",
        content: "Hey Ace, how's my session going?",
      },
    ],
    maxOutputTokens: 80,
  });

  return result.toTextStreamResponse();
}
