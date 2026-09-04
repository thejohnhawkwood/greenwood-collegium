# @greenwood/contracts

Shared Zod schemas for commands, events, snapshots, and errors.

- Ticket 002 owns the event envelope. Do not invent gameplay events here during Ticket 001.
- The client must never be allowed to claim account, role, or character authority through payload fields.
- Every significant event needs structured data and plain-text narration once events exist.
