# Three pushes — mouse-female-fern v003

Identity lock for all three: the live plate `apps/web/public/art/characters/looks/mouse-female-fern.png`.
Route: Cursor native image tool. Reported image model: unknown.
The Island Mice sheet was not sent to the generator. None of these is approved, and none is in `apps/web/public/art/`.

Each file below is JPEG data, 864×1152, RGB, on flat pink. The tool has no 512×768 control.

## paper-gap

Prompt: `art/prompts/character.mouse-female-fern.look.v003-paper-gap.txt`
Prompt SHA-256: `541ca0c03024e6c4f1dfdf5653976a9da702330698cff5463c15981e478acf28`
File: `art/sources/character_mouse-female-fern_look__v003__paper-gap.png`
File SHA-256: `b176b0e6b23f81c24dce73452aaa84948b865983fcd0444f2ff1a7a0275b9b90`

Asked for: short hooked ink strokes with a whisker-wide white gap between the ink and the colour.

Got: the same closed outline and filled fur and tunic as the earlier candidates. The white gap is not there. Identity held: mouse, green hood, rope belt, hands on hips, tail.

## open-contour

Prompt: `art/prompts/character.mouse-female-fern.look.v003-open-contour.txt`
Prompt SHA-256: `ac06bf5d37ea3249c7296f47a90f57b094d0947d5bae1706b9c7c88d5b258ab8`
File: `art/sources/character_mouse-female-fern_look__v003__open-contour.png`
File SHA-256: `97997f60b38b03bcdf6ae18acabf31b12850f545e217d1bfc852f7eb85aa51e6`

Asked for: no ink on the far ear rim, the underside of the tail, or the tunic hem. Those edges were supposed to be only the end of a wash.

Got: ink still closes the ears, the tail, and the hem. The green is a little more uneven than paper-gap. Identity held.

## sparse-stain

Prompt: `art/prompts/character.mouse-female-fern.look.v003-sparse-stain.txt`
Prompt SHA-256: `73416f774c32f5c057a317d004416262cb0163e7e8db90cd32c5eb4d23013b45`
File: `art/sources/character_mouse-female-fern_look__v003__sparse-stain.png`
File SHA-256: `41d1ccd908f9f76e6cdb2118501ad83bf29746eacf87185c90366809d470df12`

Asked for: mostly bare paper, about a dozen fur ticks, four or five green puddles, two brown puddles, and no closed outline.

Got: the tunic and body are white paper with a few hard-edged green and tan puddles. That part moved. The contour is still one clean closed line around the whole figure, and the brown fur is gone. Pose, hood, toggles, rope belt, and hands on hips remain.

## How to repeat one

Use the prompt file for the id you pick, the live mouse plate as the only reference image, aspect ratio 3:4, and the native image tool. Do not attach the Gwelf sheets. Record the new file hash beside the prompt hash above.
