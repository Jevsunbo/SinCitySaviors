import { evaluateTilt } from "./tiltEngine";

type Bet = {
  amount: number;
  result: "win" | "loss";
  bankroll: number;
  timestamp: number;
};

// Simulate a session
const startingBankroll = 1000;
const sessionStart = Date.now() - 1000 * 60 * 95; // started 95 mins ago

const betHistory: Bet[] = [
  { amount: 50, result: "loss", bankroll: 950, timestamp: Date.now() - 60000 * 5 },
  { amount: 80, result: "loss", bankroll: 870, timestamp: Date.now() - 60000 * 4 },
  { amount: 120, result: "loss", bankroll: 750, timestamp: Date.now() - 60000 * 3 },
  { amount: 200, result: "win", bankroll: 950, timestamp: Date.now() - 60000 * 2 },
];

// Test the tilt evaluation
const result = evaluateTilt(betHistory, startingBankroll, sessionStart, 0);
console.log("Tilt Result:", result);