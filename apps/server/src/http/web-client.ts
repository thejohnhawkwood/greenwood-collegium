import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { FastifyInstance } from "fastify";
import { registerRootRoute } from "./root.js";

export async function registerWebClient(app: FastifyInstance): Promise<void> {
  const webDist = fileURLToPath(new URL("../../../web/dist", import.meta.url));
  if (!existsSync(webDist)) {
    await registerRootRoute(app);
    return;
  }

  await app.register(fastifyStatic, {
    root: webDist,
    wildcard: false,
  });
}
