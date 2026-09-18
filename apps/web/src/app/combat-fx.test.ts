import { describe, expect, it } from "vitest";
import { schemaVersion, type EventEnvelope } from "@greenwood/contracts";
import {
  equippedWeaponKind,
  fxArtSrc,
  latestCombatAction,
  resolveCombatFx,
  woundTier,
} from "./combat-fx.js";

function action(overrides: {
  eventId?: string;
  presentationKey?: string;
  payload: Record<string, unknown>;
}): EventEnvelope {
  return {
    eventId: overrides.eventId ?? "evt-fx-1",
    sequence: 1,
    schemaVersion,
    type: "combat.action_resolved",
    occurredAt: "2026-09-18T16:00:00.000Z",
    audience: "character",
    encounterId: "enc-1",
    narration: "A combat result.",
    presentationKey: overrides.presentationKey,
    payload: {
      encounterId: "enc-1",
      actorId: "char-1",
      actorName: "Fern",
      actorKind: "player",
      targetId: "enemy-practice-dummy-south-orchard",
      targetName: "Practice Dummy",
      damage: 0,
      targetHealth: 8,
      targetMaxHealth: 8,
      ...overrides.payload,
    },
  };
}

describe("combat FX catalog", () => {
  it("maps equipped names to the live weapon kinds", () => {
    expect(equippedWeaponKind("Practice Sword")).toBe("sword");
    expect(equippedWeaponKind("Practice Staff")).toBe("staff");
    expect(equippedWeaponKind("Practice Sling")).toBe("sling");
    expect(equippedWeaponKind(undefined)).toBe("fist");
    expect(equippedWeaponKind("Small Copper Key")).toBe("fist");
  });

  it("tiers wounds from current foe vitals", () => {
    expect(woundTier(8, 8)).toBeNull();
    expect(woundTier(5, 8)).toBe("shred");
    expect(woundTier(3, 8)).toBe("seep");
    expect(woundTier(1, 8)).toBe("blacken");
    expect(woundTier(0, 8)).toBe("blacken");
  });

  it("plays a sword swing and foe shake on a damaging attack", () => {
    const fx = resolveCombatFx({
      event: action({ payload: { verb: "attack", damage: 3, targetHealth: 5 } }),
      equipped: "Practice Sword",
      health: 5,
      maxHealth: 8,
    });
    expect(fx.weapon).toBe(fxArtSrc("weapon-sword"));
    expect(fx.impact).toBe(fxArtSrc("impact-burst"));
    expect(fx.shakeTarget).toBe("foe");
    expect(fx.motion).toBe("swing");
    expect(fx.wound).toBe(fxArtSrc("wound-shred"));
  });

  it("does not shake or flash on defend", () => {
    const fx = resolveCombatFx({
      event: action({ payload: { verb: "defend", damage: 0 } }),
      equipped: "Practice Sword",
      health: 8,
      maxHealth: 8,
    });
    expect(fx.weapon).toBeUndefined();
    expect(fx.impact).toBeUndefined();
    expect(fx.shakeTarget).toBeNull();
    expect(fx.wound).toBeUndefined();
  });

  it("maps unique enemy spells and self spells", () => {
    const ember = resolveCombatFx({
      event: action({
        presentationKey: "ember-burst",
        payload: { verb: "cast", spellId: "ember", spellName: "Ember", damage: 5, targetHealth: 3 },
      }),
      health: 3,
      maxHealth: 8,
    });
    expect(ember.spell).toBe(fxArtSrc("ember-burst"));
    expect(ember.motion).toBe("pulse");
    expect(ember.shakeTarget).toBe("foe");
    const bind = resolveCombatFx({
      event: action({
        presentationKey: "thorn-bind",
        payload: { verb: "cast", spellId: "bind", spellName: "Bind", damage: 3, targetHealth: 5 },
      }),
      health: 5,
      maxHealth: 8,
    });
    expect(bind.spell).toBe(fxArtSrc("thorn-bind"));
    expect(bind.motion).toBe("grow");
    const ward = resolveCombatFx({
      event: action({
        presentationKey: "hearth-ward",
        payload: { verb: "cast", spellId: "hearth-ward", spellName: "Hearth Ward", damage: 0 },
      }),
      health: 8,
      maxHealth: 8,
    });
    expect(ward.spell).toBe(fxArtSrc("hearth-ward"));
    expect(ward.motion).toBe("self");
    expect(ward.shakeTarget).toBeNull();
  });

  it("shakes the player doll when the foe lands a hit", () => {
    const fx = resolveCombatFx({
      event: action({
        payload: {
          verb: "attack",
          actorKind: "enemy",
          actorName: "Practice Dummy",
          damage: 2,
          targetHealth: 6,
        },
      }),
      health: 8,
      maxHealth: 8,
    });
    expect(fx.shakeTarget).toBe("self");
    expect(fx.impact).toBe(fxArtSrc("impact-burst"));
    expect(fx.weapon).toBeUndefined();
  });

  it("shows a skull when foe health is already zero", () => {
    const fx = resolveCombatFx({ health: 0, maxHealth: 8 });
    expect(fx.defeat).toBe(fxArtSrc("defeat-skull"));
    expect(fx.wound).toBe(fxArtSrc("wound-blacken"));
  });

  it("reads the latest combat action from the transcript", () => {
    const first = action({ eventId: "evt-a", payload: { verb: "attack", damage: 1 } });
    const second = action({
      eventId: "evt-b",
      presentationKey: "ember-burst",
      payload: { verb: "cast", damage: 5 },
    });
    expect(
      latestCombatAction([
        { id: "look", kind: "narration", text: "A dummy waits." },
        { id: "evt-a", kind: "narration", text: "A hit.", event: first },
        { id: "evt-b", kind: "narration", text: "Ember.", event: second },
      ])?.eventId,
    ).toBe("evt-b");
  });
});
