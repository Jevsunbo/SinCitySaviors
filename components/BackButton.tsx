"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-zinc-500 hover:text-white transition text-sm"
    >
      ←
    </button>
  );
}
