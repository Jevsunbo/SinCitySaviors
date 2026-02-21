import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import StartSessionButton from "@/components/StartSessionButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold">♠</div>
            <span className="font-bold tracking-tight text-lg">Sin City Saviors</span>
          </Link>
          <UserAvatar />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-16 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="h-[400px] w-[800px] rounded-full bg-indigo-600/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-powered responsible gaming · Powered by Claude
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
            Play smarter.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Stay in control.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            Sin City Saviors gives every casino player a real-time AI companion named Ace.
            He watches your session, reads the patterns, and steps in before things go sideways.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <StartSessionButton className="rounded-full bg-indigo-600 px-10 py-4 font-semibold hover:bg-indigo-500 transition text-lg shadow-lg shadow-indigo-600/30">
              Start your session →
            </StartSessionButton>
            <a
              href="#how-it-works"
              className="rounded-full border border-zinc-700 px-10 py-4 font-semibold text-zinc-400 hover:border-zinc-500 hover:text-white transition text-lg"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Hero mockup */}
        <div className="relative mt-20">
          {/* Glow under card */}
          <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 h-32 w-3/4 bg-indigo-600/20 blur-2xl rounded-full" />

          <div className="relative rounded-3xl border border-zinc-700/60 bg-zinc-900 p-6 text-left shadow-2xl shadow-black/60 max-w-2xl mx-auto">
            {/* Window chrome */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs text-zinc-500 font-mono">Live Session · Full Tilt</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Session Time", value: "47m", color: "text-white" },
                { label: "Bankroll", value: "38%", color: "text-red-400" },
                { label: "Risk Score", value: "82", color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5">
                  <p className="text-xs text-zinc-500">{s.label}</p>
                  <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Risk bar */}
            <div className="mb-5 space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Risk Score</span>
                <span className="text-red-400 font-semibold">82 / 100 — High Risk</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800">
                <div className="h-2 w-[82%] rounded-full bg-red-500" />
              </div>
            </div>

            {/* Ace message */}
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/20 text-sm flex-shrink-0">♠</div>
                <div>
                  <p className="text-sm font-semibold text-white">Ace</p>
                  <p className="text-xs text-zinc-500">Your casino companion</p>
                </div>
                <span className="ml-auto rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 text-xs text-red-300 flex-shrink-0">
                  Checking in
                </span>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">
                Hey — things have been moving pretty fast the last few minutes. How about a quick break? The steakhouse on the 3rd floor has an opening right now.
              </p>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 rounded-xl bg-red-500 py-2 text-center text-xs font-semibold text-white">
                  Sounds good, let's go
                </div>
                <div className="rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-400">
                  Maybe later
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-800/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">The process</p>
            <h2 className="text-4xl font-bold">How Ace works</h2>
            <p className="mt-3 text-zinc-400 max-w-lg mx-auto">Three steps between a great night out and one you'll regret.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: "🧠",
                title: "Check in with Ace",
                desc: "Before you play, Ace asks how you're feeling. Your mood, stress level, and intent shape how closely he watches your session.",
              },
              {
                step: "02",
                icon: "📊",
                title: "Live risk monitoring",
                desc: "Ace tracks bet velocity, loss chasing, and bankroll erosion in real time — building a live risk score as you play.",
              },
              {
                step: "03",
                icon: "💬",
                title: "Ace steps in",
                desc: "When your score climbs, Ace checks in — never preachy, always human. He suggests a show, a meal, a change of scenery.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative rounded-3xl border border-zinc-800 bg-zinc-900/60 p-7 overflow-hidden group hover:border-indigo-500/30 transition-colors">
                <div className="absolute top-4 right-5 text-6xl font-black text-zinc-800 select-none group-hover:text-indigo-900/60 transition-colors">
                  {item.step}
                </div>
                <span className="text-4xl">{item.icon}</span>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-zinc-700 text-xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800/60 bg-zinc-900/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Features</p>
            <h2 className="text-4xl font-bold">Built for real impact</h2>
            <p className="mt-3 text-zinc-400">Every feature designed to protect players without killing the fun.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "⚡", title: "Real-time risk engine", desc: "Detects loss chasing, velocity spikes, and bankroll erosion the moment they happen.", accent: "text-yellow-400" },
              { icon: "♠", title: "Ace AI companion", desc: "Powered by Claude — warm, casual, never preachy. Like a friend who just happens to notice.", accent: "text-indigo-400" },
              { icon: "🧠", title: "Mental health baseline", desc: "Pre-session check-in adjusts Ace's sensitivity based on how you're actually feeling tonight.", accent: "text-purple-400" },
              { icon: "📈", title: "Live betting chart", desc: "Visual bankroll and bet history so players can see their own patterns in real time.", accent: "text-green-400" },
              { icon: "🔒", title: "Secure sign in", desc: "Google and GitHub OAuth — no passwords, no friction. Your session history saved securely.", accent: "text-blue-400" },
              { icon: "🎴", title: "Activity suggestions", desc: "When Ace steps in, he offers real alternatives — shows, dining, spa. A reason to step away.", accent: "text-pink-400" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors">
                <span className={`text-2xl ${f.accent}`}>{f.icon}</span>
                <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA strip */}
      <section className="border-t border-zinc-800/60 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl mx-auto shadow-lg shadow-indigo-600/40">♠</div>
          <h2 className="text-4xl font-bold">Meet Ace tonight.</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            No sign-up required. Start a session and Ace will be watching out for you from the first bet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <StartSessionButton className="rounded-full bg-indigo-600 px-10 py-4 font-semibold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30">
              Start your session →
            </StartSessionButton>
            <Link
              href="/sign-in"
              className="rounded-full border border-zinc-700 px-10 py-4 font-semibold text-zinc-400 hover:border-zinc-500 hover:text-white transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-sm text-zinc-600">
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
