type Bet = {
  amount: number;
  result: "win" | "loss";
  bankroll: number;
  timestamp: number;
};

type RiskState = {
  score: number;
  level: "SAFE" | "SOFT_NUDGE" | "STRONG_INTERVENTION";
};

export function evaluateTilt(
  betHistory: Bet[],
  startingBankroll: number,
  sessionStart: number,
  previousScore: number
): RiskState {

let riskScore = previousScore ?? 0;

  // ----------------------------
  // DECAY
  // ----------------------------
  // Reduce risk slightly each evaluation to simulate calming down
  riskScore *= 0.95; // 5% decay per call

  if (betHistory.length < 2) {
    return { score: 0, level: "SAFE" };
  }

  const current = betHistory[betHistory.length - 1];
  const previous = betHistory[betHistory.length - 2];

 // ----------------------------
// SIGNAL 1 — Loss Chasing (2 in a row)
// ----------------------------
let lossChaseCount = 0;

for (let i = 1; i < betHistory.length; i++) {
  const prev = betHistory[i - 1];
  const curr = betHistory[i];

  if (
    prev.result === "loss" &&
    curr.amount > prev.amount * 1.5
  ) {
    lossChaseCount++;
  } else {
    lossChaseCount = 0;
  }

  if (lossChaseCount >= 2) {
    riskScore += 30;
    break;
  }
}
  // ----------------------------
  // SIGNAL 2 — Session Duration
  // ----------------------------
  const sessionMinutes =
    (Date.now() - sessionStart) / 60000;

  if (sessionMinutes > 90) {
    riskScore += 20;
  }

  // ----------------------------
  // SIGNAL 3 — Betting Velocity
  // ----------------------------
  const lastMinuteBets = betHistory.filter(
    b => Date.now() - b.timestamp < 60000
  ).length;

  const avgBetsPerMinute =
    betHistory.length / Math.max(sessionMinutes, 1);

  if (lastMinuteBets > avgBetsPerMinute * 1.8) {
    riskScore += 25;
  }

  // ----------------------------
  // SIGNAL 4 — Bankroll Erosion
  // ----------------------------
  const percentLost =
    (startingBankroll - current.bankroll) /
    startingBankroll;

  if (percentLost >= 0.5 && sessionMinutes < 30) {
    riskScore += 25;
  }

  // ----------------------------
  // Intervention Level
  // ----------------------------
  let level: RiskState["level"] = "SAFE";

  if (riskScore > 75) {
    level = "STRONG_INTERVENTION";
  } else if (riskScore > 50) {
    level = "SOFT_NUDGE";
  }

  return {
    score: riskScore,
    level,
  };
}