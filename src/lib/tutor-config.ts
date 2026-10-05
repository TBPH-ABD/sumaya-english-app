// Server-side settings for the voice tutor, read from environment variables.
//
//   TUTOR_API_KEY      required. A Groq key (gsk_...) or an OpenRouter key (sk-or-...).
//   TUTOR_API_URL      optional. Chat endpoint; chosen from the key when not set.
//   TUTOR_MODEL        optional. Chat model (the tutor's "brain").
//   TUTOR_VOICE_MODEL  optional. OpenRouter text-to-speech model (the tutor's voice).
//                      Without it the browser's own voice is used.
//   TUTOR_VOICE        optional. Voice name for that model, when the model needs one.

const GROQ_CHAT = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER = "https://openrouter.ai/api/v1";

// Checked on 2026-10-05. Providers retire models: when the tutor starts failing with
// "upstream", list the provider's current models and set TUTOR_MODEL.
const GROQ_MODEL = "openai/gpt-oss-120b";
// OpenRouter's own router across whichever free chat models exist at the moment.
const OPENROUTER_MODEL = "openrouter/free";

export type TutorConfig = {
  apiKey: string;
  chatUrl: string;
  chatModel: string;
  // Present only when a voice model is set and the key is an OpenRouter key.
  voice: { url: string; model: string; voice?: string } | null;
};

// Values pasted into a hosting dashboard often carry quotes, spaces, or the whole "NAME=value" line.
function clean(value: string | undefined, name: string): string {
  let text = (value ?? "").trim();
  if (text.startsWith(`${name}=`)) text = text.slice(name.length + 1).trim();
  return text.replace(/^["']|["']$/g, "").trim();
}

// Text-to-speech models cannot hold a conversation. If one was put in TUTOR_MODEL by mistake,
// it is used as the voice instead. The answer is cached for the life of the server.
const speechModels = new Map<string, Promise<boolean>>();

function isSpeechModel(model: string): Promise<boolean> {
  let answer = speechModels.get(model);
  if (!answer) {
    answer = fetch(`${OPENROUTER}/models/${model}/endpoints`, { signal: AbortSignal.timeout(8000) })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        const outputs: unknown = body?.data?.architecture?.output_modalities;
        return Array.isArray(outputs) && outputs.includes("speech");
      })
      .catch(() => false);
    speechModels.set(model, answer);
  }
  return answer;
}

// null when no key is set.
export async function getTutorConfig(): Promise<TutorConfig | null> {
  const apiKey = clean(process.env.TUTOR_API_KEY, "TUTOR_API_KEY");
  if (!apiKey) return null;

  const customUrl = clean(process.env.TUTOR_API_URL, "TUTOR_API_URL");
  const onOpenRouter = customUrl ? customUrl.includes("openrouter.ai") : apiKey.startsWith("sk-or-");

  let chatModel = clean(process.env.TUTOR_MODEL, "TUTOR_MODEL");
  let voiceModel = clean(process.env.TUTOR_VOICE_MODEL, "TUTOR_VOICE_MODEL");
  if (chatModel && (await isSpeechModel(chatModel))) {
    // A voice model can only be the voice, and only an OpenRouter key can reach it.
    if (!voiceModel) voiceModel = chatModel;
    chatModel = "";
  }

  return {
    apiKey,
    chatUrl: customUrl || (onOpenRouter ? `${OPENROUTER}/chat/completions` : GROQ_CHAT),
    chatModel: chatModel || (onOpenRouter ? OPENROUTER_MODEL : GROQ_MODEL),
    voice:
      onOpenRouter && voiceModel
        ? { url: `${OPENROUTER}/audio/speech`, model: voiceModel, voice: clean(process.env.TUTOR_VOICE, "TUTOR_VOICE") || undefined }
        : null,
  };
}

// Rough per-visitor limit so a public deployment cannot drain a free key. It lives in memory:
// it resets when the server restarts and is per instance on serverless hosts, so it slows abuse
// rather than stopping it.
const WINDOW_MS = 60_000;
const recentCalls = new Map<string, number[]>();

export function overLimit(request: Request, bucket: string, maxPerMinute: number): boolean {
  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = `${bucket}:${visitor}`;
  const now = Date.now();
  const calls = (recentCalls.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (calls.length >= maxPerMinute) {
    recentCalls.set(key, calls);
    return true;
  }
  calls.push(now);
  recentCalls.set(key, calls);
  // Keep the table from growing without bound.
  if (recentCalls.size > 5000) recentCalls.clear();
  return false;
}
