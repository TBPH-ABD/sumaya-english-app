"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALE_COOKIE } from "@/lib/i18n";

const ONE_YEAR = 60 * 60 * 24 * 365;

// Switches the display language between Arabic and English.
// `glass` is the variant used on the dark welcome screen; it always shows its label.
export function LanguageToggle({ glass = false }: { glass?: boolean }) {
  const router = useRouter();
  const { locale, t } = useLocale();

  function toggle() {
    const next = locale === "ar" ? "en" : "ar";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    // Server components re-render with the new cookie.
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.common.switchLanguage}
      className={
        glass
          ? "glass flex min-h-11 cursor-pointer items-center gap-2 px-4 font-bold text-white transition-colors duration-200 hover:bg-white/20"
          : "flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 font-bold transition-colors duration-200 hover:bg-muted"
      }
    >
      <Icon name="languages" size={22} />
      <span className={glass ? "" : "hidden sm:inline"}>{t.common.otherLanguage}</span>
    </button>
  );
}
