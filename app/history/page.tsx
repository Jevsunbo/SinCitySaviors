import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

function getRating(peakRiskScore: number, userAccepted: boolean) {
  if (peakRiskScore < 50) return { label: "Responsible Player", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" };
  if (peakRiskScore < 75 && userAccepted) return { label: "Good Sport", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
  if (peakRiskScore >= 75 && userAccepted) return { label: "Smart Call", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" };
  return { label: "Risky Session", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-500 hover:text-white transition text-sm">
              ← Back
            </Link>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <span>♠</span>
              <h1 className="font-bold tracking-tight">Session History</h1>
            </div>
          </div>
          <p className="text-sm text-zinc-500">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-3xl">♠</div>
            <h2 className="text-xl font-semibold">No sessions yet</h2>
            <p className="text-zinc-500 text-sm">Complete a session on the dashboard and it'll show up here.</p>
            <Link
              href="/dashboard"
              className="mt-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition"
            >
              Start a session
            </Link>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <StatBox
                label="Total Sessions"
                value={`${sessions.length}`}
              />
              <StatBox
                label="Avg Risk Score"
                value={`${Math.round(sessions.reduce((a, s) => a + s.peakRiskScore, 0) / sessions.length)}`}
                highlight={sessions.reduce((a, s) => a + s.peakRiskScore, 0) / sessions.length >= 50}
              />
              <StatBox
                label="Ace Accepted"
                value={`${sessions.filter((s) => s.userAccepted).length}/${sessions.filter((s) => s.aceTriggered).length}`}
                sub="interventions"
              />
            </div>

            {/* Session list */}
            <div className="space-y-3">
              {sessions.map((s) => {
                const rating = getRating(s.peakRiskScore, s.userAccepted);
                return (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-zinc-500">{formatDate(s.startedAt)}</p>
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${rating.bg} ${rating.color}`}>
                          {rating.label}
                        </span>
                      </div>

                      {/* Risk score ring */}
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${s.peakRiskScore >= 75 ? "text-red-400" : s.peakRiskScore >= 50 ? "text-yellow-400" : "text-green-400"}`}>
                          {Math.round(s.peakRiskScore)}
                        </p>
                        <p className="text-xs text-zinc-600">peak risk</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-sm font-semibold text-white">{s.duration ?? "—"}m</p>
                        <p className="text-xs text-zinc-600">duration</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {s.aceTriggered ? (s.userAccepted ? "Accepted" : "Declined") : "No trigger"}
                        </p>
                        <p className="text-xs text-zinc-600">Ace</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {s.finalBankroll != null ? `$${Math.round(s.finalBankroll)}` : "—"}
                        </p>
                        <p className="text-xs text-zinc-600">spent</p>
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

function StatBox({ label, value, sub, highlight = false }: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-red-400" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}
