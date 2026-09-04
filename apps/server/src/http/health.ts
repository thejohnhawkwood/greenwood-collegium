import type { FastifyInstance } from "fastify";
import type { DatabaseStatus } from "../persistence/connection.js";

export type ContentStatus = "absent" | "ok" | "invalid";

export type HealthDependencies = {
  databaseStatus: () => Promise<DatabaseStatus>;
  contentStatus?: () => ContentStatus;
};

const defaultHealth: HealthDependencies = {
  async databaseStatus() {
    return "unwired";
  },
  contentStatus() {
    return "absent";
  },
};

export async function registerHealthRoutes(
  app: FastifyInstance,
  health: HealthDependencies = defaultHealth,
): Promise<void> {
  const contentStatus = health.contentStatus ?? ((): ContentStatus => "absent");

  app.get("/health/live", async () => ({ status: "ok" as const }));

  app.get("/health/ready", async (_request, reply) => {
    const database = await health.databaseStatus();
    const content = contentStatus();
    const reasons: string[] = [];
    if (database === "unwired") {
      reasons.push("database unwired");
    }
    if (database === "unreachable") {
      reasons.push("database unreachable");
    }
    if (content === "absent") {
      reasons.push("content absent");
    }
    if (content === "invalid") {
      reasons.push("content invalid");
    }
    if (reasons.length > 0) {
      return reply.status(503).send({
        status: "not_ready" as const,
        reasons,
      });
    }
    return { status: "ok" as const };
  });
}
