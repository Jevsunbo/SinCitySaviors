"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function ScrollPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !dismissed) setVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [dismissed]);

  function dismiss() {
    setVisible(false);
    setDismissed(true);
  }

  return (
    <>
      {/* Sentinel at the very bottom of the page */}
      <div ref={sentinelRef} className="h-1" />

      {/* Popup */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-xl px-4 pb-6">
          <div className="rounded-2xl border border-indigo-500/30 bg-zinc-900/95 backdrop-blur-sm p-6 shadow-2xl shadow-black/60">
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-2 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-lg mx-auto">
                ♠
              </div>
              <h2 className="text-xl font-bold">Ready to play smarter?</h2>
              <p className="text-sm text-zinc-400">
                Sign in to save your session history and let Ace get to know you
                better over time.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/sign-in"
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold hover:bg-indigo-500 transition"
              >
                Sign in
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-center text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                Try without signing in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
