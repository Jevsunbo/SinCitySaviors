"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function UserAvatar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") return null;
  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold hover:bg-indigo-500 transition"
      >
        Sign in
      </Link>
    );
  }

  const user = session.user;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-500/50 hover:border-indigo-400 transition focus:outline-none"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("ace_player_name");
                signOut({ callbackUrl: "/" });
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
