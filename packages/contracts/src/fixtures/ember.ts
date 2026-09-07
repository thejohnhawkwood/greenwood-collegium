import { schemaVersion } from "../schema-version.js";
import {
  formatCombatActionResolvedText,
  type CombatActionResolvedEvent,
} from "../events/combat-action-resolved.js";

const payload = {
  encounterId: "enc-ember-1",
  actorId: "char-rowan",
  actorName: "Rowan the Hare",
  actorKind: "player" as const,
  verb: "cast" as const,
  spellId: "ember",
  spellName: "Ember",
  focusSpent: 4,
  targetId: "enemy-practice-dummy-south-orchard",
  targetName: "Practice Dummy",
  damage: 5,
  targetHealth: 3,
  targetMaxHealth: 8,
};

export const emberBurstFixture: CombatActionResolvedEvent = {
  eventId: "evt-ember-burst-1",
  sequence: 3,
  schemaVersion,
  type: "combat.action_resolved",
  occurredAt: "2026-09-07T20:00:00.000Z",
  audience: "character",
  encounterId: "enc-ember-1",
  presentationKey: "ember-burst",
  narration: formatCombatActionResolvedText(payload),
  payload,
  segments: [
    { kind: "text", text: "You cast " },
    { kind: "spell", id: "ember", text: "Ember" },
    { kind: "text", text: " at the " },
    { kind: "target", id: "enemy-practice-dummy-south-orchard", text: "Practice Dummy" },
    { kind: "text", text: " for " },
    { kind: "damage", text: "5" },
    { kind: "text", text: ". It has 3 remaining." },
  ],
};
