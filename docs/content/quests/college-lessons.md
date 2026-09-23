# College lessons

- **Series:** spine (hearth track, parallel with the bell)
- **Status:** live
- **Stable ids:** `first-lessons-{school}`, `second-lessons-{school}`, `third-lessons-{school}`
- **JSON:** [`packages/content/quests/`](../../../packages/content/quests/)
- **Primer:** [PROGRESSION.md](../PROGRESSION.md)
- **Spine:** [STORY.md](../STORY.md)
- **Play / author:** [adventures.md](../adventures.md)
- **Parallel:** [The Bell Below](the-bell-below.md) auto-starts when first lessons complete
- **After queen report:** breadcrumb into [The East Watch](the-east-watch.md)

School pick is Alder’s High Study tree. He sends the Collegian to the Hall of Schools (down, south, then east through the meadow), not to Flint. Completing first lessons inks three Primer starters at rank 1, starts second lessons, and starts the bell line.

## Shape (keep IDs)

| Tier | XP | What they type | Engine side-effect |
| --- | --- | --- | --- |
| First | 15 | `look` hearth → `defeat` dummy → `talk` mentor | Ink the signature stem; start second + Bell Below |
| Second | 20 | `cast` the signature in the hearth → `talk` mentor | Grant lesson-4 ink; start third |
| Third (“Alder’s Leave”) | 25 | `talk` Alder → `talk` mentor | Grant lesson-5 ink |

## School table (IDs to keep)

| School | Mentor | Hearth | Dummy spawn | Starter leaf |
| --- | --- | --- | --- | --- |
| Ember | Cinder | `hearth-ember` | `enemy-practice-dummy-hearth-ember` | ember |
| Thorns | Briar | `hearth-thorn` | `enemy-practice-dummy-hearth-thorn` | briar |
| Veil | Mist | `hearth-veil` | `enemy-practice-dummy-hearth-veil` | shade |
| Stars | Lumen | `hearth-stars` | `enemy-practice-dummy-hearth-stars` | azimuth |
| Stone | Quern | `hearth-stone` | `enemy-practice-dummy-hearth-stone` | keystone |
| Steel | Edge | `hearth-steel` | `enemy-practice-dummy-hearth-steel` | strike |

## Live copy

Expanded 20 September 2026. Mentors speak in complete sentences with a hearth smell. They say “Look around this hearth” and “Talk to Headmaster Alder.” Third lessons warn that the Clock Tower stair comes first if Alder is still sending you down.

Mentors may mention Holm in **one** sentence after the spine beat. They do not run the mystery.

Hearth smells: Cinder soot and oatcakes; Briar sap and shears; Mist lavender and curtains; Lumen ink and brass; Quern granite dust; Edge oil and mail.
