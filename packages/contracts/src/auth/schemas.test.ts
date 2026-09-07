import { describe, expect, it } from "vitest";
import {
  authBootstrapRequestSchema,
  authClassroomSchema,
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
      authSignInRequestSchema.parse({
        username: "rowan",
        password: "lantern-path",
        audience: "staff",
      }),
    ).toMatchObject({ audience: "staff" });
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
    expect(
      authClassroomSchema.parse({
        persistence: "memory",
        invites: [
          {
            id: "invite-1",
            role: "student",
            status: "unused",
            createdAt: "2026-09-07T00:00:00.000Z",
            expiresAt: "2026-09-14T00:00:00.000Z",
            token: "unused-token",
          },
        ],
        accounts: [],
      }),
    ).toMatchObject({ persistence: "memory" });
  });
});
