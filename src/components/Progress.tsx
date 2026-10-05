"use client";

import { Icon } from "@/components/Icon";
import { useLocale } from "@/components/LocaleProvider";
import { useCompletedLessons } from "@/lib/progress";

export function ProgressBar({ lessonIds, barClass }: { lessonIds: string[]; barClass: string }) {
  const { t } = useLocale();
  const completed = useCompletedLessons();
  const done = lessonIds.filter((id) => completed.includes(id)).length;
  const percent = lessonIds.length ? Math.round((done / lessonIds.length) * 100) : 0;

  return (
    <div>
      <div
        role="progressbar"
        aria-label={t.progress.label}
        aria-valuemin={0}
        aria-valuemax={lessonIds.length}
        aria-valuenow={done}
        className="h-3 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={`h-full rounded-full ${barClass} transition-[width] duration-300 ease-out motion-reduce:transition-none`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.progress.done(done, lessonIds.length)}
      </p>
    </div>
  );
}

export function LessonDoneBadge({ id }: { id: string }) {
  const { t } = useLocale();
  const completed = useCompletedLessons();
  if (!completed.includes(id)) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-accent-deep">
      <Icon name="check" size={16} />
      {t.progress.completed}
    </span>
  );
}
