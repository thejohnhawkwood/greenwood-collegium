import {
  moderationNoticeSchema,
  commandAckSchema,
  eventEnvelopeSchema,
  renderClassicNarration,
  SESSION_HELLO_EVENT,
  sessionHelloSchema,
  type AuthSessionPublic,
} from "@greenwood/contracts";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { AcademyFrame } from "./academy-frame.js";
import { AuthGate } from "./AuthGate.js";
import { CharacterGate } from "./CharacterGate.js";
import { shouldShowCharacterGate } from "./character-gate.js";

import {
  DISCONNECTED_COMMAND_NOTICE,
  SOCKET_TRANSPORTS,
  SOCKET_UPGRADE,
  canSendCommand,
} from "./command-input.js";
import { loadSocketTicket } from "./socket-ticket.js";
import { shouldShowAuthGate, type AuthStatus } from "./auth-status.js";
import { loadAuthSession } from "./auth-session.js";
import { recallCommandHistory, pushCommandHistory } from "./command-history.js";
import { shouldFocusCommandInput } from "./command-focus.js";
import { createCommandRequest } from "./command-request.js";

import {
  applyProcessHello,
  readStoredBootId,
  readStoredSequence,
  shouldApplyEvent,
  shouldResyncAfterAck,
  writeStoredBootId,
  writeStoredSequence,
} from "./event-sequence.js";
import { pendingAfterAck, type PendingCommand } from "./pending-command.js";
import { APP_TITLE } from "./title.js";
import { appendTranscript, type TranscriptLine } from "./transcript.js";
import { GameTranscript } from "./GameTranscript.js";
import { AdminPane } from "./AdminPane.js";
import { ApprovalGate } from "./ApprovalGate.js";

export function App() {
  const [status, setStatus] = useState<AuthStatus | undefined>();
  const [me, setMe] = useState<AuthSessionPublic | undefined>();
  const [forceGate, setForceGate] = useState(false);
  const [authError, setAuthError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const next = await loadAuthSession();
      setStatus(next.status);
      setMe(next.me);
      setAuthError("");
    } catch {
      setAuthError("The session check could not connect. Check your connection and try again.");
    }
  }, []);
  const showGate = status !== undefined && shouldShowAuthGate(status, forceGate);
  const waiting =
    me !== undefined && (me.nameReview?.status === "pending" || Boolean(me.timeoutUntil));
  const sidebar =
    me && (me.role === "owner" || me.role === "teacher") ? <AdminPane me={me} /> : undefined;
  const authNotice = authError ? (
    <div>
      <p role="alert">{authError}</p>
      <button type="button" onClick={() => void refresh()}>
        Retry session check
      </button>
    </div>
  ) : null;

  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(initial);
  }, [refresh]);
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => void refresh(), 3_000);
    return () => clearInterval(timer);
  }, [waiting, refresh]);

  if (status === undefined) {
    return (
      <AcademyFrame>
        <main className="client">{authNotice ?? <p>Loading the Collegium.</p>}</main>
      </AcademyFrame>
    );
  }

  if (me && waiting) {
    return (
      <AcademyFrame sidebar={sidebar}>
        <main className="client">
          <h1>{APP_TITLE}</h1>
          {authNotice}
          <ApprovalGate
            me={me}
            onRefresh={() => void refresh()}
            onSignOut={() => void signOut(() => void refresh())}
          />
        </main>
      </AcademyFrame>
    );
  }

  if (me && shouldShowCharacterGate(me)) {
    return (
      <AcademyFrame sidebar={sidebar}>
        <main className="client">
          <header className="chrome">
            <h1>{APP_TITLE}</h1>
            <p className="meta">Signed in as {me.username}.</p>
            {authNotice}
          </header>
          <CharacterGate
            needsApproval={me.role === "student"}
            reviewReason={me.nameReview?.reason}
            username={me.username}
            onReady={() => {
              void refresh();
            }}
            onSignedOut={() => {
              void refresh();
            }}
          />
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
              void refresh();
            }}
            onContinueAsGuest={status.allowGuestPlay ? () => setForceGate(false) : undefined}
          />
          {authNotice}
        </main>
      </AcademyFrame>
    );
  }

  return (
    <AcademyFrame sidebar={sidebar}>
      <PlayClient
        key={me?.accountId ?? "guest"}
        status={status}
        me={me}
        authNotice={authNotice}
        onShowGate={() => setForceGate(true)}
        onSignedOut={() => {
          void refresh();
        }}
      />
    </AcademyFrame>
  );
}

