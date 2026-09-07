import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyInstance } from "fastify";
import { registerRootRoute } from "./root.js";

export type WebClientOptions = {
  webDist?: string;
};

export function resolveWebDist(): string {
  return fileURLToPath(new URL("../../../web/dist", import.meta.url));
}

export async function registerWebClient(
  app: FastifyInstance,
  options: WebClientOptions = {},
): Promise<void> {
  const webDist = options.webDist ?? resolveWebDist();
  if (!existsSync(webDist)) {
    await registerRootRoute(app);
    return;
  }

  let decorateReply = true;
  for (const [folder, prefix] of [
    ["assets", "/assets/"],
    ["frame", "/frame/"],
  ] as const) {
    const root = join(webDist, folder);
    if (!existsSync(root)) {
      continue;
    }
    // Wildcard lookup reads the file on each request so a Vite rebuild
    // can change hashed names without leaving the page on a white screen.
    await app.register(fastifyStatic, {
      root,
      prefix,
      wildcard: true,
      decorateReply,
    });
    decorateReply = false;
  }

  app.get("/", async (_request, reply) => {
    const html = await readFile(join(webDist, "index.html"), "utf8");
    return reply.header("Cache-Control", "no-cache").type("text/html; charset=utf-8").send(html);
  });
}
