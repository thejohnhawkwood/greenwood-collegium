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

  it("reports database unreachable when the ping fails", async () => {
    app = await buildApp({
      databaseStatus: async () => "unreachable",
    });
    const response = await app.inject({ method: "GET", url: "/health/ready" });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: "not_ready",
      reasons: ["database unreachable", "content absent"],
    });
  });

  it("keeps content absent after the database is reachable", async () => {
    app = await buildApp({
      databaseStatus: async () => "ok",
    });
    const response = await app.inject({ method: "GET", url: "/health/ready" });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: "not_ready",
      reasons: ["content absent"],
    });
  });

  it("drops content absent when rooms load and the database is unwired", async () => {
    app = await buildApp({
      databaseStatus: async () => "unwired",
      contentStatus: () => "ok",
    });
    const response = await app.inject({ method: "GET", url: "/health/ready" });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: "not_ready",
      reasons: ["database unwired"],
    });
  });

  it("reports content invalid when the loader fails", async () => {
    app = await buildApp({
      databaseStatus: async () => "ok",
      contentStatus: () => "invalid",
    });
    const response = await app.inject({ method: "GET", url: "/health/ready" });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: "not_ready",
      reasons: ["content invalid"],
    });
  });

  it("reports ready when the database pings and content loads", async () => {
    app = await buildApp({
      databaseStatus: async () => "ok",
      contentStatus: () => "ok",
    });
    const response = await app.inject({ method: "GET", url: "/health/ready" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
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
