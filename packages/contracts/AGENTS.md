# @greenwood/contracts

Shared Zod schemas for commands, events, snapshots, and errors.

- Ticket 002 owns the event envelope, semantic segments, and the `room.snapshot` example.
- Every significant event needs structured `payload` and `narration`.
- Classic rendering uses `narration`. Later renderers may use `segments`.
- The client must never be allowed to claim account, role, or character authority through payload fields.
- Do not add Socket.IO, engine rules, or extra event payloads here unless a ticket asks.
- Ticket 009 owns HTTP auth request and public session schemas. The client must not claim account, role, or character authority.
- Sign-in may include `audience` (`student` or `staff`). `authClassroomSchema` is the teacher roster. It never includes passwords.
- Ticket 010 owns `session.snapshot` for authenticated resume.
- Ticket 012 owns `item.taken`, `item.dropped`, and `inventory.updated`.
- Ticket 013 owns combat start, turn, action, end, and `progress.experience_gained`.
- Ticket 014 owns Ember, burning, `combat.status_applied`, and the Ember event fixture. Presentation keys do not decide damage.
- Ticket 015 owns `quest.updated` and `progress.level_gained`. The client must not invent quest completion or level.
