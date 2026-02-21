import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import BackButton from "@/components/BackButton";

function getRating(peakRiskScore: number, userAccepted: boolean) {
  if (peakRiskScore < 50) return { label: "Responsible Player", color: "text-green-400", border: "border-green-500/30", glow: "shadow-green-500/10" };
  if (peakRiskScore < 75 && userAccepted) return { label: "Good Sport", color: "text-yellow-400", border: "border-yellow-500/30", glow: "shadow-yellow-500/10" };
  if (peakRiskScore >= 75 && userAccepted) return { label: "Smart Call", color: "text-indigo-400", border: "border-indigo-500/30", glow: "shadow-indigo-500/10" };
  return { label: "Risky Session", color: "text-red-400", border: "border-red-500/30", glow: "shadow-red-500/10" };
}

function getRiskColor(score: number) {
  if (score >= 75) return { bar: "bg-red-500", text: "text-red-400" };
  if (score >= 50) return { bar: "bg-yellow-400", text: "text-yellow-400" };
  return { bar: "bg-green-500", text: "text-green-400" };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 20,
      },
    },
  });

  const sessions = user?.sessions ?? [];
  const avgRisk = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.peakRiskScore, 0) / sessions.length)
    : 0;
  const aceTriggered = sessions.filter((s) => s.aceTriggered).length;
  const aceAccepted = sessions.filter((s) => s.userAccepted).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BackButton />
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">♠</span>
              <h1 className="font-bold tracking-tight">Session History</h1>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold hover:bg-indigo-500 transition"
          >
            New Session
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-8">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/10 text-4xl border border-indigo-500/20">
              ♠
            </div>
            <h2 className="text-2xl font-bold">No sessions yet</h2>
            <p className="text-zinc-500 max-w-xs">
              Finish a session on the dashboard and your stats will appear here.
            </p>
            <Link
              href="/dashboard"
              className="mt-2 rounded-xl bg-indigo-600 px-8 py-3 font-semibold hover:bg-indigo-500 transition"
            >
              Start your first session
            </Link>
          </div>
        ) : (
          <>
            {/* Hero stats */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-lg">♠</div>
                <div>
                  <p className="font-semibold text-white">{user?.name ?? "Player"}</p>
                  <p className="text-xs text-zinc-500">{sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded</p>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-zinc-800">
                <div className="pr-6 space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Sessions</p>
                  <p className="text-3xl font-bold">{sessions.length}</p>
                </div>
                <div className="px-6 space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Avg Risk</p>
                  <p className={`text-3xl font-bold ${getRiskColor(avgRisk).text}`}>{avgRisk}</p>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${getRiskColor(avgRisk).bar}`}
                      style={{ width: `${Math.min(avgRisk, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Ace Rate</p>
                  <p className="text-3xl font-bold">
                    {aceTriggered > 0 ? `${Math.round((aceAccepted / aceTriggered) * 100)}%` : "—"}
                  </p>
                  <p className="text-xs text-zinc-600">{aceAccepted} of {aceTriggered} accepted</p>
                </div>
              </div>
            </div>

            {/* Session list */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Past Sessions</p>
              {sessions.map((s, i) => {
                const rating = getRating(s.peakRiskScore, s.userAccepted);
                const risk = getRiskColor(s.peakRiskScore);
                return (
                  <div
                    key={s.id}
                    className={`rounded-2xl border bg-zinc-900 p-5 shadow-lg ${rating.border} ${rating.glow}`}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                          {sessions.length - i}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{formatDate(s.startedAt)}</p>
                          <span className={`text-xs font-semibold ${rating.color}`}>{rating.label}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold leading-none ${risk.text}`}>
                          {Math.round(s.peakRiskScore)}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5">risk score</p>
                      </div>
                    </div>

                    {/* Risk bar */}
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 mb-4">
                      <div
                        className={`h-1.5 rounded-full transition-all ${risk.bar}`}
                        style={{ width: `${Math.min(s.peakRiskScore, 100)}%` }}
                      />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-zinc-800/60 py-2.5">
                        <p className="text-sm font-semibold text-white">{s.duration ?? "—"}m</p>
                        <p className="text-xs text-zinc-500">duration</p>
                      </div>
                      <div className="rounded-xl bg-zinc-800/60 py-2.5">
                        <p className={`text-sm font-semibold ${
                          !s.aceTriggered ? "text-zinc-400" :
                          s.userAccepted ? "text-green-400" : "text-red-400"
                        }`}>
                          {s.aceTriggered ? (s.userAccepted ? "✓ Accepted" : "✕ Declined") : "No check-in"}
                        </p>
                        <p className="text-xs text-zinc-500">Ace</p>
                      </div>
                      <div className="rounded-xl bg-zinc-800/60 py-2.5">
                        <p className="text-sm font-semibold text-white">
                          {s.finalBankroll != null ? `$${Math.round(s.finalBankroll)}` : "—"}
                        </p>
                        <p className="text-xs text-zinc-500">spent</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
