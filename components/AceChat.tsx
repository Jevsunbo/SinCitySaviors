"use client";

import { useEffect, useRef, useState } from "react";
import { RiskResult } from "@/lib/riskEngine";

interface AceChatProps {
  risk: RiskResult;
}

const LEVEL_STYLES = {
  safe: {
    border: "border-zinc-700",
    badge: "bg-zinc-800 text-zinc-400",
    button: "bg-zinc-700 hover:bg-zinc-600",
    glow: "",
  },
  moderate: {
    border: "border-yellow-500/50",
    badge: "bg-yellow-500/20 text-yellow-300",
    button: "bg-yellow-500 hover:bg-yellow-400 text-black",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.15)]",
  },
  high: {
    border: "border-red-500/50",
    badge: "bg-red-500/20 text-red-300",
    button: "bg-red-500 hover:bg-red-400 text-white",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]",
  },
};

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 pl-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export default function AceChat({ risk }: AceChatProps) {
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const prevLevelRef = useRef<RiskResult["level"]>("safe");
  const abortRef = useRef<AbortController | null>(null);

  const styles = LEVEL_STYLES[risk.level];

  // Auto-trigger Ace when risk level escalates
  useEffect(() => {
    const prev = prevLevelRef.current;
    const curr = risk.level;

    const escalated =
      (prev === "safe" && (curr === "moderate" || curr === "high")) ||
      (prev === "moderate" && curr === "high");

    if (escalated) {
      setAccepted(false);
      callAce();
    }

    prevLevelRef.current = curr;
  }, [risk.level]);

  async function callAce() {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setMessage("");
    setIsStreaming(true);
    setTriggered(true);

    try {
      const res = await fetch("/api/ace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ risk }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setMessage(accumulated);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessage(
          "Hey, you've been at it for a while — want to take a quick break? I can help you find something fun nearby."
        );
      }
    } finally {
      setIsStreaming(false);
    }
  }

  if (!triggered) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3 text-zinc-500">
          <AceAvatar level="safe" />
          <p className="text-sm">
            Ace is watching your session. He'll check in if he notices anything.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border bg-zinc-900 p-6 transition-all duration-500 ${styles.border} ${styles.glow}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AceAvatar level={risk.level} />
          <div>
            <p className="font-semibold text-white">Ace</p>
            <p className="text-xs text-zinc-500">Your casino companion</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}>
          {risk.level === "high"
            ? "Checking in"
            : risk.level === "moderate"
            ? "Heads up"
            : "All good"}
        </span>
      </div>

      {/* Message bubble */}
      <div className="h-[80px] overflow-y-auto rounded-xl bg-zinc-800 px-4 py-3 text-sm leading-relaxed text-zinc-100">
        {message || (isStreaming ? <TypingDots /> : null)}
        {isStreaming && message && <TypingDots />}
      </div>

      {/* Action buttons */}
      {!isStreaming && message && (
        <div className="mt-4 flex gap-2">
          {!accepted ? (
            <>
              <button
                onClick={() => setAccepted(true)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${styles.button}`}
              >
                Sounds good, let's do it
              </button>
              <button
                onClick={() => setTriggered(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 transition"
              >
                Maybe later
              </button>
            </>
          ) : (
            <div className="flex-1 rounded-lg bg-green-600/20 py-2 text-center text-sm font-semibold text-green-400">
              Great choice! Enjoy your break.
            </div>
          )}
        </div>
      )}

      {/* Manual re-trigger */}
      {!isStreaming && (
        <button
          onClick={() => { setAccepted(false); callAce(); }}
          className="mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition"
        >
          Ask Ace again
        </button>
      )}
    </div>
  );
}

function AceAvatar({ level }: { level: RiskResult["level"] }) {
  const bg =
    level === "high"
      ? "bg-red-500/20 text-red-400"
      : level === "moderate"
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-indigo-500/20 text-indigo-400";

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${bg}`}
    >
      ♠
    </div>
  );
}
