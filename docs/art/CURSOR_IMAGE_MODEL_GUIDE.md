# Image Models for Greenwood in Cursor

**Research checked:** 22 September 2026  
**Purpose:** Choose a practical image-generation route for Greenwood's drawing-led woodland art.  
**Evidence boundary:** Current official product documentation and provider descriptions; no side-by-side Greenwood generation test or access to Mr. Bird's Cursor account was performed.

## Recommendation

**Start with Cursor's native image-generation tool for one style-calibration asset. For a quality-first, explicitly controlled external workflow, test GPT-Image-2.5 Sunburst first, against Nano Banana Pro.** Use Flare or Nano Banana 2 for faster iteration only after confirming that their outputs hold the same Greenwood style. These are workflow recommendations based on documented capabilities, not a claim that a benchmark proves which model is best at pencil-crayon woodland illustration. [C1–C3, O1–O4, G1]

For this project, the decisive qualities are visible drawing rather than smooth rendering, preservation of character identity across edits, controllable composition, usable cutouts, and consistency across a collection. A model's generic "best image quality" claim does not settle those questions.

## 1. Two models do different jobs

The **Cursor agent model** reads the repository, assembles briefs, operates tools, reviews images when vision is supported, and edits code. The **image-generation model** produces the image. Cursor documents image generation as an agent tool, and its support team explains that the image backend is not a model selected in the ordinary Models settings. [C1, C3]

Changing the conversation from Grok to Gemini therefore does not establish that you switched the image generator to a different Gemini image model. Cursor currently documents image-generation tool access for Grok 4.6, so that model can remain the manager while a separate backend creates the art. [C1, C6]

The included subagent uses `model: inherit`. That chooses the parent's agent model; it does **not** select an image API model. A vision-capable agent is useful for reviewing actual images, but its own praise is not proof that the art meets the brief. [C1, C4]

## 2. The shortlist

| Option | Access from Cursor | Documented capability | My recommended role |
|---|---|---|---|
| Cursor native image generation | Built-in agent tool; no separate image-provider connector required for that native route. | Text/reference-image generation, inline previews, and saved files. The January 2026 launch names Google Nano Banana Pro. | First pilot and simplest working route. |
| GPT-Image-2.5 Sunburst | Explicit OpenAI API call through a local script or approved MCP bridge. | OpenAI's most capable image-generation/editing model; positioned for precision-heavy creative workflows. | Quality-first trial for reference characters, difficult corrections, and production cutouts. |
| GPT-Image-2.5 Flare | Explicit OpenAI API call through the same type of bridge. | The 2.5 release's general-purpose option, emphasizing quality, editing, and faster generation. | Faster candidate iteration once style fidelity is confirmed. |
| Nano Banana Pro / Gemini 3 Pro Image | Direct Gemini API or approved MCP; also the backend named in Cursor's native launch documentation. | Google's premium option for complex visual instructions and professional asset production, with up to 4K output. | Strong alternative for detailed storybook assets and controlled references. |
| Nano Banana 2 / Gemini 3.1 Flash Image | Direct Gemini API or approved MCP unless your native tool explicitly exposes it. | Google's general-purpose balance of quality, speed, and cost, with multi-reference consistency and up to 4K. | Faster volume work after an approved style test. |

Sources: native route [C1–C3]; Sunburst [O1–O2]; Flare [O1, O3]; Google models [G1]. External access is an implementation route using Cursor's documented shell/MCP capabilities and provider APIs, not a claim that those image models appear in Cursor's agent-model picker. [C1, C7, O4, G1]

### Exact API identifiers checked

```text
OpenAI premium:     gpt-image-2.5-sunburst
OpenAI general:     gpt-image-2.5-flare
Google premium:    gemini-3-pro-image
Google general:    gemini-3.1-flash-image
```

These are the identifiers in the provider documentation checked on the research date. Do not assume older `-preview` IDs, consumer product names, or a reasoning-model ID are interchangeable. Recheck the selected endpoint and account before implementation. [O2–O3, G1]

### What I would not make the default

I would not choose Google's Nano Banana 2 Lite for the initial style/identity calibration. Google explicitly positions it for speed and cost, and says it is not optimized for multiple reference inputs or sequential multi-turn edits—the exact things a recurring Greenwood character workflow needs. [G1]

I would also avoid adding a second image provider or a large custom art stack before you have compared a small representative set. The first bottleneck may be weak reference control or an underspecified rendering brief, not model capability.

## 3. Native Cursor: easiest starting point

Open the Greenwood folder in Cursor and use an Agent session with image-generation tool access. The native workflow accepts a description or reference image, shows a preview, and saves output to `assets/` by default. Your art agent should record the actual returned path and register a candidate rather than treating that default location as approved production storage. [C1]

