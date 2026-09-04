import Fastify from "fastify";
import { registerHealthRoutes } from "./http/health.js";
import { registerVersionRoutes } from "./http/version.js";
import { registerWebClient } from "./http/web-client.js";

export async function buildApp() {
  const app = Fastify({ logger: true });
  await registerHealthRoutes(app);
  await registerVersionRoutes(app);
  await registerWebClient(app);
  return app;
}
