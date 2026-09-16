import type { CharacterVisual } from "@greenwood/contracts";

export type PresencePerson = {
  id: string;
  name: string;
  kind: "npc" | "player" | "object";
  visual?: CharacterVisual;
};

export type PresenceAction = {
  label: string;
  command?: string;
  disabled?: boolean;
  title?: string;
};

export function isHostile(person: PresencePerson): boolean {
  return person.id.startsWith("enemy-") || person.id === "practice-dummy";
}

export function isTakeable(person: PresencePerson): boolean {
  return person.id.startsWith("item-");
}

/** Commands the engine will accept for this token. Typed words stay canonical. */
export function presenceActions(person: PresencePerson): PresenceAction[] {
  const examine = { label: "Examine", command: `examine ${person.name}` };
  if (isHostile(person)) {
    return [
      examine,
      { label: "Attack", command: `attack ${person.name}` },
      { label: "Cast Ember", command: `cast ember ${person.name}` },
    ];
  }
  if (isTakeable(person)) {
    return [examine, { label: "Take", command: `take ${person.name}` }];
  }
  if (person.kind === "object") {
    return [examine];
  }
  if (person.kind === "npc") {
    return [examine, { label: "Talk", command: `talk ${person.name}` }];
  }
  return [
    examine,
    { label: "Talk", command: "say hello" },
    { label: "Ask to duel", disabled: true, title: "Duels come later" },
  ];
}
