import type { AuthSessionPublic } from "@greenwood/contracts";

export function ApprovalGate({
  me,
  onRefresh,
  onSignOut,
}: {
  me: AuthSessionPublic;
  onRefresh: () => void;
  onSignOut: () => void;
}) {
  const timedOut = Boolean(me.timeoutUntil);
  return (
    <section className="auth-gate" aria-labelledby="approval-heading">
      <h2 id="approval-heading">
        {timedOut ? "Play is paused" : "Waiting at the Collegium gates"}
      </h2>
      <p role="status">
        {timedOut
          ? `Your timeout ends ${new Date(me.timeoutUntil ?? "").toLocaleString()}.`
          : "Your teacher is reviewing your login and character name. This page checks automatically."}
      </p>
      <p>
        Login: <strong>{me.username}</strong>
        <br />
        Collegian: <strong>{me.characterName}</strong>
      </p>
      <p>Player speech is recorded for teacher review and retained for six months.</p>
      <button type="button" onClick={onRefresh}>
        Check again
      </button>
      <button type="button" onClick={onSignOut}>
        Sign out
      </button>
    </section>
  );
}
