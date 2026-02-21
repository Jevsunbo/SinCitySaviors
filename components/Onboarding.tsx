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
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "not_great", label: "Not great", emoji: "😔" },
] as const;

const STRESS_OPTIONS = [
  { value: "low", label: "Low", desc: "Feeling relaxed" },
  { value: "moderate", label: "Moderate", desc: "Some things on my mind" },
  { value: "high", label: "High", desc: "Pretty stressed" },
  { value: "very_high", label: "Very high", desc: "Really overwhelmed" },
] as const;

const INTENT_OPTIONS = [
  { value: "fun", label: "Just for fun", emoji: "🎉" },
  { value: "celebrating", label: "Celebrating something", emoji: "🥂" },
  { value: "bored", label: "Killing time", emoji: "😴" },
  { value: "escaping", label: "Need a distraction", emoji: "🌀" },
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

  // Read localStorage only on the client after hydration
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
      // non-blocking — proceed even if save fails
    } finally {
      setLoading(false);
      onComplete({ mood: data.mood, stress: data.stress, intent: data.intent });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-8">
          {isReturning ? (
            <div className="flex justify-between text-xs text-zinc-500 mb-2">
              <span>Step {step - 1} of 2</span>
              <span>{Math.round(((step - 1) / 2) * 100)}%</span>
            </div>
          ) : (
            <div className="flex justify-between text-xs text-zinc-500 mb-2">
              <span>Step {step} of 3</span>
              <span>{Math.round((step / 3) * 100)}%</span>
            </div>
          )}
          <div className="h-1 w-full rounded-full bg-zinc-800">
            <div
              className="h-1 rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: isReturning ? `${((step - 1) / 2) * 100}%` : `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1 — Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isReturning ? `Welcome back, ${data.name}!` : "Welcome to Sin City Saviors"}
              </h1>
              <p className="mt-1 text-zinc-400">Let's get you set up before you play.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Your name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="What should Ace call you?"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.ageVerified}
                  onChange={(e) => update("ageVerified", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-indigo-500"
                />
                <span className="text-sm text-zinc-400">
                  I confirm I am 21 years of age or older
                </span>
              </label>
            </div>

            <button
              onClick={() => {
                localStorage.setItem("ace_player_name", data.name);
                setStep(2);
              }}
              disabled={!data.name || !data.ageVerified}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2 — Mental health check-in */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Quick check-in</h2>
              <p className="mt-1 text-zinc-400">
                Ace uses this to personalize your experience. Takes 30 seconds.
              </p>
            </div>

            {/* Session settings — shown for returning users */}
            {isReturning && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-400">Budget ($)</label>
                  <input
                    type="number"
                    value={data.budgetLimit}
                    onChange={(e) => update("budgetLimit", Number(e.target.value))}
                    min={50}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-400">Time limit (min)</label>
                  <input
                    type="number"
                    value={data.timeLimit}
                    onChange={(e) => update("timeLimit", Number(e.target.value))}
                    min={30}
                    max={480}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Mood */}
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-300">How are you feeling today?</p>
              <div className="grid grid-cols-2 gap-2">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("mood", opt.value)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                      data.mood === opt.value
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress */}
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-300">How's your stress level been?</p>
              <div className="space-y-2">
                {STRESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("stress", opt.value)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                      data.stress === opt.value
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs text-zinc-500">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Intent */}
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-300">What brings you in today?</p>
              <div className="grid grid-cols-2 gap-2">
                {INTENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("intent", opt.value)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                      data.intent === opt.value
                        ? "border-indigo-500 bg-indigo-500/20 text-white"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {!isReturning && (
                <button
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-zinc-700 px-5 py-3 text-sm text-zinc-400 hover:bg-zinc-800 transition"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => setStep(3)}
                disabled={!data.mood || !data.stress || !data.intent}
                className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Meet Ace
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Ace introduction */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20 text-4xl">
                ♠
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Meet Ace</h2>
                <p className="mt-1 text-zinc-400">Your casino companion for tonight</p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-5">
              <p className="text-zinc-100 leading-relaxed">
                {getAceIntro(data)}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2 text-sm text-zinc-400">
              <p className="font-medium text-zinc-300">Your session settings</p>
              <div className="flex justify-between">
                <span>Budget</span>
                <span className="text-white">${data.budgetLimit}</span>
              </div>
              <div className="flex justify-between">
                <span>Time limit</span>
                <span className="text-white">{data.timeLimit} min</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm text-zinc-400 hover:bg-zinc-800 transition"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
              >
                {loading ? "Setting up..." : "Let's play"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
