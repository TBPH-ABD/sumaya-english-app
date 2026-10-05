"use client";

import Link from "next/link";
import { useState } from "react";
import { BankQuestionView } from "@/components/BankQuestionView";
import { Icon, type IconName } from "@/components/Icon";
import { LevelFilter, type LevelChoice } from "@/components/LevelFilter";
import { useLocale } from "@/components/LocaleProvider";
import { drawPractice, type BankQuestion } from "@/data/bank";

const ROUND_SIZE = 8;

// Reading and listening practice: a round of bank questions with instant feedback.
export function SkillPractice({ skill, icon }: { skill: "reading" | "listening"; icon: IconName }) {
  const { t } = useLocale();
  const [level, setLevel] = useState<LevelChoice>("all");
  // Empty until a round starts: questions are drawn at random, which must not happen during render.
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  function start() {
    setQuestions(drawPractice(skill, level, ROUND_SIZE));
    setIndex(0);
    setSelected(null);
    setScore(0);
  }

  if (questions.length === 0 || index >= questions.length) {
    const finished = questions.length > 0;
    return (
      <section className="card mx-auto max-w-2xl p-8 text-center" aria-live="polite">
        <span className="anim-float mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted text-primary-deep">
          <Icon name={finished ? "star" : icon} size={48} />
        </span>
        {finished && (
          <>
            <h2 className="mt-6 text-2xl font-bold">{t.practice.roundDone}</h2>
            <p className="mt-1 text-lg">{t.lesson.score(score, questions.length)}</p>
          </>
        )}
        <div className="mt-6">
          <LevelFilter value={level} onChange={setLevel} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {finished && (
            <Link href="/practice" className="btn btn-ghost">
              {t.practice.backToSkills}
            </Link>
          )}
          <button type="button" className="btn btn-primary" onClick={start}>
            {finished ? t.practice.newRound : t.practice.start}
            <Icon name="chevron-left" size={20} />
          </button>
        </div>
      </section>
    );
  }

  const question = questions[index];
  const answered = selected !== null;
  const correct = selected === question.answer;

  function choose(option: string) {
    setSelected(option);
    if (option === question.answer) setScore(score + 1);
  }

  function next() {
    setIndex(index + 1);
    setSelected(null);
  }

  return (
    <section className="card mx-auto max-w-2xl p-5">
      <p className="text-sm font-bold text-muted-foreground">{t.lesson.question(index + 1, questions.length)}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* key replays the entrance and resets audio state for each new question */}
      <div key={question.id} className="anim-rise">
        <BankQuestionView question={question} selected={selected} onSelect={choose} reveal={answered} />
      </div>

      <div className="mt-6 flex min-h-12 flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className={`font-bold ${correct ? "text-accent-deep" : "text-destructive"}`}>
          {answered && (correct ? t.lesson.correct : t.lesson.wrong(question.answer))}
        </p>
        <button type="button" className="btn btn-accent" disabled={!answered} onClick={next}>
          {index + 1 >= questions.length ? t.lesson.finish : t.lesson.next}
          <Icon name="chevron-left" size={20} />
        </button>
      </div>
    </section>
  );
}
