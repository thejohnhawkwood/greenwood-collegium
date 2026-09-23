# ADR-0041: Drawing-led art direction

## Status

Accepted, 22 September 2026.

## Context

ADR-0032 put original painted plates in `apps/web/public/art/` and named Gwelf
and Beatrix Potter as atmosphere only. Later notes described digital
watercolour and gouache. The owner asked for a stronger drawn surface: visible
pencil and ink, pencil-crayon colour, restrained watercolour, and small
gouache touches, with Larry MacDougall's _Gwelf_ as the principal stylistic
reference and Redwall as broader woodland-adventure context.

That request changes how new pictures should look. It does not replace the
catalog's file names, the compositor, or the typed command layer.

## Decision

- `GREENWOOD_ART_DIRECTION.md` is the creative brief for new and revised
  illustrations. `GREENWOOD_ART_ASSET_AGENT.md` is the operating manual.
  Tasks are in `docs/art/START_HERE.md`.
- The finished image must read as a drawing enriched with colour. Fine pencil
  contours and selective ink carry the form. Colour is layered coloured pencil.
  Watercolour supports the drawing. Gouache is a few matte accents.
- Characters stay grounded woodland animals with practical clothing. Original
  Greenwood compositions only. Do not copy book illustrations, lettering, or
  existing characters.
- Generate, review, owner approval, and production integration are separate.
  Philip Bird approves a specific revision. Candidates stay out of
  `apps/web/public/art/` until an integration task names the surface.
- ADR-0032 still owns look-plate paths, room plates, and the compositor.
  This decision does not authorize a batch regeneration, a gameplay rewrite,
  a new equipment system, or a change to map geometry.

## Consequences

Agents that write prompts, judge pictures, or wire approved art read the brief
first. Historical sprint notes keep their earlier wording. A file already in
production is not evidence that its rendering matches this direction.
