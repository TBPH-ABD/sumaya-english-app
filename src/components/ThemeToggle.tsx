"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useLocale } from "@/components/LocaleProvider";
import { THEME_COOKIE, type Theme } from "@/lib/i18n";

const ONE_YEAR = 60 * 60 * 24 * 365;

// Switches between light and dark mode. The icon shows the mode it switches to.
// `glass` is the variant used on the welcome screen.
export function ThemeToggle({ theme, glass = false }: { theme: Theme; glass?: boolean }) {
  const router = useRouter();
  const { t } = useLocale();
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    // Server components re-render with the new cookie; <html data-theme> follows.
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === "dark" ? t.common.darkMode : t.common.lightMode}
      title={next === "dark" ? t.common.darkMode : t.common.lightMode}
      className={
        glass
          ? "glass flex h-11 w-11 cursor-pointer items-center justify-center text-white transition-colors duration-200 hover:bg-white/20"
          : "flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl transition-colors duration-200 hover:bg-muted"
      }
    >
      {/* key redraws the icon when the mode changes */}
      <Icon key={next} name={next === "dark" ? "moon" : "sun"} size={22} />
    </button>
  );
}
