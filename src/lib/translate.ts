export const TRANSLATE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "si", label: "Sinhala" },
  { code: "ta", label: "Tamil" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "pt", label: "Portuguese" },
] as const;

const CHUNK_SIZE = 1400;

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > CHUNK_SIZE) {
    let cut = rest.lastIndexOf("\n", CHUNK_SIZE);
    if (cut < CHUNK_SIZE * 0.5) cut = rest.lastIndexOf(" ", CHUNK_SIZE);
    if (cut < 1) cut = CHUNK_SIZE;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest) chunks.push(rest);
  return chunks;
}

async function translateChunk(text: string, targetLang: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
    targetLang,
  )}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation request failed (${res.status})`);
  const data = (await res.json()) as unknown[];
  const segments = data[0] as unknown[];
  return segments.map((segment) => (segment as string[])[0]).join("");
}

/**
 * Free, key-less translation via Google's public "gtx" endpoint — the same
 * one browser extensions and most no-cost translate widgets use. Best-effort:
 * it's an unofficial endpoint with no SLA, so callers should handle failures.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const chunks = splitIntoChunks(trimmed);
  const translated = await Promise.all(chunks.map((chunk) => translateChunk(chunk, targetLang)));
  return translated.join("");
}
