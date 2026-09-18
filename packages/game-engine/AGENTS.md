# @greenwood/game-engine

Pure game rules. No React, Fastify, Socket.IO, PostgreSQL, Drizzle, or browser APIs.

- Ticket 003 owns `look`. It returns a `room.snapshot` event.
- Ticket 006 owns `handleMove`. It mutates in-memory location and discovery, then emits sequenced events.
- Ticket 007 owns `handleSay`, `handleJoin`, and `handleLeave`. Socket handlers still do not invent room or chat text.
- Ticket 012 owns `handleTake`, `handleDrop`, `handleExamine`, and `handleInventory`. Unique items have one owner. Examine matches fixtures, enemies, nearby Collegians, and login names. `x` is an examine alias. `starterPerCharacter` placements mint one personal copy per Collegian who does not already hold that template. That is not a general regen system.
- Ticket 016 owns staff command parsing (`admin announce`, inspect, mute, kick, audit). The engine does not enforce role or persist the audit log.
- Ticket 013 owns `handleAttack`. Combat uses an injectable `random()` so tests stay deterministic. DS-007 / ADR-0034 owns lock-in turns: the first targeted `attack` or `cast` squares up only; later commands lock. `handleDefend` halves the reply. `handleFlee` ends with `outcome: "fled"` and stays in the room. `handleCombatExpire` auto-defends after `COMBAT_LOCK_MS` (12s). Enemy focus is a real field; enemies do not spend it yet. ADR-0035 owns party chorus: `minParty` must be present before a queen squares up; chorus waits for every lock or expire; dummy and hatchling stay solo. ADR-0037 keeps one shared spawn. Victory records the spawn on each living member, awards experience and loot to first-timers, and hides the foe from Collegians who have already stood. The practice dummy stays visible after a win. A party boss stands if at least one present Collegian has not. Combat loot is a personal copy per first-timer (`availableToCharacterId`). ADR-0038 owns consented classroom duels: `duel`, `duel accept`, and `duel decline`. Surprise `attack` on a classmate is still refused.
- Ticket 014 owns `handleCast`, focus, Ember, and burning. Presentation keys do not decide damage.
- Ticket 015 owns Arrival at the Collegium, `help`, `quests`, and one-time quest rewards. Join auto-look does not complete the look objective.
- Callers supply world state, a look or move intent, and an injectable clock / id source.
- Do not persist or emit sockets here.
- Accept an injectable random source when combat exists.
