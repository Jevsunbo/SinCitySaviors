/**
 * Risk Engine Configuration
 *
 * Thresholds are based on responsible gambling research identifying
 * the three primary behavioral precursors to problem gambling:
 * loss chasing, session length, and betting velocity.
 *
 * These values are tunable per casino operator and can be refined
 * with real session data over time.
 */
export const RISK_CONFIG = {
  // Loss chasing: bet size multiplier after a loss to flag as chasing
  lossChasingMultiplier: 1.5,
  // Loss chasing: consecutive chasing bets required to trigger
  lossChasingStreak: 2,
  // Score weight for loss chasing signal
  lossChasingScore: 30,

  // Long session: minutes before flagging extended play
  longSessionMinutes: 90,
  // Score weight for long session signal
  longSessionScore: 20,

  // Velocity spike: recent window in minutes
  velocityRecentWindow: 5,
  // Velocity spike: baseline comparison window in minutes
  velocityBaselineWindow: 15,
  // Velocity spike: rate multiplier to trigger (2x = doubled pace)
  velocityMultiplier: 2,
  // Score weight for velocity spike signal
  velocityScore: 25,

  // Bankroll erosion: % lost within the erosion window to trigger
  bankrollErosionThreshold: 0.5,
  // Bankroll erosion: window in minutes to measure erosion
  bankrollErosionWindow: 30,
  // Score weight for bankroll erosion signal
  bankrollErosionScore: 25,

  // Mental health modifiers
  moodModifier: 15,       // applied when mood === "not_great"
  stressModifier: 20,     // applied when stress === "very_high"
  intentModifier: 25,     // applied when intent === "escaping"

  // Risk level thresholds
  moderateThreshold: 50,
  highThreshold: 75,
} as const;

export interface Bet {
  id: string;
  amount: number;
  outcome: "win" | "loss";
  timestamp: number; // Unix ms
}

export interface MentalHealthProfile {
  mood?: "great" | "good" | "okay" | "not_great";
  stress?: "low" | "moderate" | "high" | "very_high";
  intent?: "fun" | "celebrating" | "bored" | "escaping";
}

export interface SessionData {
  bets: Bet[];
  startTime: number; // Unix ms
  initialBankroll: number;
  currentBankroll: number;
  mentalHealth?: MentalHealthProfile;
}

export interface RiskResult {
  score: number;
  triggers: string[];
  mentalHealthModifier: number;
  level: "safe" | "moderate" | "high";
  patternSummary: string;
  sessionDurationMinutes: number;
  bankrollRemainingPct: number;
}

// +30 pts: bet size increased 1.5x+ after a loss, twice in a row
function checkLossChasing(bets: Bet[]): boolean {
  if (bets.length < 3) return false;

  let chasingStreak = 0;
  for (let i = 1; i < bets.length; i++) {
    const prev = bets[i - 1];
    const curr = bets[i];
    if (prev.outcome === "loss" && curr.amount >= prev.amount * 1.5) {
      chasingStreak++;
      if (chasingStreak >= 2) return true;
    } else {
      chasingStreak = 0;
    }
  }
  return false;
}

// +20 pts: session longer than 90 minutes
function checkSessionDuration(startTime: number): boolean {
  const durationMinutes = (Date.now() - startTime) / 60000;
  return durationMinutes > 90;
}

// +25 pts: bets per minute doubled compared to earlier in the session
function checkVelocitySpike(bets: Bet[]): boolean {
  if (bets.length < 6) return false;

  const now = Date.now();
  const recentWindow = 5 * 60000;   // last 5 minutes
  const baselineWindow = 15 * 60000; // 5–15 minutes ago

  const recent = bets.filter((b) => now - b.timestamp < recentWindow);
  const baseline = bets.filter(
    (b) =>
      now - b.timestamp >= recentWindow &&
      now - b.timestamp < baselineWindow
  );

  if (baseline.length === 0) return false;

  const recentRate = recent.length / 5;     // bets per minute
  const baselineRate = baseline.length / 10; // bets per minute

  return recentRate >= baselineRate * 2;
}

// +25 pts: 50%+ of bankroll lost within 30 minutes
function checkBankrollErosion(session: SessionData): boolean {
  const elapsedMinutes = (Date.now() - session.startTime) / 60000;
  if (elapsedMinutes > 30) return false;

  const erosionPct =
    (session.initialBankroll - session.currentBankroll) /
    session.initialBankroll;

  return erosionPct >= 0.5;
}

// Mental health baseline modifiers
function calculateMentalHealthModifier(profile?: MentalHealthProfile): number {
  if (!profile) return 0;
  let modifier = 0;
  if (profile.mood === "not_great") modifier += 15;
  if (profile.stress === "very_high") modifier += 20;
  if (profile.intent === "escaping") modifier += 25;
  return modifier;
}

export function calculateRisk(session: SessionData): RiskResult {
  let score = 0;
  const triggers: string[] = [];

  if (checkLossChasing(session.bets)) {
    score += 30;
    triggers.push("loss_chasing");
  }

  if (checkSessionDuration(session.startTime)) {
    score += 20;
    triggers.push("long_session");
  }

  if (checkVelocitySpike(session.bets)) {
    score += 25;
    triggers.push("velocity_spike");
  }

  if (checkBankrollErosion(session)) {
    score += 25;
    triggers.push("bankroll_erosion");
  }

  // Apply mental health modifier on top of behavioral score
  const mentalHealthModifier = calculateMentalHealthModifier(session.mentalHealth);
  if (mentalHealthModifier > 0) triggers.push("mental_health_baseline");
  score = Math.min(100, score + mentalHealthModifier);

  const level: RiskResult["level"] =
    score >= 75 ? "high" : score >= 50 ? "moderate" : "safe";

  const parts: string[] = [];
  if (triggers.includes("loss_chasing")) parts.push("increasing bets after losses");
  if (triggers.includes("long_session")) parts.push("extended session time");
  if (triggers.includes("velocity_spike")) parts.push("faster betting pace");
  if (triggers.includes("bankroll_erosion")) parts.push("rapid bankroll decline");
  const patternSummary =
    parts.length > 0 ? parts.join(", ") : "steady and controlled play";

  const sessionDurationMinutes = Math.round(
    (Date.now() - session.startTime) / 60000
  );
  const bankrollRemainingPct = Math.round(
    (session.currentBankroll / session.initialBankroll) * 100
  );

  return {
    score,
    triggers,
    mentalHealthModifier,
    level,
    patternSummary,
    sessionDurationMinutes,
    bankrollRemainingPct,
  };
}
