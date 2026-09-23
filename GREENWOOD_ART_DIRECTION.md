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

---

## 3. Non-negotiable visual rules

### A. Linework must carry the image

Use fine graphite-like contours and selective warm dark ink accents. Vary line weight. Allow some contours to break or soften where light meets the form. Keep the face, paws, garment construction, and important objects clearly drawn.

Use short directional marks, curved hatching, and occasional cross-hatching to describe shape. Fur strokes follow the animal's form; cloth marks follow folds; bark marks follow growth and grain. These marks should explain the object rather than act as random scratches.

Avoid thick, uniform cartoon outlines, mechanically clean vector edges, and dense engraving-like hatching across every surface. The result should be a resolved illustration, not an unfinished construction sketch.

### B. Pencil-crayon colour must remain visible

Treat **pencil crayon** as **coloured pencil**, not wax-crayon scribbling or children's colouring-book fill.

Build local colour with overlapping dry strokes, changes in pressure, and small gaps where the paper shows through. Use the grain of the drawing surface within the colour. Let the coloured-pencil marks help model cheeks, fur, sleeves, leather, timber, and shadows.

Do not imitate this by adding uniform noise over smooth rendering. At normal viewing size, at least the focal areas should visibly look drawn and coloured by hand.

### C. Watercolour supports; gouache accents

Use restrained transparent washes for local colour, atmosphere, and some shadows. Preserve the visibility of the drawing underneath and the dry marks above or beside the washes.

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
Aim toward Larry MacDougall's Gwelf as the principal stylistic reference, with
an especially strong pencil-and-ink appearance, visible pencil-crayon colour,
and selective gouache touches. Make a new Greenwood character and composition.

SUBJECT
[Species or object], [role], [personality], [action or pose].
Clothing and essential equipment: [specific practical garments and objects].
Setting: [environment, or explicitly specify an isolated asset].
Framing and output: [view, aspect ratio, background, crop, and intended use].

DRAWING FIRST
The finished image must read as a carefully observed drawing enriched with
colour, not as a smooth digital painting with a texture filter. Use fine
pencil-like contours and selective dark ink details, varied line weight,
broken edges, directional hatching, and clearly drawn facial and material
details. Preserve visible marks in the finished image. Keep the drawing
resolved and readable rather than messy or unfinished.

PENCIL-CRAYON COLOUR
Model the forms with layered coloured-pencil strokes: dry, slightly grainy
colour, pressure variation, and small flecks of paper visible between marks.
Let pencil strokes follow fur direction, cloth folds, and wood grain. Use
restrained transparent watercolour washes underneath or between the drawing
passages. Add only small matte gouache accents for selected highlights and
opaque details. Do not smooth the pencil texture into airbrushed gradients.

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
Allow a small purposeful accent. Use soft natural or modest lantern light
without cinematic glow. Maintain readable separation from the background.

FINAL IMPRESSION
Grounded animal presence, an individual stylized silhouette, visible drawing,
dry pencil-crayon modelling, restrained washes, and small chalky gouache
accents. Whimsical but not babyish; detailed but not glossy; atmospheric but
not blurry. A finished woodland-fantasy book illustration, not a game splash
screen, a photograph, or an image of a physical book.

EXCLUDE
Glossy 3D or CGI rendering, airbrushed fur, plastic highlights, thick uniform
cartoon outlines, vector-mascot styling, anime or chibi proportions, oversized
cute eyes, photorealism, neon magic, ornate oversized RPG equipment, cinematic
bloom, depth-of-field blur, all-over sepia staining, and fake grain laid over
otherwise smooth digital painting. No signatures, watermarks, or invented
lettering. Keep labels and interface text outside the illustration unless
explicitly requested.
```

---

## 5. Compact reusable style block

Use this when a detailed subject prompt already exists. Do not replace it with only "storybook fantasy."

```text
Greenwood art direction: grounded woodland fantasy with Larry MacDougall's
Gwelf as the principal reference. Drawing-led, not painting-led. Visible fine
pencil and selective ink contours; expressive line weight; directional
hatching; layered pencil-crayon colour with dry grain and paper showing
through. Restrained watercolour washes and small matte gouache accents.
Recognizable animal anatomy with an individual, slightly eccentric stylized
silhouette. Practical handmade clothing, believable wear, earthy colour,
clear values, and quiet folkloric atmosphere. A finished drawing enriched
with colour, never glossy digital fantasy with a paper-texture overlay.
```

### Negative direction block

```text
Avoid glossy CGI, airbrushed shading, plastic fur, photorealism, cinematic
bloom, oversized baby eyes, plush mascots, anime/chibi proportions, thick
uniform outlines, smooth vector fills, neon fantasy effects, ornate RPG
clutter, sepia-only colour, and artificial all-over texture. Do not erase the
drawing beneath paint. Do not turn visible pencil work into an unfinished
sketch or wax-crayon scribble.
```

Use exclusions as ordinary prompt instructions unless the chosen image tool has a verified separate negative-prompt field. Do not invent model-specific syntax, weights, or settings.

---

## 6. Strong correction prompt for an image that is close

Use only after identifying an actual accessible image to revise. Preserve its approved content; do not invent a source image or silently change the subject.

```text
Keep this image's approved character identity, species, clothing, equipment,
pose, framing, and composition. Change the rendering language, not the design.

Push it substantially toward visible pencil-and-ink drawing and pencil-crayon
colour. Restore fine contours, selective dark ink accents, directional fur
strokes, hatching in folds, and dry layered coloured-pencil modelling. Show
small gaps of paper between colour marks. Retain enough variation in line
weight to keep the drawing lively and individual.

Reduce smooth digital blending, polished fur, soft-focus lighting, and broad
paint coverage. Keep watercolour as restrained washes and gouache as a few
small matte opaque touches. Do not add a texture filter over the current
smooth finish; change how the forms themselves are described.

Preserve grounded anatomy and the character's stylistic edge. Do not make it
cuter, younger, rounder, more photographic, or more cinematic. Keep the result
finished, readable, and recognizably the same character.
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

- [ ] **Drawing:** Fine contours and deliberate marks remain visible in focal areas.
- [ ] **Pencil crayon:** Colour visibly uses layered dry strokes rather than smooth gradients.
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
