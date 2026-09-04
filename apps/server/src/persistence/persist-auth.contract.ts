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

    const invite = await invites.create({
      tokenHash: `invite-${account.id}`,
      role: "student",
      createdByAccountId: account.id,
      expiresAt: new Date(Date.now() + 60_000),
    });
    expect(await invites.consume(invite.id, new Date())).toBe(true);
    expect(await invites.consume(invite.id, new Date())).toBe(false);
    expect(await accounts.listByRole("teacher")).toHaveLength(1);
  });
}
