import { schemaVersion } from "@greenwood/contracts";
import { engineName } from "@greenwood/game-engine";
import type { FastifyInstance } from "fastify";

export async function registerVersionRoutes(app: FastifyInstance): Promise<void> {
  app.get("/version", async () => ({
    name: "greenwood-collegium",
    worldVersion: process.env.WORLD_VERSION ?? "dev",
    schemaVersion,
    engine: engineName,
  }));
}
