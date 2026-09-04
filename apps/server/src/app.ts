import Fastify from "fastify";
import { registerHealthRoutes, type HealthDependencies } from "./http/health.js";
import { registerVersionRoutes } from "./http/version.js";
import { registerWebClient } from "./http/web-client.js";

export async function buildApp(health?: HealthDependencies) {
  const app = Fastify({ logger: true });
  await registerHealthRoutes(app, health);
  await registerVersionRoutes(app);
  await registerWebClient(app);
  return app;
}
