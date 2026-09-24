import { authPreviewInviteResponseSchema } from "@greenwood/contracts";
import { useState, type FormEvent } from "react";
import { OpeningStory } from "./OpeningStory.js";
import { stepAfterInvite, type InviteStep } from "./opening-story.js";

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
  const [inviteStep, setInviteStep] = useState<InviteStep>("forms");
  const [inviteToken, setInviteToken] = useState("");

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

  async function checkInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const token = String(data.get("token") ?? "").trim();
    const response = await fetch("/auth/preview-invite", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const payload: unknown = await response.json().catch(() => undefined);
    const parsed = authPreviewInviteResponseSchema.safeParse(payload);
    if (!response.ok || !parsed.success) {
      setError(errorMessage(payload, "That invite is not valid."));
      return;
    }
    setInviteToken(token);
    setInviteStep(stepAfterInvite(parsed.data.role));
  }

  if (inviteStep === "story") {
    return (
      <OpeningStory
        onEnter={() => {
          setInviteStep("account");
        }}
      />
    );
  }

  return (
    <section className="auth-gate" aria-labelledby="auth-heading">
      <h2 id="auth-heading">{bootstrapOpen ? "First-time teacher setup" : "Sign in"}</h2>
      <p>
        {bootstrapOpen
          ? "Create the owner account with the bootstrap token from your local .env file or the Render Environment page. This form disappears after the first owner exists. There is no public registration."
          : "Classroom accounts use an invite. There is no public registration."}
      </p>
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

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
          <h3>Create the teacher owner</h3>
          <p>
            The bootstrap token is a private string you set as ADMIN_BOOTSTRAP_TOKEN. Never paste
            production tokens into chat, email, or Git.
          </p>
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

      {inviteStep === "forms" ? (
        <>
          <form
            className="auth-form"
            onSubmit={(event) => {
              const data = new FormData(event.currentTarget);
              void submit(event, "/auth/sign-in", {
                username: String(data.get("username") ?? ""),
                password: String(data.get("password") ?? ""),
                audience: "student",
              });
            }}
          >
            <h3>Student sign-in</h3>
            <p>Students who already accepted an invite use this form.</p>
            <label>
              Username
              <input name="username" autoComplete="username" required />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button type="submit">Sign in as student</button>
          </form>

          <form
            className="auth-form"
            onSubmit={(event) => {
              const data = new FormData(event.currentTarget);
              void submit(event, "/auth/sign-in", {
                username: String(data.get("username") ?? ""),
                password: String(data.get("password") ?? ""),
                audience: "staff",
              });
            }}
          >
            <h3>Teacher sign-in</h3>
            <p>Use this form for the classroom owner or a teacher account.</p>
            <label>
              Username
              <input name="username" autoComplete="username" required />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button type="submit">Sign in as teacher</button>
          </form>

          <form className="auth-form" onSubmit={(event) => void checkInvite(event)}>
            <h3>New student</h3>
            <p>Enter the invite from your teacher. The story comes next, then your login.</p>
            <label>
              Invite token
              <input name="token" autoComplete="off" required />
            </label>
            <button type="submit">Continue</button>
          </form>
        </>
      ) : null}

      {inviteStep === "account" ? (
        <form
          className="auth-form"
          onSubmit={(event) => {
            const data = new FormData(event.currentTarget);
            void submit(event, "/auth/accept-invite", {
              token: inviteToken,
              username: String(data.get("username") ?? ""),
              password: String(data.get("password") ?? ""),
            });
          }}
        >
          <h3>Create your login</h3>
          <p>This is the name you type to sign in. Your character name comes after.</p>
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
