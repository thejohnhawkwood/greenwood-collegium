import type { CombatActionResolvedPayload, EventEnvelope } from "@greenwood/contracts";
import type { TranscriptLine } from "./transcript.js";

export const FX_ART_REV = "combat-fx-1";
export const FX_DIR = "/art/fx";

export const FX_FILES = [
  "weapon-sword",
  "weapon-staff",
  "weapon-sling",
  "weapon-fist",
  "impact-burst",
  "ember-burst",
  "cinder-snap",
  "thorn-bind",
  "briar-lash",
  "steel-strike",
  "steel-riposte",
  "stone-stomp",
  "keystone-blow",
  "stars-flare",
  "azimuth-point",
  "shade-fold",
  "ready-steel",
  "hearth-ward",
  "greenstitch",
  "stone-brace",
  "night-eye",
  "quiet-step",
  "veil-slip",
  "wound-shred",
  "wound-seep",
  "wound-blacken",
  "defeat-skull",
] as const;

export type WeaponKind = "sword" | "staff" | "sling" | "fist";
export type WoundTier = "shred" | "seep" | "blacken";
export type ShakeTarget = "foe" | "self" | null;
export type FxMotion = "swing" | "grow" | "pulse" | "self" | null;

export type CombatFxLayers = {
  weapon?: string;
  spell?: string;
  impact?: string;
  wound?: string;
  defeat?: string;
  shakeTarget: ShakeTarget;
  motion: FxMotion;
};

const SELF_KEYS = new Set([
  "ready-steel",
  "hearth-ward",
  "greenstitch",
  "stone-brace",
  "night-eye",
  "quiet-step",
  "veil-slip",
]);

const ENEMY_SPELL_MOTION: Record<string, FxMotion> = {
  "ember-burst": "pulse",
  "cinder-snap": "pulse",
  "thorn-bind": "grow",
  "briar-lash": "swing",
  "steel-strike": "swing",
  "steel-riposte": "swing",
  "stone-stomp": "pulse",
  "keystone-blow": "pulse",
  "stars-flare": "pulse",
  "azimuth-point": "swing",
  "shade-fold": "grow",
};

export function fxArtSrc(id: string): string {
  return `${FX_DIR}/${id}.png?v=${FX_ART_REV}`;
}

export function equippedWeaponKind(equipped?: string): WeaponKind {
  const name = equipped ?? "";
  if (/sword/i.test(name)) return "sword";
  if (/staff/i.test(name)) return "staff";
  if (/sling/i.test(name)) return "sling";
  return "fist";
}

export function woundTier(health: number, maxHealth: number): WoundTier | null {
  if (maxHealth <= 0 || health > maxHealth) return null;
  if (health <= 0) return "blacken";
  const ratio = health / maxHealth;
  if (ratio <= 0.2) return "blacken";
  if (ratio <= 0.4) return "seep";
  if (ratio <= 0.66) return "shred";
  return null;
}

export function latestCombatAction(lines: readonly TranscriptLine[]): EventEnvelope | undefined {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const event = lines[index]?.event;
    if (event?.type === "combat.action_resolved") return event;
  }
  return undefined;
}

function actionPayload(event?: EventEnvelope): CombatActionResolvedPayload | undefined {
  if (!event || event.type !== "combat.action_resolved") return undefined;
  const payload = event.payload;
  if (!payload || typeof payload !== "object") return undefined;
  const verb = "verb" in payload ? payload.verb : undefined;
  if (verb !== "attack" && verb !== "cast" && verb !== "defend" && verb !== "flee") {
    return undefined;
  }
  return payload as CombatActionResolvedPayload;
}

export function resolveCombatFx(input: {
  event?: EventEnvelope;
  equipped?: string;
  health: number;
  maxHealth: number;
}): CombatFxLayers {
  const wound = woundTier(input.health, input.maxHealth);
  const layers: CombatFxLayers = {
    wound: wound ? fxArtSrc(`wound-${wound}`) : undefined,
    defeat: input.health <= 0 ? fxArtSrc("defeat-skull") : undefined,
    shakeTarget: null,
    motion: null,
  };
  const payload = actionPayload(input.event);
  if (!payload || payload.verb === "defend" || payload.verb === "flee") {
    return layers;
  }
  const damaging = payload.damage > 0;
  if (payload.actorKind === "enemy") {
    if (damaging) {
      layers.impact = fxArtSrc("impact-burst");
      layers.shakeTarget = "self";
      layers.motion = "pulse";
    }
    return layers;
  }
  if (payload.verb === "attack") {
    if (!damaging) return layers;
    layers.weapon = fxArtSrc(`weapon-${equippedWeaponKind(input.equipped)}`);
    layers.impact = fxArtSrc("impact-burst");
    layers.shakeTarget = "foe";
    layers.motion = "swing";
    return layers;
  }
  const key = input.event?.presentationKey;
  if (!key) return layers;
  if (SELF_KEYS.has(key)) {
    layers.spell = fxArtSrc(key);
    layers.motion = "self";
    return layers;
  }
  const motion = ENEMY_SPELL_MOTION[key];
  if (!motion) return layers;
  layers.spell = fxArtSrc(key);
  layers.motion = motion;
  if (damaging) {
    layers.impact = fxArtSrc("impact-burst");
    layers.shakeTarget = "foe";
  }
  return layers;
}
