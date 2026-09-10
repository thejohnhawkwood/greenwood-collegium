import { createHash } from "node:crypto";
import type { NameReview } from "@greenwood/contracts";
import type { AccountRecord, CharacterRecord } from "../persistence/types.js";
import type { ModerationState } from "../persistence/moderation-types.js";

export function nameReview(
  account: AccountRecord,
  character: CharacterRecord | undefined,
  state: ModerationState,
): NameReview {
  if (account.role !== "student") return { status: "approved" };
  if (!character?.creationCompletedAt || !character.gender) return { status: "unsubmitted" };
  const revision = createHash("sha256")
    .update(
      JSON.stringify([
        account.username,
        character.id,
        character.name,
        character.speciesId,
        character.gender,
        character.creationCompletedAt.toISOString(),
      ]),
    )
    .digest("hex");
  if (state.review?.revision === revision)
    return { status: state.review.status, revision, reason: state.review.reason };
  return { status: "pending", revision };
}
