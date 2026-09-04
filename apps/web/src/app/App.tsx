import {
  authInviteCreatedSchema,
  authSessionPublicSchema,
  commandAckSchema,
  eventEnvelopeSchema,
  renderClassicNarration,
  schemaVersion,
  type AuthSessionPublic,
} from "@greenwood/contracts";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { io, type Socket } from "socket.io-client";
import { AuthGate } from "./AuthGate.js";
import { loadAuthStatus, shouldShowAuthGate, type AuthStatus } from "./auth-status.js";
import { recallCommandHistory, pushCommandHistory } from "./command-history.js";
import { createCommandRequest } from "./command-request.js";
import { APP_TITLE } from "./title.js";
import { appendTranscript, type TranscriptLine } from "./transcript.js";

export function App() {
  const [status, setStatus] = useState<AuthStatus | undefined>();
  const [me, setMe] = useState<AuthSessionPublic | undefined>();
  const [forceGate, setForceGate] = useState(false);
  const [inviteOnce, setInviteOnce] = useState("");
  const showGate = status !== undefined && shouldShowAuthGate(status, forceGate);

  useEffect(() => {
    void refreshAuth(setStatus, setMe);
  }, []);

  if (status === undefined) {
    return (
      <main className="client">
        <p>Loading the Collegium.</p>
      </main>
    );
  }

  if (showGate) {
    return (
      <main className="client">
        <header className="chrome">
          <h1>{APP_TITLE}</h1>
        </header>
        <AuthGate
          bootstrapOpen={status.bootstrapOpen}
          allowGuestPlay={status.allowGuestPlay}
          onSignedIn={() => {
            setForceGate(false);
            void refreshAuth(setStatus, setMe);
          }}
          onContinueAsGuest={status.allowGuestPlay ? () => setForceGate(false) : undefined}
        />
      </main>
    );
  }

  return (
    <ClassicClient
      key={me?.accountId ?? "guest"}
      status={status}
      me={me}
      inviteOnce={inviteOnce}
      onInviteOnce={setInviteOnce}
      onShowGate={() => setForceGate(true)}
      onSignedOut={() => {
        setInviteOnce("");
        void refreshAuth(setStatus, setMe);
      }}
    />
  );
}

