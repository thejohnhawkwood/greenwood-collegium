import Fastify from "fastify";
import { registerHealthRoutes } from "./http/health.js";
import { registerRootRoute } from "./http/root.js";
import { registerVersionRoutes } from "./http/version.js";

export async function buildApp() {
  const app = Fastify({ logger: true });
  await registerRootRoute(app);
  await registerHealthRoutes(app);
  await registerVersionRoutes(app);
  return app;
}
