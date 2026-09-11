import {
  STUDENT_INVITE_BATCH_MAX,
  auditPageSchema,
  authClassroomSchema,
  authInviteCreatedSchema,
  resetPreviewSchema,
  type AuthClassroom,
  type AuthClassroomAccount,
  type AuthSessionPublic,
  type ModerationAction,
} from "@greenwood/contracts";
import {
  downloadTextFile,
  givenNameFromCollegian,
  isActiveClassroomStudent,
  rosterCsv,
  unusedStudentTokenText,
  unusedStudentTokens,
} from "./classroom-data.js";
import { useEffect, useRef, useState } from "react";
import { adminRequest, requestMessage } from "./admin-api.js";
import { SpeechLog } from "./SpeechLog.js";

export function AdminPane({ me }: { me: AuthSessionPublic }) {
  const allowed = me.role === "teacher" || me.role === "owner";
  const [classroom, setClassroom] = useState<AuthClassroom>();
  const [tab, setTab] = useState("Approvals");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(30);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof resetPreviewSchema.parse>>();
  const [confirmation, setConfirmation] = useState("");
  const generation = useRef({ value: 0 });

  async function refresh() {
    const request = ++generation.current.value;
    const next = authClassroomSchema.parse(await adminRequest("/auth/classroom"));
    if (request === generation.current.value) setClassroom(next);
  }
  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    async function poll() {
      try {
        if (!cancelled) await refresh();
      } catch (error) {
        if (!cancelled) setMessage(requestMessage(error));
      }
    }
    void poll();
    const tracker = generation.current;
    const timer = setInterval(() => void poll(), 5_000);
    return () => {
      cancelled = true;
      tracker.value++;
      clearInterval(timer);
    };
  }, [allowed, me.accountId]);

  async function operate(operation: () => Promise<unknown>, success: string) {
    if (busy) return;
    setBusy(true);
    generation.current.value++;
    try {
      await operation();
      await refresh();
      setMessage(success);
    } catch (error) {
      setMessage(requestMessage(error));
    } finally {
      setBusy(false);
    }
  }
  function action(input: ModerationAction) {
    return operate(() => adminRequest("/admin/action", input), "Classroom updated.");
  }
  if (!allowed) return null;
  const pending =
    classroom?.accounts.filter(
      (account) => account.nameReview?.status === "pending" && account.status === "active",
    ) ?? [];
  const accounts = (classroom?.accounts ?? []).filter((account) =>
    [account.username, account.characterName, account.inviteReference].some((value) =>
      value?.toLowerCase().includes(search.toLowerCase()),
    ),
  );
  const activeStudents = (classroom?.accounts ?? []).filter(isActiveClassroomStudent);

  return (
    <aside className="admin-pane" aria-label="Teacher administration">
      <details open className="admin-disclosure">
        <summary>Teacher controls</summary>
        <p className="admin-hint">Private classroom administration</p>
        <button
          type="button"
          className="admin-pause"
          disabled={busy || !classroom}
          onClick={() =>
            void action({
              action: "chat-pause",
              paused: !classroom?.chatPaused,
              reason: "Teacher panel",
            })
          }
        >
          {classroom?.chatPaused ? "Resume student chat" : "Pause student chat"}
        </button>
        <p role="status">
          {message ||
            (classroom ? `${pending.length} names waiting for review.` : "Loading classroom…")}
        </p>
        <nav className="admin-tabs" aria-label="Teacher sections">
          {["Active", "Approvals", "Roster", "Speech", "History"].map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={tab === name}
              onClick={() => setTab(name)}
            >
              {name}
              {name === "Approvals"
                ? ` (${pending.length})`
                : name === "Active"
                  ? ` (${activeStudents.length})`
                  : ""}
            </button>
          ))}
        </nav>
        {tab === "Active" ? (
          <section aria-labelledby="active-students-heading">
            <h3 id="active-students-heading">Active students</h3>
            <p className="admin-hint">
              Students with a Collegian. Rooms are the last place they entered. Remove disables the
              login. Mute and timeout use the duration below each name.
            </p>
            {activeStudents.length ? (
              activeStudents.map((account) => (
                <ActiveStudentCard
                  key={account.accountId}
                  account={account}
                  busy={busy}
                  act={action}
                />
              ))
            ) : (
              <p>No active students with a Collegian yet.</p>
            )}
          </section>
        ) : null}
        {tab === "Approvals" ? (
          <section aria-labelledby="approval-queue-heading">
            <h3 id="approval-queue-heading">Name approval</h3>
            <p className="admin-hint">
              Approve the login and Collegian together. Students wait outside until approved.
            </p>
            {pending.length ? (
              pending.map((account) => (
                <AccountCard
                  key={account.accountId}
                  account={account}
                  busy={busy}
                  act={action}
                  approval
                />
              ))
            ) : (
              <p>No names waiting.</p>
            )}
          </section>
        ) : null}
        {tab === "Roster" ? (
          <section aria-labelledby="roster-heading">
            <h3 id="roster-heading">Invites and roster</h3>
            {classroom?.persistence === "memory" ? (
              <p role="alert">
                Local memory preview: accounts and speech will not survive a restart.
              </p>
            ) : null}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void operate(async () => {
                  authInviteCreatedSchema.parse(
                    await adminRequest("/auth/invites", { role: "student", count }),
                  );
                }, "Student invites created.");
              }}
            >
              <label>
                Number of students (1–{STUDENT_INVITE_BATCH_MAX})
                <input
                  type="number"
                  min={1}
                  max={STUDENT_INVITE_BATCH_MAX}
                  required
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value))}
                />
              </label>
              <button disabled={busy} type="submit">
                Generate student invites
              </button>
            </form>
            <p className="roster-actions">
              <button
                type="button"
                disabled={!classroom || unusedStudentTokens(classroom).length === 0}
                onClick={() => {
                  if (!classroom) {
                    return;
                  }
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
                disabled={!classroom}
                onClick={() => {
                  if (!classroom) {
                    return;
                  }
                  downloadTextFile(
                    "greenwood-classroom-roster.csv",
                    rosterCsv(classroom),
                    "text/csv",
                  );
                }}
              >
                Download class list
              </button>
            </p>
            {me.role === "owner" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void operate(
                    () => adminRequest("/auth/invites", { role: "teacher", count: 1 }),
                    "Teacher invite created.",
                  )
                }
              >
                Generate teacher invite
              </button>
            ) : null}
            <details>
              <summary>
                Unused invites (
                {classroom?.invites.filter((invite) => invite.status === "unused").length ?? 0})
              </summary>
              {classroom?.invites
                .filter((invite) => invite.status === "unused")
                .map((invite) => (
                  <div className="admin-account" key={invite.id}>
                    <label>
                      Permanent reference
                      <input
                        readOnly
                        value={invite.id}
                        onFocus={(event) => event.target.select()}
                      />
                    </label>
                    <label>
                      {invite.role} invite token
                      <input
                        readOnly
                        value={invite.token ?? "Unavailable"}
                        onFocus={(event) => event.target.select()}
                      />
                    </label>
                    <p className="admin-hint">
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}. Record this
                      reference on your private class list.
                    </p>
                  </div>
                ))}
            </details>
            <label>
              Find username, character, or reference
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            {accounts.map((account) => (
              <AccountCard
                key={`${account.accountId}:${account.characterName ?? ""}`}
                account={account}
                busy={busy}
                act={action}
              />
            ))}
            {me.role === "owner" ? (
              <details className="admin-reset">
                <summary>Full student reset</summary>
                <p>
                  Deletes all student accounts, characters, progress, held items, and old student
                  invites. Staff accounts and retained speech remain. Issue fresh invites
                  afterwards.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void operate(async () => {
                      setPreview(
                        resetPreviewSchema.parse(await adminRequest("/admin/reset-preview")),
                      );
                      setConfirmation("");
                    }, "Review the reset counts before continuing.")
                  }
                >
                  Preview reset
                </button>
                {preview ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void operate(async () => {
                        await adminRequest("/admin/reset", {
                          revision: preview.revision,
                          confirmation,
                        });
                        setPreview(undefined);
                        setConfirmation("");
                      }, "Student reset completed. Generate new invites.");
                    }}
                  >
                    <p>
                      {preview.accounts} student accounts · {preview.characters} characters ·{" "}
                      {preview.invites} invites
                    </p>
                    <label>
                      Type RESET STUDENTS
                      <input
                        required
                        value={confirmation}
                        onChange={(event) => setConfirmation(event.target.value)}
                        autoComplete="off"
                      />
                    </label>
                    <button disabled={busy || confirmation !== "RESET STUDENTS"} type="submit">
                      Permanently reset students
                    </button>
                  </form>
                ) : null}
              </details>
            ) : null}
          </section>
        ) : null}
        {tab === "Speech" ? <SpeechLog /> : null}
        {tab === "History" ? <AuditHistory /> : null}
      </details>
    </aside>
  );
}

