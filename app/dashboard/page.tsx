"use client";

import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import AceChat from "@/components/AceChat";
import { calculateRisk, RiskResult, SessionData } from "@/lib/riskEngine";
import { createMockSession } from "@/lib/mockSession";

const DEFAULT_RISK: RiskResult = calculateRisk(createMockSession("normal"));

export default function DashboardPage() {
  const [risk, setRisk] = useState<RiskResult>(DEFAULT_RISK);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♠</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Sin City Saviors</h1>
              <p className="text-xs text-zinc-500">Responsible Gaming Companion</p>
            </div>
          </div>
          <RiskBadge level={risk.level} score={risk.score} />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Session Time"
            value={`${risk.sessionDurationMinutes}m`}
            sub="duration"
          />
          <StatCard
            label="Bankroll"
            value={`${risk.bankrollRemainingPct}%`}
            sub="remaining"
            highlight={risk.bankrollRemainingPct < 50}
          />
          <StatCard
            label="Risk Score"
            value={`${risk.score}`}
            sub="out of 100"
            highlight={risk.score >= 50}
          />
        </div>

        {/* Two-column layout on larger screens */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Chart takes more space */}
          <div className="lg:col-span-3">
            <Dashboard onRiskUpdate={setRisk} />
          </div>

          {/* Ace sidebar */}
          <div className="lg:col-span-2">
            <AceChat risk={risk} />
          </div>
        </div>

        {/* Active triggers */}
        {risk.triggers.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Active Signals
            </p>
            <div className="flex flex-wrap gap-2">
              {risk.triggers.map((t) => (
                <TriggerPill key={t} trigger={t} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function RiskBadge({ level, score }: { level: RiskResult["level"]; score: number }) {
  const styles =
    level === "high"
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : level === "moderate"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-green-500/20 text-green-400 border-green-500/30";

  const label =
    level === "high" ? "High Risk" : level === "moderate" ? "Moderate" : "All Clear";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}>
      {label} · {score}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          highlight ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-zinc-600">{sub}</p>
    </div>
  );
}

const TRIGGER_LABELS: Record<string, string> = {
  loss_chasing: "Loss Chasing",
  long_session: "Long Session",
  velocity_spike: "Velocity Spike",
  bankroll_erosion: "Bankroll Erosion",
};

function TriggerPill({ trigger }: { trigger: string }) {
  return (
    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 border border-red-500/20">
      {TRIGGER_LABELS[trigger] ?? trigger}
    </span>
  );
}