**Important limitation:** Cursor's 22 January 2026 release notes name Nano Banana Pro, but the general tool documentation I checked does not establish an exposed per-request model selector or a guaranteed current underlying API ID. Record the backend as unknown when the tool response does not disclose it. Do not claim that writing `model=...` or "use 4K Pro mode" in a prompt selects an unsupported backend/control. [C1–C3]

The March support thread includes then-current model-access limitations. Do not treat that old list as today's compatibility matrix; check the current model page and the tools actually exposed in your session. [C3, C6]

Suggested first native generation request, after the audit:

```text
Use the greenwood-art workflow. CREATE one candidate for the representative
character identified in the audit, using Cursor's built-in image-generation
tool only. Use the actual approved identity reference when one is available.

Apply GREENWOOD_ART_DIRECTION.md with visible pencil-and-ink form,
layered pencil-crayon colour, restrained washes, and small matte gouache
accents. Keep the character's identity and equipment unchanged.

One generation call only. No external API calls, installations, or production
changes. Open the real result, inspect it at intended display size, register
it as a candidate, and report specific failures as well as strengths.
Record the image backend as unknown unless the tool actually identifies it.
```

That prompt authorizes a native tool call when you submit it. Check your own Cursor usage arrangements; this guide does not establish that native generation is free or unlimited.

## 4. Quality-first external workflow: Sunburst

OpenAI released Images 2.5 on 8 September 2026. Its API variants are Sunburst and Flare; Sunburst is positioned for creative work needing more precise editing, while Flare is the general-purpose faster option. [O1–O3]

**My reason to test Sunburst first:** Greenwood requires revisions such as "keep this exact character, but replace the smooth modelling with visible pencil strokes." Editing precision, explicit model selection, and documented transparency controls make it a strong production candidate. That is my inference from the features, not an observed result on your art. [O2, O4]

Both 2.5 variants support transparent output using `background: "transparent"` with PNG or WebP. They expose quality levels from `low` through `max` plus `auto`, and documented sizes including `1024x1024`, `1536x1024`, and `1024x1536`. [O4]

For an initial portrait comparison, I would use an explicitly selected model, a 1024-square output, and a moderate or high quality setting. I would not begin with maximum quality or experimental large dimensions. Once the rendering matches, test the cutout/alpha workflow separately. Higher quality is not a substitute for a precise medium treatment.

### Connecting an external provider

Use a small local development script before adding a large plugin stack. Cursor can run shell commands, and OpenAI exposes generation/edit APIs. An approved MCP bridge is another supported integration route, but MCP is not required simply to run an API script. [C1, C7, O4]

A useful implementation request for Cursor is:

```text
Implement an optional, local-only image-provider adapter for the Greenwood
art workflow. Do not modify runtime game code or install a dashboard.

Inspect the repo's language/runtime first. Read the current official OpenAI
image-generation and API reference documentation. Support explicit model
selection, new generation, and edits using real local reference files.

Start with gpt-image-2.5-sunburst and gpt-image-2.5-flare only if those exact
IDs remain supported. Read OPENAI_API_KEY from approved environment/secret
storage. Never print it, commit it, embed it in a frontend bundle, or ask me
to paste it into a chat transcript.

Accept a brief/request file, validate paths and supported settings, implement
a dry-run mode, save actual image bytes atomically without overwriting prior
revisions, and write a sanitized sidecar with prompt, model evidence,
parameters, input/output hashes, dimensions, request ID, and returned usage.

Enforce an authorized call limit, bounded retries, and the agreed cost
controls. An interrupted paid request must not be blindly duplicated.
Do not invent seed, negative-prompt, or input-fidelity fields.

Write tests for dry-run, missing credentials, invalid references, API failure,
no image returned, output collisions, and successful response decoding.
Use mocked responses for those tests. Do not make a paid smoke-test call
until I explicitly authorize its scope and spending limit.

Document the exact command that was actually implemented. Keep generated
art separate from approval and integration.
```

This is an implementation prompt, **not** a claim that the kit contains that adapter or a working API connection. Once built and tested, the art agent can call the implemented command.

For Google, the same architecture can call the Gemini API with the exact image-model ID, permitted reference inputs, and supported image configuration. Do not assume the standalone Gemini API's full controls are exposed through Cursor's native tool. [G1, C1–C3]

## 5. Cost and access

Prices below are **USD**, as published on the research date. These are API prices, not a promise about your Cursor plan's billing.

