# Load-test report template

Fill this after the CI 30-client run or after a class period. No student speech. No secrets.

| Check | Result |
|---|---|
| Date | |
| Host | localhost CI / live class |
| `/health/ready` | |
| Clients seated | |
| `look` accepted | |
| `say` accepted | |
| Moves accepted | |
| Reconnects | |
| Rejected commands | |
| Connect errors | |
| look ack p50 / p95 | |
| Crash lines in Render logs | none / describe event names only |
| Fixes shipped | |

CI gate: `apps/server/src/ops/classroom-load.test.ts` must print `passed`.

## 2026-09-07 localhost CI

| Check | Result |
|---|---|
| Host | localhost Vitest |
| Clients seated | 30 |
| `look` accepted | 30 |
| `say` accepted | 30 |
| Moves accepted | 20 (10 north, 10 south) |
| Reconnects | 5 |
| Rejected commands | 0 |
| Connect errors | 0 |
| Duration | 344 ms for the seated exercise |
| Crash lines | none |
| Fixes shipped | command-verb logs; Render origin refused |
