import { describe, expect, it } from "vitest";
import { unusedInvites, usedInvites } from "./classroom-data.js";
import type { AuthClassroom } from "@greenwood/contracts";

const classroom: AuthClassroom = {
  persistence: "memory",
  invites: [
    {
      id: "open",
      role: "student",
      status: "unused",
      createdAt: "2026-09-07T00:00:00.000Z",
      expiresAt: "2026-09-14T00:00:00.000Z",
      token: "keep-this",
    },
    {
      id: "taken",
      role: "student",
      status: "used",
      createdAt: "2026-09-06T00:00:00.000Z",
      expiresAt: "2026-09-13T00:00:00.000Z",
      username: "pip",
    },
  ],
  accounts: [
    {
      accountId: "acct-pip",
      username: "pip",
      role: "student",
      status: "active",
      createdAt: "2026-09-06T00:00:00.000Z",
      characterName: "Pip the Sparrow",
    },
  ],
};

describe("classroom roster helpers", () => {
  it("separates unused tokens from accepted usernames", () => {
    expect(unusedInvites(classroom).map((invite) => invite.token)).toEqual(["keep-this"]);
    expect(usedInvites(classroom).map((invite) => invite.username)).toEqual(["pip"]);
  });
});
