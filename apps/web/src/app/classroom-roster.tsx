import type { AuthClassroom } from "@greenwood/contracts";
import { unusedInvites } from "./classroom-data.js";

export function ClassroomRoster({
  classroom,
  onRemove,
}: {
  classroom: AuthClassroom;
  onRemove?: (username: string) => void;
}) {
  const unused = unusedInvites(classroom);

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
        <p>No unused tokens. Choose how many students, then issue invites above.</p>
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
      <h3>Students and teachers</h3>
      {classroom.accounts.length === 0 ? (
        <p>No student has created a username yet.</p>
      ) : (
        <table className="roster-table">
          <caption className="visually-hidden">Classroom logins and Collegian names</caption>
          <thead>
            <tr>
              <th scope="col">Username</th>
              <th scope="col">Collegian</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Remove</th>
            </tr>
          </thead>
          <tbody>
            {classroom.accounts.map((account) => (
              <tr key={account.accountId}>
                <td>{account.username}</td>
                <td>{account.characterName ?? "Not finished yet"}</td>
                <td>{account.role}</td>
                <td>{account.status}</td>
                <td>
                  {onRemove && account.status === "active" ? (
                    <button
                      type="button"
                      onClick={() => {
                        onRemove(account.username);
                      }}
                    >
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>
        Passwords are never shown. Download class list keeps the invite token so your private name
        list can stay joined to username and Collegian. Legal names stay off this server.
      </p>
    </section>
  );
}
