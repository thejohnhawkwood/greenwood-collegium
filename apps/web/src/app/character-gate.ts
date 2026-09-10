import type { AuthSessionPublic } from "@greenwood/contracts";

export function shouldShowCharacterGate(me: AuthSessionPublic | undefined): boolean {
  return me !== undefined && (!me.characterComplete || me.nameReview?.status === "rejected");
}
