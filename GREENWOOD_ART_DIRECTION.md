# Greenwood Art Direction
## Drawing-led woodland fantasy: pencil, ink, pencil crayon, and gouache touches

**Document version:** 1.0  
**Prepared for:** Mr. Bird and the Greenwood project  
**Audience:** Cursor coding agents, image-generation agents, and human collaborators  
**Purpose:** Keep Greenwood's artwork grounded, distinctive, and visibly drawn rather than drifting into generic digital fantasy-animal art.

> **The governing instruction:** Make it read as a finished drawing enriched with colour, not a smooth digital painting decorated with a paper-texture filter.

---

## 1. The creative direction

Mr. Bird's primary reference is **Larry MacDougall's _Gwelf_**, with **Redwall** as broader woodland-adventure context. The desired Greenwood treatment places particular emphasis on **visible pencil-and-ink drawing, pencil-crayon modelling, restrained watercolour, and small opaque gouache touches**.

The earlier Greenwood direction was close. Preserve its grounded woodland characters, practical clothing, believable materials, and old-world atmosphere. Change the **surface treatment and emphasis**, not the entire concept:

- **More drawing:** Contours, directional strokes, hatching, and expressive line should remain visible in the finished artwork.
- **More pencil crayon:** Colour should have layered, dry, grainy marks that describe form, not uniformly smooth shading.
- **Less all-over paint:** Watercolour should support the drawing; gouache should provide selected accents rather than burying the linework.

**Desired character:** Grounded, whimsical, observant, slightly eccentric, weathered, literary, and quietly magical. Inviting does not mean babyish; naturalistic does not mean photographic. Retain a stylistic edge through memorable silhouettes, posture, expressive features, and handmade irregularity.

### Reference accuracy

The medium language in this guide specifies **Greenwood's requested appearance**. It is not a claim that every _Gwelf_ illustration was made with pencil crayon, ink, and gouache. MacDougall's artist statement identifies watercolour and an interest in the antique character of fairy-tale storytelling; it does not establish that complete mixed-media recipe. See the source note at the end.

---

## 2. Instructions to the Cursor agent

Apply this guide when writing image prompts, evaluating artwork, preparing assets, or integrating approved artwork into Greenwood.

**Before changing anything:** Read the applicable repository instructions and inspect the relevant existing assets, asset-loading code, and prompt templates. Discover the actual project structure. This document does not assume particular filenames, frameworks, species lists, or image-generation tools.

**Keep the scope bounded:** An art-direction request does not authorize a gameplay rewrite, a new UI layout, a replacement rendering engine, or a wholesale regeneration of existing artwork. Preserve approved character identity, equipment, composition, and functionality unless the task explicitly changes them.

**Do not substitute an easier aesthetic:** Do not deliver emoji, generic stock fantasy creatures, smooth vector mascots, or CSS silhouettes as finished replacements for the requested illustration. Such assets may be explicitly labelled temporary placeholders, but they do not meet this art direction.

**Use actual capabilities:** When an image-generation tool is available and authorized, supply the complete assembled prompt and relevant accessible references. When it is not, produce the prompt and asset specification, and report that image generation remains outstanding. Never claim an image was generated, inspected, or integrated without doing that work.

**Use concrete visual evidence:** Review actual images at working size. Do not declare success merely because the prompt contains the right words. When visual inspection is unavailable, mark the artwork unreviewed.

**Default first task:** Prepare one representative character prompt and one small visual test when generation is available. Do not replace production artwork or expand to a large batch until Mr. Bird has approved the direction or explicitly authorized those steps.

**Locked style, 22 September 2026, later the same night:** Philip Bird locked the comic-ink pass. Heavy black contour, flat local colour behind the line. The earlier ragged-boundary plate is no longer the style master.

Style masters, candidates only, not yet the live plates:

- Mouse: `art/sources/character_mouse-female-fern_look__v007__comic-ink.png`
  SHA-256 `5b126a7e8b6d435af36fe163d2ae8c3fa7bbcc289b2c84e7b8ff460c0a099439`
- Hare: `art/sources/character_hare-female-fern_look__v005__comic-ink.png`
  SHA-256 `b34f8eaa9e2b476b270297a6423af129c419c18bd0f447ddbd441d64067484e0`
- Lantern Court: `art/sources/room_lantern-court__v003__comic-ink.png`
  SHA-256 `0239eb1d03209b69572482c00d7057d359f2ac295a31f4f9e310d0421b376fe6`

