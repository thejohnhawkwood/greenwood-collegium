# @greenwood/contracts

Shared Zod schemas for commands, events, snapshots, and errors.

- Ticket 002 owns the event envelope, semantic segments, and the `room.snapshot` example.
- Every significant event needs structured `payload` and `narration`.
- Classic rendering uses `narration`. Later renderers may use `segments`.
- The client must never be allowed to claim account, role, or character authority through payload fields.
- Do not add Socket.IO, engine rules, or extra event payloads here unless a ticket asks.
- Ticket 009 owns HTTP auth request and public session schemas. The client must not claim account, role, or character authority.
- `authSocketTicketSchema` is a short-lived play handshake. It is not account, role, or character authority.
- Character creation schemas carry chosen name, species, and gender. The client still cannot claim account authority.
- Sign-in may include `audience` (`student` or `staff`). `authClassroomSchema` is the teacher roster. It never includes passwords.
- Ticket 010 owns `session.snapshot` for authenticated resume.
- `sessionHelloSchema` is a process boot handshake. It is not account, role, or character authority.
- Ticket 012 owns `item.taken`, `item.dropped`, and `inventory.updated`.
- Ticket 013 owns combat start, turn, action, end, and `progress.experience_gained`. DS-007 / ADR-0034 adds `combat.ended` outcome `fled`, action verbs `defend` / `flee`, `combat.started` enemy focus, and optional `play-state.encounter`. Optional `combat.turn_started` `lockNarration` is server-authored; the client must not invent it.
- Ticket 014 owns Ember, burning, `combat.status_applied`, and the Ember event fixture. Presentation keys do not decide damage.
- Ticket 015 owns `quest.updated` and `progress.level_gained`. The client must not invent quest completion or level.
- ADR-0039 and ADR-0042 add optional `play-state.primer` leaves. The client must not invent nodes, legality, ranks, rank previews, or descriptions. Quest entries may include a projected `current` step and `reward`. The client must not invent either. A map room may include `quest` when that room is the current step's place. An unknown room still has no title. Optional `play-state.duelAsk` is an outgoing classroom challenge. The client must not invent it.
- ADR-0040 adds `play-state.slots`. The client must not invent wear positions.
