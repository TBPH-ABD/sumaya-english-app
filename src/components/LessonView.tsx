"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { useLocale } from "@/components/LocaleProvider";
import { buildQuiz, PART_SIZE, partCount, partWords, posLabel, type Lesson, type Word } from "@/data/curriculum";
import { markPartDone, partId, useCompletedLessons } from "@/lib/progress";
import { speak } from "@/lib/speech";

const PASS_RATIO = 0.8;

type TabId = "vocabulary" | "grammar" | "practice";

const tabs: { id: TabId; icon: IconName }[] = [
  { id: "vocabulary", icon: "cards" },
  { id: "grammar", icon: "grammar" },
  { id: "practice", icon: "target" },
];

type TranslationProps = { showTranslation: boolean; onToggleTranslation: () => void };

function TranslationToggle({ showTranslation, onToggleTranslation }: TranslationProps) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      className={`btn ${showTranslation ? "btn-primary" : "btn-ghost"}`}
      aria-pressed={showTranslation}
      onClick={onToggleTranslation}
    >
      <Icon name="languages" size={20} />
      {showTranslation ? t.lesson.hideTranslation : t.lesson.showTranslation}
    </button>
  );
}

export function LessonView({ id, lesson, backHref }: { id: string; lesson: Lesson; backHref: string }) {
  const { t } = useLocale();
  const completed = useCompletedLessons();
  const [tab, setTab] = useState<TabId>("vocabulary");
  // The lesson's words are studied and quizzed one part at a time.
  const [part, setPart] = useState(0);
  const parts = partCount(lesson.words);
  const words = partWords(lesson.words, part);
  // Shared by the vocabulary and grammar tabs.
  const [showTranslation, setShowTranslation] = useState(false);
  const translation = {
    showTranslation,
    onToggleTranslation: () => setShowTranslation(!showTranslation),
  };

  return (
    <div className="mt-6">
      <div role="tablist" aria-label={t.lesson.sections} className="card flex gap-1 p-1.5">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`flex min-h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl px-1 font-display text-sm font-bold transition-colors duration-200 sm:text-base ${
              tab === item.id ? "bg-primary text-on-primary" : "hover:bg-muted"
            }`}
          >
            {/* No room for icons beside the English labels on narrow phones. */}
            <Icon name={item.icon} size={20} className="max-sm:hidden" />
            {t.lesson[item.id]}
          </button>
        ))}
      </div>

      {tab !== "grammar" && (
        <div role="group" aria-label={t.lesson.parts} className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: parts }, (_, i) => {
            const from = i * PART_SIZE + 1;
            const to = Math.min((i + 1) * PART_SIZE, lesson.words.length);
            return (
              <button
                key={i}
                type="button"
                aria-pressed={i === part}
                onClick={() => setPart(i)}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border-2 px-4 font-display font-bold transition-colors duration-200 ${
                  i === part ? "border-primary bg-primary text-on-primary" : "border-border bg-card hover:bg-muted"
                }`}
              >
                <span dir="ltr">
                  {from}–{to}
                </span>
                {completed.includes(partId(id, i)) && <Icon name="check" size={18} aria-label={t.progress.completed} />}
              </button>
            );
          })}
        </div>
      )}

      {/* key replays the entrance (and restarts the quiz) when the tab or part changes */}
      <div
        key={`${tab}-${part}`}
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="anim-rise mt-6"
      >
        {tab === "vocabulary" && <Vocabulary words={words} offset={part * PART_SIZE} {...translation} />}
        {tab === "grammar" && <GrammarPanel lesson={lesson} {...translation} />}
        {tab === "practice" && <Practice id={id} words={words} part={part} parts={parts} backHref={backHref} />}
      </div>
    </div>
  );
}

function Vocabulary({ words, offset, ...translation }: { words: Word[]; offset: number } & TranslationProps) {
  const { t } = useLocale();
  const [hideMeanings, setHideMeanings] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold">{t.levels.words(words.length)}</p>
        <div className="flex flex-wrap gap-3">
          <TranslationToggle {...translation} />
          <button
            type="button"
            className="btn btn-ghost"
            aria-pressed={hideMeanings}
            onClick={() => setHideMeanings(!hideMeanings)}
          >
            <Icon name={hideMeanings ? "eye" : "eye-off"} size={20} />
            {hideMeanings ? t.lesson.showMeanings : t.lesson.hideMeanings}
          </button>
        </div>
      </div>

      <ol className="stagger mt-4 grid gap-4">
        {words.map((word, i) => (
          <li key={word.en} className="card flex flex-col p-4">
            <div className="flex items-start justify-between gap-2" dir="ltr">
              <div>
                <p lang="en" className="font-display text-2xl font-bold">
                  {word.en}
                </p>
                <p lang="en" className="text-sm text-muted-foreground">
                  {offset + i + 1} · {posLabel[word.pos]}
                </p>
              </div>
              <button
                type="button"
                aria-label={t.lesson.listen(word.en)}
                onClick={() => speak(word.en)}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-muted text-primary-deep transition-colors duration-200 hover:bg-border"
              >
                <Icon name="speaker" size={22} />
              </button>
            </div>
            <p dir="rtl" lang="ar" className="mt-3 min-h-7 text-start text-lg font-bold text-primary">
              {hideMeanings ? <span className="text-muted-foreground">••••</span> : word.ar}
            </p>
            {word.example && (
              <p dir="ltr" lang="en" className="mt-2 text-start text-muted-foreground">
                {word.example}
              </p>
            )}
            {translation.showTranslation && word.exampleAr && (
              <p dir="rtl" lang="ar" className="anim-rise mt-2 rounded-xl bg-muted px-3 py-2 text-sm">
                {word.exampleAr}
              </p>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

function GrammarPanel({ lesson, ...translation }: { lesson: Lesson } & TranslationProps) {
  const { locale, t } = useLocale();
  const grammar = lesson.grammar;
  if (!grammar) {
    return <p className="card p-6 text-center text-muted-foreground">{t.lesson.noGrammar}</p>;
  }

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 dir="ltr" lang="en" className="text-start text-2xl font-bold">
          {grammar.title}
        </h2>
        <TranslationToggle {...translation} />
      </div>
      <p className="mt-2 text-lg">{locale === "ar" ? grammar.explanationAr : grammar.explanationEn}</p>
      <ul className="stagger mt-4 space-y-3">
        {grammar.points.map((point) => (
          <li key={point.rule} className="rounded-2xl bg-muted p-4">
            <div dir="ltr" lang="en">
              <p className="font-display font-bold text-primary-deep">{point.rule}</p>
              <p className="mt-1">{point.example}</p>
            </div>
            {translation.showTranslation && (
              <p dir="rtl" lang="ar" className="anim-rise mt-2 border-t-2 border-border pt-2 text-sm">
                {point.exampleAr}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

type PracticeProps = { id: string; words: Word[]; part: number; parts: number; backHref: string };

function Practice({ id, words, part, parts, backHref }: PracticeProps) {
  const { t } = useLocale();
  const questions = buildQuiz(words);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const finished = index >= questions.length;
  const passMark = Math.ceil(questions.length * PASS_RATIO);

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
  }

  if (finished) {
    const passed = score >= passMark;
    return (
      <section className="card p-8 text-center" aria-live="polite">
        <span
          className={`anim-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            passed ? "bg-success-soft text-accent-deep" : "bg-destructive-soft text-destructive"
          }`}
        >
          <Icon name={passed ? "star" : "refresh"} size={32} />
        </span>
        <h2 className="mt-4 text-2xl font-bold">{passed ? t.lesson.passed : t.lesson.tryAgain}</h2>
        <p className="mt-1 text-lg">{t.lesson.score(score, questions.length)}</p>
        {!passed && <p className="text-muted-foreground">{t.lesson.need(passMark)}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-ghost" onClick={restart}>
            <Icon name="refresh" size={20} />
            {t.lesson.retry}
          </button>
          <Link href={backHref} className="btn btn-primary">
            {t.lesson.backToUnits}
          </Link>
        </div>
      </section>
    );
  }

  const question = questions[index];
  const answer = question.word.ar;
  const answered = selected !== null;
  const correct = selected === answer;

  function choose(option: string) {
    if (answered) return;
    setSelected(option);
    if (option === answer) setScore(score + 1);
  }

  function next() {
    const isLast = index + 1 >= questions.length;
    if (isLast && score >= passMark) markPartDone(id, part, parts);
    setIndex(index + 1);
    setSelected(null);
  }

  return (
    <section className="card p-5">
      <p className="text-sm font-bold text-muted-foreground">{t.lesson.question(index + 1, questions.length)}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* key replays the entrance for each new question */}
      <div key={index} className="anim-rise">
        <h2 className="mt-4 text-lg font-bold">{t.lesson.whatMeans}</h2>
        <p dir="ltr" lang="en" className="mt-3 text-center font-display text-4xl font-bold">
          {question.word.en}
        </p>

        <ul className="mt-6 grid gap-3" dir="rtl" lang="ar">
          {question.options.map((option) => {
            const isAnswer = option === answer;
            const isSelected = option === selected;
            let state = "border-border bg-card hover:bg-muted";
            if (answered && isAnswer) state = "anim-pop border-accent bg-success-soft text-accent-deep";
            else if (answered && isSelected) state = "anim-shake border-destructive bg-destructive-soft text-destructive";
            else if (answered) state = "border-border bg-card opacity-60";

            return (
              <li key={option}>
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => choose(option)}
                  className={`flex min-h-14 w-full items-center justify-between gap-2 rounded-2xl border-2 px-4 text-lg font-bold transition-colors duration-200 ${state} ${
                    answered ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  {option}
                  {answered && isAnswer && <Icon name="check" size={22} />}
                  {answered && isSelected && !isAnswer && <Icon name="x" size={22} />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex min-h-12 flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className={`font-bold ${correct ? "text-accent-deep" : "text-destructive"}`}>
          {answered && (correct ? t.lesson.correct : t.lesson.wrong(answer))}
        </p>
        <button type="button" className="btn btn-accent" disabled={!answered} onClick={next}>
          {index + 1 >= questions.length ? t.lesson.finish : t.lesson.next}
          <Icon name="chevron-left" size={20} />
        </button>
      </div>
    </section>
  );
}
