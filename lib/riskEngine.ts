export interface Bet {
  id: string;
  amount: number;
  outcome: "win" | "loss";
  timestamp: number; // Unix ms
}

export interface SessionData {
  bets: Bet[];
  startTime: number; // Unix ms
  initialBankroll: number;
  currentBankroll: number;
}

export interface RiskResult {
  score: number;
  triggers: string[];
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
    level,
    patternSummary,
    sessionDurationMinutes,
    bankrollRemainingPct,
  };
}