The ink is a heavy near-black album contour, thick enough to read at a glance, sitting on top of the colour. Interior lines for clothes, fingers, and features are the same black pen. Colour is flat and local: one surface keeps one colour, with a single darker shadow of that same colour. Fur colour stays on fur. Cloth colour stays on cloth. Do not copy those three masters onto a different character or room. Do not copy Asterix, Obelix, or any other comic's characters or lettering. Slices are in `docs/art/SLICES.md`.

---

## 3. Non-negotiable visual rules

### A. Linework must carry the image

Draw the contour in dark ink that wobbles, doubles, and breaks. Line weight changes along a single edge: heavier on the outer silhouette, lighter and incomplete inside the ears, sleeves, and paws. Leave overlaps and small gaps. A face, paw, or satchel is described by those nervous marks, not by one closed stroke.

Use short directional ticks, curved hatching, and a few scratchy overlaps to describe shape. Fur is a handful of ink ticks plus a stain of colour, not a smooth brown fill. Cloth marks follow folds. These marks should explain the object rather than act as random scratches.

Avoid a single even cartoon outline, mechanically clean vector edges, soft bezier curves, and colour that fills neatly up to the line. The result should stay readable, with the rough edge left visible. Do not tidy the contour into a sticker.

### B. Pencil-crayon colour must remain visible

Treat **pencil crayon** as **coloured pencil**, not wax-crayon scribbling or children's colouring-book fill.

Build local colour with overlapping dry strokes, changes in pressure, and large gaps of bare paper. The wash or pencil often stops short of the ink or spills past it. Ears, muzzle highlights, and cloth lights stay the white of the paper. Colour is blotchy and local, not a gradient inside an outline.

Do not imitate this by adding uniform noise over smooth rendering. At normal viewing size, the edge itself must look drawn: broken ink, missed colour, paper showing. A smooth fill with a texture on top fails.

### C. Watercolour supports; gouache accents

Use thin, uneven transparent washes for local colour and a few shadow puddles. The wash is a stain on paper. It must not model the form into a soft digital volume. Preserve the ink, and leave bare paper beside the colour.

Use gouache selectively: a pale whisker, the edge of a worn cuff, a small lantern highlight, a chalky light on a book spine, or a few opaque marks on fur and cloth. These are matte paint touches, not glowing effects.

**Visual hierarchy:** Drawing and pencil-crayon modelling first; restrained washes second; opaque gouache accents third. This is a design priority, not a literal percentage formula or a claim about the reference artist's process.

### D. Grounded anatomy with deliberate stylization

Keep the species legible through its muzzle or beak, ears, body mass, paws, tail, and characteristic posture. Translate that structure into an upright fantasy character without turning it into a human body with an animal head.

Stylization is welcome: an angular silhouette, a slightly stooped scholar, an alert stance, a long practical coat, an uneven hood, or expressive ear placement. Ground the exaggeration in the character's species and personality.

Avoid oversized infant eyes, tiny button noses applied to every species, plush-toy proportions, exaggerated human musculature, and identical faces across the cast. Expression should come from posture and drawing, not a compulsory broad smile.

### E. Clothing and equipment should have a reason to exist

Use wool, linen, canvas, worn leather, wood, rope, ceramic, and modest metal fittings. Show understandable seams, closures, straps, folds, weight, and wear.

Give each character a small number of meaningful details: a repaired satchel, a field notebook, a rubbed brass clasp, or a cloak cut to accommodate a tail. Do not cover every surface with decorative clutter.

Magic and adventure remain welcome. Depict them through believable objects and restrained illustrated effects rather than constant neon glows, oversized crystalline weapons, or glossy ornamental armour.

### F. Earthy colour with clarity

Use moss and olive greens, bark and umber browns, warm cream, ochre, russet, dusty red, slate blue, and blue-grey shadows. Allow a small purposeful accent colour.

Muted does not mean monochrome brown. Maintain a clear light-dark structure and enough separation between the character, clothing, and background.

Use soft daylight, overcast woodland light, or modest lantern light as appropriate. Avoid default orange-and-teal grading, photographic depth-of-field blur, lens effects, bloom, and glossy rim lighting.

### G. Paper and atmosphere should not become a gimmick

Aim for the appearance of an illustration reproduced from lightly textured drawing paper. Keep the grain subtle and related to the marks. Do not add heavy sepia staining, burnt edges, a photographed sketchbook, a tabletop, or an artificial antique border unless the asset brief specifically requests them.

For isolated game assets, preserve the internal drawing texture without baking a rectangular paper background around the character. Background requirements are defined by the asset brief, not by the word "storybook."

---

## 4. Master image prompt

Replace every bracketed field before use. Keep the medium treatment intact when adapting the subject.

