import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("health-only server", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
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
