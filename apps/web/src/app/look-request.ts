import { schemaVersion, type CommandRequest } from "@greenwood/contracts";

export function createLookRequest(commandId: string): CommandRequest {
  return {
    schemaVersion,
    commandId,
    raw: "look",
    lastSequence: 0,
    interfaceMode: "classic",
  };
}
