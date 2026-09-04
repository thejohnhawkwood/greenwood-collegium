import type { FastifyInstance } from "fastify";
import type { DatabaseStatus } from "../persistence/connection.js";

export type HealthDependencies = {
  databaseStatus: () => Promise<DatabaseStatus>;
};

const defaultHealth: HealthDependencies = {
  async databaseStatus() {
    return "unwired";
  },
};

export async function registerHealthRoutes(
  app: FastifyInstance,
  health: HealthDependencies = defaultHealth,
): Promise<void> {
  app.get("/health/live", async () => ({ status: "ok" as const }));

  app.get("/health/ready", async (_request, reply) => {
    const database = await health.databaseStatus();
    const reasons: string[] = [];
    if (database === "unwired") {
      reasons.push("database unwired");
    }
    if (database === "unreachable") {
      reasons.push("database unreachable");
    }
    reasons.push("content absent");
    return reply.status(503).send({
      status: "not_ready" as const,
      reasons,
    });
  });
}
