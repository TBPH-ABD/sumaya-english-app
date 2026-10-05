import { getTutorConfig, overLimit } from "@/lib/tutor-config";

// Voice tutor backend: one short spoken-style reply per call.
// The browser sends the whole conversation each time; nothing is stored here.
// It talks to any OpenAI-compatible chat endpoint; settings are described in src/lib/tutor-config.ts.

const TIMEOUT_MS = 25_000;

const MAX_NAME = 40;
const MAX_TURNS = 40;
const MAX_MESSAGE = 600;

// What the browser sends as the very first "user" turn, before the student has spoken.
const SESSION_START = "[session start]";

type Turn = { role: "user" | "assistant"; content: string };

function systemPrompt(name: string): string {
  return `You are Salma, a warm, patient English conversation tutor. You are talking out loud with a student named ${name}, whose first language is Arabic. Everything you write is read aloud by a speech synthesizer and everything the student says reaches you through speech recognition, so transcripts may contain small recognition errors: respond to what the student most likely meant.

How to talk:
- Speak only English, in plain sentences with no lists, markdown, emoji or stage directions, because every character is spoken.
- Keep each turn to one to three short sentences and end most turns with one open question, so the student does most of the talking.
- Match the student's level: if their sentences are short or hesitant, use simple words and slow down; if they are fluent, use richer vocabulary.
- When the student makes a clear mistake, briefly say the corrected sentence in a friendly way, then carry on with the conversation. Correct at most one thing per turn.
- If the student is stuck or silent, offer an easier question or a couple of words they could use.
- Stay on everyday topics that suit a language lesson: daily life, study, work, travel, hobbies, plans.

When the conversation contains only "${SESSION_START}", the student has just joined: greet ${name} by name, introduce yourself in one sentence, and ask an easy opening question.`;
}

function parseBody(body: unknown): { name: string; turns: Turn[] } | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, messages } = body as { name?: unknown; messages?: unknown };
  if (typeof name !== "string" || !Array.isArray(messages) || messages.length > MAX_TURNS) return null;

  // Letters (any script), spaces, hyphens and apostrophes only: the name goes into the system prompt.
  const cleanName = name.replace(/[^\p{L}\p{M} '-]/gu, "").trim().slice(0, MAX_NAME);
  if (!cleanName) return null;

  const turns: Turn[] = [];
  for (const message of messages) {
    const { role, content } = (message ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_MESSAGE);
    if (!text) return null;
    turns.push({ role, content: text });
  }
  return { name: cleanName, turns };
}

export async function POST(request: Request) {
  if (overLimit(request, "tutor", 20)) return Response.json({ error: "busy" }, { status: 429 });

  const parsed = parseBody(await request.json().catch(() => null));
  if (!parsed) return Response.json({ error: "bad_request" }, { status: 400 });

  // The API needs a user turn first; a new session has no turns yet.
  const messages: Turn[] = parsed.turns.length > 0 ? parsed.turns : [{ role: "user", content: SESSION_START }];
  if (messages[0].role !== "user") return Response.json({ error: "bad_request" }, { status: 400 });

  // `reason` tells whoever is setting the site up what is wrong; the learner sees one message.
  const config = await getTutorConfig();
  if (!config) return Response.json({ error: "not_configured", reason: "key_missing" }, { status: 503 });
  const provider = new URL(config.chatUrl).host;

  let upstream: Response;
  try {
    upstream = await fetch(config.chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.chatModel,
        messages: [{ role: "system", content: systemPrompt(parsed.name) }, ...messages],
        // Spoken turns are a few sentences, but some models also spend tokens on hidden
        // reasoning before they answer, so the limit leaves room for both.
        max_tokens: 800,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error("tutor: could not reach the provider", error);
    return Response.json({ error: "upstream" }, { status: 502 });
  }

  // A rejected key reads as "not set up" to the learner; free-tier limits read as "busy".
  if (upstream.status === 401 || upstream.status === 403) {
    console.error("tutor: provider refused the key", upstream.status, (await upstream.text()).slice(0, 300));
    return Response.json(
      { error: "not_configured", reason: "key_rejected", provider, providerStatus: upstream.status },
      { status: 503 },
    );
  }
  if (upstream.status === 429) return Response.json({ error: "busy" }, { status: 429 });
  if (!upstream.ok) {
    console.error("tutor: provider error", upstream.status, (await upstream.text()).slice(0, 300));
    return Response.json(
      { error: "upstream", provider, model: config.chatModel, providerStatus: upstream.status },
      { status: 502 },
    );
  }

  const data = (await upstream.json().catch(() => null)) as {
    choices?: { message?: { content?: unknown } }[];
  } | null;
  const content = data?.choices?.[0]?.message?.content;
  const reply = typeof content === "string" ? content.trim() : "";
  if (!reply) return Response.json({ error: "empty" }, { status: 502 });
  return Response.json({ reply });
}
