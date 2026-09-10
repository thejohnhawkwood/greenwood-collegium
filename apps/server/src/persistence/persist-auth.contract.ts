import { expect, it } from "vitest";
import type {
  AccountRepository,
  CharacterRepository,
  InviteRepository,
  SessionRepository,
} from "./types.js";

export function persistSessionsAndInvites(
  accounts: AccountRepository,
  characters: CharacterRepository,
  sessions: SessionRepository,
  invites: InviteRepository,
): void {
  it("persists a session and a one-time invite", async () => {
    const account = await accounts.create({
      username: "thistle",
      passwordHash: "pending",
      role: "teacher",
    });
    await characters.updateRoom("missing-character", "great-hall");

    const session = await sessions.create({
      accountId: account.id,
      tokenHash: `hash-${account.id}`,
      expiresAt: new Date(Date.now() + 60_000),
    });
    expect(await sessions.getByTokenHash(session.tokenHash)).toMatchObject({
      accountId: account.id,
    });
    await sessions.revoke(session.id, new Date());
    expect(await sessions.getByTokenHash(session.tokenHash)).toMatchObject({
      revokedAt: expect.any(Date),
    });

    const student = await accounts.create({
      username: "pip",
      passwordHash: "pending",
      role: "student",
    });
    const invite = await invites.create({
      tokenHash: `invite-${account.id}`,
      role: "student",
      createdByAccountId: account.id,
      expiresAt: new Date(Date.now() + 60_000),
      issuedToken: "plain-invite",
    });
    expect((await invites.list())[0]).toMatchObject({
      issuedToken: "plain-invite",
    });
    expect(await invites.consume(invite.id, new Date(), student.id)).toBe(true);
    expect(await invites.consume(invite.id, new Date(), student.id)).toBe(false);
    expect(await invites.getByTokenHash(`invite-${account.id}`)).toMatchObject({
      consumedByAccountId: student.id,
    });
    expect((await invites.list())[0]?.issuedToken).toBe("plain-invite");
    expect(await accounts.listByRole("teacher")).toHaveLength(1);
  });
}
