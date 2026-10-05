import type { Metadata } from "next";
import { Baloo_Bhaijaan_2, IBM_Plex_Sans_Arabic } from "next/font/google";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDictionary, getTheme } from "@/lib/locale";
import "./globals.css";

const baloo = Baloo_Bhaijaan_2({
  variable: "--font-baloo",
  subsets: ["arabic", "latin"],
});

// One body font for both scripts: its Latin glyphs are IBM Plex Sans.
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: { default: t.siteTitle, template: "%s — Salma" },
    description: t.siteDescription,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getDictionary();
  const theme = await getTheme();

  return (
    // Browser extensions add their own attributes to <html>; that is not a hydration bug.
    <html
      suppressHydrationWarning
      lang={locale}
      dir={t.dir}
      data-theme={theme}
      className={`${baloo.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
