// Browser speech: text-to-speech for the app's voice, speech recognition for the learner's.

// Prefer a clear female English voice when the device has one.
function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith("en"));
  return voices.find((voice) => /samantha|zira|female|google us english/i.test(voice.name)) ?? voices[0];
}

// Returns false when the browser cannot speak, so callers can fall back to showing the text.
// onEnd runs when the speech finishes or fails. onWord runs as each word starts, with the
// word's character position in `text` — only some voices report this, so do not rely on it.
export function speak(text: string, rate = 1, onEnd?: () => void, onWord?: (charIndex: number) => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  if (onWord) {
    utterance.onboundary = (event) => {
      if (event.name !== "sentence") onWord(event.charIndex);
    };
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

// The Web Speech recognition API is not in TypeScript's DOM types; this is the part used here.
export type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  abort(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

// null when the browser has no speech recognition (Firefox, for example).
export function createRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  const Constructor = scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
  if (!Constructor) return null;
  const recognition = new Constructor();
  recognition.lang = "en-US";
  // Interim results let the screen show the learner's words while they are still speaking.
  recognition.interimResults = true;
  recognition.continuous = false;
  return recognition;
}
