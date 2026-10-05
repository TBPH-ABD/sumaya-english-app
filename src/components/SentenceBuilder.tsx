"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { LevelFilter, type LevelChoice } from "@/components/LevelFilter";
import { useLocale } from "@/components/LocaleProvider";
import { drawPractice, fullSentence, shuffle } from "@/data/bank";

const ROUND_SIZE = 8;

type Item = { sentence: string; words: string[]; shuffled: number[] };

// Word positions in a shuffled order that is never the correct order.
function shuffledOrder(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  if (length < 2) return order;
  let result = shuffle(order);
  while (result.every((position, i) => position === i)) result = shuffle(order);
  return result;
}

// Writing practice: tap the words in order to build the sentence.
export function SentenceBuilder() {
  const { t } = useLocale();
  const [level, setLevel] = useState<LevelChoice>("all");
  // Empty until a round starts: sentences are drawn at random, which must not happen during render.
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  // Positions (into item.words) the learner has placed, in order.
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  function start() {
    const drawn = drawPractice("writing", level, ROUND_SIZE).map((question) => {
      const sentence = fullSentence(question);
      const words = sentence.split(" ");
      return { sentence, words, shuffled: shuffledOrder(words.length) };
    });
    setItems(drawn);
    setIndex(0);
    setPlaced([]);
    setChecked(false);
    setScore(0);
  }

  if (items.length === 0 || index >= items.length) {
    const finished = items.length > 0;
    return (
      <section className="card mx-auto max-w-2xl p-8 text-center" aria-live="polite">
        <span className="anim-float mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted text-primary-deep">
          <Icon name={finished ? "star" : "pencil"} size={48} />
        </span>
        {finished ? (
          <>
            <h2 className="mt-6 text-2xl font-bold">{t.practice.roundDone}</h2>
            <p className="mt-1 text-lg">{t.lesson.score(score, items.length)}</p>
          </>
        ) : (
          <p className="mt-6 text-lg text-muted-foreground">{t.practice.buildInstruction}</p>
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

  const item = items[index];
  const built = placed.map((position) => item.words[position]).join(" ");
  const complete = placed.length === item.words.length;
  const correct = built === item.sentence;

  function check() {
    setChecked(true);
    if (correct) setScore(score + 1);
  }

  function next() {
    setIndex(index + 1);
    setPlaced([]);
    setChecked(false);
  }

  return (
    <section className="card mx-auto max-w-2xl p-5">
      <p className="text-sm font-bold text-muted-foreground">{t.lesson.question(index + 1, items.length)}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${((index + (checked ? 1 : 0)) / items.length) * 100}%` }}
        />
      </div>

      {/* key replays the entrance for each new sentence */}
      <div key={index} className="anim-rise">
        <h2 className="mt-4 text-lg font-bold">{t.practice.buildInstruction}</h2>

        {/* Tap a placed word to send it back. */}
        <div
          dir="ltr"
          lang="en"
          aria-label={t.practice.yourSentence}
          className={`mt-4 flex min-h-20 flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-3 ${
            checked ? (correct ? "anim-pop border-accent bg-success-soft" : "anim-shake border-destructive bg-destructive-soft") : "border-border bg-muted"
          }`}
        >
          {placed.map((position) => (
            <button
              key={position}
              type="button"
              disabled={checked}
              onClick={() => setPlaced(placed.filter((p) => p !== position))}
              className="anim-pop min-h-11 cursor-pointer rounded-xl border-2 border-primary bg-primary px-3 font-bold text-on-primary disabled:cursor-default"
            >
              {item.words[position]}
            </button>
          ))}
        </div>

        <div dir="ltr" lang="en" className="mt-4 flex min-h-12 flex-wrap justify-center gap-2">
          {item.shuffled.map((position) => (
            <button
              key={position}
              type="button"
              disabled={checked || placed.includes(position)}
              onClick={() => setPlaced([...placed, position])}
              className="min-h-11 cursor-pointer rounded-xl border-2 border-border bg-card px-3 font-bold transition-colors duration-200 hover:bg-muted disabled:cursor-default disabled:opacity-30"
            >
              {item.words[position]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex min-h-12 flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className={`font-bold ${correct ? "text-accent-deep" : "text-destructive"}`}>
          {checked && (correct ? t.lesson.correct : <span dir="ltr">{item.sentence}</span>)}
        </p>
        <div className="flex flex-wrap gap-3">
          {!checked && (
            <button type="button" className="btn btn-ghost" disabled={placed.length === 0} onClick={() => setPlaced([])}>
              <Icon name="refresh" size={20} />
              {t.practice.clear}
            </button>
          )}
          {checked ? (
            <button type="button" className="btn btn-accent" onClick={next}>
              {index + 1 >= items.length ? t.lesson.finish : t.lesson.next}
              <Icon name="chevron-left" size={20} />
            </button>
          ) : (
            <button type="button" className="btn btn-accent" disabled={!complete} onClick={check}>
              <Icon name="check" size={20} />
              {t.practice.check}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
