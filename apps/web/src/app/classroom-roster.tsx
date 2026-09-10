import type { AuthClassroom } from "@greenwood/contracts";
import {
  classroomChat,
  downloadTextFile,
  rosterCsv,
  rosterRows,
  unusedStudentTokenText,
  unusedStudentTokens,
} from "./classroom-data.js";

export function ClassroomRoster({
  classroom,
  onRemove,
}: {
  classroom: AuthClassroom;
  onRemove?: (username: string) => void;
}) {
  const rows = rosterRows(classroom);
  const chat = classroomChat(classroom);

  return (
    <section className="classroom-roster" aria-labelledby="classroom-roster-heading">
      <h2 id="classroom-roster-heading">Classroom roster</h2>
      {classroom.persistence === "memory" ? (
        <p role="status">
          This server is using memory. Unused tokens, student accounts, and chat vanish when you
          rebuild or restart. Start local Postgres so they survive.
        </p>
      ) : (
        <p>Invites, accounts, and room chat are stored in the classroom database.</p>
      )}
      <h3>Tokens, logins, and Collegians</h3>
      <p className="roster-actions">
        <button
          type="button"
          disabled={unusedStudentTokens(classroom).length === 0}
          onClick={() => {
            downloadTextFile(
              "greenwood-student-tokens.txt",
              unusedStudentTokenText(classroom),
            );
          }}
        >
          Download unused tokens
        </button>
        <button
          type="button"
          disabled={rows.length === 0}
          onClick={() => {
            downloadTextFile("greenwood-classroom-roster.csv", rosterCsv(classroom), "text/csv");
          }}
        >
          Download class list
        </button>
      </p>
      {rows.length === 0 ? (
        <p>No unused tokens or student logins yet. Choose how many students, then issue invites.</p>
      ) : (
        <table className="roster-table">
          <caption className="visually-hidden">
            Invite tokens matched to classroom logins and Collegian names
          </caption>
          <thead>
            <tr>
              <th scope="col">Invite token</th>
              <th scope="col">Login</th>
              <th scope="col">Collegian</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Remove</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>
                  {row.token ? (
                    <label>
                      <span className="visually-hidden">Invite token</span>
                      <input readOnly value={row.token} />
                    </label>
                  ) : (
                    "Not saved"
                  )}
                </td>
                <td>{row.username ?? "—"}</td>
                <td>{row.characterName ?? (row.username ? "Not finished yet" : "—")}</td>
                <td>{row.role}</td>
                <td>{row.status}</td>
                <td>
                  {onRemove && row.removable && row.username ? (
                    <button
                      type="button"
                      onClick={() => {
                        onRemove(row.username ?? "");
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
      <h3>Room chat</h3>
      {chat.length === 0 ? (
        <p>No room speech is stored yet. Student say lines appear here for teachers only.</p>
      ) : (
        <table className="roster-table">
          <caption className="visually-hidden">Classroom room chat</caption>
          <thead>
            <tr>
              <th scope="col">When</th>
              <th scope="col">Login</th>
              <th scope="col">Collegian</th>
              <th scope="col">Room</th>
              <th scope="col">Said</th>
            </tr>
          </thead>
          <tbody>
            {chat.map((line) => (
              <tr key={line.id}>
                <td>{line.at.slice(11, 19)}</td>
                <td>{line.username ?? "—"}</td>
                <td>{line.characterName}</td>
                <td>{line.roomId}</td>
                <td>{line.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>
        Passwords are never shown. Tokens on this table are for your class list. Do not put them on
        a projector.
      </p>
    </section>
  );
}
