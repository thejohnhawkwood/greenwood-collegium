import { speechDaysSchema, speechPageSchema, type SpeechRecord } from "@greenwood/contracts";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminRequest, requestMessage } from "./admin-api.js";

export function SpeechLog() {
  const [days, setDays] = useState<string[]>([]);
  const [day, setDay] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const next = speechDaysSchema.parse(await adminRequest("/admin/speech/days"));
        if (!cancelled) {
          setDays(next.days);
          setDay((current) => (next.days.includes(current) ? current : (next.days[0] ?? "")));
          setError("");
        }
      } catch (error) {
        if (!cancelled) setError(requestMessage(error));
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 15_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);
  return (
    <section aria-labelledby="speech-heading">
      <h3 id="speech-heading">Realm speech</h3>
      <p className="admin-hint">
        All rooms · Alberta time · six months. Reading position stays still as messages arrive.
      </p>
      <label>
        Class day
        <select
          value={day}
          onChange={(event) => setDay(event.target.value)}
          disabled={!days.length}
        >
          {!days.length ? <option value="">No recorded speech yet</option> : null}
          {days.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      {error ? <p role="alert">{error}</p> : null}
      {day ? <DaySpeech key={day} day={day} /> : null}
    </section>
  );
}

function DaySpeech({ day }: { day: string }) {
  const [records, setRecords] = useState<SpeechRecord[]>([]);
  const [more, setMore] = useState(false);
  const [live, setLive] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const liveRef = useRef(true);
  const cursor = useRef({ after: 0, inFlight: false, active: true });
  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  const loadMore = useCallback(async () => {
    const state = cursor.current;
    if (state.inFlight || !state.active) return;
    state.inFlight = true;
    setBusy(true);
    try {
      const page = speechPageSchema.parse(
        await adminRequest(`/admin/speech?day=${encodeURIComponent(day)}&after=${state.after}`),
      );
      if (!state.active) return;
      state.after = page.records.at(-1)?.id ?? state.after;
      setRecords((current) => [...current, ...page.records]);
      setMore(page.hasMore);
      setError("");
    } catch (error) {
      if (state.active) setError(requestMessage(error));
    } finally {
      state.inFlight = false;
      if (state.active) setBusy(false);
    }
  }, [day]);

  useEffect(() => {
    const state = { after: 0, inFlight: false, active: true };
    cursor.current = state;
    // DaySpeech is keyed by day, so a new selection starts with an empty page.
    const initial = setTimeout(() => void loadMore(), 0);
    const timer = setInterval(() => {
      if (liveRef.current) void loadMore();
    }, 5_000);
    return () => {
      state.active = false;
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [loadMore]);

  return (
    <>
      <label className="admin-check">
        <input type="checkbox" checked={live} onChange={(event) => setLive(event.target.checked)} />{" "}
        Update automatically
      </label>
      <a href={`/admin/speech/export?day=${encodeURIComponent(day)}`} download>
        Export this day as text
      </a>
      <p className="admin-hint">Exports list Collegian, username, room, and the spoken line.</p>
      {error ? <p role="alert">{error}</p> : null}
      <ol className="speech-entries" aria-label="Recorded player speech">
        {records.map((row) => (
          <li key={row.id}>
            <time dateTime={row.occurredAt}>
              {new Date(row.occurredAt).toLocaleTimeString("en-CA", {
                timeZone: "America/Edmonton",
              })}
            </time>{" "}
            <strong>{row.characterName}</strong>
            <div className="admin-hint">
              {row.username}
              {row.roomId ? ` · ${row.roomId}` : ""}
            </div>
            <p className="speech-text">{row.text}</p>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => void loadMore()} disabled={busy}>
        {more ? "Load next 200 messages" : "Check for newer messages"}
      </button>
    </>
  );
}
