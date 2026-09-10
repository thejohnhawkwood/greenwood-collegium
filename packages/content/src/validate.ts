import type { EnemyPlacement, EnemyTemplate } from "./enemy-schema.js";
import type { ItemPlacement, ItemTemplate } from "./item-schema.js";
import { START_ROOM_ID, type RoomFile } from "./schema.js";
import type { QuestTemplate } from "./quest-schema.js";
import type { SpellTemplate } from "./spell-schema.js";

export type ContentIssue = {
  code: string;
  message: string;
  roomId?: string;
  itemId?: string;
  enemyId?: string;
  spellId?: string;
  questId?: string;
  fileName?: string;
};

export class ContentValidationError extends Error {
  readonly issues: ContentIssue[];

  constructor(issues: ContentIssue[]) {
    super(issues.map((issue) => issue.message).join("\n"));
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

export type NamedRoom = {
  fileName: string;
  room: RoomFile;
};

export function validateWorld(namedRooms: NamedRoom[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const roomsById = new Map<string, NamedRoom>();

  for (const named of namedRooms) {
    const stem = named.fileName.replace(/\.json$/u, "");
    if (stem !== named.room.id) {
      issues.push({
        code: "id_filename_mismatch",
        message: `${named.fileName} must be named ${named.room.id}.json`,
        roomId: named.room.id,
        fileName: named.fileName,
      });
    }

    const existing = roomsById.get(named.room.id);
    if (existing) {
      issues.push({
        code: "duplicate_id",
        message: `duplicate room id ${named.room.id}`,
        roomId: named.room.id,
        fileName: named.fileName,
      });
    } else {
      roomsById.set(named.room.id, named);
    }
  }

  if (!roomsById.has(START_ROOM_ID)) {
    issues.push({
      code: "missing_start_room",
      message: `required start room ${START_ROOM_ID} is missing`,
      roomId: START_ROOM_ID,
    });
  }

  const fixtureIds = new Map<string, string>();
  const mapped = new Map<string, string>();

  for (const named of namedRooms) {
    for (const exit of named.room.exits) {
      if (!roomsById.has(exit.toRoomId)) {
        issues.push({
          code: "missing_exit_target",
          message: `${named.room.id} exit ${exit.direction} points at unknown room ${exit.toRoomId}`,
          roomId: named.room.id,
          fileName: named.fileName,
        });
      }
    }

    for (const fixture of named.room.fixtures) {
      const owner = fixtureIds.get(fixture.id);
      if (owner) {
        issues.push({
          code: "duplicate_fixture",
          message: `duplicate fixture id ${fixture.id}`,
          roomId: named.room.id,
          fileName: named.fileName,
        });
      } else {
        fixtureIds.set(fixture.id, named.room.id);
      }
    }

    if (named.room.map) {
      const key = `${String(named.room.map.x)},${String(named.room.map.y)}`;
      const owner = mapped.get(key);
      if (owner) {
        issues.push({
          code: "duplicate_coordinates",
          message: `${named.room.id} shares map coordinates ${key} with ${owner}`,
          roomId: named.room.id,
          fileName: named.fileName,
        });
      } else {
        mapped.set(key, named.room.id);
      }
    }
  }

  if (roomsById.has(START_ROOM_ID)) {
    const reachable = new Set<string>();
    const queue = [START_ROOM_ID];
    reachable.add(START_ROOM_ID);
    while (queue.length > 0) {
      const roomId = queue.shift();
      if (!roomId) {
        break;
      }
      const named = roomsById.get(roomId);
      if (!named) {
        continue;
      }
      for (const exit of named.room.exits) {
        if (roomsById.has(exit.toRoomId) && !reachable.has(exit.toRoomId)) {
          reachable.add(exit.toRoomId);
          queue.push(exit.toRoomId);
        }
      }
    }

    for (const roomId of roomsById.keys()) {
      if (!reachable.has(roomId)) {
        issues.push({
          code: "unreachable_room",
          message: `${roomId} is not reachable from ${START_ROOM_ID}`,
          roomId,
          fileName: roomsById.get(roomId)?.fileName,
        });
      }
    }
  }

  return issues;
}

export type NamedTemplate = {
  fileName: string;
  template: ItemTemplate;
};

export type NamedPlacement = {
  fileName: string;
  placement: ItemPlacement;
};

export function validateCatalog(
  namedRooms: NamedRoom[],
  namedTemplates: NamedTemplate[],
  namedPlacements: NamedPlacement[],
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const roomIds = new Set(namedRooms.map((named) => named.room.id));
  const templatesById = new Map<string, NamedTemplate>();

  for (const named of namedTemplates) {
    const stem = named.fileName.replace(/\.json$/u, "");
    if (stem !== named.template.id) {
      issues.push({
        code: "id_filename_mismatch",
        message: `${named.fileName} must be named ${named.template.id}.json`,
        itemId: named.template.id,
        fileName: named.fileName,
      });
    }
    if (templatesById.has(named.template.id)) {
      issues.push({
        code: "duplicate_id",
        message: `duplicate item template ${named.template.id}`,
        itemId: named.template.id,
        fileName: named.fileName,
      });
    } else {
      templatesById.set(named.template.id, named);
    }
  }

  const placementsById = new Map<string, NamedPlacement>();
  for (const named of namedPlacements) {
    const stem = named.fileName.replace(/\.json$/u, "");
    if (stem !== named.placement.id) {
      issues.push({
        code: "id_filename_mismatch",
        message: `${named.fileName} must be named ${named.placement.id}.json`,
        itemId: named.placement.id,
        fileName: named.fileName,
      });
    }
    if (placementsById.has(named.placement.id)) {
      issues.push({
        code: "duplicate_id",
        message: `duplicate item instance ${named.placement.id}`,
        itemId: named.placement.id,
        fileName: named.fileName,
      });
    } else {
      placementsById.set(named.placement.id, named);
    }
    if (!templatesById.has(named.placement.templateId)) {
      issues.push({
        code: "unknown_item_template",
        message: `${named.placement.id} uses unknown template ${named.placement.templateId}`,
        itemId: named.placement.id,
        fileName: named.fileName,
      });
    }
    if (!roomIds.has(named.placement.roomId)) {
      issues.push({
        code: "missing_reference",
        message: `${named.placement.id} is placed in unknown room ${named.placement.roomId}`,
        itemId: named.placement.id,
        roomId: named.placement.roomId,
        fileName: named.fileName,
      });
    }
  }

  return issues;
}

export type NamedEnemyTemplate = {
  fileName: string;
  template: EnemyTemplate;
};

export type NamedEnemyPlacement = {
  fileName: string;
  placement: EnemyPlacement;
};

export function validateBestiary(
  namedRooms: NamedRoom[],
  namedTemplates: NamedEnemyTemplate[],
  namedPlacements: NamedEnemyPlacement[],
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const roomIds = new Set(namedRooms.map((named) => named.room.id));
  const templatesById = new Map<string, NamedEnemyTemplate>();

  for (const named of namedTemplates) {
    const stem = named.fileName.replace(/\.json$/u, "");
    if (stem !== named.template.id) {
      issues.push({
        code: "id_filename_mismatch",
        message: `${named.fileName} must be named ${named.template.id}.json`,
        enemyId: named.template.id,
        fileName: named.fileName,
      });
    }
    if (templatesById.has(named.template.id)) {
      issues.push({
        code: "duplicate_id",
        message: `duplicate enemy template ${named.template.id}`,
        enemyId: named.template.id,
        fileName: named.fileName,
      });
    } else {
      templatesById.set(named.template.id, named);
    }
  }

  const placementsById = new Map<string, NamedEnemyPlacement>();
  for (const named of namedPlacements) {
    const stem = named.fileName.replace(/\.json$/u, "");
    if (stem !== named.placement.id) {
      issues.push({
        code: "id_filename_mismatch",
        message: `${named.fileName} must be named ${named.placement.id}.json`,
        enemyId: named.placement.id,
        fileName: named.fileName,
      });
    }
    if (placementsById.has(named.placement.id)) {
      issues.push({
        code: "duplicate_id",
        message: `duplicate enemy instance ${named.placement.id}`,
        enemyId: named.placement.id,
        fileName: named.fileName,
      });
    } else {
      placementsById.set(named.placement.id, named);
    }
    if (!templatesById.has(named.placement.templateId)) {
      issues.push({
        code: "unknown_enemy_template",
        message: `${named.placement.id} uses unknown template ${named.placement.templateId}`,
        enemyId: named.placement.id,
        fileName: named.fileName,
      });
    }
    if (!roomIds.has(named.placement.roomId)) {
      issues.push({
        code: "missing_reference",
        message: `${named.placement.id} is placed in unknown room ${named.placement.roomId}`,
        enemyId: named.placement.id,
        roomId: named.placement.roomId,
        fileName: named.fileName,
      });
    }
  }

  return issues;
}

export type NamedSpell = {
  fileName: string;
  template: SpellTemplate;
};

export function validateSpells(namedSpells: NamedSpell[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const spellsById = new Map<string, NamedSpell>();

  for (const named of namedSpells) {
    const stem = named.fileName.replace(/\.json$/u, "");
    if (stem !== named.template.id) {
      issues.push({
        code: "id_filename_mismatch",
        message: `${named.fileName} must be named ${named.template.id}.json`,
        spellId: named.template.id,
        fileName: named.fileName,
      });
    }
    if (spellsById.has(named.template.id)) {
      issues.push({
        code: "duplicate_id",
        message: `duplicate spell template ${named.template.id}`,
        spellId: named.template.id,
        fileName: named.fileName,
      });
    } else {
      spellsById.set(named.template.id, named);
    }
  }

  return issues;
}

export type NamedQuest = {
  fileName: string;
  template: QuestTemplate;
};

export function validateQuests(
  namedRooms: NamedRoom[],
  namedTemplates: NamedTemplate[],
  namedQuests: NamedQuest[],
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const roomIds = new Set(namedRooms.map((named) => named.room.id));
  const itemTemplateIds = new Set(namedTemplates.map((named) => named.template.id));
  const questsById = new Map<string, NamedQuest>();
  const fixtures = new Map(
    namedRooms.flatMap(({ room }) =>
      room.fixtures.map((fixture) => [fixture.id, { fixture, roomId: room.id }] as const),
    ),
  );

  for (const named of namedQuests) {
    const stem = named.fileName.replace(/\.json$/u, "");
    if (stem !== named.template.id) {
      issues.push({
        code: "id_filename_mismatch",
        message: `${named.fileName} must be named ${named.template.id}.json`,
        questId: named.template.id,
        fileName: named.fileName,
      });
    }
    if (questsById.has(named.template.id)) {
      issues.push({
        code: "duplicate_id",
        message: `duplicate quest template ${named.template.id}`,
        questId: named.template.id,
        fileName: named.fileName,
      });
    } else {
      questsById.set(named.template.id, named);
    }

    const giver = named.template.giverNpcId ? fixtures.get(named.template.giverNpcId) : undefined;
    if (named.template.giverNpcId && (giver?.fixture.kind !== "npc" || !giver.fixture.dialogue)) {
      issues.push({
        code: "missing_reference",
        message: `${named.template.id} needs a speaking NPC giver: ${named.template.giverNpcId}`,
        questId: named.template.id,
        fileName: named.fileName,
      });
    }
    for (const objective of named.template.objectives) {
      if (objective.kind === "examine" || objective.kind === "talk") {
        const target = objective.targetId ? fixtures.get(objective.targetId) : undefined;
        if (
          !target ||
          (objective.kind === "talk" &&
            (target.fixture.kind !== "npc" || !target.fixture.dialogue)) ||
          (objective.roomId && target.roomId !== objective.roomId)
        ) {
          issues.push({
            code: "missing_reference",
            message: `${named.template.id} has an unavailable ${objective.kind} target: ${objective.targetId ?? "missing"}`,
            questId: named.template.id,
            fileName: named.fileName,
          });
        }
      }
      if (objective.roomId && !roomIds.has(objective.roomId)) {
        issues.push({
          code: "missing_reference",
          message: `${named.template.id} visits unknown room ${objective.roomId}`,
          questId: named.template.id,
          roomId: objective.roomId,
          fileName: named.fileName,
        });
      }
      if (
        objective.kind === "take" &&
        objective.itemTemplateId &&
        !itemTemplateIds.has(objective.itemTemplateId)
      ) {
        issues.push({
          code: "unknown_item_template",
          message: `${named.template.id} takes unknown template ${objective.itemTemplateId}`,
          questId: named.template.id,
          itemId: objective.itemTemplateId,
          fileName: named.fileName,
        });
      }
    }
  }

  return issues;
}
