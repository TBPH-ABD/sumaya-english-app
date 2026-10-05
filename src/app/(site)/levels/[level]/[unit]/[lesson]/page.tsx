import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { LessonView } from "@/components/LessonView";
import { getLevel, lessonId, levelStyles } from "@/data/curriculum";
import { getDictionary } from "@/lib/locale";

type Props = { params: Promise<{ level: string; unit: string; lesson: string }> };

async function findLesson(params: Props["params"]) {
  const { level: levelParam, unit: unitParam, lesson: lessonParam } = await params;
  const level = getLevel(levelParam);
  const unitNumber = Number(unitParam);
  const lessonNumber = Number(lessonParam);
  const unit = level?.units[unitNumber - 1];
  const lesson = unit?.lessons[lessonNumber - 1];
  if (!level || !unit || !lesson || lesson.words.length === 0) return null;
  return { level, unit, lesson, unitNumber, lessonNumber };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getDictionary();
  const found = await findLesson(params);
  return { title: found ? `${found.lesson.title} · ${found.level.code}` : t.common.notFound };
}

export default async function LessonPage({ params }: Props) {
  const { t } = await getDictionary();
  const found = await findLesson(params);
  if (!found) notFound();
  const { level, unit, lesson, unitNumber, lessonNumber } = found;
  const styles = levelStyles[level.id];

  return (
    <>
      <Link
        href="{`/levels/${level.id}`}"
        className="inline-flex min-h-11 items-center gap-1 rounded-xl font-bold text-primary-deep hover:underline"
      >
        <Icon name="chevron-right" size={20} />
        {t.levels.unitsOf(level.code)}
      </Link>

      <p className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold">
        <span dir="ltr" className={`rounded-full px-3 py-1 ${styles.soft} ${styles.text}`}>
          {level.code}
        </span>
        <span className="text-muted-foreground">{t.levels.unitLesson(unitNumber, lessonNumber)}</span>
        <span dir="ltr" lang="en" className="text-muted-foreground">
          {unit.title}
        </span>
      </p>
      <h1 dir="ltr" lang="en" className="mt-2 text-start text-3xl font-bold sm:text-4xl">
        {lesson.title}
      </h1>

      <LessonView
        id={lessonId(level.id, unitNumber, lessonNumber)}
        lesson={lesson}
        backHref={`/levels/${level.id}`}
      />
    </>
  );
}
