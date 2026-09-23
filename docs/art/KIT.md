# Greenwood Art Agent Kit

**Installed in this repository on 22 September 2026.** The project README at the
repository root was left in place. The creative brief and operating manual are
`GREENWOOD_ART_DIRECTION.md` and `GREENWOOD_ART_ASSET_AGENT.md` at the repository
root. Tasks are in [`START_HERE.md`](START_HERE.md).

**For Mr. Bird • Version 1.0 • 22 September 2026**

This is a prompt-and-configuration kit for Cursor. It is not a standalone asset
manager application. It does not include generated artwork, a paid API adapter,
API keys, an installed MCP server, or changes to the Greenwood repository.

## What is included

| File | Purpose |
|---|---|
| `GREENWOOD_ART_ASSET_AGENT.md` | Complete creator/manager operating prompt. |
| `GREENWOOD_ART_DIRECTION.md` | The supplied creative brief, copied unchanged. |
| `.cursor/agents/greenwood-art.md` | Small Cursor subagent entry point using the full manuals. |
| `.cursor/skills/greenwood-art-workflow/SKILL.md` | Explicitly invoked workflow for a regular Agent session. |
| `docs/art/CURSOR_IMAGE_MODEL_GUIDE.md` | Dated model research, practical recommendation, API pricing, and optional adapter implementation prompt. |
| `docs/art/templates/asset-brief.template.md` | Reusable per-asset brief. |
| `docs/art/templates/asset-record.template.json` | Example metadata record with unknowns and pending approvals, not a live manifest. |
| `START_HERE.md` | Copy/paste audit, initialization, pilot, and integration tasks. |

The subagent and skill are two ways to run the same workflow. They do not need
to call one another. Prefer the skill or direct manual attachment when you want
a hands-on art session; use the subagent when a larger coding task needs to
assign bounded art work to a specialist.

## Install without disturbing the project

1. Extract the ZIP into a temporary folder and inspect it.
2. Merge its contents into the Greenwood repository root. Include `.cursor`.
   Preserve existing files with the same names until you compare them. In
   particular, do not overwrite a newer art guide with the bundled copy.
3. Open a new Cursor Agent chat. The subagent definition follows Cursor's
   documented `.cursor/agents/` format; the workflow uses the documented
   `.cursor/skills/<name>/SKILL.md` format. See sources C4–C5 in the model guide.
4. Submit the first task from `START_HERE.md`. It is an audit only: no image
   generation, API spending, installation, or production modification.

If the slash entry is not discovered in your version/account, explicitly attach
or reference `GREENWOOD_ART_ASSET_AGENT.md` and `GREENWOOD_ART_DIRECTION.md` in an
Agent chat and ask it to execute the same task directly. The manuals do not rely
on automatic subagent discovery.

## Model setup in one paragraph

Begin with Cursor's native image-generation tool for one pilot. Cursor's launch
documentation names Nano Banana Pro, while the currently exposed tool—not a
prompt pretending to select a backend—determines what controls you can use.
For explicit external image-model control, the quality-first candidate in the
research guide is `gpt-image-2.5-sunburst`, compared with `gemini-3-pro-image`.
That external route needs a configured API or approved bridge and separate
spending authorization. The agent's `model: inherit` is the manager-model
setting, not an image-model selector. Sources and qualifications are in the
model guide; no Greenwood-specific model contest was run.

## Important workflow decisions

An image can pass technical checks and still fail Greenwood's art direction.
The agent must open it and inspect it at actual display size. "Ready for owner
review" is not "approved." Mr. Bird approves a particular revision, and
production integration requires its own explicit scope.

Creation does not authorize redesigning combat, replacing the Unicode world,
changing travel geometry, or inventing paper-doll attachment points. The agent
must preserve the existing application contracts.

The default pilot is one candidate. Additional revisions and batches need a
bounded task. Native usage and external API spending are not treated as free,
unlimited, or interchangeable.

## Validation performed on this kit

The Markdown/frontmatter structure and example JSON were checked locally.
Required files and cross-file references were verified, and the bundled art
guide was compared byte-for-byte with the supplied guide. No Cursor runtime,
provider authentication, image-generation call, or Greenwood integration test
was performed. Those are workspace tasks, not something this download claims
to have completed.
