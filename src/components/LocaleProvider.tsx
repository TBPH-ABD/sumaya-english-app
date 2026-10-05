"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, dictionaries, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

// Client components read the display language here; server components use getDictionary().
export function useLocale() {
  const locale = useContext(LocaleContext);
  return { locale, t: dictionaries[locale] };
}
