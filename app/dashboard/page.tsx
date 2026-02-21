"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import AceChat from "@/components/AceChat";
import Onboarding from "@/components/Onboarding";
import SessionSummary from "@/components/SessionSummary";
import ActivityCards from "@/components/ActivityCards";
import { calculateRisk, MentalHealthProfile, RiskResult, SessionData } from "@/lib/riskEngine";
import { createMockSession } from "@/lib/mockSession";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";

const DEFAULT_RISK: RiskResult = calculateRisk(createMockSession("normal"));

export default function DashboardPage() {
  const [risk, setRisk] = useState<RiskResult>(DEFAULT_RISK);
  const [mentalHealth, setMentalHealth] = useState<MentalHealthProfile | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = sessionStorage.getItem("ace_mental_health");
    return saved ? JSON.parse(saved) : null;
  });
  const [endedSession, setEndedSession] = useState<SessionData | null>(null);
  const [aceTriggered, setAceTriggered] = useState(false);
  const [userAccepted, setUserAccepted] = useState(false);

  function handleOnboardingComplete(profile: MentalHealthProfile) {
    sessionStorage.setItem("ace_mental_health", JSON.stringify(profile));
    setMentalHealth(profile);
  }

  if (!mentalHealth) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (endedSession) {
    const wins = endedSession.bets.filter((b) => b.outcome === "win").length;
    const losses = endedSession.bets.filter((b) => b.outcome === "loss").length;
    const amountSpent = endedSession.initialBankroll - endedSession.currentBankroll;
    const durationMinutes = Math.round((Date.now() - endedSession.startTime) / 60000);

    return (
      <SessionSummary
        stats={{
          totalBets: endedSession.bets.length,
          wins,
          losses,
          amountSpent: Math.max(0, amountSpent),
          initialBankroll: endedSession.initialBankroll,
          peakRiskScore: risk.score,
          durationMinutes,
          aceTriggered,
          userAccepted,
        }}
        onPlayAgain={() => {
          sessionStorage.removeItem("ace_mental_health");
          setEndedSession(null);
          setMentalHealth(null);
          setAceTriggered(false);
          setUserAccepted(false);
          setRisk(DEFAULT_RISK);
        }}
      />
    );
  }

  const riskColor =
    risk.level === "high"
      ? "text-red-400"
      : risk.level === "moderate"
      ? "text-yellow-400"
      : "text-green-400";

  const riskBorderGlow =
    risk.level === "high"
      ? "border-red-500/30 shadow-red-500/10"
      : risk.level === "moderate"
      ? "border-yellow-500/20 shadow-yellow-500/5"
      : "border-zinc-800 shadow-transparent";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold hover:bg-indigo-500 transition">♠</Link>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-none">Sin City Saviors</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Responsible Gaming Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-zinc-400 font-medium">Live</span>
            </div>

            <RiskBadge level={risk.level} score={risk.score} />
            <UserAvatar />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6 space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <SessionTimeCard minutes={risk.sessionDurationMinutes} />
          <StatCard
            label="Bankroll"
            icon="💰"
            value={`${risk.bankrollRemainingPct}%`}
            sub="remaining"
            bar={{ pct: risk.bankrollRemainingPct, color: risk.bankrollRemainingPct < 30 ? "bg-red-500" : risk.bankrollRemainingPct < 60 ? "bg-yellow-400" : "bg-green-500" }}
            valueColor={risk.bankrollRemainingPct < 50 ? "text-red-400" : "text-white"}
          />
          <StatCard
            label="Risk Score"
            icon="⚠️"
            value={`${risk.score}`}
            sub="out of 100"
            bar={{ pct: risk.score, color: risk.score >= 75 ? "bg-red-500" : risk.score >= 50 ? "bg-yellow-400" : "bg-green-500" }}
            valueColor={riskColor}
          />
        </div>

        {/* Main layout */}
        <div className={`grid gap-5 lg:grid-cols-5 lg:items-stretch rounded-2xl border shadow-lg transition-all duration-700 p-5 bg-zinc-900/40 ${riskBorderGlow}`}>
          {/* Chart */}
          <div className="lg:col-span-3">
            <Dashboard
              onRiskUpdate={setRisk}
              onEndSession={setEndedSession}
              mentalHealth={mentalHealth}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <AceChat risk={risk} />
            <ActivityCards risk={risk} onAccept={() => setUserAccepted(true)} />

            {/* Active signals */}
            <div className="mt-auto">
              {risk.triggers.length > 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Active Signals
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {risk.triggers.map((t) => (
                      <TriggerPill key={t} trigger={t} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <p className="text-xs text-zinc-500">No risk signals detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function RiskBadge({ level, score }: { level: RiskResult["level"]; score: number }) {
  const styles =
    level === "high"
      ? "bg-red-500/20 text-red-400 border-red-500/40"
      : level === "moderate"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
      : "bg-green-500/20 text-green-400 border-green-500/40";

  const dot =
    level === "high" ? "bg-red-400" : level === "moderate" ? "bg-yellow-400" : "bg-green-400";

  const label =
    level === "high" ? "High Risk" : level === "moderate" ? "Moderate" : "All Clear";

  return (
    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-500 ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${level === "high" ? "animate-pulse" : ""}`} />
      {label} · {score}
    </span>
  );
}

function SessionTimeCard({ minutes }: { minutes: number }) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const display = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  const intensity =
    minutes >= 120 ? "text-red-400" :
    minutes >= 60  ? "text-yellow-400" :
    "text-white";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">Session Time</p>
        <span className="text-sm">⏱</span>
      </div>
      <p className={`text-3xl font-bold ${intensity}`}>{display}</p>
      <p className="text-xs text-zinc-600">active duration</p>
      <div className="flex gap-1 mt-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${
              i < Math.ceil((minutes / 120) * 12)
                ? minutes >= 120 ? "bg-red-500" : minutes >= 60 ? "bg-yellow-400" : "bg-green-500"
                : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  icon,
  value,
  sub,
  valueColor = "text-white",
  bar,
}: {
  label: string;
  icon: string;
  value: string;
  sub: string;
  valueColor?: string;
  bar?: { pct: number; color: string };
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{label}</p>
        <span className="text-sm">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-zinc-600">{sub}</p>
      {bar && (
        <div className="h-1.5 w-full rounded-full bg-zinc-800 mt-2">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${bar.color}`}
            style={{ width: `${Math.min(bar.pct, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

const TRIGGER_LABELS: Record<string, { label: string; icon: string }> = {
  loss_chasing:           { label: "Loss Chasing",    icon: "📉" },
  long_session:           { label: "Long Session",    icon: "⏰" },
  velocity_spike:         { label: "Velocity Spike",  icon: "⚡" },
  bankroll_erosion:       { label: "Bankroll Erosion",icon: "💸" },
  mental_health_baseline: { label: "Mental Health",   icon: "🧠" },
};

function TriggerPill({ trigger }: { trigger: string }) {
  const info = TRIGGER_LABELS[trigger] ?? { label: trigger, icon: "⚠️" };
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 border border-red-500/20">
      <span>{info.icon}</span>
      {info.label}
    </span>
  );
}
