import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { LessonDoneBadge, ProgressBar, UnlockGate } from "@/components/Progress";
import { getLevel, lessonId, levelLessonIds, levelStyles, levelText } from "@/data/curriculum";
import { getDictionary } from "@/lib/locale";

type Props = { params: Promise<{ level: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  const level = getLevel((await params).level);
  return { title: level ? `${level.code} ${levelText(level, locale).name}` : t.common.notFound };
}

export default async function LevelPage({ params }: Props) {
  const { locale, t } = await getDictionary();
  const level = getLevel((await params).level);
  if (!level) notFound();
  const styles = levelStyles[level.id];
  const text = levelText(level, locale);

  return (
    <>
      <Link
        href="/levels"
        className="inline-flex min-h-11 items-center gap-1 rounded-xl font-bold text-primary-deep hover:underline"
      >
        <Icon name="chevron-right" size={20} />
        {t.levels.allLevels}
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span
          dir="ltr"
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-3xl font-bold ${styles.soft} ${styles.text}`}
        >
          {level.code}
        </span>
        <div>
          <h1 className="text-3xl font-bold">{text.name}</h1>
          <p className="text-muted-foreground">{text.description}</p>
        </div>
      </div>

      {level.units.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <Icon name="lock" size={32} className="mx-auto text-muted-foreground" />
          <h2 className="mt-3 text-xl font-bold">{t.levels.contentSoon}</h2>
          <p className="mt-1 text-muted-foreground">{t.levels.noUnits}</p>
        </div>
      ) : (
        <>
          <div className="mt-6 max-w-md">
            <ProgressBar lessonIds={levelLessonIds(level)} barClass={styles.bar} />
          </div>

          <div className="stagger mt-8 space-y-6">
            {level.units.map((unit, u) => (
              <section key={unit.title} className="card p-5" aria-labelledby={`unit-${u + 1}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.soft} ${styles.text}`}>
                    <Icon name="book" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">{t.levels.unit(u + 1)}</p>
                    <h2 id={`unit-${u + 1}`} dir="ltr" lang="en" className="text-xl font-bold">
                      {unit.title}
                    </h2>
                  </div>
                </div>

                <ol className="mt-4 space-y-3">
                  {unit.lessons.map((lesson, l) => {
                    const id = lessonId(level.id, u + 1, l + 1);
                    const ready = lesson.words.length > 0;
                    const row = (
                      <>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-display font-bold">
                          {l + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span dir="ltr" lang="en" className="block truncate text-start font-bold">
                            {lesson.title}
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            {ready ? t.levels.words(lesson.words.length) : t.levels.contentSoon}
                          </span>
                        </span>
                        {ready ? (
                          <>
                            <LessonDoneBadge id={id} />
                            <UnlockGate
                              id={id}
                              locked={<Icon name="lock" className="shrink-0 text-muted-foreground" aria-label={t.levels.locked} />}
                            >
                              <Icon name="chevron-left" className="shrink-0 text-muted-foreground" />
                            </UnlockGate>
                          </>
                        ) : (
                          <Icon name="lock" className="shrink-0 text-muted-foreground" aria-label={t.levels.unavailable} />
                        )}
                      </>
                    );

                    return (
                      <li key={id}>
                        {ready ? (
                          <UnlockGate
                            id={id}
                            locked={
                              <div className="flex min-h-16 items-center gap-3 rounded-2xl border-2 border-dashed border-border p-3 opacity-70">
                                {row}
                              </div>
                            }
                          >
                            <Link
                              href={`/levels/${id}`}
                              className="flex min-h-16 items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 transition-colors duration-200 hover:bg-muted"
                            >
                              {row}
                            </Link>
                          </UnlockGate>
                        ) : (
                          <div className="flex min-h-16 items-center gap-3 rounded-2xl border-2 border-dashed border-border p-3 opacity-70">
                            {row}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
