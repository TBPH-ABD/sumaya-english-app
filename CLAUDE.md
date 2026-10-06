@AGENTS.md

# Salma (folder: Slma)

The product name shown in the UI is "Salma"; "Slma" is only the folder and package name. English-learning web app for Arabic speakers, made for Salma Abdullah (Information Systems, University of Aden) — her name is on the welcome screen. Content is organised as
CEFR level → units → lessons; each lesson has 100 words plus grammar and practice.

## Stack

- Next.js 16 (App Router, `src/` dir, TypeScript), React 19, Tailwind CSS v4.
- No database, no UI library, no animation library. Lesson progress lives in `localStorage`.
- Two server routes, both plain `fetch` (no SDK): `/api/tutor` (chat reply, any OpenAI-compatible endpoint) and `/api/voice` (reply as MP3 from an OpenRouter text-to-speech model; 404 when none is set, and the browser's own voice is used). Salah wants free keys only, zero cost, and no Anthropic account or dependency — do not add `@anthropic-ai/sdk` or any paid provider. Settings live in `src/lib/tutor-config.ts`, read from `.env.local` locally (git-ignored) and from Vercel's environment variables in production: `TUTOR_API_KEY` (required; a Groq `gsk_` key or an OpenRouter `sk-or-` key — the provider is picked from the key), `TUTOR_MODEL` (chat model), `TUTOR_VOICE_MODEL` (Salah chose `fish-audio/s2.1-pro-free:free`), `TUTOR_VOICE`, `TUTOR_API_URL`. A speech model put in `TUTOR_MODEL` by mistake is used as the voice. Both routes have a rough in-memory limit (20 calls a minute per visitor) and no auth; on a serverless host the limit is per instance.
- After `npm run build`, a running `npm run dev` can serve stale routes (seen: `/practice` 404). Fix: stop dev, `rm -rf .next/dev`, start it again.
- There is no login: Salah had the login page and button removed. Do not add accounts unasked.
- Commands: `npm run dev`, `npm run build`, `npm run lint`.
- Next 16: `params` in pages is a `Promise` — `await` it.

## Layout

| Path | Purpose |
|------|---------|
| `src/data/curriculum.ts` | All content and its types. Add levels, units, lessons, words here. |
| `src/app/page.tsx` | Welcome screen at `/` (full-bleed, no header): greeting, Salma's name / major / university, `Enter` button → `/home`. |
| `src/app/(site)/layout.tsx` | Header + content shell for every page after the welcome screen. |
| `src/app/(site)/home/page.tsx` | Hub with three tiles: تعلّم → `/levels`, اختبار → `/test`, ممارسة → `/practice`. |
| `src/app/(site)/levels/page.tsx` | Level picker. |
| `src/app/(site)/levels/[level]/page.tsx` | Units and lessons of one level. |
| `src/app/(site)/levels/[level]/[unit]/[lesson]/page.tsx` | Lesson page (unit and lesson are 1-based numbers). |
| `src/data/bank.ts` | Question bank (100 questions: 4 skills x 5 levels) shared by the test and the practice section, plus the draw helpers. |
| `src/app/(site)/test/page.tsx`, `src/components/PlacementTest.tsx` | Placement test: 50 questions drawn from the bank (10 per level: 3 reading, 3 writing, 2 listening, 2 speaking), level + per-skill result. |
| `src/app/(site)/practice/page.tsx`, `src/components/VoiceTutor.tsx` | Voice practice (Salah's plan for speaking): asks the trainee's name, then a spoken conversation with the AI tutor "Salma" (avatar `public/tutor.jpg`, supplied by Salah) until the learner presses Leave. Speech recognition in, model reply, text-to-speech out, then the microphone reopens. A typed reply always works as a fallback. Laid out like a video call: the picture in a tile, live captions that reveal each word as it is spoken (voice `boundary` events when the voice sends them, otherwise an estimate from word length), and the learner's own words while they speak. |
| `src/components/TutorAvatar.tsx` | The tutor picture animated as inline SVG: lower lip drops once per spoken word (masked copy of the image over a mouth interior), eyelids blink, head sways. Every coordinate is a pixel of `public/tutor.jpg` (1254 x 1254, the second picture Salah supplied, source `~/Downloads/another.png`); a different picture needs the mouth line and eyes re-measured. |
| `src/app/api/tutor/route.ts` | Tutor backend: validates `{ name, messages }`, holds the tutor system prompt, returns `{ reply }`. Stateless — the browser resends the conversation. |
| `src/app/(site)/practice/[skill]/page.tsx` | The older exercises, linked from the voice practice start screen as "other exercises". One skill: `SkillPractice` (reading, listening: bank questions with instant feedback) or `SentenceBuilder` (writing: tap words into order). |
| `src/components/BankQuestionView.tsx` | Renders one bank question for any skill (passage, audio player, blank sentence, situation) and its options. |
| `src/lib/speech.ts` | Browser text-to-speech (`speak`, `stopSpeaking`) and speech recognition (`createRecognition`; Chrome, Edge, Safari — not Firefox). |
| `src/components/LessonView.tsx` | Lesson tabs: vocabulary, grammar, practice quiz. |
| `src/components/Icon.tsx` | Custom SVG icon set (`<Icon name="..." />`). |
| `src/components/Logo.tsx` | Logo mark and wordmark. Copies: `src/app/icon.svg`, `public/logo-mark.svg`. |
| `src/lib/i18n.ts` | Every UI string in Arabic and English (`dictionaries`). Add a key to `ar`; TypeScript then requires it in `en`. |
| `src/lib/locale.ts` | Server: `getDictionary()` reads the `locale` cookie → `{ locale, t }`. |
| `src/components/LocaleProvider.tsx` | Client: `useLocale()` → `{ locale, t }`. |
| `src/components/ThemeToggle.tsx` | The sun/moon button (header + welcome screen). Sets the `theme` cookie, then `router.refresh()`. |
| `src/components/LanguageToggle.tsx` | The language icon button (header + welcome screen). Sets the cookie, then `router.refresh()`. |
| `src/lib/progress.ts` | Completed-lesson store (`localStorage` key `slma:completed`). |
| `src/app/globals.css` | Design tokens (`@theme`) and the `.card` / `.btn` component classes. |
| `src/app/(site)/design-system/page.tsx` | Live preview of tokens, buttons, icons, logo at `/design-system`. Not linked from the header (removed on request); open it by URL. |
| `src/app/(site)/template.tsx` | Replays the page entrance animation on every navigation. |

## Content rules

- Question bank (`bank.ts`): each row lists the correct option first; options are shuffled at draw time. Listening `text` is spoken, never shown before answering.
- The test must show different questions on every attempt: `drawTest` excludes the previous attempt's ids (stored under `slma:test-last`). That only works while each skill-level cell holds at least twice what one test takes (now exactly twice: 6/6/4/4). Add rows to get more variety; never shrink a cell.
- In the test, "speaking" means choosing the best reply for a situation. Real spoken practice is the voice tutor at `/practice`.
- Anything random (`shuffle`, `drawTest`, `drawPractice`) runs in event handlers only, never during render.

- Every English example sentence carries an Arabic translation (`exampleAr` on words and grammar points); the lesson's "translate sentences" toggle shows them.
- A lesson has 100 words (`WORDS_PER_LESSON`), studied and quizzed in 5 parts of 20 (`PART_SIZE`). The quiz covers the selected part; 80% passes that part (stored as `<lessonId>#<part>`), and the lesson is complete once every part is passed. A lesson with `words: []` shows as "coming soon".
- Lessons unlock in order (Salah asked for it): a lesson opens only once the lesson before it is complete, across levels too, so a level opens after the last lesson of the level before it. `requiredLessonId` in `curriculum.ts` gives the order, `UnlockGate` in `Progress.tsx` shows the locked state (level picker, level page, lesson page). Exception: levels in `OPEN_LEVELS` (now A2) are open from the start; their later lessons still go in order. Client-side only — progress is in `localStorage`.
- The practice quiz is generated from the part's words (`buildQuiz`), so the Arabic meanings inside a lesson must be unique.
- Levels are listed easiest first (A1 → C1); that order is the display order (Salah asked for beginner first).
- Current content: every level has Unit 1 with 3 lessons (15 lessons, 1500 words). Only the first 15 words of each lesson have an example sentence and its translation (`example`, `exampleAr` are optional); the other 85 are word + part of speech + meaning. Rows use the `w(...)` and `p(...)` helpers.

## Design rules

- Two display languages: Arabic (default, RTL) and English (LTR), switched by the language icon. `<html lang dir>` follows the cookie, so every page renders per request (no static pages).
- Never hard-code UI text in a component: server components use `getDictionary()`, client components `useLocale()`.
- Lesson content is not UI text: English words/sentences stay `dir="ltr" lang="en"`, Arabic meanings and sentence translations stay `dir="rtl" lang="ar"` in both display languages.
- Use logical classes (`start-*`, `end-*`, `ps-*`, `text-start`) so layouts mirror. Chevron icons are authored for RTL ("forward" = `chevron-left`) and are mirrored by CSS in LTR; add `className="no-flip"` to opt out.
- `/design-system` is a developer page and is Arabic only.
- Brand colour is `#805AD5` (`primary`), with the purple scale around it: `primary-deep` `#553C9A`, `secondary` `#B794F4`, `border` `#D6BCFA`, `background` `#FAF5FF`.
- `text-primary` passes contrast on white cards only; on `bg-background` or `bg-muted` use `text-primary-deep`.
- Light and dark mode, switched by the sun/moon icon (`ThemeToggle`, cookie `theme`, `<html data-theme>`). Dark mode only overrides token values in `globals.css` under `html[data-theme="dark"]` — components never branch on the theme. A new colour needs both a light and a dark value. `*-deep` tokens are text colours (light in dark mode); `*-edge` tokens are button shadows. The welcome screen is the same in both themes. Use token classes (`bg-primary`, `text-muted-foreground`, `bg-c1-soft`, ...), never raw hex in components.
- Style: light claymorphism — 20px radius, 2px border, solid 4px bottom shadow, 200ms ease-out press.
- Each CEFR level has its own colour pair (`--color-<level>` / `--color-<level>-soft`), mapped in `levelStyles`.
- Fonts: Baloo Bhaijaan 2 (`font-display`), IBM Plex Sans Arabic (`font-sans`). Both cover Arabic and Latin; do not put a Latin-only font first in a stack — its Arial-based `next/font` fallback then renders the Arabic.
- Icons come from `Icon.tsx` only — no emoji, no icon library. New icon: 24×24 grid, 2px stroke, round caps.
- Motion is a core part of the look, all CSS in `globals.css`:
  - Entrances: `.anim-rise`, `.stagger` (children one by one), `.anim-pop`; feedback: `.anim-shake`; ambient: `.anim-float`, `.bg-blobs`.
  - Icons draw themselves in on mount and react on hover of their parent link/button (per-icon rules via `data-icon`).
  - Logo bars grow on load; `<LogoMark loop />` keeps them bouncing.
  - To replay an entrance, change the element's `key`.
  - Animate `transform`/`opacity`/`translate` only. Everything is neutralised under `prefers-reduced-motion`.
- Tap targets at least 44px, visible focus ring, text contrast at least 4.5:1, honour `prefers-reduced-motion`.
- The accent green carries dark text (`text-on-accent`), never white — white fails contrast.
