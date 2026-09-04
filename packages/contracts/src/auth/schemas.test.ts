import { describe, expect, it } from "vitest";
import {
  authBootstrapRequestSchema,
  authSignInRequestSchema,
  authStatusSchema,
} from "./schemas.js";

describe("auth contracts", () => {
  it("accepts a classroom bootstrap payload and rejects a short password", () => {
    expect(
      authBootstrapRequestSchema.parse({
        token: "example-token",
        username: "Rowan",
        password: "lantern-path",
      }),
    ).toMatchObject({ username: "Rowan" });
    expect(() => authSignInRequestSchema.parse({ username: "ab", password: "x" })).toThrow();
    expect(
      authStatusSchema.parse({
        signedIn: false,
        allowGuestPlay: true,
        bootstrapOpen: true,
      }),
    ).toEqual({
      signedIn: false,
      allowGuestPlay: true,
      bootstrapOpen: true,
    });
  });
});
