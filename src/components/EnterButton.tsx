import Link from "next/link";
import { Icon } from "@/components/Icon";

// The welcome screen waits for a tap on this button; nothing else sends the visitor onward.
export function EnterButton() {
  return (
    <Link href="/home" className="btn btn-enter" dir="ltr" lang="en">
      Enter
      <Icon name="chevron-right" size={24} className="no-flip" />
    </Link>
  );
}
