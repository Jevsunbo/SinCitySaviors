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
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center h-9 w-9 rounded-full overflow-hidden border-2 border-indigo-500/50 hover:border-indigo-400 transition focus:outline-none"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name ?? "avatar"} className="h-full w-full object-cover" />
        ) : (
          <span className="bg-indigo-600 text-white text-xs font-bold h-full w-full flex items-center justify-center">
            {initials}
          </span>
        )}
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
              onClick={() => signOut({ callbackUrl: "/" })}
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