function DurationSelect({
  minutes,
  onChange,
}: {
  minutes: number;
  onChange: (minutes: number) => void;
}) {
  return (
    <label>
      Duration
      <select value={minutes} onChange={(event) => onChange(Number(event.target.value))}>
        {[1, 5, 10, 30, 60, 1440].map((value) => (
          <option key={value} value={value}>
            {value < 60 ? `${value} minutes` : value === 60 ? "1 hour" : "1 day"}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ActiveStudentCard({
  account,
  busy,
  act,
}: {
  account: AuthClassroomAccount;
  busy: boolean;
  act: (action: ModerationAction) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [minutes, setMinutes] = useState(10);
  return (
    <article className="admin-account">
      <h4>
        {account.username} → {account.characterName ?? "Character not submitted"}
      </h4>
      <p className="admin-hint">
        {account.roomTitle ?? "Room not recorded yet"}
        {account.mutedUntil
          ? ` · muted until ${new Date(account.mutedUntil).toLocaleString()}`
          : ""}
        {account.timeoutUntil
          ? ` · timeout until ${new Date(account.timeoutUntil).toLocaleString()}`
          : ""}
      </p>
      <label>
        Reason / feedback
        <input value={reason} maxLength={300} onChange={(event) => setReason(event.target.value)} />
      </label>
      <DurationSelect minutes={minutes} onChange={setMinutes} />
      <div className="admin-buttons">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void act({ action: "mute", accountId: account.accountId, minutes, reason })
          }
        >
          Mute
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void act({ action: "timeout", accountId: account.accountId, minutes, reason })
          }
        >
          Timeout
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (
              window.confirm(`${account.username}: Disable this account and remove them from play?`)
            )
              void act({ action: "disable", accountId: account.accountId, reason });
          }}
        >
          Remove
        </button>
      </div>
    </article>
  );
}

function AccountCard({
  account,
  approval = false,
  busy,
  act,
}: {
  account: AuthClassroomAccount;
  approval?: boolean;
  busy: boolean;
  act: (action: ModerationAction) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [minutes, setMinutes] = useState(10);
  const [collegianName, setCollegianName] = useState(() =>
    givenNameFromCollegian(account.characterName),
  );
  function confirmAction(action: "disable" | "remove-character") {
    const description =
      action === "disable"
        ? "Disable this account and disconnect it?"
        : "Permanently remove this character and its progress? The login will remain.";
    if (window.confirm(`${account.username}: ${description}`))
      void act({ action, accountId: account.accountId, reason });
  }
  return (
    <article className="admin-account">
      <h4>
        {account.username} → {account.characterName ?? "Character not submitted"}
      </h4>
      <p className="admin-hint">
        {account.role} · {account.status} · names {account.nameReview?.status ?? "unsubmitted"}
      </p>
      <label>
        Permanent invite reference
        <input
          readOnly
          value={account.inviteReference ?? "No invite reference"}
          onFocus={(event) => event.target.select()}
        />
      </label>
      <details>
        <summary>Account and character IDs</summary>
        <p className="admin-reference">
          {account.accountId}
          <br />
          {account.characterId ?? "No character yet"}
        </p>
      </details>
      {account.role === "student" ? (
        <>
          <label>
            Reason / feedback
            <input
              value={reason}
              maxLength={300}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          {!approval && account.characterId ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void act({
                  action: "rename-character",
                  accountId: account.accountId,
                  name: collegianName,
                  reason,
                });
              }}
            >
              <label>
                Collegian given name
                <input
                  value={collegianName}
                  maxLength={24}
                  minLength={2}
                  required
                  autoComplete="off"
                  onChange={(event) => setCollegianName(event.target.value)}
                />
              </label>
              <p className="admin-hint">
                Enter a given name. The Collegium adds the species. The student reconnects with the
                new name.
              </p>
              <button disabled={busy || !collegianName.trim()} type="submit">
                Change Collegian name
              </button>
            </form>
          ) : null}
          {approval && account.nameReview?.revision ? (
            <div className="admin-buttons">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void act({
                    action: "approve",
                    accountId: account.accountId,
                    revision: account.nameReview?.revision ?? "",
                  })
                }
              >
                Approve both names
              </button>
              <button
                type="button"
                disabled={busy || !reason.trim()}
                onClick={() =>
                  void act({
                    action: "reject",
                    accountId: account.accountId,
                    revision: account.nameReview?.revision ?? "",
                    reason,
                  })
                }
              >
                Reject — try again
              </button>
            </div>
          ) : (
            <>
              {account.mutedUntil ? (
                <p>Mute ends: {new Date(account.mutedUntil).toLocaleString()}</p>
              ) : null}
              {account.timeoutUntil ? (
                <p>Timeout ends: {new Date(account.timeoutUntil).toLocaleString()}</p>
              ) : null}
              <DurationSelect minutes={minutes} onChange={setMinutes} />
              <div className="admin-buttons">
                {(["mute", "timeout"] as const).map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled={busy || account.status !== "active"}
                    onClick={() =>
                      void act({ action, accountId: account.accountId, minutes, reason })
                    }
                  >
                    {action === "mute" ? "Mute" : "Timeout"}
                  </button>
                ))}
                {(["unmute", "end-timeout", "kick"] as const).map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled={busy}
                    onClick={() => void act({ action, accountId: account.accountId, reason })}
                  >
                    {action === "unmute"
                      ? "Unmute"
                      : action === "end-timeout"
                        ? "End timeout"
                        : "Disconnect"}
                  </button>
                ))}
                {account.status === "active" ? (
                  <button type="button" disabled={busy} onClick={() => confirmAction("disable")}>
                    Disable account
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void act({ action: "restore", accountId: account.accountId, reason })
                    }
                  >
                    Restore account
                  </button>
                )}
                {account.characterId ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => confirmAction("remove-character")}
                  >
                    Remove character
                  </button>
                ) : null}
              </div>
            </>
          )}
        </>
      ) : null}
    </article>
  );
}

function AuditHistory() {
  const [records, setRecords] = useState<ReturnType<typeof auditPageSchema.parse>["records"]>([]);
  const [message, setMessage] = useState("Loading history…");
  useEffect(() => {
    let cancelled = false;
    void adminRequest("/admin/audit")
      .then((payload) => {
        if (cancelled) return;
        const page = auditPageSchema.parse(payload);
        setRecords(page.records);
        setMessage(page.records.length ? "" : "No teacher actions recorded yet.");
      })
      .catch((error) => {
        if (!cancelled) setMessage(requestMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <section>
      <h3>Recent teacher actions</h3>
      {message ? <p role="status">{message}</p> : null}
      <ol className="speech-entries">
        {records.map((row) => (
          <li key={row.id}>
            <time dateTime={row.at}>{new Date(row.at).toLocaleString()}</time>
            <p>
              <strong>{row.actorUsername}</strong> · {row.action}
              {row.targetName ? ` · ${row.targetName}` : ""}
            </p>
            <p className="admin-audit">{row.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