```text
Create an original illustration for Greenwood, a grounded woodland-fantasy world.
Aim toward the mark-making of Larry MacDougall's Gwelf: nervous pen-and-ink,
thin blotchy watercolour, and bare white paper. Make a new Greenwood character
and composition. Do not copy a Gwelf character, costume, pose, or signature.

SUBJECT
[Species or object], [role], [personality], [action or pose].
Clothing and essential equipment: [specific practical garments and objects].
Setting: [environment, or explicitly specify an isolated asset].
Framing and output: [view, aspect ratio, background, crop, and intended use].

INK EDGES, NOT SMOOTH SHAPES
The outer contour is dark ink that wobbles, doubles back, breaks, and changes
thickness along one edge. Heavier on the silhouette. Lighter, incomplete, and
overlapping inside ears, sleeves, fingers, and folds. Do not draw one closed
even outline. Do not use soft bezier curves or a sticker edge. Leave the
searching construction lines that a pen makes. Fur is a few ink ticks, not
smooth hair. The drawing must look scratchy and specific at normal size.

COLOUR MISSES THE LINE
Colour is a thin watercolour stain and a few dry coloured-pencil marks. It
often stops short of the ink or spills past it. Leave large areas of bare
white paper: ear lights, muzzle, cloth highlights, the gaps between marks.
Washes are blotchy and uneven, with puddles in the shadow and empty paper in
the light. Do not fill a shape neatly to its outline. Do not airbrush a
gradient inside the line. Gouache, if any, is a few small matte dabs, not a
smooth opaque layer. No paper-texture filter over a digital painting.

CHARACTER DESIGN
Ground the character in recognizable animal structure, then stylize the
silhouette, posture, and expression with confidence. Preserve the species'
muzzle or beak, ears, paws, tail, and body mass. Let the character be slightly
peculiar, thoughtful, capable, and individual, not an adorable generic mascot.
Use expressive posture and restrained facial acting rather than enlarged
baby eyes or a compulsory smile.

MATERIALS AND WORLD
Use practical handmade clothing and equipment: wool, linen, canvas, worn
leather, wood, rope, simple metal fittings, and well-used books or tools.
Show believable construction, weight, repairs, and wear. Include a few
specific storytelling details rather than decorative clutter. The world
should feel lived-in, old-fashioned, folkloric, and quietly magical.

COLOUR AND LIGHT
Use a restrained earthy palette with clear light-dark structure: moss and
olive, umber, warm cream, ochre, russet, dusty red, slate, and blue-grey.
Allow a small purposeful accent. Light is the white of the paper, not a
rendered highlight. No cinematic glow. Maintain readable separation from the
background.

FINAL IMPRESSION
A pen-and-ink animal on paper, with thin dirty washes and dry pencil marks,
broken contours, and colour that does not obediently fill the drawing.
Whimsical but not babyish. A book illustration drawn with a pen, not a game
splash, a cartoon sticker, or a smooth digital character.

EXCLUDE
Smooth digital painting, airbrushed fur, soft gradients inside a clean
outline, easy rounded edges, thick uniform cartoon outlines, vector-mascot
styling, glossy CGI, plastic highlights, anime or chibi proportions, oversized
cute eyes, photorealism, neon magic, ornate oversized RPG equipment, cinematic
bloom, depth-of-field blur, all-over sepia, and fake grain laid over an
otherwise smooth render. No signatures, watermarks, or invented lettering.
Do not reproduce another artist's characters or signed drawings.
```

---

## 5. Compact reusable style block

Use this when a detailed subject prompt already exists. Do not replace it with only "storybook fantasy."

```text
Greenwood locked style: the comic-ink pass of 22 September 2026.
Heavy near-black album contour, thick enough to read at a glance, on top of
flat local colour. One darker shadow of the same colour. Fur stays fur.
Cloth stays cloth. Masters: mouse v007 comic-ink, hare v005 comic-ink,
Lantern Court v003 comic-ink, under art/sources/. Do not copy those
characters onto a different species. Do not copy Asterix, Obelix, or Gwelf
characters or lettering. No missing ink, no camouflage stains, no smooth
digital painting.
```

### Negative direction block

```text
Avoid smooth digital painting, airbrushed fur, glossy CGI, plastic fur,
photorealism, cinematic bloom, oversized baby eyes, plush mascots,
anime/chibi proportions, neon effects, ornate RPG clutter, and fake grain
over a smooth render. The locked line is a heavy black comic contour with
flat local colour behind it. Do not drop that ink. Do not camouflage fur
onto cloth. Do not copy Gwelf, Asterix, or Obelix characters or lettering.
```

Use exclusions as ordinary prompt instructions unless the chosen image tool has a verified separate negative-prompt field. Do not invent model-specific syntax, weights, or settings.

