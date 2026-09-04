import { schemaVersion } from "@greenwood/contracts";

export const engineName = "greenwood-game-engine";

export function contractsSchemaVersion(): number {
  return schemaVersion;
}
