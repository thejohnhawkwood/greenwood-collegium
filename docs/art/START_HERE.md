# Start Here — Cursor Tasks

The locked look is the comic-ink pass. Current slices are `docs/art/SLICES.md`. Rooms, NPC cutouts, and object plates from that pass are in `apps/web/public/art/`. Collegian looks are still candidates in `art/sources/`. Combat FX and the arrival procession are not redrawn.

Use one task at a time. These are prompts, not installed shell commands.
References to an asset or candidate below must be replaced with actual IDs
returned by your audit/generation session.

## 1. Audit the project first

```text
Use the greenwood-art subagent. Read GREENWOOD_ART_ASSET_AGENT.md and
GREENWOOD_ART_DIRECTION.md completely, plus applicable repository instructions.

Run AUDIT only. Inspect existing artwork, actual image consumers, manifests,
character references, and available generation/image-viewing tools. Do not
read secrets into the conversation. Record confirmed facts and unknowns.

Recommend the minimum asset registry/review structure that fits this repo,
and propose one representative character for a style pilot. Preserve all
existing production artwork, game behaviour, and uncommitted changes.

No generation, external API calls, spending, installations, file moves,
commits, or deployment. Give me the audit report and proposed next task.
```

As an alternative, begin with `/greenwood-art-workflow` and the same task, or
attach the two manuals and ask the main agent to execute it directly.

## 2. Initialize the minimum management files

```text
Run INITIALIZE using the audit's confirmed paths. Create or extend only the
minimal asset registry, brief/prompt folders, and review/report structure.
Reuse existing equivalents and preserve every existing record.

Import metadata for actual existing assets without moving files. Record
approval as unknown where evidence is absent. Do not insert template/example
assets as real records. Separate candidate, owner approval, and integration
states. Do not build a dashboard, add dependencies, or change runtime code.

Validate the resulting records and report exactly what changed. No image
generation or paid external calls.
```

## 3. Create one native-tool pilot

```text
Run CREATE for the representative character proposed in the audit, using
Cursor's built-in image-generation tool only. Use the actual approved identity
reference when available. Preserve its species, outfit, equipment, and
composition; any new design choices remain draft proposals.

Apply the drawing-led art guide: fine pencil and selective ink, dry layered
pencil-crayon colour, light watercolour support, and small matte gouache
accents. No smooth digital painting with a paper overlay.

Authorize one generation call only, with no external API calls or tool
installations. Use only supported tool parameters. Save and open the actual
output. Review full size and intended UI size; register the candidate and
report concrete problems. Do not self-approve or change production assets.
If the backend ID is not disclosed, record it as unknown.
```

## 4. Revise one real candidate

```text
Run REVISE on [ACTUAL_ASSET_ID / REVISION / FILE]. First open the image and
verify the registered source. Preserve all identity, pose, equipment, and
framing locks. Correct only [SPECIFIC_OBSERVED_PROBLEM].

Use the already authorized native route for one generation/edit call. Create
a new revision; do not overwrite the source. Re-run visual and technical
review, then report whether the targeted problem was actually corrected.
No production changes and no inherited owner approval.
```

## 5. Show the collection without changing approvals

```text
Run MANAGE. Build a lightweight local review gallery or contact sheet from
the actual registered image files. Group by asset kind and review status;
show IDs, revisions, dimensions, and observed issues. Include actual-size
previews and light/dark backgrounds for cutouts.

Do not invent thumbnails, fetch third-party art, install a dashboard, or
change any approvals. Keep the gallery outside the public runtime build.
For a static gallery, give me an ID/revision-based decision template rather
than pretending approval buttons save changes.
```

## 6. Approve and integrate only a named revision

```text
I approve [ACTUAL_ASSET_ID], revision [ACTUAL_REVISION], matching the exact
candidate just reviewed. Record this decision against that source hash.

Run EXPORT and INTEGRATE only for [SPECIFIED_UI_SURFACE]. Preserve the source,
create the required delivery sizes, and keep the previous mapping for rollback.
Do not alter gameplay, map topology, equipment contracts, or unrelated UI.

Run the relevant build/tests and inspect the actual UI. Report the changed
files, visual checks, failures/unknowns, and rollback procedure. Do not push,
deploy, or delete the previous assets.
```

For an external-provider trial, use the setup guidance in
`docs/art/CURSOR_IMAGE_MODEL_GUIDE.md`, specify the permitted provider/model,
and authorize the call count and spending separately.
