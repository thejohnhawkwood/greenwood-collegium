import { Readable } from "node:stream";
import {
  moderationActionSchema,
  resetRequestSchema,
  speechQuerySchema,
} from "@greenwood/contracts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { AuthService } from "../auth/service.js";
import { parseCookie, SESSION_COOKIE } from "../auth/cookies.js";
import {
  CLASSROOM_TIME_ZONE,
  ClassroomError,
  type ClassroomService,
} from "../application/classroom.js";
import type { RunExclusive } from "../application/operation-queue.js";

export async function registerClassroomRoutes(
  app: FastifyInstance,
  deps: { auth: AuthService; classroom: ClassroomService; runExclusive: RunExclusive },
) {
  async function actor(request: FastifyRequest) {
    const token = parseCookie(request.headers.cookie, SESSION_COOKIE);
    const session = token ? await deps.auth.resolveSession(token) : undefined;
    if (!session) throw new ClassroomError(401, "Sign in to continue.");
    await deps.classroom.staff(session.account.id);
    return session.account.id;
  }
  function route(
    method: "GET" | "POST",
    url: string,
    handler: (request: FastifyRequest, reply: FastifyReply, actorId: string) => Promise<unknown>,
  ) {
    app.route({
      method,
      url,
      handler: async (request, reply) => {
        reply.header("Cache-Control", "no-store");
        const execute = async () => {
          try {
            return await handler(request, reply, await actor(request));
          } catch (error) {
            if (error instanceof ClassroomError)
              return reply.status(error.status).send({ message: error.message });
            app.log.error({ event: "classroom_operation_failed" }, "classroom operation failed");
            return reply.status(503).send({
              message: "The classroom operation could not be completed. Refresh before retrying.",
            });
          }
        };
        return method === "POST" ? deps.runExclusive(execute) : execute();
      },
    });
  }
  route("POST", "/admin/action", async (request, reply, actorId) => {
    const parsed = moderationActionSchema.safeParse(request.body);
    if (!parsed.success)
      return reply.status(400).send({ message: "Choose a valid classroom action." });
    await deps.classroom.moderate(actorId, parsed.data);
    return { ok: true };
  });
  route("GET", "/admin/reset-preview", async (_request, _reply, actorId) =>
    deps.classroom.resetPreview(actorId),
  );
  route("POST", "/admin/reset", async (request, reply, actorId) => {
    const parsed = resetRequestSchema.safeParse(request.body);
    if (!parsed.success)
      return reply
        .status(400)
        .send({ message: "Review the reset preview and type RESET STUDENTS." });
    return deps.classroom.resetStudents(actorId, parsed.data.revision);
  });
  route("GET", "/admin/speech/days", async (_request, _reply, actorId) => ({
    days: await deps.classroom.days(actorId),
    timeZone: CLASSROOM_TIME_ZONE,
    retentionMonths: 6,
  }));
  route("GET", "/admin/speech", async (request, reply, actorId) => {
    const parsed = speechQuerySchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send({ message: "Choose a valid day." });
    return deps.classroom.speech(actorId, parsed.data);
  });
  route("GET", "/admin/speech/export", async (request, reply, actorId) => {
    const parsed = speechQuerySchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send({ message: "Choose a valid day." });
    const query = parsed.data;
    reply
      .header("X-Content-Type-Options", "nosniff")
      .header("Content-Disposition", `attachment; filename="greenwood-say-${query.day}.txt"`)
      .type("text/plain; charset=utf-8");
    async function* text() {
      yield `Greenwood realm speech — ${query.day} (${CLASSROOM_TIME_ZONE})\nRetained for six calendar months. Store this export privately outside the repository.\n\n`;
      let after = 0;
      while (true) {
        const page = await deps.classroom.speech(actorId, { ...query, after });
        for (const row of page.records) {
          yield `${row.occurredAt} | ${row.roomId} | ${row.characterName} | login ${row.username} | invite ${row.inviteReference ?? "none"} | account ${row.accountId} | character ${row.characterId}\n  ${row.text}\n\n`;
          after = row.id;
        }
        if (!page.hasMore) break;
      }
    }
    return reply.send(Readable.from(text()));
  });
  route("GET", "/admin/audit", async (_request, _reply, actorId) => ({
    records: await deps.classroom.audit(actorId),
  }));
}
