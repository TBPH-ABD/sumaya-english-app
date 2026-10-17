"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useLocale } from "@/components/LocaleProvider";
import { TutorAvatar } from "@/components/TutorAvatar";
import { createRecognition, speak, stopSpeaking, type Recognition } from "@/lib/speech";

type Turn = { role: "user" | "assistant"; content: string };
type Status = "idle" | "thinking" | "speaking" | "listening";
type Failure = "notConfigured" | "failed" | "micBlocked";

const otherExercises = [
  { href: "/practice/reading", label: "Reading" },
  { href: "/practice/writing", label: "Writing" },
  { href: "/practice/listening", label: "Listening" },
];

// How many of the tutor's latest words the caption keeps on screen.
const CAPTION_WORDS = 14;

// Rough length of one spoken word, used for the mouth and for captions when the voice reports no timing.
function wordMs(word: string): number {
  return Math.min(480, 110 + 60 * word.length) + (/[.!?,;:]$/.test(word) ? 220 : 0);
}

// Voice practice: the learner gives a name, then talks with the AI tutor until they leave.
export function VoiceTutor() {
  const router = useRouter();
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<Failure | null>(null);
  const [canListen, setCanListen] = useState(true);
  const [draft, setDraft] = useState("");
  // What the tutor is saying right now, revealed word by word as she speaks.
  const [caption, setCaption] = useState<{ words: string[]; shown: number }>({ words: [], shown: 0 });
  // What the learner has said so far in the current turn.
  const [heard, setHeard] = useState("");
  // One mouth movement per spoken word.
  const [beat, setBeat] = useState({ count: 0, ms: 260 });

  // Callbacks from speech and recognition outlive a render, so they read the latest values from refs.
  const turnsRef = useRef<Turn[]>([]);
  const recognitionRef = useRef<Recognition | null>(null);
  const activeRef = useRef(false);
  const logRef = useRef<HTMLOListElement>(null);
  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The tutor's recorded voice, when the server has a voice model; otherwise the browser speaks.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const serverVoiceRef = useRef(true);

  useEffect(() => {
    // Leaving the page by any route ends the session.
    return () => {
      activeRef.current = false;
      recognitionRef.current?.abort();
      stopSpeaking();
      audioRef.current?.pause();
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    };
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns]);

  function stopWordTimer() {
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    wordTimerRef.current = null;
  }

  function stopVoice() {
    stopSpeaking();
    audioRef.current?.pause();
    audioRef.current = null;
  }

  // Fetches the reply as audio from the server's voice model. null when there is none or it failed.
  async function fetchVoice(reply: string): Promise<HTMLAudioElement | null> {
    if (!serverVoiceRef.current) return null;
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reply }),
      });
      if (response.status === 404) serverVoiceRef.current = false;
      if (!response.ok) return null;
      const audio = new Audio(URL.createObjectURL(await response.blob()));
      await new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => reject(new Error("audio"));
      });
      return audio;
    } catch {
      return null;
    }
  }

  // Speaks a reply while the caption fills in and the mouth moves, word by word.
  async function say(reply: string) {
    const words = reply.split(/\s+/).filter(Boolean);
    // Character position where each word starts, to match the browser voice's word events.
    const starts: number[] = [];
    let from = 0;
    for (const word of words) {
      const at = reply.indexOf(word, from);
      starts.push(at);
      from = at + word.length;
    }

    function show(index: number, ms: number) {
      setCaption({ words, shown: index + 1 });
      setBeat((previous) => ({ count: previous.count + 1, ms }));
    }

    // Words advance on a timer. `scale` stretches the estimate to the real length of the audio.
    let timed = false;
    function advance(index: number, scale: number) {
      if (timed || index >= words.length) return;
      const ms = wordMs(words[index]) * scale;
      show(index, Math.min(ms, 480));
      wordTimerRef.current = setTimeout(() => advance(index + 1, scale), ms);
    }

    function finish() {
      stopWordTimer();
      audioRef.current = null;
      setCaption({ words, shown: words.length });
      listen();
    }

    setCaption({ words, shown: 0 });

    const audio = await fetchVoice(reply);
    if (!activeRef.current) return;
    if (audio) {
      const estimate = words.reduce((total, word) => total + wordMs(word), 0);
      const scale = Number.isFinite(audio.duration) && estimate > 0 ? (audio.duration * 1000) / estimate : 1;
      audio.onended = finish;
      audioRef.current = audio;
      try {
        await audio.play();
        setStatus("speaking");
        advance(0, scale);
        return;
      } catch {
        // The browser refused to play it (autoplay rules): fall back to its own voice.
        audioRef.current = null;
      }
    }

    setStatus("speaking");
    const speaking = speak(reply, 1, finish, (charIndex) => {
      timed = true;
      stopWordTimer();
      const index = starts.findLastIndex((start) => start <= charIndex);
      if (index >= 0) show(index, wordMs(words[index]));
    });
    if (!speaking) {
      // No voice on this device: show the whole reply and hand over.
      setCaption({ words, shown: words.length });
      listen();
      return;
    }
    // Until the browser voice reports real word timing, advance on the estimate.
    wordTimerRef.current = setTimeout(() => advance(0, 1), 350);
  }

  function listen() {
    if (!activeRef.current) return;
    const recognition = createRecognition();
    if (!recognition) {
      setCanListen(false);
      setStatus("idle");
      return;
    }
    stopVoice();
    stopWordTimer();
    let spoken = "";
    setHeard("");
    recognition.onresult = (event) => {
      spoken = Array.from(event.results, (result) => result[0].transcript).join(" ").trim();
      setHeard(spoken);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") setFailure("micBlocked");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (!activeRef.current) return;
      if (spoken) send(spoken);
      else setStatus("idle");
    };
    recognitionRef.current = recognition;
    setFailure(null);
    setStatus("listening");
    try {
      recognition.start();
    } catch {
      setStatus("idle");
    }
  }

  async function ask(history: Turn[]) {
    setStatus("thinking");
    setFailure(null);
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), messages: history }),
      });
      if (!activeRef.current) return;
      if (!response.ok) {
        setFailure(response.status === 503 ? "notConfigured" : "failed");
        setStatus("idle");
        return;
      }
      const { reply } = (await response.json()) as { reply: string };
      if (!activeRef.current) return;
      const next: Turn[] = [...history, { role: "assistant", content: reply }];
      turnsRef.current = next;
      setTurns(next);
      // When the tutor finishes speaking, the microphone opens for the learner's turn.
      say(reply);
    } catch {
      if (!activeRef.current) return;
      setFailure("failed");
      setStatus("idle");
    }
  }

  function send(text: string) {
    const next: Turn[] = [...turnsRef.current, { role: "user", content: text }];
    turnsRef.current = next;
    setTurns(next);
    ask(next);
  }

  function start(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    activeRef.current = true;
    setStarted(true);
    ask([]);
  }

  function toggleMic() {
    if (status === "listening") recognitionRef.current?.abort();
    else listen();
  }

  function sendDraft(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || status === "thinking") return;
    recognitionRef.current?.abort();
    stopVoice();
    stopWordTimer();
    setDraft("");
    send(text);
  }

  function leave() {
    activeRef.current = false;
    recognitionRef.current?.abort();
    stopVoice();
    stopWordTimer();
    router.push("/home");
  }

  if (!started) {
    return (
      <section className="card mx-auto max-w-md p-6 text-center">
        <TutorAvatar
          status="idle"
          viewBox="385 230 380 380"
          className="mx-auto h-32 w-32 rounded-full border-4 border-border"
        />
        <h2 className="mt-5 text-2xl font-bold">{t.voice.meet}</h2>
        <p className="mt-2 text-muted-foreground">{t.voice.intro}</p>

        <form noValidate onSubmit={start} className="mt-6 text-start">
          <label htmlFor="trainee-name" className="mb-2 block font-bold">
            {t.voice.askName}
          </label>
          <input
            id="trainee-name"
            value={name}
            maxLength={40}
            autoComplete="given-name"
            aria-invalid={nameError}
            aria-describedby={nameError ? "trainee-name-error" : undefined}
            onChange={(event) => {
              setName(event.target.value);
              setNameError(false);
            }}
            className={`min-h-13 w-full rounded-2xl border-2 bg-card px-4 text-lg transition-colors duration-200 ${
              nameError ? "anim-shake border-destructive" : "border-border focus:border-primary"
            }`}
          />
          {nameError && (
            <p id="trainee-name-error" role="alert" className="anim-rise mt-2 text-sm font-bold text-destructive">
              {t.voice.nameRequired}
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-5 w-full">
            <Icon name="mic" size={20} />
            {t.voice.start}
          </button>
        </form>

        <p className="mt-8 text-sm font-bold text-muted-foreground">{t.voice.otherExercises}</p>
        <ul className="mt-2 flex flex-wrap justify-center gap-2" dir="ltr">
          {otherExercises.map((exercise) => (
            <li key={exercise.href}>
              <Link
                href={exercise.href}
                className="flex min-h-11 items-center rounded-2xl border-2 border-border px-4 font-bold transition-colors duration-200 hover:bg-muted"
              >
                {exercise.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="card mx-auto flex max-w-md flex-col items-center p-4">
      {/* Laid out like a video call: her picture, a name tag, and live captions. */}
      <div
        data-status={status}
        className="video-tile relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border-4"
      >
        <TutorAvatar status={status} beat={beat.count} beatMs={beat.ms} className="h-full w-full" />

        <span dir="ltr" className="absolute start-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-sm font-bold text-white">
          <span className="live-dot" />
          Salma
        </span>

        {/* Captions are a visual aid; the full conversation is in the transcript below. */}
        <p
          dir="ltr"
          lang="en"
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 flex min-h-24 items-end bg-gradient-to-t from-black/85 to-transparent px-4 pt-10 pb-4 font-display text-lg leading-snug font-bold text-white"
        >
          {status === "listening" ? (
            <span>
              <span className="text-primary-soft">{name.trim()}: </span>
              {heard || "…"}
            </span>
          ) : (
            <span>
              {caption.words.slice(Math.max(0, caption.shown - CAPTION_WORDS), caption.shown).map((word, i) => (
                <span key={`${caption.shown}-${i}`} className="caption-word">
                  {word}{" "}
                </span>
              ))}
            </span>
          )}
        </p>
      </div>

      <p aria-live="polite" className="mt-4 flex min-h-7 items-center gap-2 font-bold text-primary-deep">
        {status === "thinking" && (
          <span className="tutor-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        )}
        {t.voice.status[status]}
      </p>

      {failure && (
        <div role="alert" className="anim-rise mt-4 w-full rounded-2xl border-2 border-destructive bg-destructive-soft p-4 text-center font-bold text-destructive">
          <p>{t.voice.failure[failure]}</p>
          {failure === "failed" && (
            <button type="button" className="btn btn-ghost mt-3" onClick={() => ask(turnsRef.current)}>
              <Icon name="refresh" size={20} />
              {t.voice.retry}
            </button>
          )}
        </div>
      )}

      <ol
        ref={logRef}
        dir="ltr"
        lang="en"
        aria-label={t.voice.transcript}
        className="mt-5 max-h-64 w-full space-y-3 overflow-y-auto rounded-2xl bg-muted p-4"
      >
        {turns.map((turn, i) => (
          <li
            key={i}
            className={`anim-rise max-w-[85%] rounded-2xl px-4 py-2 ${
              turn.role === "assistant" ? "bg-card" : "ms-auto bg-primary text-on-primary"
            }`}
          >
            <span className="block text-xs font-bold opacity-70">{turn.role === "assistant" ? "Salma" : name.trim()}</span>
            {turn.content}
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-center gap-4">
        {canListen && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={status === "thinking"}
            aria-pressed={status === "listening"}
            aria-label={status === "listening" ? t.voice.stopMic : t.voice.startMic}
            className={`mic-button flex h-20 w-20 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
              status === "listening" ? "mic-live bg-accent text-on-accent" : "bg-primary text-on-primary"
            }`}
          >
            <Icon name="mic" size={36} />
          </button>
        )}
        <button type="button" onClick={leave} className="btn btn-leave">
          <Icon name="x" size={20} />
          {t.voice.leave}
        </button>
      </div>

      {!canListen && <p className="mt-4 text-center text-sm font-bold text-muted-foreground">{t.voice.noMic}</p>}

      <form onSubmit={sendDraft} className="mt-5 flex w-full gap-2">
        <label htmlFor="tutor-draft" className="sr-only">
          {t.voice.typeInstead}
        </label>
        <input
          id="tutor-draft"
          dir="ltr"
          lang="en"
          value={draft}
          maxLength={600}
          placeholder={t.voice.typeInstead}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-border bg-card px-4 transition-colors duration-200 focus:border-primary"
        />
        <button type="submit" className="btn btn-ghost" disabled={!draft.trim() || status === "thinking"}>
          {t.voice.send}
        </button>
      </form>
    </section>
  );
}
