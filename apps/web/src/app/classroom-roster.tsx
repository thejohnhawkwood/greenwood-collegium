import type { AuthClassroom } from "@greenwood/contracts";
import { unusedInvites, usedInvites } from "./classroom-data.js";

export function ClassroomRoster({ classroom }: { classroom: AuthClassroom }) {
  const unused = unusedInvites(classroom);
  const used = usedInvites(classroom);

  return (
    <section className="classroom-roster" aria-labelledby="classroom-roster-heading">
      <h2 id="classroom-roster-heading">Classroom roster</h2>
      {classroom.persistence === "memory" ? (
        <p role="status">
          This server is using memory. Unused tokens and student accounts vanish when you rebuild or
          restart. Start local Postgres so they survive.
        </p>
      ) : (
        <p>Invites and accounts are stored in the classroom database.</p>
      )}
      <h3>Unused invites</h3>
      {unused.length === 0 ? (
        <p>No unused tokens. Issue a student invite above.</p>
      ) : (
        <ul>
          {unused.map((invite) => (
            <li key={invite.id}>
              <span>
                {invite.role} · expires {invite.expiresAt.slice(0, 10)}
              </span>
              {invite.token ? (
                <label>
                  Invite token
                  <input readOnly value={invite.token} />
                </label>
              ) : (
                <span>Token was not saved. Issue a new invite.</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <h3>Accepted accounts</h3>
      {used.length === 0 && classroom.accounts.length === 0 ? (
        <p>No student has created a username yet.</p>
      ) : (
        <ul>
          {used.map((invite) => (
            <li key={invite.id}>
              {invite.username ?? "unknown"} created a {invite.role} username and password.
            </li>
          ))}
          {classroom.accounts
            .filter((account) => !used.some((invite) => invite.username === account.username))
            .map((account) => (
              <li key={account.username}>
                {account.username} ({account.role}) has an account.
              </li>
            ))}
        </ul>
      )}
      <p>Passwords are never shown.</p>
    </section>
  );
}
