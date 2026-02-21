"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MentalHealthProfile } from "@/lib/riskEngine";

interface OnboardingData {
  name: string;
  ageVerified: boolean;
  budgetLimit: number;
  timeLimit: number;
  mood: MentalHealthProfile["mood"];
  stress: MentalHealthProfile["stress"];
  intent: MentalHealthProfile["intent"];
}

interface OnboardingProps {
  onComplete: (profile: MentalHealthProfile) => void;
}

const MOOD_OPTIONS = [
  { value: "great",     label: "Great",     emoji: "😄" },
  { value: "good",      label: "Good",      emoji: "🙂" },
  { value: "okay",      label: "Okay",      emoji: "😐" },
  { value: "not_great", label: "Not great", emoji: "😔" },
] as const;

const STRESS_OPTIONS = [
  { value: "low",       label: "Low",       desc: "Feeling relaxed" },
  { value: "moderate",  label: "Moderate",  desc: "Some things on my mind" },
  { value: "high",      label: "High",      desc: "Pretty stressed" },
  { value: "very_high", label: "Very high", desc: "Really overwhelmed" },
] as const;

const INTENT_OPTIONS = [
  { value: "fun",         label: "Just for fun",           emoji: "🎉" },
  { value: "celebrating", label: "Celebrating something",  emoji: "🥂" },
  { value: "bored",       label: "Killing time",           emoji: "😴" },
  { value: "escaping",    label: "Need a distraction",     emoji: "🌀" },
] as const;

function getAceIntro(data: OnboardingData): string {
  if (data.intent === "escaping") {
    return `Hey ${data.name}, good to meet you. I'm Ace — think of me as your casino buddy for the night. Sounds like you've got a lot going on, so let's keep things fun and low-key. I'll check in every now and then to make sure the night stays good.`;
  }
  if (data.stress === "very_high") {
    return `Hey ${data.name}! I'm Ace, your companion for tonight. I'll keep an eye on things so you can just relax and enjoy yourself. If I ever think you could use a break, I'll give you a heads up — no pressure, just looking out for you.`;
  }
  if (data.mood === "not_great") {
    return `Hey ${data.name}, glad you're here. I'm Ace. Tonight's about having a good time, and I'm here to help with that. I'll pop in occasionally — just a friendly check-in to make sure you're enjoying yourself.`;
  }
  return `Hey ${data.name}! I'm Ace, your casino companion for the night. I'll be around to make sure you're having a great time. If you ever want a recommendation for a show or a bite to eat, just ask!`;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { data: session } = useSession();
  const [isReturning, setIsReturning] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    ageVerified: false,
    budgetLimit: 500,
    timeLimit: 120,
    mood: undefined,
    stress: undefined,
    intent: undefined,
  });

  useEffect(() => {
    const saved = localStorage.getItem("ace_player_name") ?? "";
    if (saved) {
      setIsReturning(true);
      setStep(2);
      setData((prev) => ({ ...prev, name: saved, ageVerified: true }));
    } else if (session?.user?.name) {
      setData((prev) => ({ ...prev, name: session.user!.name! }));
    }
  }, [session?.user?.name]);

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFinish() {
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
      onComplete({ mood: data.mood, stress: data.stress, intent: data.intent });
    }
  }

  const totalSteps = isReturning ? 2 : 3;
  const currentStep = isReturning ? step - 1 : step;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold">♠</div>
            <span className="text-sm font-semibold text-zinc-400">Sin City Saviors</span>
          </div>
          <span className="text-xs text-zinc-600">Step {currentStep} of {totalSteps}</span>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 w-full rounded-full bg-zinc-800">
            <div
              className="h-1 rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`text-xs ${i + 1 <= currentStep ? "text-indigo-400" : "text-zinc-700"}`}
              >
                {isReturning
                  ? ["Check-in", "Meet Ace"][i]
                  : ["Welcome", "Check-in", "Meet Ace"][i]}
              </span>
            ))}
          </div>
        </div>

        {/* Step 1 — Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome to Sin City Saviors</h1>
              <p className="mt-2 text-zinc-400">Let's get you set up before you play.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Your name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="What should Ace call you?"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition">
                <input
                  type="checkbox"
                  checked={data.ageVerified}
                  onChange={(e) => update("ageVerified", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-indigo-500"
                />
                <span className="text-sm text-zinc-400">
                  I confirm I am <span className="text-white font-semibold">21 years of age</span> or older
                </span>
              </label>
            </div>

            <button
              onClick={() => {
                localStorage.setItem("ace_player_name", data.name);
                setStep(2);
              }}
              disabled={!data.name || !data.ageVerified}
              className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Check-in */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Quick check-in</h2>
              <p className="mt-2 text-zinc-400">
                Ace uses this to personalize your session. Takes 30 seconds.
              </p>
            </div>

            {/* Budget & time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Budget ($)</label>
                <input
                  type="number"
                  value={data.budgetLimit}
                  onChange={(e) => update("budgetLimit", Number(e.target.value))}
                  min={50}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Time limit (min)</label>
                <input
                  type="number"
                  value={data.timeLimit}
                  onChange={(e) => update("timeLimit", Number(e.target.value))}
                  min={30}
                  max={480}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Mood */}
            <div>
              <p className="mb-3 text-sm font-semibold text-zinc-300">How are you feeling tonight?</p>
              <div className="grid grid-cols-2 gap-2">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("mood", opt.value)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                      data.mood === opt.value
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                    {data.mood === opt.value && <span className="ml-auto text-indigo-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Stress */}
            <div>
              <p className="mb-3 text-sm font-semibold text-zinc-300">What's your stress level?</p>
              <div className="space-y-2">
                {STRESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("stress", opt.value)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-sm transition ${
                      data.stress === opt.value
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{opt.desc}</span>
                      {data.stress === opt.value && <span className="text-indigo-400 text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Intent */}
            <div>
              <p className="mb-3 text-sm font-semibold text-zinc-300">What brings you in tonight?</p>
              <div className="grid grid-cols-2 gap-2">
                {INTENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("intent", opt.value)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                      data.intent === opt.value
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                    {data.intent === opt.value && <span className="ml-auto text-indigo-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              {!isReturning && (
                <button
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-zinc-700 px-5 py-3.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={() => setStep(3)}
                disabled={!data.mood || !data.stress || !data.intent}
                className="flex-1 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Meet Ace →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Ace intro */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-4xl mx-auto shadow-lg shadow-indigo-600/30">
                ♠
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Meet Ace</h2>
                <p className="mt-1 text-zinc-400">Your casino companion for tonight</p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/30 text-sm flex-shrink-0">♠</div>
                <div>
                  <p className="text-sm font-semibold text-white">Ace</p>
                  <p className="text-xs text-indigo-300/60">Casino companion</p>
                </div>
              </div>
              <p className="text-zinc-100 leading-relaxed text-sm">
                {getAceIntro(data)}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Session settings</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-zinc-800/60 px-4 py-3">
                  <p className="text-xs text-zinc-500">Budget</p>
                  <p className="text-lg font-bold text-white mt-0.5">${data.budgetLimit}</p>
                </div>
                <div className="rounded-lg bg-zinc-800/60 px-4 py-3">
                  <p className="text-xs text-zinc-500">Time limit</p>
                  <p className="text-lg font-bold text-white mt-0.5">{data.timeLimit}m</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="rounded-xl border border-zinc-700 px-5 py-3.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
              >
                {loading ? "Setting up..." : "Let's play →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
