---
name: greenwood-art-workflow
description: Operate Greenwood's drawing-led art creation and asset-management workflow, including briefs, generation, reference consistency, visual review, records, exports, and approval-aware integration.
disable-model-invocation: true
---

# Greenwood Art Workflow

Read and follow the complete repository-root `GREENWOOD_ART_ASSET_AGENT.md`
and `GREENWOOD_ART_DIRECTION.md`, plus all applicable repository instructions.
Locate moved copies rather than guessing paths. If missing, report the missing
manual and limit work to a factual audit.

Execute this workflow in the current agent session. Do not invoke the same skill
recursively. Use a bounded delegated task only when needed and pass its complete
brief, reference paths, constraints, and authorization explicitly.

Mode defaults to AUDIT. Supported modes are AUDIT, INITIALIZE, CREATE, REVISE,
REVIEW, MANAGE, EXPORT, INTEGRATE, and RETIRE. They are workflow instructions,
not CLI commands assumed to exist.

When creation is authorized, use an actual permitted image tool and save real
outputs. Otherwise prepare the brief/prompt and report the specific blocker.
Never invent images, inspections, approvals, backend IDs, or provider settings.

Keep the style drawing-led: visible pencil/ink, dry pencil-crayon colour,
restrained washes, and small matte gouache touches. Preserve species-specific
anatomy and character identity. No smooth generic fantasy with a grain overlay.

Consult `docs/art/templates/` for example records and briefs; adapt existing
project conventions instead of replacing them. Consult
`docs/art/CURSOR_IMAGE_MODEL_GUIDE.md` only when model or integration guidance
is relevant, and recheck official docs before implementing provider calls.

Keep candidates outside production; Mr. Bird approves exact revisions.
No API spending, integration, deletion, installation, deployment, or bulk
regeneration beyond the explicit task and its limits.
