import {
  moderationNoticeSchema,
  PLAY_STATE_EVENT,
  playStateSchema,
  type PlayState,
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
import {
  completeCommand,
  completionCandidates,
  reminderWords,
  shortcutForKey,
} from "./command-assist.js";
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
import { PlayPanels } from "./PlayPanels.js";
import { PlayChrome } from "./PlayChrome.js";
import { CollegiumLobby } from "./CollegiumLobby.js";
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
            initialVisual={me.characterVisual}
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
    <AcademyFrame sidebar={sidebar} playing>
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
  const [playState, setPlayState] = useState<PlayState>();
  const [viewError, setViewError] = useState("");
  const [lines, setLines] = useState<TranscriptLine[]>([
    {
      id: "notice-start",
      kind: "notice",
      text: "Porter Bramble will greet you in Lantern Court. Type help for the list of words. Tab completes a word. Up and down recall earlier commands.",
    },
  ]);
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const [questJournalOpen, setQuestJournalOpen] = useState(false);
  const [lobbyOpen, setLobbyOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [followToken, setFollowToken] = useState(0);

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
    socket.on(PLAY_STATE_EVENT, (payload: unknown) => {
      const parsed = playStateSchema.safeParse(payload);
      if (parsed.success) {
        setPlayState(parsed.data);
        setViewError("");
      } else {
        setPlayState(undefined);
        setViewError(
          "The visual view could not be read. Your transcript is available; type look to retry.",
        );
      }
    });
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
      setPlayState(undefined);
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
      setPlayState(undefined);
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
    sendCommand(inputValue);
  }

  function sendCommand(
    raw: string,
    preserveDraft = false,
    onSettled?: (result: { ok: boolean; message: string }) => void,
  ) {
    const socket = socketRef.current;
    if (raw.trim().length === 0) {
      return;
    }
    if (!socket || !canSendCommand(connection, raw)) {
      addNotice(DISCONNECTED_COMMAND_NOTICE);
      onSettled?.({ ok: false, message: DISCONNECTED_COMMAND_NOTICE });
      return;
    }

    if (/^(?:map|chart)$/iu.test(raw.trim())) {
      setWorldMapOpen(true);
    }
    if (/^quests?$/iu.test(raw.trim())) {
      setQuestJournalOpen(true);
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
    if (!preserveDraft) {
      setHistoryCursor(null);
      setDraft("");
      setInputValue("");
    }

    setFollowToken((current) => current + 1);
    socket.emit(
      "command",
      createCommandRequest(commandId, raw, lastSequenceRef.current),
      (payload: unknown) => {
        const ack = commandAckSchema.safeParse(payload);
        if (!ack.success) {
          const message = "The server acknowledgement was not valid.";
          addNotice(message);
          onSettled?.({ ok: false, message });
          return;
        }
        pendingRef.current = pendingAfterAck(pendingRef.current, ack.data.commandId);
        if (ack.data.status === "rejected") {
          addNotice(ack.data.message);
          onSettled?.({ ok: false, message: ack.data.message });
          return;
        }
        onSettled?.({ ok: true, message: ack.data.message });
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

  function fillCommand(raw: string) {
    setInputValue(raw);
    setDraft(raw);
    setHistoryCursor(null);
    inputRef.current?.focus();
  }

  function onCommandKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.altKey && !event.ctrlKey && !event.metaKey) {
      const shortcut = shortcutForKey(event.key);
      if (shortcut) {
        event.preventDefault();
        if (shortcut.send) {
          sendCommand(shortcut.word);
          return;
        }
        fillCommand(`${shortcut.word} `);
        return;
      }
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const completed = completeCommand(inputValue, completionCandidates(playState));
      setInputValue(completed.value);
      setDraft(completed.value);
      setHistoryCursor(null);
      return;
    }
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
      className="client play-client"
      onClick={(event) => {
        if (shouldFocusCommandInput(event.target)) {
          inputRef.current?.focus();
        }
      }}
    >
      <PlayChrome
        connection={connection}
        accountLabel={
          me
            ? `Signed in as ${me.username}.`
            : status.allowGuestPlay
              ? "Guest play."
              : "Not signed in."
        }
        signedIn={Boolean(me)}
        settingsOpen={settingsOpen}
        onOpenSettings={() => setSettingsOpen(true)}
        onCloseSettings={() => setSettingsOpen(false)}
        onOpenLobby={() => setLobbyOpen(true)}
        onShowGate={onShowGate}
        onSignOut={() => {
          void signOut(onSignedOut);
        }}
        authNotice={authNotice}
      />
      <PlayPanels
        state={playState}
        lines={lines}
        connection={connection}
        error={viewError}
        worldMapOpen={worldMapOpen}
        onOpenWorldMap={() => setWorldMapOpen(true)}
        onCloseWorldMap={() => setWorldMapOpen(false)}
        questJournalOpen={questJournalOpen}
        onOpenQuestJournal={() => setQuestJournalOpen(true)}
        onCloseQuestJournal={() => setQuestJournalOpen(false)}
        onMove={(direction) => sendCommand(direction, true)}
        onMapTravel={(title, report) => {
          sendCommand(`travel ${title}`, false, report);
        }}
        onSend={(raw) => sendCommand(raw)}
        onCommand={fillCommand}
        followToken={followToken}
      />
      <CollegiumLobby
        open={lobbyOpen}
        state={playState}
        onEnter={() => setLobbyOpen(false)}
        onTravel={(title) => {
          sendCommand(`travel ${title}`);
          setLobbyOpen(false);
        }}
      />
      <div className="command-dock">
        <nav className="command-reminders" aria-label="Command words">
          {reminderWords(playState).map((entry) => (
            <button
              key={entry.word}
              type="button"
              accessKey={entry.shortcut}
              title={entry.shortcut ? `Alt+${entry.shortcut.toUpperCase()}` : undefined}
              onClick={() => {
                if (entry.send) {
                  sendCommand(entry.word);
                  return;
                }
                fillCommand(`${entry.word} `);
              }}
            >
              {entry.word}
              {entry.shortcut ? <kbd>{entry.shortcut}</kbd> : null}
            </button>
          ))}
        </nav>
        <form className="command-form" onSubmit={submitCommand}>
          <label className="command-label">
            <span className="prompt" aria-hidden="true">
              ❯
            </span>
            <input
              ref={inputRef}
              id="play-command"
              placeholder="Type a command… Tab completes a word"
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
          <button type="submit" disabled={connection !== "connected" || !inputValue.trim()}>
            Send <span aria-hidden="true">↵</span>
          </button>
        </form>
      </div>
    </main>
  );
}

async function signOut(onSignedOut: () => void): Promise<void> {
  await fetch("/auth/sign-out", { method: "POST", credentials: "same-origin" });
  onSignedOut();
}
