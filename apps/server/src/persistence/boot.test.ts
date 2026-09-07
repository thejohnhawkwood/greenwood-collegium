import { describe, expect, it } from "vitest";
import { migrateCliError, productionStartError } from "./boot.js";

describe("production boot", () => {
  it("refuses to start production without a reachable database", () => {
    expect(productionStartError({ databaseUrl: undefined, databaseStatus: "unwired" })).toBe(
      "DATABASE_URL is required in production.",
    );
    expect(
      productionStartError({ databaseUrl: "postgres://example", databaseStatus: "unreachable" }),
    ).toBe("database connection or migration failed");
    expect(
      productionStartError({ databaseUrl: "postgres://example", databaseStatus: "ok" }),
    ).toBeUndefined();
    expect(migrateCliError(undefined)).toBe("DATABASE_URL is required to migrate.");
    expect(migrateCliError("postgres://example")).toBeUndefined();
  });
});
