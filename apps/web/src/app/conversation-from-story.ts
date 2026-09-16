const CHOICE = /Type say \S+ [—–-]/u;

export function isDialogueMenuText(text: string): boolean {
  return CHOICE.test(text);
}