function PlayClient({
  status,
  me,
  onShowGate,
  onSignedOut,
  authNotice,
}: {
  status: AuthStatus;
  me: AuthSessionPublic | undefined;
  onShowGate: () => void;
  onSignedOut: () => void;
  authNotice: ReactNode;
}) {
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastSequenceRef = useRef(
    me?.characterId ? readStoredSequence(sessionStorage, me.characterId) : 0,
  );
  const pendingRef = useRef<PendingCommand | undefined>(undefined);
  const sessionChanged = useRef(onSignedOut);
  useEffect(() => {
    sessionChanged.current = onSignedOut;
  }, [onSignedOut]);
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

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: [...SOCKET_TRANSPORTS],
      upgrade: SOCKET_UPGRADE,
      withCredentials: true,
      auth: (callback) => {
        void (async () => {
          const ticket = me ? await loadSocketTicket() : undefined;
          callback({ lastSequence: lastSequenceRef.current, ticket });
        })();
      },
    });
    socketRef.current = socket;
    socket.on("moderation-changed", (payload: unknown) => {
      const parsed = moderationNoticeSchema.safeParse(payload);
      if (!parsed.success) return;
      setLines((current) =>
        appendTranscript(current, {
          id: crypto.randomUUID(),
          kind: "notice",
          text: parsed.data.message,
        }),
      );
      if (parsed.data.refreshSession) sessionChanged.current();
    });
    socket.on(SESSION_HELLO_EVENT, (payload: unknown) => {
      const parsed = sessionHelloSchema.safeParse(payload);
      if (!parsed.success) {
        return;
      }
      const next = applyProcessHello(
        readStoredBootId(sessionStorage),
        parsed.data.bootId,
        lastSequenceRef.current,
      );
      writeStoredBootId(sessionStorage, next.bootId);
      if (!next.reset) {
        return;
      }
      lastSequenceRef.current = next.lastSequence;
      if (me?.characterId) {
        writeStoredSequence(sessionStorage, me.characterId, next.lastSequence);
      }
    });
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
    let connectErrorShown = false;
    socket.on("connect_error", (error) => {
      if (connectErrorShown) {
        return;
      }
      connectErrorShown = true;
      const text = error.message.includes("sign_in_required")
        ? "Sign in to enter the Collegium."
        : "The courtyard could not connect. Refresh once. If it stays disconnected, wait a moment and try again.";
      setLines((current) =>
        appendTranscript(current, {
          id: crypto.randomUUID(),
          kind: "notice",
          text,
        }),
      );
    });
    socket.on("event", (payload: unknown) => {
      const parsed = eventEnvelopeSchema.safeParse(payload);
      if (!parsed.success || !shouldApplyEvent(lastSequenceRef.current, parsed.data.sequence)) {
        return;
      }
      lastSequenceRef.current = parsed.data.sequence;
      if (me?.characterId) {
        writeStoredSequence(sessionStorage, me.characterId, parsed.data.sequence);
      }
      setLines((current) =>
        appendTranscript(current, {
          id: parsed.data.eventId,
          kind: "narration",
          text: renderClassicNarration(parsed.data),
          event: parsed.data,
        }),
      );
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [me]);

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
          return;
        }
        if (shouldResyncAfterAck(lastSequenceRef.current, ack.data.eventSequenceEnd)) {
          lastSequenceRef.current = ack.data.eventSequenceEnd ?? 0;
          if (me?.characterId) {
            writeStoredSequence(sessionStorage, me.characterId, lastSequenceRef.current);
          }
          addNotice("The courtyard restarted. Type look again.");
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
    <main
      className="client"
      onClick={(event) => {
        if (shouldFocusCommandInput(event.target)) {
          inputRef.current?.focus();
        }
      }}
    >
      <header className="chrome">
        <h1>{APP_TITLE}</h1>
        {authNotice}
        <p className="meta">
          Connection: {connection}. Living transcript.{" "}
          {me
            ? `Signed in as ${me.username}.`
            : status.allowGuestPlay
              ? "Guest play."
              : "Not signed in."}
        </p>
        <p className="auth-actions">
          {me ? (
            <>
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
      </header>
      <GameTranscript lines={lines} />
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

async function signOut(onSignedOut: () => void): Promise<void> {
  await fetch("/auth/sign-out", { method: "POST", credentials: "same-origin" });
  onSignedOut();
}
