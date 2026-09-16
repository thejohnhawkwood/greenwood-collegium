import type { PlayState } from "@greenwood/contracts";

const CHOICE = /^Type say (\S+) [—–-] (.+)$/u;

export function conversationFromStory(
  lines: readonly { text: string }[],
): PlayState["conversation"] {
  for (const line of [...lines].reverse()) {
    const rows = line.text.split(/\r?\n/u);
    const choices = rows.flatMap((row) => {
      const match = CHOICE.exec(row.trim());
      return match?.[1] && match[2] ? [{ say: match[1], label: match[2] }] : [];
    });
    if (choices.length === 0) {
      continue;
    }
    const speaker = rows[0]?.trim();
    const prompt = rows
      .slice(1)
      .map((row) => row.trim())
      .find((row) => row.length > 0 && !CHOICE.test(row));
    if (!speaker || !prompt) {
      continue;
    }
    return {
      npcId: "story",
      npcName: speaker,
      prompt,
      choices,
    };
  }
  return undefined;
}
