# 2026-09-16 — Dialogue stays on the room painting

## Intent
Branching talk, including Porter’s arrival greeting, must appear as speech and
choice buttons on the main visual. The story log is for look, movement, and
other description, not printed `Type say 1` menus.

## What changed
- Talk, reply, room-entry Porter nags, and Flint misfit open `openConversation`
  and emit only a short beat: “Porter Bramble speaks with you.”
- Arrival intro is the hedgehog description. The welcome speech and replies
  live on the painting from the `welcome` node, the same path future trees use.
- Linear NPC talk also opens the speech box. The client hides any leftover
  `Type say` menus from the story log.

## Next
Human confirm live Arrival and `talk porter`: boxes on the painting, story log
describes the courtyard only.
