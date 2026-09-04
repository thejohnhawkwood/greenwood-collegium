import { useState, type FormEvent } from "react";

export type AuthGateProps = {
  bootstrapOpen: boolean;
  allowGuestPlay: boolean;
  onSignedIn: () => void;
  onContinueAsGuest?: () => void;
};

export function AuthGate({
  bootstrapOpen,
  allowGuestPlay,
  onSignedIn,
  onContinueAsGuest,
}: AuthGateProps) {
  const [error, setError] = useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>,
    path: string,
    body: Record<string, string>,
  ) {
    event.preventDefault();
    setError("");
    const response = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      setError(errorMessage(payload, "That request was not accepted."));
      return;
    }
    onSignedIn();
  }

  return (
    <section className="auth-gate" aria-labelledby="auth-heading">
      <h2 id="auth-heading">Sign in</h2>
      <p>Classroom accounts use an invite. There is no public registration.</p>
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <form
        className="auth-form"
        onSubmit={(event) => {
          const data = new FormData(event.currentTarget);
          void submit(event, "/auth/sign-in", {
            username: String(data.get("username") ?? ""),
            password: String(data.get("password") ?? ""),
          });
        }}
      >
        <h3>Returning student</h3>
        <label>
          Username
          <input name="username" autoComplete="username" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button type="submit">Sign in</button>
      </form>

      <form
        className="auth-form"
        onSubmit={(event) => {
          const data = new FormData(event.currentTarget);
          void submit(event, "/auth/accept-invite", {
            token: String(data.get("token") ?? ""),
            username: String(data.get("username") ?? ""),
            password: String(data.get("password") ?? ""),
          });
        }}
      >
        <h3>Accept an invite</h3>
        <label>
          Invite token
          <input name="token" autoComplete="off" required />
        </label>
        <label>
          Username
          <input name="username" autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        </label>
        <button type="submit">Create account</button>
      </form>

      {bootstrapOpen ? (
        <form
          className="auth-form"
          onSubmit={(event) => {
            const data = new FormData(event.currentTarget);
            void submit(event, "/auth/bootstrap", {
              token: String(data.get("token") ?? ""),
              username: String(data.get("username") ?? ""),
              password: String(data.get("password") ?? ""),
            });
          }}
        >
          <h3>Owner bootstrap</h3>
          <label>
            Bootstrap token
            <input name="token" type="password" autoComplete="off" required />
          </label>
          <label>
            Username
            <input name="username" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </label>
          <button type="submit">Create owner</button>
        </form>
      ) : null}

      {allowGuestPlay && onContinueAsGuest ? (
        <p>
          <button type="button" onClick={onContinueAsGuest}>
            Continue as guest
          </button>
        </p>
      ) : null}
    </section>
  );
}

function errorMessage(payload: unknown, fallback: string): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }
  return fallback;
}
