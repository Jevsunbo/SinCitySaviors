import { Bet, SessionData } from "./riskEngine";

let betCounter = 0;

export type ScenarioMode =
  | "normal"       // steady play
  | "loss_chase"   // triggers loss chasing
  | "velocity"     // triggers velocity spike
  | "erosion"      // triggers bankroll erosion
  | "tilt"         // triggers everything
  | "demo";        // scripted live demo sequence

// Pre-scripted demo: safe → Moderate (loss chasing) → High (velocity + erosion)
// Each bet is added ~1.2s apart during the live demo.
export const DEMO_SCRIPT: { amount: number; outcome: "win" | "loss" }[] = [
  { amount: 30, outcome: "win" },   // 1. Normal win
  { amount: 25, outcome: "loss" },  // 2. Small loss
  { amount: 30, outcome: "win" },   // 3. Recovery
  { amount: 35, outcome: "loss" },  // 4. Loss — start of trouble
  { amount: 54, outcome: "loss" },  // 5. Chase! (1.54×) — streak begins
  { amount: 30, outcome: "loss" },  // 6. Another loss
  { amount: 46, outcome: "loss" },  // 7. Chase! (1.53×) → LOSS CHASING +30 → Moderate
  { amount: 60, outcome: "loss" },  // 8. Rapid bet → VELOCITY SPIKE +25 → ~55
  { amount: 80, outcome: "loss" },  // 9. → BANKROLL EROSION +25 → ~80 HIGH → Ace fires
  { amount: 95, outcome: "loss" },  // 10. Full tilt
  { amount: 110, outcome: "loss" }, // 11. Script ends — session should be ended
];

// Creates a demo session with 5 baseline bets from 8–14 min ago so the
// velocity spike check has a non-zero comparison window.
export function createDemoSession(initialBankroll = 500): SessionData {
  betCounter = 0;
  const bets: Bet[] = [];
  let bankroll = initialBankroll;
  const startTime = Date.now() - 22 * 60000;

  const applyBet = (bet: Bet) => {
    bets.push(bet);
    bankroll += bet.outcome === "win" ? bet.amount * 0.9 : -bet.amount;
    bankroll = Math.max(0, bankroll);
  };

  const baselineOffsets = [14, 12, 11, 9, 8]; // minutes ago
  const baseBets: { amount: number; outcome: "win" | "loss" }[] = [
    { amount: 20, outcome: "loss" },
    { amount: 25, outcome: "win" },
    { amount: 20, outcome: "loss" },
    { amount: 30, outcome: "loss" },
    { amount: 25, outcome: "loss" },
  ];
  baselineOffsets.forEach((mins, i) => {
    applyBet({
      id: `bet_${++betCounter}`,
      amount: baseBets[i].amount,
      outcome: baseBets[i].outcome,
      timestamp: Date.now() - mins * 60000,
    });
  });

  return { bets, startTime, initialBankroll, currentBankroll: bankroll };
}

