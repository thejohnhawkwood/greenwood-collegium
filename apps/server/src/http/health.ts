import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health/live", async () => ({ status: "ok" as const }));

  app.get("/health/ready", async (_request, reply) => {
    return reply.status(503).send({
      status: "not_ready" as const,
      reasons: ["database unwired", "content absent"],
    });
  });
}
