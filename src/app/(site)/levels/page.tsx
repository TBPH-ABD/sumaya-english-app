import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ProgressBar, UnlockGate } from "@/components/Progress";
import { levelLessonIds, lessonId, levels, levelStyles, levelText } from "@/data/curriculum";
import { getDictionary } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.levels.metaTitle };
}

export default async function LevelsPage() {
  const { locale, t } = await getDictionary();

  return (
    <>
      <Link
        href="/home"
        className="inline-flex min-h-11 items-center gap-1 rounded-xl font-bold text-primary-deep hover:underline"
      >
        <Icon name="chevron-right" size={20} />
        {t.common.home}
      </Link>
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t.levels.title}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{t.levels.subtitle}</p>

      <ul className="stagger mt-8 grid gap-4">
        {levels.map((level) => {
          const styles = levelStyles[level.id];
          const lessonIds = levelLessonIds(level);
          const hasContent = level.units.length > 0;
          const text = levelText(level, locale);

          const body = (
            <>
              <div className="flex items-center justify-between gap-3">
                <span
                  dir="ltr"
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl font-display text-2xl font-bold ${styles.soft} ${styles.text}`}
                >
                  {level.code}
                </span>
                {hasContent ? (
                  <UnlockGate
                    id={lessonId(level.id, 1, 1)}
                    locked={<Icon name="lock" className="text-muted-foreground" aria-label={t.levels.locked} />}
                  >
                    <Icon name="chevron-left" className="text-muted-foreground" />
                  </UnlockGate>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
                    <Icon name="lock" size={16} />
                    {t.common.soon}
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold">{text.name}</h2>
              <p className="mt-1 text-muted-foreground">{text.description}</p>
              {hasContent && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-bold">{t.levels.counts(level.units.length, lessonIds.length)}</p>
                  <ProgressBar lessonIds={lessonIds} barClass={styles.bar} />
                </div>
              )}
            </>
          );

          return (
            <li key={level.id}>
              {hasContent ? (
                <UnlockGate
                  id={lessonId(level.id, 1, 1)}
                  locked={<div className="card h-full p-5 opacity-80">{body}</div>}
                >
                  <Link href={`/levels/${level.id}`} className="card card-interactive block h-full p-5">
                    {body}
                  </Link>
                </UnlockGate>
              ) : (
                <div className="card h-full p-5 opacity-80">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
