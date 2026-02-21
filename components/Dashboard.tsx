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
import { calculateRisk, Bet, MentalHealthProfile, RiskResult, SessionData } from "@/lib/riskEngine";
import { addLiveBet, createDemoSession, createMockSession, DEMO_SCRIPT, ScenarioMode } from "@/lib/mockSession";

interface ChartPoint {
  bet: number;
  amount: number;
  outcome: "win" | "loss";
  bankroll: number;
}

interface DashboardProps {
  onRiskUpdate: (risk: RiskResult) => void;
  onEndSession: (session: SessionData) => void;
  mentalHealth?: MentalHealthProfile | null;
}

const MODES: { value: ScenarioMode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "loss_chase", label: "Loss Chasing" },
  { value: "velocity", label: "Velocity Spike" },
  { value: "erosion", label: "Bankroll Erosion" },
  { value: "tilt", label: "Full Tilt" },
  { value: "demo", label: "Demo" },
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

export default function Dashboard({ onRiskUpdate, onEndSession, mentalHealth }: DashboardProps) {
  const [mode, setMode] = useState<ScenarioMode>("normal");
  const [session, setSession] = useState<SessionData>(() =>
    createMockSession("normal")
  );
  const [risk, setRisk] = useState<RiskResult>(() =>
    calculateRisk(createMockSession("normal"))
  );
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoStepRef = useRef(0);

  const chartData = buildChartData(session);

  // Recalculate risk whenever session or mental health profile changes
  useEffect(() => {
    const newRisk = calculateRisk({
      ...session,
      mentalHealth: mentalHealth ?? undefined,
    });
    setRisk(newRisk);
    onRiskUpdate(newRisk);
  }, [session, mentalHealth]);

  // Live simulation tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === "demo") {
          const step = demoStepRef.current;
          if (step >= DEMO_SCRIPT.length) {
            setIsRunning(false);
            return;
          }
          const { amount, outcome } = DEMO_SCRIPT[step];
          demoStepRef.current = step + 1;
          const newBet: Bet = {
            id: `bet_demo_${step + 1}`,
            amount,
            outcome,
            timestamp: Date.now(),
          };
          setSession((prev) => {
            const bankrollDelta = outcome === "win" ? amount * 0.9 : -amount;
            return {
              ...prev,
              bets: [...prev.bets, newBet],
              currentBankroll: Math.max(0, prev.currentBankroll + bankrollDelta),
            };
          });
        } else {
          setSession((prev) => addLiveBet(prev, mode));
        }
      }, mode === "demo" ? 1200 : 1500);
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
    demoStepRef.current = 0;
    if (newMode === "demo") {
      setSession(createDemoSession());
      setTimeout(() => setIsRunning(true), 100);
    } else {
      setSession(createMockSession(newMode));
    }
  }

  function handleReset() {
    setIsRunning(false);
    demoStepRef.current = 0;
    if (mode === "demo") {
      setSession(createDemoSession());
      setTimeout(() => setIsRunning(true), 100);
    } else {
      setSession(createMockSession(mode));
    }
  }

  return (
    <div className="space-y-6 rounded-2xl bg-zinc-900 p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Live Session</h2>
            {mode === "demo" && (
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 text-xs font-bold text-indigo-300 animate-pulse">
                DEMO
              </span>
            )}
          </div>
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
            onClick={() => { setIsRunning(false); onEndSession(session); }}
            disabled={session.bets.length === 0}
            className="rounded-lg border border-red-700 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            End Session
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
        {MODES.filter((m) => m.value !== "demo").map((m) => (
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
        <button
          onClick={() => handleModeChange("demo")}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            mode === "demo"
              ? "bg-indigo-500 text-white shadow shadow-indigo-500/30"
              : "border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10"
          }`}
        >
          ⚡ Demo Mode
        </button>
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
