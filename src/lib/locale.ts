import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  dictionaries,
  isLocale,
  isTheme,
  LOCALE_COOKIE,
  THEME_COOKIE,
  type Locale,
  type Theme,
} from "@/lib/i18n";

// Server side only: the display language comes from a cookie set by LanguageToggle.
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

// Colour theme, from a cookie set by ThemeToggle.
export async function getTheme(): Promise<Theme> {
  const value = (await cookies()).get(THEME_COOKIE)?.value;
  return isTheme(value) ? value : DEFAULT_THEME;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
