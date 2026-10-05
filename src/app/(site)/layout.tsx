import Link from "next/link";
import { Icon } from "@/components/Icon";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDictionary, getTheme } from "@/lib/locale";

// Shell for every page after the welcome screen: drifting background, header, content column.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getDictionary();
  const theme = await getTheme();

  return (
    <>
      <div className="bg-blobs" aria-hidden="true">
        <span />
        <span />
      </div>
      <header className="border-b-2 border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/home" aria-label={t.common.brandHome} className="rounded-xl">
            <Logo />
          </Link>
          <nav aria-label={t.common.mainNav} className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/home"
              className="hidden min-h-11 items-center gap-2 rounded-xl px-3 font-bold transition-colors duration-200 hover:bg-muted sm:flex"
            >
              <Icon name="home" size={20} />
              {t.common.home}
            </Link>
            <ThemeToggle theme={theme} />
            <LanguageToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
