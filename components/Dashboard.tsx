"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculateRisk, RiskResult, SessionData } from "@/lib/riskEngine";
import { addLiveBet, createMockSession, ScenarioMode } from "@/lib/mockSession";

interface ChartPoint {
  bet: number;
  amount: number;
  outcome: "win" | "loss";
  bankroll: number;
}

interface DashboardProps {
  onRiskUpdate: (risk: RiskResult) => void;
}

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "loss_chase", label: "Loss Chasing" },
  { value: "velocity", label: "Velocity Spike" },
  { value: "erosion", label: "Bankroll Erosion" },
  { value: "tilt", label: "Full Tilt" },
];

function buildChartData(session: SessionData): ChartPoint[] {
  let runningBankroll = session.initialBankroll;
  return session.bets.map((bet, i) => {
    runningBankroll +=
      bet.outcome === "win" ? bet.amount * 0.9 : -bet.amount;
    runningBankroll = Math.max(0, runningBankroll);
    return {
      bet: i + 1,
      amount: bet.amount,
      outcome: bet.outcome,
      bankroll: Math.round(runningBankroll),
    };
  });
}

function RiskMeter({ score, level }: { score: number; level: RiskResult["level"] }) {
  const color =
    level === "high"
      ? "bg-red-500"
      : level === "moderate"
      ? "bg-yellow-400"
      : "bg-green-500";

  const label =
    level === "high"
      ? "High Risk"
      : level === "moderate"
      ? "Moderate Risk"
      : "Safe";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-zinc-400">
        <span>Risk Score</span>
        <span className="font-semibold text-white">
          {score} / 100 — {label}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-zinc-700">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard({ onRiskUpdate }: DashboardProps) {
  const [mode, setMode] = useState<ScenarioMode>("normal");
  const [session, setSession] = useState<SessionData>(() =>
    createMockSession("normal")
  );
  const [risk, setRisk] = useState<RiskResult>(() =>
    calculateRisk(createMockSession("normal"))
  );
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chartData = buildChartData(session);

  // Recalculate risk whenever session changes
  useEffect(() => {
    const newRisk = calculateRisk(session);
    setRisk(newRisk);
    onRiskUpdate(newRisk);
  }, [session]);

  // Live simulation tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSession((prev) => addLiveBet(prev, mode));
      }, 1500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  function handleModeChange(newMode: ScenarioMode) {
    setMode(newMode);
    setIsRunning(false);
    const newSession = createMockSession(newMode);
    setSession(newSession);
  }

  function handleReset() {
    setIsRunning(false);
    const newSession = createMockSession(mode);
    setSession(newSession);
  }

  return (
    <div className="space-y-6 rounded-2xl bg-zinc-900 p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Live Session</h2>
          <p className="text-sm text-zinc-400">
            {session.bets.length} bets · ${Math.round(session.currentBankroll)}{" "}
            remaining of ${session.initialBankroll}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 transition"
          >
            Reset
          </button>
          <button
            onClick={() => setIsRunning((r) => !r)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              isRunning
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
        </div>
      </div>

      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => handleModeChange(m.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              mode === m.value
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Risk meter */}
      <RiskMeter score={risk.score} level={risk.level} />

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="bet"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              label={{ value: "Bet #", position: "insideBottom", offset: -2, fill: "#a1a1aa", fontSize: 11 }}
            />
            <YAxis
              yAxisId="bankroll"
              orientation="right"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              yAxisId="amount"
              orientation="left"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number | undefined, name: string | undefined) => [
                `$${value ?? 0}`,
                name === "bankroll" ? "Bankroll" : "Bet",
              ]}
            />
            {/* Bet bars — green for wins, red for losses */}
            <Bar yAxisId="amount" dataKey="amount" maxBarSize={20}>
              {chartData.map((point, i) => (
                <Cell
                  key={i}
                  fill={point.outcome === "win" ? "#22c55e" : "#ef4444"}
                />
              ))}
            </Bar>
            {/* Bankroll line */}
            <Line
              yAxisId="bankroll"
              type="monotone"
              dataKey="bankroll"
              stroke="#818cf8"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" />
          Win
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" />
          Loss
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-400" />
          Bankroll
        </span>
      </div>
    </div>
  );
}
