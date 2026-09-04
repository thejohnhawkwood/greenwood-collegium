import { schemaVersion, type CommandRequest } from "@greenwood/contracts";

export function createCommandRequest(
  commandId: string,
  raw: string,
  lastSequence: number,
): CommandRequest {
  return {
    schemaVersion,
    commandId,
    raw,
    lastSequence,
    interfaceMode: "classic",
  };
}
