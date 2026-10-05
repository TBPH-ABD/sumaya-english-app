"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/components/Icon";

const TARGET = "/home";

// The Enter key works from anywhere on the welcome screen, not only when the button is focused.
export function EnterButton() {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // A focused link or button already handles Enter itself.
      if (event.key !== "Enter" || event.target instanceof HTMLAnchorElement) return;
      router.push(TARGET);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <Link href={TARGET} className="btn btn-enter" dir="ltr" lang="en">
      Enter
      <Icon name="chevron-right" size={24} className="no-flip" />
    </Link>
  );
}
