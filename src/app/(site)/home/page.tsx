import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { getDictionary } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.common.home };
}

// Hub shown right after the welcome screen.
export default async function HomePage() {
  const { t } = await getDictionary();
  const sections: { href: string; icon: IconName; title: string; description: string }[] = [
    { href: "/levels", icon: "school", title: t.home.learn, description: t.home.learnDescription },
    { href: "/test", icon: "clipboard", title: t.home.test, description: t.home.testDescription },
    { href: "/practice", icon: "mic", title: t.home.practice, description: t.home.practiceDescription },
  ];

  return (
    <>
      <h1 className="text-center text-3xl font-bold">{t.home.title}</h1>
      <p className="mt-2 text-center text-lg text-muted-foreground">{t.home.subtitle}</p>

      <ul className="stagger mt-8 grid gap-4">
        {sections.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="card card-interactive flex h-full items-center gap-4 p-4 text-start"
            >
              <span className="anim-float flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-primary-deep">
                <Icon name={section.icon} size={32} />
              </span>
              <span className="min-w-0 flex-1">
                <h2 className="text-xl font-bold">{section.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                <Icon name="chevron-left" size={22} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
