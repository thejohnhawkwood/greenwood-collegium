import { describe, expect, it } from "vitest";
import {
  combatActionResolvedEventSchema,
  formatCombatActionResolvedText,
} from "./combat-action-resolved.js";

describe("combat.action_resolved contract", () => {
  it("renders player and dummy strikes from the same schema", () => {
    const player = combatActionResolvedEventSchema.parse({
      eventId: "evt-combat-hit-1",
      sequence: 3,
      schemaVersion: 0,
      type: "combat.action_resolved",
      occurredAt: "2026-09-07T19:00:00.000Z",
      audience: "character",
      encounterId: "enc-1",
      narration: "You strike the Practice Dummy for 4. It has 4 remaining.",
      payload: {
        encounterId: "enc-1",
        actorId: "char-rowan",
        actorName: "Rowan the Hare",
        actorKind: "player",
        verb: "attack",
        targetId: "enemy-practice-dummy-south-orchard",
        targetName: "Practice Dummy",
        damage: 4,
        targetHealth: 4,
        targetMaxHealth: 8,
      },
    });
    const enemy = combatActionResolvedEventSchema.parse({
      eventId: "evt-combat-hit-2",
      sequence: 4,
      schemaVersion: 0,
      type: "combat.action_resolved",
      occurredAt: "2026-09-07T19:00:00.000Z",
      audience: "character",
      encounterId: "enc-1",
      narration: "The Practice Dummy thumps you for 2. You have 18 remaining.",
      payload: {
        encounterId: "enc-1",
        actorId: "enemy-practice-dummy-south-orchard",
        actorName: "Practice Dummy",
        actorKind: "enemy",
        verb: "attack",
        targetId: "char-rowan",
        targetName: "Rowan the Hare",
        damage: 2,
        targetHealth: 18,
        targetMaxHealth: 20,
      },
    });

    expect(formatCombatActionResolvedText(player.payload)).toBe(player.narration);
    expect(formatCombatActionResolvedText(enemy.payload)).toBe(enemy.narration);
  });
});
