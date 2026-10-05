"use client";

import { useSyncExternalStore } from "react";

// Completed lesson ids, kept in this browser only (no backend yet).
const KEY = "slma:completed";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: { raw: string | null; ids: string[] } = { raw: null, ids: EMPTY };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cache.raw) {
    let ids = EMPTY;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) ids = parsed.filter((id) => typeof id === "string");
    } catch {}
    cache = { raw, ids };
  }
  return cache.ids;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useCompletedLessons(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function markLessonDone(id: string) {
  const ids = read();
  if (ids.includes(id)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids, id]));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

// A lesson is passed part by part; it counts as done once every part is.
export function partId(lessonId: string, part: number): string {
  return `${lessonId}#${part + 1}`;
}

export function markPartDone(lessonId: string, part: number, parts: number) {
  markLessonDone(partId(lessonId, part));
  const done = read();
  if (Array.from({ length: parts }, (_, i) => partId(lessonId, i)).every((id) => done.includes(id))) {
    markLessonDone(lessonId);
  }
}
