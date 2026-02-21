import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">♠</span>
            <span className="font-bold tracking-tight">Sin City Saviors</span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold hover:bg-indigo-500 transition"
          >
            Start Session
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          AI-powered responsible gambling
        </div>

        <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Play smarter.{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Stay in control.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
          Sin City Saviors monitors your betting behavior in real time and
          deploys Ace — an AI companion — to keep your session fun, safe, and
          on your terms.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-full bg-indigo-600 px-8 py-3.5 font-semibold hover:bg-indigo-500 transition text-lg"
          >
            Start your session
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-zinc-700 px-8 py-3.5 font-semibold text-zinc-400 hover:border-zinc-500 hover:text-white transition text-lg"
          >
            See how it works
          </a>
        </div>

        {/* Hero visual */}
        <div className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-zinc-500">Live Session · Full Tilt Mode</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Session Time", value: "47m", highlight: false },
              { label: "Bankroll", value: "38%", highlight: true },
              { label: "Risk Score", value: "82", highlight: true },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.highlight ? "text-red-400" : "text-white"}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-sm">♠</div>
              <div>
                <p className="text-sm font-semibold text-white">Ace</p>
                <p className="text-xs text-zinc-500">Your casino companion</p>
              </div>
              <span className="ml-auto rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs text-red-300">Checking in</span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">
              Hey, you've had a solid run tonight — things have been moving pretty fast the last few minutes. How about a quick break? I heard the steakhouse on the 3rd floor has an opening right now.
            </p>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-lg bg-red-500 py-1.5 text-center text-xs font-semibold text-white">
                Sounds good, let's do it
              </div>
              <div className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400">
                Maybe later
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-800 bg-zinc-900/50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <p className="mt-3 text-center text-zinc-400">Three steps between a fun night and a regrettable one.</p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: "🧠",
                title: "Check in with Ace",
                desc: "Before you play, Ace asks a few quick questions about how you're feeling. Your answers shape how Ace looks out for you all night.",
              },
              {
                step: "02",
                icon: "📊",
                title: "Live risk monitoring",
                desc: "Ace watches your betting patterns in real time — speed, bet sizes, bankroll changes — and calculates a live risk score as you play.",
              },
              {
                step: "03",
                icon: "💬",
                title: "Ace steps in",
                desc: "When your risk score climbs, Ace checks in with a warm, non-judgmental message and suggests a real alternative — a show, a meal, a walk.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-xs font-mono text-zinc-600">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold">Built for real impact</h2>
          <p className="mt-3 text-center text-zinc-400">Every feature is designed to protect players without killing the fun.</p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "⚡", title: "Real-time risk engine", desc: "Detects loss chasing, velocity spikes, and bankroll erosion as they happen." },
              { icon: "♠", title: "Ace AI companion", desc: "Powered by Claude — warm, casual, and never preachy. Like a friend who happens to notice." },
              { icon: "🧠", title: "Mental health baseline", desc: "Pre-session check-in adjusts Ace's sensitivity based on how you're actually feeling." },
              { icon: "📈", title: "Live betting chart", desc: "Visual bankroll and bet history so players can see their own patterns clearly." },
              { icon: "🔒", title: "Secure sign in", desc: "Google and GitHub OAuth via NextAuth — no passwords to remember." },
              { icon: "🎯", title: "Session limits", desc: "Set a budget and time limit before you play. Ace keeps you accountable." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign in CTA */}
      <section className="border-t border-zinc-800 bg-zinc-900/50 py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to play smarter?</h2>
          <p className="mt-3 text-zinc-400">
            Sign in to save your session history and let Ace get to know you better over time.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/api/auth/signin"
              className="flex items-center justify-center gap-2 rounded-full border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Sign in with GitHub
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 transition"
            >
              Try without signing in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <span>♠</span>
            <span>Sin City Saviors</span>
          </div>
          <span>Built for hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}
