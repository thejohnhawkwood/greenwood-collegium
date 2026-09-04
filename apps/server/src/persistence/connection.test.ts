import { describe, expect, it } from "vitest";
import { sslForConnection } from "./connection.js";

describe("sslForConnection", () => {
  it("disables SSL for local hosts and enables it otherwise", () => {
    expect(sslForConnection("postgres://greenwood:greenwood@localhost:5432/greenwood")).toBe(false);
    expect(sslForConnection("postgres://greenwood:greenwood@127.0.0.1:5432/greenwood")).toBe(false);
    expect(
      sslForConnection("postgres://greenwood:greenwood@example.internal:5432/greenwood"),
    ).toEqual({
      rejectUnauthorized: false,
    });
  });
});
