"use client";

import { useRouter } from "next/navigation";

export default function StartSessionButton({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function handleClick() {
    sessionStorage.removeItem("ace_mental_health");
    router.push("/dashboard");
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
