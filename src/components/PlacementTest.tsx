"use client";

import Link from "next/link";
import { useState } from "react";
import { BankQuestionView } from "@/components/BankQuestionView";
import { Icon } from "@/components/Icon";
import { useLocale } from "@/components/LocaleProvider";
import { drawTest, placeLevel, skillOrder, TEST_LENGTH, type BankQuestion } from "@/data/bank";
import { getLevel, levelStyles, levelText } from "@/data/curriculum";

// Ids of the previous attempt, so the next one draws different questions.
const LAST_KEY = "slma:test-last";

function readLastIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LAST_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function PlacementTest() {
  const { locale, t } = useLocale();
  // Empty until the learner starts: questions are drawn at random, which must not happen during render.
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  function start() {
    const drawn = drawTest(readLastIds());
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify(drawn.map((question) => question.id)));
    } catch {}
    setQuestions(drawn);
    setAnswers([]);
    setSelected(null);
  }

  if (questions.length === 0) {
    return (
      <section className="card mx-auto max-w-md p-6 text-center">
        <span className="anim-float mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted text-primary-deep">
          <Icon name="clipboard" size={48} />
        </span>
        <h2 className="mt-6 text-2xl font-bold">{t.test.metaTitle}</h2>
        <p className="mt-2 text-lg text-muted-foreground">{t.test.intro(TEST_LENGTH)}</p>
        <p className="mt-1 text-muted-foreground">{t.test.note}</p>
        <button type="button" className="btn btn-primary mt-6" onClick={start}>
          {t.test.start}
          <Icon name="chevron-left" size={20} />
        </button>
      </section>
    );
  }

  const index = answers.length;

  if (index >= questions.length) {
    const isCorrect = (question: BankQuestion, i: number) => answers[i] === question.answer;
    const score = questions.filter(isCorrect).length;
    const level = getLevel(placeLevel(score))!;
    const styles = levelStyles[level.id];

    return (
      <section className="card mx-auto max-w-md p-6 text-center" aria-live="polite">
        <p className="font-bold text-muted-foreground">{t.test.yourLevel}</p>
        <span
          dir="ltr"
          className={`anim-pop mx-auto mt-3 flex h-28 w-28 items-center justify-center rounded-full font-display text-5xl font-bold ${styles.soft} ${styles.text}`}
        >
          {level.code}
        </span>
        <h2 className="mt-4 text-3xl font-bold">{levelText(level, locale).name}</h2>
        <p className="mt-1 text-lg">{t.lesson.score(score, questions.length)}</p>

        <h3 className="mt-8 text-lg font-bold">{t.test.bySkill}</h3>
        <ul className="stagger mt-3 space-y-3 text-start">
          {skillOrder.map((skill) => {
            const total = questions.filter((question) => question.skill === skill).length;
            const correct = questions.filter((question, i) => question.skill === skill && isCorrect(question, i)).length;
            return (
              <li key={skill}>
                <p className="flex justify-between font-bold">
                  <span>{t.skills[skill]}</span>
                  <span dir="ltr">
                    {correct} / {total}
                  </span>
                </p>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(correct / total) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-ghost" onClick={start}>
            <Icon name="refresh" size={20} />
            {t.test.retake}
          </button>
          <Link href={`/levels/${level.id}`} className="btn btn-primary">
            {t.test.goTo(level.code)}
            <Icon name="chevron-left" size={20} />
          </Link>
        </div>
      </section>
    );
  }

  function next() {
    if (selected === null) return;
    setAnswers([...answers, selected]);
    setSelected(null);
  }

  return (
    <section className="card mx-auto max-w-md p-5">
      <p className="text-sm font-bold text-muted-foreground">{t.lesson.question(index + 1, questions.length)}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      {/* key replays the entrance and resets audio state for each new question */}
      <div key={questions[index].id} className="anim-rise">
        <BankQuestionView question={questions[index]} selected={selected} onSelect={setSelected} reveal={false} />
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" className="btn btn-accent" disabled={selected === null} onClick={next}>
          {index + 1 >= questions.length ? t.test.showResult : t.lesson.next}
          <Icon name="chevron-left" size={20} />
        </button>
      </div>
    </section>
  );
}
