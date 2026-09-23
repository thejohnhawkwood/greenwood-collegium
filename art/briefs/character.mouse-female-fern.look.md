# Asset Brief — character.mouse-female-fern.look

## Identity and purpose

Asset ID: character.mouse-female-fern.look
Asset kind: character look plate
Canonical entity ID: mouse / female / fern (Courtyard)
Game surface and source-code consumer: `lookArtSrc` in `apps/web/src/app/portrait-layers.ts`
Current source/master revision: production file `apps/web/public/art/characters/looks/mouse-female-fern.png` (approval of the painted rendering: unknown; identity is the live plate)
Owner approval evidence for source identity, or unknown: unknown for the drawing-led revision; the live plate is the identity lock

## Technical contract

Intended display size: portrait in the play shell; full figure on zoom
Requested generation size/aspect ratio: 512×768 (2:3)
Actual supported provider size/aspect ratio: native tool enum has 3:4, not 2:3
Framing, view, facing, pose, and safe margins: three-quarter standing, feet planted, ears and tail inside the crop, hands on hips
Background/real alpha requirement: flat chroma #EE3173, then punch. The tool has no alpha switch.
Required export sizes/formats: PNG 512×768 after fit and punch
Canvas, baseline, anchors, and layer order, when applicable: single look plate; overlays do not stack
Map/room geometry or UI overlay constraints, when applicable: null
Runtime destination, confirmed from repo: `apps/web/public/art/characters/looks/mouse-female-fern.png` — not written this slice

## Reference inputs

| Actual path / asset revision | Role | Inspected? | Upload permitted? | Origin and usage permission |
|---|---|---|---|---|
| apps/web/public/art/characters/looks/mouse-female-fern.png | identity, pose, outfit | yes | yes, this task | Greenwood production plate |

## Preserve exactly

Species and anatomy: mouse; ears, whiskers, muzzle, paws, long tail, body mass
Face, markings, and silhouette: cream muzzle and belly, light brown fur, standing three-quarter pose
Outfit, palette, and equipment: moss-green hooded tunic, toggle closures, rope belt
Pose, camera, crop, and composition: hands on hips, feet planted, isolated figure
Other identity locks: female Collegian, Courtyard (fern) clothing colour

## Change deliberately

Rendering/style correction or new visual requirement: visible pencil and selective ink, dry pencil-crayon colour, restrained watercolour, small matte gouache. Less plush eyes.
Allowed variations: line weight and colour-mark texture
Prohibited changes: new species, new clothes, cuter or younger proportions, paper rectangle, lettering

## Style and prompt

Art guide version/hash: GREENWOOD_ART_DIRECTION.md version 1.0
Exact assembled generation prompt location: art/prompts/character.mouse-female-fern.look.v001.txt
Provider-reported revised prompt location, if returned: null
Required medium treatment: visible pencil-and-ink, dry layered pencil-crayon colour, restrained watercolour, selective matte gouache.

## Authorization

Requested mode: CREATE / REVISE, slice 0 of the drawing-led plan
Permitted generation route: Cursor native image tool, one call
Explicit generation authorization/evidence: owner asked to implement the drawing-led plan, slice 0
Maximum calls, including revisions/retries: 1
Maximum spend/currency, or explicitly bounded native usage: one native call; no external API
Pricing basis and known uncertainty: native usage is not priced in this session
Production integration authorized? No

## Review and stopping point

Mandatory identity checks: mouse, green tunic, rope belt, hands on hips, tail and ears
Mandatory style checks: drawing, pencil crayon, paint restraint at display size
Technical compatibility checks: decodes as an image; chroma can be punched
Preview at full size and actual UI size: required
Required deliverables: one candidate, prompt, hash, review
Stop after: this one image, pending owner approval