function randomBetween(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function makeBet(amount: number, outcome: "win" | "loss", offsetMs = 0): Bet {
  return {
    id: `bet_${++betCounter}`,
    amount,
    outcome,
    timestamp: Date.now() - offsetMs,
  };
}

// Generates a history of bets that will trigger the given scenario
function generateHistory(mode: ScenarioMode, initialBankroll: number): {
  bets: Bet[];
  currentBankroll: number;
  startTime: number;
} {
  betCounter = 0;
  const bets: Bet[] = [];
  let bankroll = initialBankroll;

  const applyBet = (bet: Bet) => {
    bets.push(bet);
    bankroll += bet.outcome === "win" ? bet.amount * 0.9 : -bet.amount;
    bankroll = Math.max(0, bankroll);
  };

  if (mode === "normal") {
    // 10 calm bets spread over 20 minutes
    for (let i = 10; i >= 1; i--) {
      const amount = randomBetween(10, 50);
      const outcome = Math.random() > 0.45 ? "win" : "loss";
      applyBet(makeBet(amount, outcome, i * 2 * 60000));
    }
  }

  if (mode === "loss_chase") {
    // Normal bets, then two rounds of chasing a loss
    applyBet(makeBet(20, "win", 10 * 60000));
    applyBet(makeBet(25, "loss", 8 * 60000));  // loss #1
    applyBet(makeBet(38, "loss", 6 * 60000));  // chase 1 (1.5x+), still loses
    applyBet(makeBet(20, "loss", 4 * 60000));
    applyBet(makeBet(30, "loss", 3 * 60000));  // loss #2
    applyBet(makeBet(46, "loss", 2 * 60000));  // chase 2 (1.5x+) — triggers rule
  }

  if (mode === "velocity") {
    // Slow start 10-15 min ago, then rapid fire in the last 5 min
    for (let i = 6; i >= 1; i--) {
      applyBet(makeBet(randomBetween(15, 40), "loss", (i * 2 + 5) * 60000));
    }
    // 10 bets in the last 4 minutes — velocity doubled
    for (let i = 10; i >= 1; i--) {
      applyBet(makeBet(randomBetween(15, 40), "loss", i * 20000));
    }
  }

  if (mode === "erosion") {
    // 50%+ of bankroll gone in under 30 minutes
    const startTime = Date.now() - 20 * 60000;
    applyBet(makeBet(200, "loss", 18 * 60000));
    applyBet(makeBet(150, "loss", 15 * 60000));
    applyBet(makeBet(100, "loss", 12 * 60000));
    applyBet(makeBet(80, "loss", 8 * 60000));
    return { bets, currentBankroll: bankroll, startTime };
  }

  if (mode === "tilt") {
    // Long session + loss chasing + velocity spike
    const startTime = Date.now() - 95 * 60000;
    // Early calm bets
    for (let i = 20; i >= 15; i--) {
      applyBet(makeBet(randomBetween(10, 30), "win", i * 4 * 60000));
    }
    // Loss chasing sequence
    applyBet(makeBet(30, "loss", 12 * 60000));
    applyBet(makeBet(46, "loss", 10 * 60000));
    applyBet(makeBet(25, "loss", 8 * 60000));
    applyBet(makeBet(40, "loss", 6 * 60000));
    // Velocity spike in last 5 min
    for (let i = 10; i >= 1; i--) {
      applyBet(makeBet(randomBetween(20, 60), "loss", i * 25000));
    }
    return { bets, currentBankroll: bankroll, startTime };
  }

  return { bets, currentBankroll: bankroll, startTime: Date.now() - 20 * 60000 };
}

export function createMockSession(
  mode: ScenarioMode = "normal",
  initialBankroll = 1000
): SessionData {
  const { bets, currentBankroll, startTime } = generateHistory(mode, initialBankroll);
  return {
    bets,
    startTime,
    initialBankroll,
    currentBankroll,
  };
}

// Adds one new live bet to an existing session (used for real-time simulation)
export function addLiveBet(session: SessionData, mode: ScenarioMode = "normal"): SessionData {
  const lastBet = session.bets[session.bets.length - 1];
  const isChasing =
    mode === "loss_chase" || mode === "tilt"
      ? lastBet?.outcome === "loss"
      : false;

  let amount: number;
  if (isChasing && lastBet) {
    amount = Math.round(lastBet.amount * (1.5 + Math.random() * 0.5));
  } else {
    amount = randomBetween(10, 80);
  }

  const outcome: "win" | "loss" =
    mode === "tilt" || mode === "erosion"
      ? Math.random() > 0.7 ? "win" : "loss" // more losses
      : Math.random() > 0.45 ? "win" : "loss";

  const newBet: Bet = {
    id: `bet_${++betCounter}`,
    amount,
    outcome,
    timestamp: Date.now(),
  };

  const bankrollDelta = outcome === "win" ? amount * 0.9 : -amount;

  return {
    ...session,
    bets: [...session.bets, newBet],
    currentBankroll: Math.max(0, session.currentBankroll + bankrollDelta),
  };
}
