import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const blueprint = readFileSync(
  fileURLToPath(new URL("../../../../render.yaml", import.meta.url)),
  "utf8",
);

describe("Render Blueprint", () => {
  it("migrates before start, checks ready, and keeps secrets out of the file", () => {
    expect(blueprint).toContain("preDeployCommand: pnpm --filter @greenwood/server db:migrate");
    expect(blueprint).toContain("healthCheckPath: /health/ready");
    expect(blueprint).toContain("startCommand: pnpm --filter @greenwood/server start");
    expect(blueprint).toContain('postgresMajorVersion: "18"');
    expect(blueprint).toContain("plan: starter");
    expect(blueprint).toContain("plan: basic-256mb");
    expect(blueprint).not.toContain("plan: free");
    expect(blueprint).not.toMatch(/postgres:\/\/[^\s]+@/);
    expect(blueprint).not.toMatch(/SESSION_SECRET:\s*\n\s+value:/);
  });
});