function ClassicClient({
  status,
  me,
  inviteOnce,
  onInviteOnce,
  onShowGate,
  onSignedOut,
}: {
  status: AuthStatus;
  me: AuthSessionPublic | undefined;
  inviteOnce: string;
  onInviteOnce: (token: string) => void;
  onShowGate: () => void;
  onSignedOut: () => void;
}) {
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const lastSequenceRef = useRef(0);
  const [connection, setConnection] = useState("disconnected");
  const [lines, setLines] = useState<TranscriptLine[]>([
    {
      id: "notice-start",
      kind: "notice",
      text: "Type look, say hello, or a direction such as north. Up and down recall earlier commands.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnection("connected");
      inputRef.current?.focus();
    });
    socket.on("disconnect", () => {
      setConnection("disconnected");
    });
    socket.on("connect_error", (error) => {
      if (error.message.includes("sign_in_required")) {
        setLines((current) =>
          appendTranscript(current, {
            id: crypto.randomUUID(),
            kind: "notice",
            text: "Sign in to enter the Collegium.",
          }),
        );
      }
    });
    socket.on("event", (payload: unknown) => {
      const parsed = eventEnvelopeSchema.safeParse(payload);
      if (!parsed.success) {
        return;
      }
      lastSequenceRef.current = parsed.data.sequence;
      setLines((current) =>
        appendTranscript(current, {
          id: parsed.data.eventId,
          kind: "narration",
          text: renderClassicNarration(parsed.data),
        }),
      );
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const log = logRef.current;
    if (log) {
      log.scrollTop = log.scrollHeight;
    }
  }, [lines]);

  function addNotice(text: string) {
    setLines((current) =>
      appendTranscript(current, {
        id: crypto.randomUUID(),
        kind: "notice",
        text,
      }),
    );
  }

  function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const socket = socketRef.current;
    const raw = inputValue;
    if (!socket || connection !== "connected" || raw.trim().length === 0) {
      return;
    }

    const commandId = crypto.randomUUID();
    setLines((current) =>
      appendTranscript(current, {
        id: commandId,
        kind: "command",
        text: raw,
      }),
    );
    setHistory((current) => pushCommandHistory(current, raw));
    setHistoryCursor(null);
    setDraft("");
    setInputValue("");

    socket.emit(
      "command",
      createCommandRequest(commandId, raw, lastSequenceRef.current),
      (payload: unknown) => {
        const ack = commandAckSchema.safeParse(payload);
        if (!ack.success) {
          addNotice("The server acknowledgement was not valid.");
          return;
        }
        if (ack.data.status === "rejected") {
          addNotice(ack.data.message);
        }
      },
    );

    inputRef.current?.focus();
  }

  function onCommandKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }
    event.preventDefault();
    const recalled = recallCommandHistory(
      history,
      historyCursor,
      draft,
      inputValue,
      event.key === "ArrowUp" ? "up" : "down",
    );
    setHistoryCursor(recalled.cursor);
    setDraft(recalled.draft);
    setInputValue(recalled.value);
  }

  const canInvite = me?.role === "owner" || me?.role === "teacher";

  return (
    <main className="client" onClick={() => inputRef.current?.focus()}>
      <header className="chrome">
        <h1>{APP_TITLE}</h1>
        <p className="meta">
          Connection: {connection}. Schema {schemaVersion}. Classic UI 0.{" "}
          {me
            ? `Signed in as ${me.username}.`
            : status.allowGuestPlay
              ? "Guest play."
              : "Not signed in."}
        </p>
        <p className="auth-actions">
          {me ? (
            <>
              {canInvite ? (
                <button
                  type="button"
                  onClick={() => {
                    void issueInvite(onInviteOnce, addNotice);
                  }}
                >
                  Issue invite
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  void signOut(onSignedOut);
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button type="button" onClick={onShowGate}>
              Sign in
            </button>
          )}
        </p>
        {inviteOnce ? (
          <p>
            <label>
              Invite token (shown once)
              <input readOnly value={inviteOnce} />
            </label>
          </p>
        ) : null}
      </header>
      <div
        ref={logRef}
        className="transcript"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {lines.map((line) => (
          <pre key={line.id} className={`line line-${line.kind}`}>
            {line.kind === "command" ? `> ${line.text}` : line.text}
          </pre>
        ))}
      </div>
      <form className="command-form" onSubmit={submitCommand}>
        <label className="command-label">
          <span className="prompt" aria-hidden="true">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(event) => {
              setHistoryCursor(null);
              setDraft(event.target.value);
              setInputValue(event.target.value);
            }}
            onKeyDown={onCommandKeyDown}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            disabled={connection !== "connected"}
            aria-label="Command"
          />
        </label>
      </form>
    </main>
  );
}

async function refreshAuth(
  setStatus: (status: AuthStatus) => void,
  setMe: (me: AuthSessionPublic | undefined) => void,
): Promise<void> {
  const next = await loadAuthStatus();
  setStatus(next);
  if (!next.signedIn) {
    setMe(undefined);
    return;
  }
  const response = await fetch("/auth/me", { credentials: "same-origin" });
  if (!response.ok) {
    setMe(undefined);
    return;
  }
  const parsed = authSessionPublicSchema.safeParse(await response.json());
  setMe(parsed.success ? parsed.data : undefined);
}

async function signOut(onSignedOut: () => void): Promise<void> {
  await fetch("/auth/sign-out", { method: "POST", credentials: "same-origin" });
  onSignedOut();
}

async function issueInvite(
  onInviteOnce: (token: string) => void,
  addNotice: (text: string) => void,
): Promise<void> {
  const response = await fetch("/auth/invites", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "student" }),
  });
  const payload: unknown = await response.json().catch(() => undefined);
  const parsed = authInviteCreatedSchema.safeParse(payload);
  if (!response.ok || !parsed.success) {
    addNotice("The invite could not be created.");
    return;
  }
  onInviteOnce(parsed.data.token);
}
