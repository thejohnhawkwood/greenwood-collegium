import { describe, expect, it } from "vitest";
import {
  classroomChat,
  rosterCsv,
  rosterRows,
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
      token: "used-this",
      username: "pip",
      characterName: "Pip the Sparrow",
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
    {
      accountId: "acct-owner",
      username: "owner",
      role: "teacher",
      status: "active",
      createdAt: "2026-09-05T00:00:00.000Z",
      characterName: "Bramble the Hedgehog",
    },
  ],
  chat: [
    {
      id: "chat-1",
      at: "2026-09-09T16:00:00.000Z",
      username: "pip",
      characterName: "Pip the Sparrow",
      roomId: "lantern-court",
      text: "hello courtyard",
    },
  ],
};

describe("classroom roster helpers", () => {
  it("separates unused tokens from accepted usernames", () => {
    expect(unusedInvites(classroom).map((invite) => invite.token)).toEqual(["keep-this"]);
    expect(usedInvites(classroom).map((invite) => invite.username)).toEqual(["pip"]);
  });

  it("returns stored room chat for the teacher table", () => {
    expect(classroomChat(classroom)).toEqual([
      expect.objectContaining({
        username: "pip",
        characterName: "Pip the Sparrow",
        text: "hello courtyard",
      }),
    ]);
  });

  it("writes unused student tokens as one token per line", () => {
    expect(unusedStudentTokenText(classroom)).toBe("keep-this\n");
  });

  it("quotes csv cells that contain commas", () => {
    expect(
      rosterCsv({
        ...classroom,
        invites: [
          {
            ...classroom.invites[1]!,
            characterName: "Pip, the Sparrow",
          },
        ],
        accounts: [classroom.accounts[0]!],
      }),
    ).toContain('"Pip, the Sparrow"');
  });

  it("writes the class list as csv", () => {
    expect(rosterCsv(classroom)).toBe(
      [
        "invite_token,login,collegian,role,status",
        "keep-this,,,student,unused",
        "used-this,pip,Pip the Sparrow,student,active",
        ",owner,Bramble the Hedgehog,teacher,active",
        "",
      ].join("\n"),
    );
  });

  it("puts token, login, and Collegian on one row", () => {
    expect(rosterRows(classroom)).toEqual([
      expect.objectContaining({
        token: "keep-this",
        username: undefined,
        role: "student",
        status: "unused",
      }),
      expect.objectContaining({
        token: "used-this",
        username: "pip",
        characterName: "Pip the Sparrow",
        removable: true,
      }),
      expect.objectContaining({
        username: "owner",
        characterName: "Bramble the Hedgehog",
        token: undefined,
        removable: false,
      }),
    ]);
  });
});