---

## 6. Strong correction prompt for an image that is close

Use only after identifying an actual accessible image to revise. Preserve its approved content; do not invent a source image or silently change the subject.

```text
Keep this image's approved character identity, species, clothing, equipment,
pose, framing, and composition. Change the rendering language, not the design.

Match the locked comic-ink pass. Use a heavy near-black contour on top of
flat local colour, with one darker shadow of that same colour. Fur stays
fur. Cloth stays cloth.

Do not turn the figure into the style-master mouse or hare. Do not drop the
ink. Do not camouflage the clothes. Do not make the character photographic.
```

---

## 7. Greenwood subject modules

Combine **one subject module**, the **master prompt or compact style block**, and **one output specification**. These are example briefs, not declarations of existing game canon or approved assets.

### Mouse scholar-adventurer

An alert mouse scholar with a narrow, recognizable muzzle and a slightly stooped travelling posture. A worn wool waistcoat over linen, a patched shoulder satchel, and one small field notebook. A tiny ink mark on a cuff provides the storytelling detail. The expression is curious and serious rather than irresistibly cute.

### Badger gatekeeper

A solidly built badger with a broad species-specific head and a patient, grounded stance. A practical heavy coat, weathered belt, simple keys, and a wooden staff. Suggest strength through weight and posture, not human bodybuilding proportions or massive armour. Let pale pencil and a few gouache marks describe the facial pattern.

### Squirrel merchant

A quick, attentive squirrel with a distinctive tail silhouette and an asymmetrical working pose. A canvas apron, a compact bag, and a few wrapped goods. Draw the tail as grouped forms with directional pencil work, not a cloud of digitally rendered hair. Show personality through the ears, stance, and handling of one object.

### Rabbit novice

A young rabbit apprentice with a species-appropriate muzzle, long ears, and a long-legged silhouette. A slightly oversized but practical tunic, a cord belt, and a borrowed book. Convey nervous determination without infant proportions. Use the ears and shoulders to carry the expression.

### Owl archivist

An owl archivist with a compact body, an observant tilt of the head, and a practical draped garment that respects the wings. One weathered reference book and a simple desk. Describe feather groups with layered pencil strokes and selective ink. Do not add unexplained human arms or duplicate limbs.

### Academy gate environment

An old timber academy entrance fitted among roots and stone. Worn steps, understandable joinery, moss in damp joints, and a modest lantern. Give the architecture a gently irregular silhouette without making it structurally incoherent. Resolve the focal gate in pencil and ink; simplify the distant woods into restrained washes. Leave sign surfaces blank for separately rendered text.

### Inventory object

One well-used woodland object: a leather satchel, field notebook, lantern, wooden staff, or ceramic flask. Give it a clear silhouette, understandable construction, and one distinctive wear detail. Use pencil-crayon modelling and fine ink accents. Avoid glowing rarity borders, floating particles, or an elaborate scenic background.

---

## 8. Output specifications by asset type

These are suggested briefs. Match actual dimensions, naming conventions, and integration requirements to the repository and the task.

| Asset | Composition instruction | Practical constraint |
|---|---|---|
| Character portrait | Head and upper body; ears and identifying features comfortably inside the crop. | Check expression and species recognition at the real portrait size. |
| Full-body character | Readable three-quarter pose with paws, tail, and equipment fully included. | Do not crop important anatomy or paint a paper rectangle around an isolated asset. |
| Inventory paper-doll artwork | Use the agreed neutral pose, framing, scale, and equipment arrangement. | Match existing attachment points or layout; do not invent an equipment system. |
| Item icon | One object with simplified internal detail and a strong silhouette. | Reduce detail before increasing blur or sharpening; test at the actual icon size. |
| Environment illustration | Clear focal area, believable scale, restrained distant detail. | Reserve required space for text or controls rather than baking those into the art. |
| Map artwork | Fine drawn paths, readable landforms, limited washes, and consistent symbols. | Preserve the actual map geometry; labels and interactive targets remain separate. |

For transparent assets, request real transparency only through supported output options. A drawn checkerboard is not transparency. Inspect exports against both light and dark backgrounds for leftover paper halos and damaged edges.

For UI integration, keep text, buttons, focus indicators, and interaction targets functional and readable. The illustration style is not permission to make the interface look like illegible handwriting. Do not replace an existing Unicode or tile-based game layer solely because this guide describes larger illustrations.

---

## 9. Review checklist and rejection criteria

Review the actual output, not the intention behind it.

