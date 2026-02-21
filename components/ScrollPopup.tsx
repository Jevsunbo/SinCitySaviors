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

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={dismiss}
      />

      {/* Popup */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="relative w-full max-w-2xl rounded-3xl border border-indigo-500/30 bg-zinc-900 p-12 shadow-2xl shadow-black/60">
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-5 right-5 text-zinc-500 hover:text-white transition text-sm"
          >
            ✕
          </button>

          <div className="text-center space-y-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/20 text-2xl mx-auto">
              ♠
            </div>
            <h2 className="text-3xl font-bold">Ready to play smarter?</h2>
            <p className="text-base text-zinc-400 max-w-sm mx-auto">
              Sign in to save your session history and let Ace get to know you
              better over time.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-in"
              className="rounded-xl bg-indigo-600 px-10 py-3.5 text-center font-semibold hover:bg-indigo-500 transition"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-zinc-700 px-10 py-3.5 text-center font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              Try without signing in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
