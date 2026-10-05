"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useLocale } from "@/components/LocaleProvider";
import type { BankQuestion } from "@/data/bank";
import { speak } from "@/lib/speech";

type Props = {
  question: BankQuestion;
  selected: string | null;
  onSelect: (option: string) => void;
  // true: lock the options and mark right / wrong (practice). false: selection only (test).
  reveal: boolean;
};

// One bank question: the skill-specific stimulus, then the options.
export function BankQuestionView({ question, selected, onSelect, reveal }: Props) {
  const { t } = useLocale();
  const [noAudio, setNoAudio] = useState(false);

  function play(rate: number) {
    if (!speak(question.text ?? "", rate)) setNoAudio(true);
  }

  return (
    <>
      <p className="mt-4 flex items-center gap-2 text-sm font-bold text-primary-deep">
        <span className="rounded-full bg-muted px-3 py-1">{t.skills[question.skill]}</span>
        {t.bank.instruction[question.skill]}
      </p>

      <div dir="ltr" lang="en" className="mt-4 text-start">
        {question.skill === "reading" && (
          <>
            <p className="rounded-2xl bg-muted p-4 text-lg leading-relaxed">{question.text}</p>
            <p className="mt-4 font-display text-xl font-bold">{question.prompt}</p>
          </>
        )}

        {question.skill === "listening" && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary" onClick={() => play(1)}>
                <Icon name="speaker" size={22} />
                {t.bank.play}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => play(0.7)}>
                {t.bank.playSlow}
              </button>
            </div>
            {noAudio && (
              <p dir="auto" className="mt-3 text-sm font-bold text-destructive">
                {t.bank.noAudio}
              </p>
            )}
            {(noAudio || reveal) && (
              <p className="anim-rise mt-3 rounded-2xl bg-muted p-4 text-lg">{question.text}</p>
            )}
            <p className="mt-4 font-display text-xl font-bold">{question.prompt}</p>
          </>
        )}

        {question.skill === "writing" && <Blank sentence={question.prompt} fill={selected} />}

        {question.skill === "speaking" && (
          <p className="rounded-2xl bg-muted p-4 font-display text-xl font-bold">{question.prompt}</p>
        )}

        <ul className={`mt-6 grid gap-3 ${question.skill === "speaking" ? "" : "sm:grid-cols-2"}`}>
          {question.options.map((option) => {
            const isAnswer = option === question.answer;
            const isSelected = option === selected;
            let state = "border-border bg-card hover:bg-muted";
            if (reveal && isAnswer) state = "anim-pop border-accent bg-success-soft text-accent-deep";
            else if (reveal && isSelected) state = "anim-shake border-destructive bg-destructive-soft text-destructive";
            else if (reveal) state = "border-border bg-card opacity-60";
            else if (isSelected) state = "border-primary bg-primary text-on-primary";

            return (
              <li key={option}>
                <button
                  type="button"
                  disabled={reveal}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(option)}
                  className={`flex min-h-14 w-full items-center justify-between gap-2 rounded-2xl border-2 px-4 py-2 text-start text-lg font-bold transition-colors duration-200 ${state} ${
                    reveal ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  {option}
                  {reveal && isAnswer && <Icon name="check" size={22} className="shrink-0" />}
                  {reveal && isSelected && !isAnswer && <Icon name="x" size={22} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function Blank({ sentence, fill }: { sentence: string; fill: string | null }) {
  const [before, after] = sentence.split("___");
  return (
    <p className="text-center font-display text-2xl font-bold sm:text-3xl">
      {before}
      <span className="mx-1 inline-block min-w-16 border-b-4 border-primary text-primary">{fill ?? " "}</span>
      {after}
    </p>
  );
}
