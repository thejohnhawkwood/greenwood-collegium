import {
  authInviteCreatedSchema,
  authSessionPublicSchema,
  commandAckSchema,
  eventEnvelopeSchema,
  renderClassicNarration,
  schemaVersion,
  type AuthClassroom,
  type AuthSessionPublic,
} from "@greenwood/contracts";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { io, type Socket } from "socket.io-client";
import { AcademyFrame } from "./academy-frame.js";
import { AuthGate } from "./AuthGate.js";
import { loadClassroom } from "./classroom-data.js";
import { ClassroomRoster } from "./classroom-roster.js";
import { DISCONNECTED_COMMAND_NOTICE, SOCKET_TRANSPORTS, canSendCommand } from "./command-input.js";
import { loadAuthStatus, shouldShowAuthGate, type AuthStatus } from "./auth-status.js";
import { recallCommandHistory, pushCommandHistory } from "./command-history.js";
import { createCommandRequest } from "./command-request.js";
import { readStoredSequence, shouldApplyEvent, writeStoredSequence } from "./event-sequence.js";
import { pendingAfterAck, type PendingCommand } from "./pending-command.js";
import { APP_TITLE } from "./title.js";
import { appendTranscript, type TranscriptLine } from "./transcript.js";

export function App() {
  const [status, setStatus] = useState<AuthStatus | undefined>();
  const [me, setMe] = useState<AuthSessionPublic | undefined>();
  const [forceGate, setForceGate] = useState(false);
  const showGate = status !== undefined && shouldShowAuthGate(status, forceGate);

  useEffect(() => {
    void refreshAuth(setStatus, setMe);
  }, []);

  if (status === undefined) {
    return (
      <AcademyFrame>
        <main className="client">
          <p>Loading the Collegium.</p>
        </main>
      </AcademyFrame>
    );
  }

  if (showGate) {
    return (
      <AcademyFrame>
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
      </AcademyFrame>
    );
  }

  return (
    <AcademyFrame>
      <ClassicClient
        key={me?.accountId ?? "guest"}
        status={status}
        me={me}
        onShowGate={() => setForceGate(true)}
        onSignedOut={() => {
          void refreshAuth(setStatus, setMe);
        }}
      />
    </AcademyFrame>
  );
}

function ClassicClient({
  status,
  me,
  onShowGate,
  onSignedOut,
}: {
  status: AuthStatus;
  me: AuthSessionPublic | undefined;
  onShowGate: () => void;
  onSignedOut: () => void;
}) {
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const lastSequenceRef = useRef(me ? readStoredSequence(sessionStorage, me.characterId) : 0);
  const pendingRef = useRef<PendingCommand | undefined>(undefined);
  const [connection, setConnection] = useState("disconnected");
  const [lines, setLines] = useState<TranscriptLine[]>([
    {
      id: "notice-start",
      kind: "notice",
      text: "Porter Bramble will greet you in Lantern Court. Type help for the list of words. Up and down recall earlier commands.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [classroom, setClassroom] = useState<AuthClassroom | undefined>();
  const canInvite = me?.role === "owner" || me?.role === "teacher";

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: [...SOCKET_TRANSPORTS],
      withCredentials: true,
      auth: () => ({ lastSequence: lastSequenceRef.current }),
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnection("connected");
      inputRef.current?.focus();
      const pending = pendingRef.current;
      if (pending) {
        socket.emit(
          "command",
          createCommandRequest(pending.commandId, pending.raw, lastSequenceRef.current),
        );
      }
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
      if (!parsed.success || !shouldApplyEvent(lastSequenceRef.current, parsed.data.sequence)) {
        return;
      }
      lastSequenceRef.current = parsed.data.sequence;
      if (me) {
        writeStoredSequence(sessionStorage, me.characterId, parsed.data.sequence);
      }
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
  }, [me]);

  useEffect(() => {
    if (!canInvite) {
      return;
    }
    let cancelled = false;
    void loadClassroom().then((next) => {
      if (!cancelled) {
        setClassroom(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [canInvite, me?.accountId]);

  useEffect(() => {
    const log = logRef.current;
    if (log) {
      log.scrollTop = log.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    if (raw.trim().length === 0) {
      return;
    }
    if (!socket || !canSendCommand(connection, raw)) {
      addNotice(DISCONNECTED_COMMAND_NOTICE);
      return;
    }

    const commandId = crypto.randomUUID();
    pendingRef.current = { commandId, raw };
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
        pendingRef.current = pendingAfterAck(pendingRef.current, ack.data.commandId);
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
                    void issueInvite("student", setClassroom, addNotice);
                  }}
                >
                  Issue student invite
                </button>
              ) : null}
              {me?.role === "owner" ? (
                <button
                  type="button"
                  onClick={() => {
                    void issueInvite("teacher", setClassroom, addNotice);
                  }}
                >
                  Issue teacher invite
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
        {canInvite && classroom ? <ClassroomRoster classroom={classroom} /> : null}
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
  role: "student" | "teacher",
  onClassroom: (classroom: AuthClassroom | undefined) => void,
  addNotice: (text: string) => void,
): Promise<void> {
  const response = await fetch("/auth/invites", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const payload: unknown = await response.json().catch(() => undefined);
  const parsed = authInviteCreatedSchema.safeParse(payload);
  if (!response.ok || !parsed.success) {
    addNotice("The invite could not be created.");
    return;
  }
  onClassroom(await loadClassroom());
}
