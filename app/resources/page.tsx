import Link from "next/link";
import BackButton from "@/components/BackButton";

const HOTLINES = [
  {
    name: "National Problem Gambling Helpline",
    number: "1-800-522-4700",
    desc: "24/7 call, text, or chat. Free, confidential support for anyone affected by problem gambling.",
    flag: "🇺🇸",
  },
  {
    name: "Crisis Text Line",
    number: "Text HOME to 741741",
    desc: "Free, 24/7 crisis counseling by text for anyone in the US.",
    flag: "📱",
  },
  {
    name: "Gamblers Anonymous",
    number: "gamblersanonymous.org",
    desc: "Find a meeting near you. Peer support from people who've been there.",
    flag: "🤝",
  },
];

const RESOURCES = [
  {
    icon: "🔒",
    title: "Self-Exclusion Programs",
    desc: "Most states and casinos offer voluntary self-exclusion. You can request to be banned from gambling venues for a set period — 1 year, 5 years, or lifetime.",
    accent: "border-blue-500/30 bg-blue-500/5",
    iconBg: "bg-blue-500/20 text-blue-400",
  },
  {
    icon: "🧠",
    title: "Know the Warning Signs",
    desc: "Chasing losses, hiding gambling from others, borrowing money to gamble, feeling restless when not playing — these are signs it's time to talk to someone.",
    accent: "border-purple-500/30 bg-purple-500/5",
    iconBg: "bg-purple-500/20 text-purple-400",
  },
  {
    icon: "💬",
    title: "Talk to Someone",
    desc: "Problem gambling thrives in silence. Whether it's a counselor, a trusted friend, or a helpline, reaching out is the hardest and most important step.",
    accent: "border-green-500/30 bg-green-500/5",
    iconBg: "bg-green-500/20 text-green-400",
  },
  {
    icon: "📊",
    title: "Set Hard Limits",
    desc: "Decide your budget and time limit before you start — not while you're playing. Write it down. Tell someone. Make it real before you walk in.",
    accent: "border-yellow-500/30 bg-yellow-500/5",
    iconBg: "bg-yellow-500/20 text-yellow-400",
  },
];

const SELF_CHECK = [
  "Have you ever spent more than you planned to?",
  "Have you gambled to escape stress, anxiety, or problems at home?",
  "Have you chased losses by continuing to play after losing?",
  "Has gambling affected your relationships or responsibilities?",
  "Have you lied to others about how much you gamble?",
  "Have you borrowed money or sold things to fund gambling?",
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BackButton />
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <Link href="/" className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold hover:bg-indigo-500 transition">♠</Link>
              <h1 className="font-bold tracking-tight">Responsible Gambling</h1>
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

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-12">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/15 border border-green-500/30 text-3xl mx-auto">
            🛡️
          </div>
          <h2 className="text-3xl font-bold">You're not alone.</h2>
          <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
            Millions of people struggle with problem gambling. Help is available — free, confidential, and available right now.
          </p>
        </div>

        {/* Hotlines */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Get Help Now</p>
          {HOTLINES.map((h) => (
            <div
              key={h.name}
              className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 flex items-start gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15 text-xl flex-shrink-0">
                {h.flag}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white">{h.name}</p>
                <p className="text-green-400 font-bold text-lg mt-0.5">{h.number}</p>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Self-check */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Quick Self-Check</p>
            <p className="text-white font-semibold">If you answered yes to 2 or more of these, consider reaching out.</p>
          </div>
          <ul className="space-y-3">
            {SELF_CHECK.map((q, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 text-xs text-zinc-500 flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ul>
          <a
            href="https://www.ncpgambling.org/help-treatment/self-assessment/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition"
          >
            Take the full assessment →
          </a>
        </div>

        {/* Resource cards */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">What You Can Do</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {RESOURCES.map((r) => (
              <div key={r.title} className={`rounded-2xl border p-5 space-y-3 ${r.accent}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${r.iconBg}`}>
                  {r.icon}
                </div>
                <div>
                  <p className="font-semibold text-white">{r.title}</p>
                  <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 text-center space-y-3">
          <p className="font-semibold text-white">Ready to play responsibly?</p>
          <p className="text-sm text-zinc-400">
            Sin City Saviors monitors your session in real time and checks in before things go sideways.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold hover:bg-indigo-500 transition"
          >
            Start a session with Ace →
          </Link>
        </div>

      </main>

      <footer className="border-t border-zinc-800/60 py-6 mt-8">
        <p className="text-center text-xs text-zinc-600">
          If you are in crisis, call or text 988 (Suicide & Crisis Lifeline) or 911.
        </p>
      </footer>
    </div>
  );
}
