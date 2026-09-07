import Fastify from "fastify";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { registerWebClient } from "./web-client.js";

describe("web client static files", () => {
  const apps: Array<Awaited<ReturnType<typeof Fastify>>> = [];
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("serves hashed assets written after the server starts", async () => {
    const webDist = await mkdtemp(join(tmpdir(), "greenwood-web-"));
    dirs.push(webDist);
    await mkdir(join(webDist, "assets"));
    await mkdir(join(webDist, "frame"));
    await writeFile(
      join(webDist, "index.html"),
      `<!doctype html><title>The Greenwood Collegium</title><script src="/assets/index-old.js"></script>`,
    );
    await writeFile(join(webDist, "assets", "index-old.js"), "old");
    await writeFile(join(webDist, "frame", "bough-left.jpg"), "left");

    const app = Fastify();
    apps.push(app);
    await registerWebClient(app, { webDist });

    await writeFile(
      join(webDist, "index.html"),
      `<!doctype html><title>The Greenwood Collegium</title><script src="/assets/index-new.js"></script>`,
    );
    await writeFile(join(webDist, "assets", "index-new.js"), "new");

    const page = await app.inject({ method: "GET", url: "/" });
    expect(page.statusCode).toBe(200);
    expect(page.headers["cache-control"]).toBe("no-cache");
    expect(page.body).toContain("/assets/index-new.js");

    const late = await app.inject({ method: "GET", url: "/assets/index-new.js" });
    expect(late.statusCode).toBe(200);
    expect(late.body).toBe("new");

    const frame = await app.inject({ method: "GET", url: "/frame/bough-left.jpg" });
    expect(frame.statusCode).toBe(200);
    expect(frame.body).toBe("left");
  });

  it("keeps the foundation page when the web build is absent", async () => {
    const app = Fastify();
    apps.push(app);
    await registerWebClient(app, { webDist: join(tmpdir(), "greenwood-missing-web-dist") });
    const response = await app.inject({ method: "GET", url: "/" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("Repository foundation");
  });
});
