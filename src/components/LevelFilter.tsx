"use client";

import { useLocale } from "@/components/LocaleProvider";
import { levelOrder } from "@/data/bank";
import type { LevelId } from "@/data/curriculum";

export type LevelChoice = LevelId | "all";

// Level picker shown before a practice round.
export function LevelFilter({ value, onChange }: { value: LevelChoice; onChange: (value: LevelChoice) => void }) {
  const { t } = useLocale();
  const choices: LevelChoice[] = ["all", ...levelOrder];

  return (
    <fieldset>
      <legend className="font-bold">{t.practice.chooseLevel}</legend>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            aria-pressed={choice === value}
            onClick={() => onChange(choice)}
            className={`min-h-11 min-w-14 cursor-pointer rounded-2xl border-2 px-4 font-display font-bold transition-colors duration-200 ${
              choice === value ? "border-primary bg-primary text-on-primary" : "border-border bg-card hover:bg-muted"
            }`}
          >
            {choice === "all" ? t.levels.allLevels : choice.toUpperCase()}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
