# @greenwood/contracts

Shared Zod schemas for commands, events, snapshots, and errors.

- Ticket 002 owns the event envelope, semantic segments, and the `room.snapshot` example.
- Every significant event needs structured `payload` and `narration`.
- Classic rendering uses `narration`. Later renderers may use `segments`.
- The client must never be allowed to claim account, role, or character authority through payload fields.
- Do not add Socket.IO, engine rules, or extra event payloads here unless a ticket asks.
