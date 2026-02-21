"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RiskResult } from "@/lib/riskEngine";

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

function getRatingLabel(peakRiskScore: number, userAccepted: boolean): {
  label: string;
  desc: string;
  color: string;
} {
  if (peakRiskScore < 50) {
    return {
      label: "Responsible Player",
      desc: "You kept it clean tonight. Ace barely had to say a word.",
      color: "text-green-400",
    };
  }
  if (peakRiskScore < 75 && userAccepted) {
    return {
      label: "Good Sport",
      desc: "Things got a little heated but you took the hint. Well played.",
      color: "text-yellow-400",
    };
  }
  if (peakRiskScore >= 75 && userAccepted) {
    return {
      label: "Smart Call",
      desc: "It was getting intense — you made the right move taking a break.",
      color: "text-indigo-400",
    };
  }
  return {
    label: "Risky Session",
    desc: "It was a tough night. Ace will be here next time too.",
    color: "text-red-400",
  };
}

export default function SessionSummary({ stats, onPlayAgain }: SessionSummaryProps) {
  const rating = getRatingLabel(stats.peakRiskScore, stats.userAccepted);
  const winRate = stats.totalBets > 0
    ? Math.round((stats.wins / stats.totalBets) * 100)
    : 0;
  const netResult = stats.initialBankroll - stats.amountSpent;
  const isUp = netResult > stats.initialBankroll;

  // Save session to DB
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
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-3xl mx-auto">
            ♠
          </div>
          <h1 className="text-3xl font-bold">Session Complete</h1>
          <p className={`text-lg font-semibold ${rating.color}`}>{rating.label}</p>
          <p className="text-sm text-zinc-400">{rating.desc}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Total Bets" value={`${stats.totalBets}`} sub="placed" />
          <StatBox label="Win Rate" value={`${winRate}%`} sub={`${stats.wins}W · ${stats.losses}L`} />
          <StatBox
            label="Amount Spent"
            value={`$${Math.round(stats.amountSpent)}`}
            sub={`of $${stats.initialBankroll} budget`}
            highlight={stats.amountSpent > stats.initialBankroll * 0.5}
          />
          <StatBox
            label="Session Time"
            value={`${stats.durationMinutes}m`}
            sub="duration"
          />
          <StatBox
            label="Peak Risk Score"
            value={`${stats.peakRiskScore}`}
            sub="out of 100"
            highlight={stats.peakRiskScore >= 75}
          />
          <StatBox
            label="Ace Intervened"
            value={stats.aceTriggered ? "Yes" : "No"}
            sub={stats.aceTriggered ? (stats.userAccepted ? "You accepted" : "You passed") : "Clean session"}
            highlight={false}
          />
        </div>

        {/* Ace summary */}
        {stats.aceTriggered && (
          <div className={`rounded-2xl border p-4 ${
            stats.userAccepted
              ? "border-green-500/30 bg-green-500/10"
              : "border-zinc-700 bg-zinc-900"
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-sm">♠</div>
              <div>
                <p className="text-sm font-semibold text-white">Ace</p>
                <p className="text-xs text-zinc-500">
                  {stats.userAccepted
                    ? "You took Ace's suggestion — great call."
                    : "Ace checked in but you kept going."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 transition"
          >
            Play Again
          </button>
          <Link
            href="/"
            className="flex-1 rounded-xl border border-zinc-700 py-3 text-center font-semibold text-zinc-400 hover:bg-zinc-800 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatBox({
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
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-red-400" : "text-white"}`}>
        {value}
      </p>
      <p className="text-xs text-zinc-600">{sub}</p>
    </div>
  );
}
