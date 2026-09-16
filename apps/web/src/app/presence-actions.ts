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
export function presenceActions(
  person: PresencePerson,
  gift?: { id: string; name: string },
  gifts?: readonly { id: string; name: string }[],
): PresenceAction[] {
  const examine = { label: "Examine", command: `examine ${person.name}` };
  if (isHostile(person)) {
    const kit = gifts?.length ? gifts : gift ? [gift] : [{ id: "ember", name: "Ember" }];
    return [
      examine,
      { label: "Attack", command: `attack ${person.name}` },
      ...kit.map((spell) => ({
        label: `Cast ${spell.name}`,
        command: `cast ${spell.id} ${person.name}`,
      })),
    ];
  }
  if (isTakeable(person)) {
    return [examine, { label: "Take", command: `take ${person.name}` }];
  }
  if (person.kind === "object") {
    if (person.id === "object-courtyard-well" || /well/i.test(person.name)) {
      return [examine, { label: "Drink", command: `drink ${person.name}` }];
    }
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
