import type { WorldState } from "./state.js";

/**
 * H3. One defense of the college, shared by everybody online.
 *
 * This is a process-wide phase, not a per-character quest flag. A teacher calls it,
 * the clock runs in minutes, and when it ends the adults finish what is left. A
 * Collegian who loses a fight loses nothing else: no quest, no ink, no gear, and no
 * room is locked against the students who turned up.
 */

export type DefensePhase = "quiet" | "called" | "fighting" | "closed";

export type CollegeDefense = {
  /** New id per call, so a trophy can only come from the defense it was won in. */
  id: string;
  phase: DefensePhase;
  /** ISO. Absent once the phase is `closed`. */
  endsAt?: string;
  startedByUsername?: string;
};

export const DEFENSE_DEFAULT_MINUTES = 7;
export const DEFENSE_MAX_MINUTES = 7;

/** The three ways in. Raiders come to these and nowhere else. */
export const DEFENSE_GATE_ROOM_IDS = ["lantern-court", "east-meadow", "south-orchard"] as const;

export function defenseMinutes(requested: number | undefined): number {
  const minutes = requested ?? DEFENSE_DEFAULT_MINUTES;
  if (!Number.isFinite(minutes)) {
    return DEFENSE_DEFAULT_MINUTES;
  }
  return Math.min(DEFENSE_MAX_MINUTES, Math.max(1, Math.floor(minutes)));
}

export function minutesLeft(defense: CollegeDefense | undefined, now: Date): number {
  if (!defense?.endsAt) {
    return 0;
  }
  const remaining = new Date(defense.endsAt).getTime() - now.getTime();
  return remaining <= 0 ? 0 : Math.ceil(remaining / 60_000);
}

/**
 * Lazily close a defense whose clock has run out. Called before anything reads the
 * phase, so a process that missed its own timer still tells the truth.
 */
export function settleDefense(world: WorldState, now: Date): CollegeDefense | undefined {
  const defense = world.defense;
  if (!defense || defense.phase === "quiet" || defense.phase === "closed") {
    return defense;
  }
  if (minutesLeft(defense, now) === 0) {
    world.defense = { ...defense, phase: "closed", endsAt: undefined };
  }
  return world.defense;
}

export function defenseFighting(world: WorldState, now: Date): boolean {
  return settleDefense(world, now)?.phase === "fighting";
}

export function startDefense(
  world: WorldState,
  input: { id: string; minutes?: number; now: Date; startedByUsername?: string },
): CollegeDefense {
  const minutes = defenseMinutes(input.minutes);
  world.defense = {
    id: input.id,
    phase: "fighting",
    endsAt: new Date(input.now.getTime() + minutes * 60_000).toISOString(),
    startedByUsername: input.startedByUsername,
  };
  return world.defense;
}

export function cancelDefense(world: WorldState): CollegeDefense | undefined {
  if (!world.defense) {
    return undefined;
  }
  world.defense = { ...world.defense, phase: "closed", endsAt: undefined };
  return world.defense;
}

/**
 * Restore a persisted phase on boot. A defense whose clock already ran out during the
 * restart comes back `closed`, so the class sees the aftermath rather than a fight
 * nobody is having.
 */
export function restoreDefense(
  world: WorldState,
  defense: CollegeDefense | undefined,
  now: Date,
): void {
  if (!defense) {
    return;
  }
  world.defense = { ...defense };
  settleDefense(world, now);
}

export function alderCallNarration(minutes: number): string {
  const count = minutes === 1 ? "a minute" : `${String(minutes)} minutes`;
  return [
    "Headmaster Alder does not use the hour-bell for this. His voice reaches every room at once, and it is level.",
    "",
    '"Raiders are on the grounds. Three ways in: Lantern Court, the East Meadow, and the South Orchard. Whatever errand you are carrying, put it down. It will keep."',
    "",
    `"Go to a gate. Stand with whoever is already standing there. We have about ${count} before the staff close what is left, and I would rather the yard were held by Collegians than tidied by porters."`,
    "",
    '"Nobody is graded on this. Come back up the path afterward and eat something."',
  ].join("\n");
}

export function alderYardFirstLine(): string {
  return "Alder's voice is still in the room: the yard first. Errands keep. Go to Lantern Court, the East Meadow, or the South Orchard.";
}

export function defenseClosedNarration(): string {
  return [
    "Instructor Flint calls the yard closed in the voice he uses for the end of a lesson, not the end of a battle.",
    "",
    '"That is time. Hands off, step back, let the porters through."',
    "",
    "Porters move up to the three gates with lanterns and long poles and finish what is left, which is what porters are for. Somebody is already sweeping.",
    "",
    "Nothing you were carrying was taken from you.",
  ].join("\n");
}

export function defenseStatusLine(defense: CollegeDefense | undefined, now: Date): string {
  const settled = defense;
  if (!settled || settled.phase === "quiet") {
    return "No defense is called. The grounds are quiet.";
  }
  if (settled.phase === "closed") {
    return "The last defense is closed. The porters finished the gates.";
  }
  const left = minutesLeft(settled, now);
  const by = settled.startedByUsername ? ` Called by ${settled.startedByUsername}.` : "";
  return `A defense is running with about ${String(left)} ${left === 1 ? "minute" : "minutes"} left.${by}`;
}
