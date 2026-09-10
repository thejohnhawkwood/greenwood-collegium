# Classroom load test

Ticket 018. The CI simulation is 30 signed-in clients on localhost. **Do not point that script at the live Render URL.** Tomorrow's coding class is the real load test.

## Before class

1. Confirm https://greenwood-collegium.onrender.com/health/ready returns `{"status":"ok"}`.
2. Open the Render web service **Logs** page. Keep it on another screen.
3. Sign in as the teacher. Type `look`. Issue unused student invites if the roster is short.

## What the process now logs

Structured lines (no chat text, no tokens, no `DATABASE_URL`):

- `event=process_listening` — the courtyard accepted traffic
- `event=socket_connected` / `socket_disconnected` — seat count
- `event=command` — verb, accepted or rejected, duration in ms. `say` is the verb only; spoken text is on the teacher roster chat table.
- `event=rate_limited` — a student is sending too fast
- `event=uncaught_exception` / `unhandled_rejection` — crash. The message is redacted if it contained a database URL

## If it wobbles during class

1. Check `/health/live` and `/health/ready`.
2. In Render logs, search for `process crash`, `rate_limited`, or a sudden drop in `connected`.
3. Do not paste environment values, cookies, or a database dump into chat or Git.
4. Students can refresh. Signed-in rooms persist. Mute does not.

## Local 30-client simulation

```text
pnpm --filter @greenwood/server exec vitest run src/ops/classroom-load.test.ts
```

That command must stay on `127.0.0.1`. It refuses `*.onrender.com`.
