# Review — character.mouse-female-fern.look v001 candidate-a

Visual inspection: performed, full image opened.
Status: needs_revision
Owner approval: pending. This file is not the style master.

## Generation

Route: Cursor native image tool
Requested image model: null
Reported image model: unknown (the tool did not disclose a backend id)
Calls attempted: 1
Source path: art/sources/character_mouse-female-fern_look__v001__candidate-a.png
SHA-256: 6018df077d03f7131663b069b6a1e6123d41430ad05834e574d97b420e00adc2
Measured: JPEG data in a .png name, 864×1152, RGB, 233208 bytes, no alpha
Supported aspect used: 3:4. The tool has no 2:3 / 512×768 control.
Live identity plate SHA-256: 70495ffc8ade8f9d84dec5dbb530c01931224f97f27667fcceee58cc4a9ce8c5

## Checks

| Criterion | Result | Observation |
|---|---|---|
| Drawing-led form | fail | Thick, even dark outlines around the whole figure. That is a cartoon contour, not fine pencil with broken edges. |
| Pencil-crayon colour | fail | Fur and cloth are smooth blended colour. No layered dry strokes or paper gaps at this size. |
| Paint restraint | fail | The colour reads as flat digital fill inside the outline. Gouache accents are not visible as small matte touches. |
| Identity and anatomy | pass | Mouse, ears, whiskers, cream muzzle, long tail, green hooded tunic, rope belt, hands on hips, feet planted. |
| Materials and personality | not_checked | Tunic construction is readable, but the thick outline prevents a fair materials judgement. |
| Family consistency | not_checked | No approved style master exists yet. |
| Production fit | fail | 864×1152 RGB JPEG, not 512×768 punched PNG. Background is a flat pink field, not transparency. |
| Integration readiness | fail | Not punched, wrong canvas, style failed. Not copied into public/art. |

Identity drift to correct later, without treating it as a style pass: the pose is more frontal than the live plate, and the chest fastening is one toggle rather than the live plate's loops.

## Decision

Do not use this candidate as the style master. Do not start species cards, looks, NPCs, rooms, objects, FX, or the arrival frame from it. The plan's comparison route (`gemini-3-pro-image`) was not called: no Gemini or OpenAI API key is configured, and this slice's native cap was one call.
