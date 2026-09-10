import { useLayoutEffect, useRef, useState } from "react";
import type { TranscriptLine } from "./transcript.js";
import { TranscriptScroll } from "./transcript-scroll.js";
import { SemanticNarration } from "./SemanticNarration.js";

export function GameTranscript({ lines }: { lines: readonly TranscriptLine[] }) {
  const logRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef(new TranscriptScroll());
  const [unread, setUnread] = useState(false);

  useLayoutEffect(() => {
    const log = logRef.current;
    if (log) {
      setUnread(scrollRef.current.entriesChanged(log, lines.at(-1)?.id));
    }
  }, [lines]);

  useLayoutEffect(() => {
    const log = logRef.current;
    if (!log) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setUnread(scrollRef.current.resized(log));
    });
    observer.observe(log);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="transcript-region">
      <div
        ref={logRef}
        className="transcript"
        role="log"
        aria-label="Game transcript"
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
        onScroll={(event) => {
          setUnread(scrollRef.current.scrolled(event.currentTarget));
        }}
      >
        {lines.map((line) => (
          <pre key={line.id} className={`line line-${line.kind}`}>
            {line.kind === "command" ? (
              `> ${line.text}`
            ) : line.event ? (
              <SemanticNarration event={line.event} />
            ) : (
              line.text
            )}
          </pre>
        ))}
      </div>
      {unread ? (
        <button
          type="button"
          className="transcript-latest"
          aria-label="New messages. Jump to latest"
          onClick={() => {
            const log = logRef.current;
            if (log) {
              setUnread(scrollRef.current.jumpToLatest(log));
              log.focus({ preventScroll: true });
            }
          }}
        >
          <span aria-hidden="true">↓ </span>New messages
        </button>
      ) : null}
    </div>
  );
}
