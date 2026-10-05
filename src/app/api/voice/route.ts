import { getTutorConfig, overLimit } from "@/lib/tutor-config";

// The tutor's voice: turns one reply into speech with the configured text-to-speech model and
// returns MP3. When no voice model is set this answers 404 and the browser's own voice is used.

const MAX_TEXT = 600;
const TIMEOUT_MS = 30_000;

export async function POST(request: Request) {
  if (overLimit(request, "voice", 20)) return Response.json({ error: "busy" }, { status: 429 });

  const body = (await request.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : "";
  if (!text) return Response.json({ error: "bad_request" }, { status: 400 });

  const config = await getTutorConfig();
  if (!config?.voice) return Response.json({ error: "no_voice" }, { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetch(config.voice.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.voice.model,
        input: text,
        response_format: "mp3",
        // Left out unless set: some models have a default voice, others require a name.
        ...(config.voice.voice ? { voice: config.voice.voice } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error("voice: could not reach the provider", error);
    return Response.json({ error: "upstream" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = (await upstream.text().catch(() => "")).slice(0, 300);
    console.error("voice: provider error", upstream.status, detail);
    return Response.json(
      { error: "upstream", model: config.voice.model, providerStatus: upstream.status, detail },
      { status: 502 },
    );
  }

  return new Response(upstream.body, {
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg", "Cache-Control": "no-store" },
  });
}
