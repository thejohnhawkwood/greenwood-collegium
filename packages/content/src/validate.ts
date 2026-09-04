import { START_ROOM_ID, type RoomFile } from "./schema.js";

export type ContentIssue = {
  code: string;
  message: string;
  roomId?: string;
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