| Provider/model | Published pricing information | Important qualification |
|---|---|---|
| Google Nano Banana Pro | Image output: approximately $0.134 at 1K/2K; $0.24 at 4K, standard API pricing. | Input and any other billable processing are additional. |
| Google Nano Banana 2 | Image output: approximately $0.067 at 1K; $0.101 at 2K; $0.151 at 4K, standard API pricing. | These are output-only equivalents, not a complete edited-image quote. |
| OpenAI Sunburst and Flare | Both list $30 per million image-output tokens, $8 per million image-input tokens, and $5 per million text-input tokens. | Equal token prices do not mean equal per-image cost; consumption varies with model, size, quality, and references. |
| Cursor native tool | A universal per-image charge was not established in the documentation reviewed. | Check account usage and plan details rather than treating it as free. |

Google pricing: [G2]. OpenAI pricing and usage caveat: [O2–O4]. Cached-input rates and other options are documented by the providers; the table is not a complete tariff.

For example, 100 Nano Banana Pro 1K/2K outputs would have approximately **$13.40 USD of image-output charges alone**, using Google's published rounded per-image figure. That excludes inputs, other processing, retries, taxes, and currency conversion. This arithmetic is a planning illustration, not a project quote. [G2]

Use actual returned usage to measure your own workflow. The meaningful project metric is **cost per accepted asset**, including rejected candidates and edits, not just the first generated image's price.

## 6. Choose through a small controlled comparison

Use the same permitted identity reference, same locked character details, same aspect ratio, same intended display size, and the same medium brief across the models being tested. Record every model-specific change. Do not pretend one provider's "high" setting equals another's.

Start with one representative character candidate per shortlisted route. Then, only within an authorized test budget, request the same narrow rendering correction. Compare:

- Visibility of actual pencil/ink/pencil-crayon modelling, not an all-over paper filter.
- Identity preservation, species anatomy, and the character's stylistic edge.
- Production usability: crop, fine edges, transparency where required, and readability at game size.
- The number of corrections and total cost needed to reach an acceptable asset.

Those are Greenwood's evaluation criteria, not published benchmark results. Once Mr. Bird approves the direction, lock a small reference set and use it across related assets. Do not silently replace the chosen model when a newer one appears; test the replacement against the same reference assets first.

**Practical decision:** native Cursor first for minimal setup; Sunburst first among external quality-focused trials; keep Nano Banana Pro as a serious comparison; move routine work to Flare or Nano Banana 2 only when the results justify it.

## Sources

All checked on 2026-09-22. The numbered references above separate documentation from the recommendations in this guide.

**[C1] Cursor — Agent overview, tools.** Image-file reading, shell execution, native image generation, inline previews, and default storage.  
`https://cursor.com/docs/agent/overview`

**[C2] Cursor — Subagents, Skills, and Image Generation, 22 January 2026.** Native launch identifies Nano Banana Pro.  
`https://cursor.com/changelog/2-4`

**[C3] Cursor support — Image generation models not showing up, 18 March 2026.** Staff explanation of the separate internal image tool and model-picker behaviour. Historical compatibility details are not treated as a current exhaustive list.  
`https://forum.cursor.com/t/image-generation-models-not-showing-up-settings-models-search-image-returns-none-on-cursor-2-6-19/155150`

**[C4] Cursor — Subagents.** File location, frontmatter, model inheritance, explicit invocation, and tools.  
`https://cursor.com/docs/subagents`

**[C5] Cursor — Agent Skills.** Skill structure, frontmatter, explicit invocation, and reusable workflow resources.  
`https://cursor.com/docs/skills`

**[C6] Cursor — Grok 4.6.** Current documented agent tools include image generation.  
`https://cursor.com/docs/models/grok-4-6`

**[C7] Cursor — Model Context Protocol.** External tools, local server configuration, and environment-variable credentials.  
`https://cursor.com/docs/mcp`

**[O1] OpenAI — Introducing ChatGPT Images 2.5, 8 September 2026.** Current release and Sunburst/Flare positioning.  
`https://openai.com/index/introducing-chatgpt-images-2-5/`

**[O2] OpenAI — GPT-Image-2.5 Sunburst model.** Model ID, capabilities, and token pricing.  
`https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst`

**[O3] OpenAI — GPT-Image-2.5 Flare model.** Model ID, capabilities, and token pricing.  
`https://developers.openai.com/api/docs/models/gpt-image-2.5-flare`

**[O4] OpenAI — Image generation guide.** Generation/editing APIs, transparent output, quality/size controls, usage, and limitations.  
`https://developers.openai.com/api/docs/guides/image-generation`

**[G1] Google — Gemini API image generation.** Nano Banana family, current IDs, recommended roles, reference/editing capabilities, and Lite limitations.  
`https://ai.google.dev/gemini-api/docs/image-generation`

**[G2] Google — Gemini Developer API pricing.** Standard image-output equivalents and additional token charges.  
`https://ai.google.dev/gemini-api/docs/pricing`
