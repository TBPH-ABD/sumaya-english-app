# Salma

An English-learning web app for Arabic speakers: lessons by CEFR level (A1 to C1), a 50-question
placement test, and voice practice with an AI conversation tutor. The interface is available in
Arabic and English, with light and dark mode.

Built with Next.js (App Router), React and Tailwind CSS.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Voice tutor setup

The voice practice page talks to a chat model through any OpenAI-compatible endpoint. It is set up
with environment variables; without a key the rest of the site still works and the tutor page says
it is not configured.

| Variable | Required | Meaning |
|---|---|---|
| `TUTOR_API_KEY` | yes | API key from the provider. A free Groq key works: https://console.groq.com/keys |
| `TUTOR_API_URL` | no | Chat completions endpoint. Defaults to Groq. |
| `TUTOR_MODEL` | no | Model name. Defaults to `openai/gpt-oss-120b`. |

Locally, put them in `.env.local` (this file is git-ignored). On Vercel, add them under
Project Settings > Environment Variables, then redeploy.

Speech recognition and text-to-speech run in the browser. Speaking by microphone needs Chrome,
Edge or Safari, and the site must be served over HTTPS (or from localhost).
