"use client";

import Link from "next/link";
import { useEffect } from "react";

interface SessionStats {
  totalBets: number;
  wins: number;
  losses: number;
  amountSpent: number;
  initialBankroll: number;
  peakRiskScore: number;
  durationMinutes: number;
  aceTriggered: boolean;
  userAccepted: boolean;
}

interface SessionSummaryProps {
  stats: SessionStats;
  onPlayAgain: () => void;
}

function getRating(peakRiskScore: number, userAccepted: boolean) {
  if (peakRiskScore < 50) return {
    label: "Responsible Player",
    desc: "You kept it clean tonight. Ace barely had to say a word.",
    emoji: "🟢",
    color: "text-green-400",
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    bar: "bg-green-500",
  };
  if (peakRiskScore < 75 && userAccepted) return {
    label: "Good Sport",
    desc: "Things got a little heated but you took the hint. Well played.",
    emoji: "🟡",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    bar: "bg-yellow-400",
  };
  if (peakRiskScore >= 75 && userAccepted) return {
    label: "Smart Call",
    desc: "It was getting intense — you made the right move taking a break.",
    emoji: "🔵",
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    bar: "bg-indigo-500",
  };
  return {
    label: "Risky Session",
    desc: "It was a tough night. Ace will be here next time too.",
    emoji: "🔴",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    bar: "bg-red-500",
  };
}

export default function SessionSummary({ stats, onPlayAgain }: SessionSummaryProps) {
  const rating = getRating(stats.peakRiskScore, stats.userAccepted);
  const winRate = stats.totalBets > 0 ? Math.round((stats.wins / stats.totalBets) * 100) : 0;
  const budgetUsedPct = Math.min(Math.round((stats.amountSpent / stats.initialBankroll) * 100), 100);

  useEffect(() => {
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        duration: stats.durationMinutes,
        peakRiskScore: stats.peakRiskScore,
        finalBankroll: stats.amountSpent,
        aceTriggered: stats.aceTriggered,
        userAccepted: stats.userAccepted,
      }),
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-5">

        {/* Hero card */}
        <div className={`rounded-3xl border ${rating.border} ${rating.bg} p-8 text-center space-y-3`}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900/60 text-4xl mx-auto border border-zinc-700/50">
            ♠
          </div>
          <div>
            <p className="text-sm text-zinc-400 uppercase tracking-widest font-medium mb-1">Session Complete</p>
            <h1 className={`text-3xl font-bold ${rating.color}`}>{rating.label}</h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">{rating.desc}</p>
          </div>
        </div>

        {/* Risk score bar */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Peak Risk Score</span>
            <span className={`font-bold ${rating.color}`}>{stats.peakRiskScore} / 100</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-800">
            <div
              className={`h-2.5 rounded-full ${rating.bar} transition-all duration-700`}
              style={{ width: `${Math.min(stats.peakRiskScore, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Bets" value={`${stats.totalBets}`} sub="placed" />
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            sub={`${stats.wins}W · ${stats.losses}L`}
            valueColor={winRate >= 50 ? "text-green-400" : "text-red-400"}
          />
          <StatCard
            label="Budget Used"
            value={`${budgetUsedPct}%`}
            sub={`$${Math.round(stats.amountSpent)} of $${stats.initialBankroll}`}
            valueColor={budgetUsedPct >= 75 ? "text-red-400" : "text-white"}
            bar={{ pct: budgetUsedPct, color: budgetUsedPct >= 75 ? "bg-red-500" : budgetUsedPct >= 50 ? "bg-yellow-400" : "bg-green-500" }}
          />
          <StatCard label="Session Time" value={`${stats.durationMinutes}m`} sub="duration" />
        </div>

        {/* Ace card */}
        <div className={`rounded-2xl border p-5 ${
          !stats.aceTriggered
            ? "border-zinc-800 bg-zinc-900"
            : stats.userAccepted
            ? "border-green-500/30 bg-green-500/10"
            : "border-zinc-700 bg-zinc-900"
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-base flex-shrink-0">♠</div>
            <div>
              <p className="font-semibold text-white text-sm">Ace</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {!stats.aceTriggered
                  ? "No intervention needed — clean session."
                  : stats.userAccepted
                  ? "You took Ace's suggestion — great call."
                  : "Ace checked in but you kept going."}
              </p>
            </div>
            <span className={`ml-auto text-xs font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${
              !stats.aceTriggered
                ? "bg-zinc-800 text-zinc-400"
                : stats.userAccepted
                ? "bg-green-500/20 text-green-400"
                : "bg-zinc-800 text-zinc-400"
            }`}>
              {!stats.aceTriggered ? "No trigger" : stats.userAccepted ? "Accepted" : "Declined"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onPlayAgain}
            className="flex-1 rounded-xl bg-indigo-600 py-3.5 font-semibold hover:bg-indigo-500 transition"
          >
            Play Again
          </button>
          <Link
            href="/history"
            className="flex-1 rounded-xl border border-zinc-700 py-3.5 text-center font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            View History
          </Link>
        </div>

      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  valueColor = "text-white",
  bar,
}: {
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
  bar?: { pct: number; color: string };
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-1">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-zinc-600">{sub}</p>
      {bar && (
        <div className="h-1.5 w-full rounded-full bg-zinc-800 mt-2">
          <div className={`h-1.5 rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
        </div>
      )}
    </div>
  );
}
