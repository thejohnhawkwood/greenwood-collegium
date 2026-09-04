export const SAY_MAX_LENGTH = 160;

export function sanitizeSpeech(raw: string): string {
  const normalized = raw.normalize("NFC");
  let cleaned = "";
  for (const character of normalized) {
    const code = character.codePointAt(0) ?? 0;
    cleaned += code < 32 || code === 127 ? " " : character;
  }
  return cleaned.replace(/\s+/g, " ").trim();
}