- [ ] **Drawing:** Dark ink wobbles, doubles, and breaks. The figure is not one closed even outline.
- [ ] **Ink:** Near-black pen is visible on top of the colour. Missing ink fails.
- [ ] **Colour:** Washes follow the light on each surface. Fur stays fur-coloured. Cloth stays cloth-coloured. Random blotches fail.
- [ ] **Paint restraint:** Washes support the drawing; opaque gouache remains selective.
- [ ] **Character:** Species, posture, anatomy, and personality are convincing without mascot proportions.
- [ ] **Materials:** Clothing and objects have understandable construction and purposeful wear.
- [ ] **Palette:** Earthy colour remains varied and readable, not muddy or uniformly sepia.
- [ ] **Consistency:** The image respects approved character details and the established Greenwood treatment.
- [ ] **Production fit:** Crop, background, transparency, and detail work at the intended display size.

**Reject or revise** an attractive image that fails the drawing, pencil-crayon, or character requirements. Attractive generic fantasy is not the same as the requested direction. A style failure is not solved by adding more background foliage.

### Diagnose before revising

| Problem observed | Targeted correction |
|---|---|
| Glossy or airbrushed | Replace smooth modelling with directional pencil strokes; reduce highlights and bloom. |
| Watercolour dominates | Restore visible contours and dry colour modelling; reduce broad wash coverage. |
| Too cute or generic | Restore species-specific muzzle, body proportions, posture, and restrained expression. |
| Too photographic | Simplify fur into drawn groups and strengthen the intentional silhouette. |
| Too scratchy or unfinished | Resolve focal contours and group values; remove indiscriminate construction marks. |
| Too muddy or antique-filtered | Recover warm paper lights, cool shadows, and selected local colours; remove all-over sepia. |
| Correct texture only when enlarged | Strengthen a few meaningful strokes and simplify competing detail at display size. |

Change the smallest relevant set of instructions. Keep the subject, framing, and approved design stable while correcting the rendering treatment.

---

## 10. Asset record and agent handoff

For each proposed or generated asset, record the following in the project's existing asset log or a companion Markdown note. Do not replace an existing tracking system merely to adopt this format.

```text
Asset name / ID:
Purpose and intended display size:
Source character or object specification:
Actual reference files inspected:
Exact assembled prompt:
Generation tool / model / available settings, or "not generated":
Output path, or "no output file":
Visual review: passed / needs revision / not visually inspected:
Specific observed issues:
Approval status: draft / awaiting Mr. Bird / approved:
Integration status: not integrated / integrated and checked:
```

Do not infer Mr. Bird's approval from an agent's own review. Keep candidate assets separate from approved production assets until replacement is authorized.

### Paste-ready instruction for Cursor

```text
Read GREENWOOD_ART_DIRECTION.md completely and use it as the art-direction
brief for this task. Inspect the relevant repository instructions, existing
artwork, and prompt or asset pipeline before changing files.

Preserve the current Greenwood concept, approved character designs, and game
functionality. The main correction is visible pencil-and-ink structure,
layered pencil-crayon colour, restrained watercolour washes, and small matte
gouache touches, using Larry MacDougall's Gwelf as the principal reference.
Do not substitute generic digital fantasy, a texture overlay, or vector
mascots for this treatment.

Start with one representative character asset brief and an exact generation
prompt. Generate and inspect a small test only when the necessary tools are
available and authorized; otherwise deliver the prompt and explain what
remains ungenerated. Apply the guide's review checklist, report specific
visual shortcomings, and keep drafts separate from production assets.
Do not batch-regenerate assets, change gameplay, or redesign the UI without
an explicit task authorizing that work.
```

---

## Source and scope note

**Basis:** Mr. Bird's directions in the preceding Greenwood art discussion, especially the request for more pencil crayon, a pencil-and-ink appearance, and gouache touches. The agent workflow, example subjects, and review criteria above are proposed implementation guidance, not independently verified observations about specific _Gwelf_ images.

**Artist statement referenced in the discussion:** Larry MacDougall, “About Larry and Gwelf,” Home of Larry MacDougall and Gwelf. The statement describes his use of watercolour and his interest in older fairy tales and their antique character.

Source: `https://homeoflarrymacdougallandgwelf.godaddysites.com/about-larry-and-gwelf`

The stronger pencil-crayon / ink / gouache treatment is Greenwood's requested art direction, not a documented universal account of MacDougall's materials. No original _Gwelf_ illustrations are included in this file, and no Greenwood repository or current artwork was inspected in preparing this standalone guide. Inspect the actual available references before claiming visual comparison or asset compatibility.

**Final reminder:** Draw the forms. Let the pencil colour show. Use paint sparingly. Preserve the animal, the personality, and the sense of a lived-in woodland world.
