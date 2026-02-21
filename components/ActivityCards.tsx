"use client";

import { useState, useRef } from "react";
import { RiskResult } from "@/lib/riskEngine";

interface Activity {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  tag: string;
  tagColor: string;
}

const ACTIVITIES: Activity[] = [
  {
    id: "steakhouse",
    emoji: "🥩",
    title: "Prime Steakhouse",
    desc: "Award-winning cuts on the 3rd floor. Reservations available right now — Ace can get you a table.",
    tag: "Dining",
    tagColor: "bg-orange-500/20 text-orange-400",
  },
  {
    id: "cirque",
    emoji: "🎭",
    title: "Cirque du Soleil",
    desc: "Tonight's show starts in 45 minutes. Great seats still open — you won't regret it.",
    tag: "Show",
    tagColor: "bg-purple-500/20 text-purple-400",
  },
  {
    id: "spa",
    emoji: "💆",
    title: "Aria Spa & Wellness",
    desc: "Deep tissue or hot stone — walk-ins welcome tonight. Perfect way to reset.",
    tag: "Spa",
    tagColor: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "rooftop",
    emoji: "🍸",
    title: "Rooftop Bar",
    desc: "Best view on the strip. Happy hour ends at midnight — grab a drink and enjoy the skyline.",
    tag: "Bar",
    tagColor: "bg-pink-500/20 text-pink-400",
  },
];

interface ActivityCardsProps {
  risk: RiskResult;
  onAccept: () => void;
}

export default function ActivityCards({ risk, onAccept }: ActivityCardsProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [accepted, setAccepted] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0);

  if (risk.level !== "high") return null;

  const activity = ACTIVITIES[current];

  function handleAccept() {
    setAccepted(activity.id);
    onAccept();
    setTimeout(() => setOpen(false), 1500);
  }

  function next() {
    setCurrent((c) => (c + 1) % ACTIVITIES.length);
    setDragX(0);
  }

  function prev() {
    setCurrent((c) => (c - 1 + ACTIVITIES.length) % ACTIVITIES.length);
    setDragX(0);
  }

  // Drag / swipe handlers
  function onPointerDown(e: React.PointerEvent) {
    dragStart.current = e.clientX;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragX(e.clientX - dragStart.current);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX < -60) next();
    else if (dragX > 60) prev();
    setDragX(0);
  }

  return (
    <>
      {/* Trigger button */}
      {!accepted && (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-xl border border-indigo-500/40 bg-indigo-500/10 py-2.5 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 transition"
        >
          ✨ See Ace's picks for tonight
        </button>
      )}

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-sm">

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-zinc-500 hover:text-white text-sm transition"
            >
              Close ✕
            </button>

            {/* Card stack background layers */}
            <div className="relative h-80 select-none">
              {/* Back cards */}
              {[2, 1].map((offset) => (
                <div
                  key={offset}
                  className="absolute inset-0 rounded-2xl border-2 border-indigo-900/60 bg-indigo-950 overflow-hidden flex items-center justify-center"
                  style={{
                    transform: `translateY(${offset * 8}px) scale(${1 - offset * 0.04}) rotate(${offset % 2 === 0 ? 2 : -2}deg)`,
                    zIndex: 10 - offset,
                  }}
                >
                  {/* Outer frame */}
                  <div className="absolute inset-3 rounded-xl border border-indigo-700/40 flex items-center justify-center">
                    {/* Inner frame */}
                    <div className="absolute inset-2 rounded-lg border border-indigo-600/30 flex items-center justify-center">
                      {/* Corner spades */}
                      <span className="absolute top-2 left-2.5 text-sm font-bold text-indigo-400/60 leading-none">♠</span>
                      <span className="absolute top-2 right-2.5 text-sm font-bold text-indigo-400/60 leading-none">♠</span>
                      <span className="absolute bottom-2 left-2.5 text-sm font-bold text-indigo-400/60 leading-none rotate-180">♠</span>
                      <span className="absolute bottom-2 right-2.5 text-sm font-bold text-indigo-400/60 leading-none rotate-180">♠</span>
                      {/* Center logo */}
                      <span className="text-8xl text-indigo-500/50 select-none">♠</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Front card */}
              <div
                className="absolute inset-0 rounded-2xl border border-zinc-600 bg-zinc-900 cursor-grab active:cursor-grabbing"
                style={{
                  transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                  transition: dragging ? "none" : "transform 0.3s ease",
                  zIndex: 20,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                {accepted === activity.id ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-6">
                    <span className="text-5xl">✅</span>
                    <p className="text-xl font-bold text-white">Enjoy your night!</p>
                    <p className="text-sm text-zinc-400">Hope you have an amazing time at {activity.title}.</p>
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-5xl">{activity.emoji}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activity.tagColor}`}>
                          {activity.tag}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">{activity.title}</h3>
                      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{activity.desc}</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={handleAccept}
                        className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 transition"
                      >
                        Let's go →
                      </button>
                      <p className="text-center text-xs text-zinc-600">
                        Swipe or use arrows to see more options
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={prev}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition"
              >
                ← Prev
              </button>

              {/* Dot indicators */}
              <div className="flex gap-2">
                {ACTIVITIES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrent(i); setDragX(0); }}
                    className={`h-2 rounded-full transition-all ${
                      i === current ? "w-6 bg-indigo-500" : "w-2 bg-zinc-600"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
