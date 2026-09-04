import {
  commandAckSchema,
  eventEnvelopeSchema,
  renderClassicNarration,
  schemaVersion,
} from "@greenwood/contracts";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { io, type Socket } from "socket.io-client";
import { recallCommandHistory, pushCommandHistory } from "./command-history.js";
import { createCommandRequest } from "./command-request.js";
import { APP_TITLE } from "./title.js";
import { appendTranscript, type TranscriptLine } from "./transcript.js";

export function App() {
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const lastSequenceRef = useRef(0);
  const [connection, setConnection] = useState("disconnected");
  const [lines, setLines] = useState<TranscriptLine[]>([
    {
      id: "notice-start",
      kind: "notice",
      text: "Type look, or a direction such as north. Up and down recall earlier commands.",
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
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnection("connected");
      inputRef.current?.focus();
    });
    socket.on("disconnect", () => {
      setConnection("disconnected");
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

  return (
    <main className="client" onClick={() => inputRef.current?.focus()}>
      <header className="chrome">
        <h1>{APP_TITLE}</h1>
        <p className="meta">
          Connection: {connection}. Schema {schemaVersion}. Classic UI 0.
        </p>
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
