# Review — character.mouse-female-fern.look v002 candidate-a

Visual inspection: performed.
Status: needs_revision
Owner approval: pending. Not the style master.

Route: Cursor native image tool. Reported image model: unknown.
Prompt: art/prompts/character.mouse-female-fern.look.v002.txt
Prompt SHA-256: 931e981d379eaca5b8debcacd0c2e732b92406101aff7d4e2c9c43badd4fa998
Source: art/sources/character_mouse-female-fern_look__v002__candidate-a.png
SHA-256: b7f78b08b0972e7caedd4548013fd7cb76ffa0ad15cdbfb44e01d3c7ec84c9bf
Measured: JPEG, 864×1152, RGB, 259660 bytes. No alpha.
Identity reference: the live plate only. The Gwelf sheets were not sent to the generator.

## Checks

| Criterion | Result | Observation |
|---|---|---|
| Broken ink edge | fail | One dark closed contour around the whole figure. Slight thickening, still a sticker outline. |
| Colour misses the line | fail | Brown fur and green tunic are filled up to the outline. Paper white is not left in the ear or the cloth. |
| Thin blotchy wash | fail | Soft shading inside the shapes. Not a stain that stops short of the ink. |
| Identity | pass | Mouse, green hooded tunic, rope belt, hands on hips, long tail, ears. |
| Production fit | fail | JPEG 864×1152, not a punched 512×768 PNG. |

The revised prompt asked for wobbling broken ink and colour that misses the line. This call did not do that. v001 remains the earlier failure. Neither file is a style master. Live art was not replaced.
