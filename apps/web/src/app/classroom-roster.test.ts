import { describe, expect, it } from "vitest";
import {
  rosterCsv,
  sha256Hex,
  unusedInvites,
  unusedStudentTokenText,
  usedInvites,
} from "./classroom-data.js";
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
      inviteReference: "taken",
    },
    {
      accountId: "acct-owner",
      username: "arbird",
      role: "teacher",
      status: "active",
      createdAt: "2026-09-06T00:00:00.000Z",
    },
  ],
};

describe("classroom roster helpers", () => {
  it("separates unused tokens from accepted usernames", () => {
    expect(unusedInvites(classroom).map((invite) => invite.token)).toEqual(["keep-this"]);
    expect(usedInvites(classroom).map((invite) => invite.username)).toEqual(["pip"]);
  });

  it("writes unused student tokens as one token per line", () => {
    expect(unusedStudentTokenText(classroom)).toBe("keep-this\n");
  });

  it("writes usernames and used tokens on the class list csv", async () => {
    const usedHash = await sha256Hex("used-secret");
    const withHash: AuthClassroom = {
      ...classroom,
      invites: classroom.invites.map((invite) =>
        invite.id === "taken" ? { ...invite, token: "used-secret", tokenHash: usedHash } : invite,
      ),
    };
    expect(rosterCsv(withHash)).toBe(
      [
        "username,collegian,role,status,invite_token,invite_token_hash,invite_reference",
        ",,student,unused,keep-this,,open",
        `pip,Pip the Sparrow,student,active,used-secret,${usedHash},taken`,
        "arbird,,teacher,active,,,",
        "",
      ].join("\n"),
    );
  });
});
