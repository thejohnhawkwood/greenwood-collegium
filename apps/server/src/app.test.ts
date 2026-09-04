import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("health-only server", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("serves a foundation page at /", async () => {
    app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/" });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/html/);
    expect(response.body).toContain("The Greenwood Collegium");
    expect(response.body).toContain("not a playable game yet");
  });

  it("reports live", async () => {
    app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/health/live" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("reports not ready until later tickets", async () => {
    app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/health/ready" });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: "not_ready",
      reasons: ["database unwired", "content absent"],
    });
  });

  it("returns a safe version payload", async () => {
    app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/version" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      name: "greenwood-collegium",
      worldVersion: "dev",
      schemaVersion: 0,
      engine: "greenwood-game-engine",
    });
  });
});
