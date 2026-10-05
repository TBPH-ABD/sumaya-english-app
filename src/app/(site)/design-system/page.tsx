import type { Metadata } from "next";
import { Icon, iconNames } from "@/components/Icon";
import { Logo, LogoMark } from "@/components/Logo";
import { levels, levelStyles } from "@/data/curriculum";

export const metadata: Metadata = { title: "نظام التصميم" };

// Mirrors the tokens in globals.css; swatches use the Tailwind classes built from them.
const colors = [
  { name: "primary", hex: "#805AD5", swatch: "bg-primary" },
  { name: "primary-deep", hex: "#553C9A", swatch: "bg-primary-deep" },
  { name: "secondary", hex: "#B794F4", swatch: "bg-secondary" },
  { name: "accent", hex: "#16A34A", swatch: "bg-accent" },
  { name: "accent-deep", hex: "#166534", swatch: "bg-accent-deep" },
  { name: "destructive", hex: "#DC2626", swatch: "bg-destructive" },
  { name: "background", hex: "#FAF5FF", swatch: "bg-background" },
  { name: "card", hex: "#FFFFFF", swatch: "bg-card" },
  { name: "muted", hex: "#F1E8FD", swatch: "bg-muted" },
  { name: "border", hex: "#D6BCFA", swatch: "bg-border" },
  { name: "foreground", hex: "#322659", swatch: "bg-foreground" },
  { name: "muted-foreground", hex: "#5B4B8A", swatch: "bg-muted-foreground" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card mt-6 p-5">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <>
      <h1 className="text-3xl font-bold sm:text-4xl">نظام التصميم</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        أسلوب Claymorphism خفيف: حواف مستديرة، حد 2px، ظل سفلي صلب. المصدر: globals.css.
      </p>

      <Section title="الشعار">
        <div className="flex flex-wrap items-center gap-8">
          <Logo size={56} />
          <LogoMark size={72} loop />
          <LogoMark size={40} />
          <LogoMark size={24} />
        </div>
      </Section>

      <Section title="الألوان">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" dir="ltr">
          {colors.map((color) => (
            <li key={color.name} className="rounded-2xl border-2 border-border p-2">
              <div className={`h-14 rounded-xl border border-border ${color.swatch}`} />
              <p className="mt-2 text-sm font-bold">{color.name}</p>
              <p className="text-sm text-muted-foreground">{color.hex}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="ألوان المستويات">
        <ul className="flex flex-wrap gap-3" dir="ltr">
          {levels.map((level) => (
            <li
              key={level.id}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl font-display text-2xl font-bold ${levelStyles[level.id].soft} ${levelStyles[level.id].text}`}
            >
              {level.code}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="الخطوط">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground" dir="ltr">
              Display — Baloo Bhaijaan 2
            </p>
            <p className="font-display text-3xl font-bold">تعلّم كلمة جديدة كل يوم · Learn a new word</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground" dir="ltr">
              Body — IBM Plex Sans Arabic (Arabic + Latin)
            </p>
            <p className="text-lg">كل درس فيه 15 كلمة مع مثال. Each lesson has 15 words with an example.</p>
          </div>
        </div>
      </Section>

      <Section title="الأزرار">
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary">
            ابدأ الدرس
          </button>
          <button type="button" className="btn btn-accent">
            التالي
            <Icon name="chevron-left" size={20} />
          </button>
          <button type="button" className="btn btn-ghost">
            <Icon name="refresh" size={20} />
            أعد التمرين
          </button>
          <button type="button" className="btn btn-primary" disabled>
            معطّل
          </button>
        </div>
      </Section>

      <Section title="الأيقونات">
        <ul className="stagger grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6" dir="ltr">
          {iconNames.map((name) => (
            <li key={name} className="flex flex-col items-center gap-2 rounded-2xl bg-muted p-3">
              <Icon name={name} size={28} />
              <span className="text-sm">{name}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
