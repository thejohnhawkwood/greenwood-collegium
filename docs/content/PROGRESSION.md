# PROGRESSION.md — Field Primer and spell bible

Developer bible for careers, ranks, and every authored leaf. Runtime truth remains
the JSON under `packages/content/spells/` and the engine in
`packages/game-engine/src/primer.ts`. If this file and a live spell file disagree,
the live file is what students cast until a content ticket lands the change.

Last updated: 20 September 2026. Law: [ADR-0039](../adr/0039-field-primer.md).
Story spine stays in [STORY.md](STORY.md). Storylines stay in
[quests/](quests/README.md) (college loop: [college-lessons.md](quests/college-lessons.md)).
Room and quest IDs stay in [room-and-quest-summary.md](room-and-quest-summary.md).
Play and JSON authoring stay in [adventures.md](adventures.md).

---

## 1. How to use this file

- **Agents and laptops.** Start here before adding a spell, changing a rank, or
  touching college quests. Then open the matching `packages/content/spells/<id>.json`.
- **JSON still wins at runtime.** New leaves ship as content files. This bible
  says what those files should mean and how the Primer spends them.
- **Stable IDs.** Spell ids are kebab-case file names. Published ids live on
  saved `known_spells`. Do not rename an inked leaf without a progress migration.
- **Do not invent a second system.** No Strength. No hidden to-hit. No type
  chart. No shop. Presentation keys stay cosmetic.
- **Do not implement from flavour alone.** Insight copy that names a future door
  or fixture is author intent. Only `chart` currently reads live world state.
  See [§6.3](#63-insight-that-is-still-copy).

---

## 2. Career law

Every Collegian carries a personal **Field Primer Book** (`field-primer`,
`starterPerCharacter`). The moss-bound primer in the Stacks is the one school
copy. `spells` / `grimoire` / `book` reads the personal book. `spells <leaf>`
opens one page. `stats` shows School, inked leaves, and the next published
lesson.

### 2.1 Ink budget

- First lessons ink **three starter leaves at rank 1**.
- Lessons 4–20 each offer **one pick** from three cards.
- A 1–20 career has **20 ink** (3 + 17). Seven leaves at rank 5 would need **35**.
  A Collegian cannot max every leaf.
- A pick either inks a new leaf at rank 1 or raises an owned leaf by 1, cap 5.
- A **vital leaf** is not a spell. It is +2 health and +1 focus.

### 2.2 Ranks

Ranks are **I–V**. The numbers `cast` spends come from `ranks[rank - 1]` on the
spell JSON. Missing tables fall back to `defaultRankTable` in `primer.ts`:

| Step | Default change |
| --- | --- |
| II | +1 damage, else +1 heal, else +1 burn rounds, else +1 restore focus |
| III | −1 focus if focus > 1, else +1 damage |
| IV | +1 damage / heal / restore; margin note |
| V | +1 damage / heal / burn rounds; last margin note |

Authored tables always win when they have five rows.

### 2.3 Vitals per lesson

Character level still raises **+4 max health** and **+2 max focus**. Lesson 1 is
20 / 10. Lesson 20 is 96 / 48 before vital leaves.

```text
maxHealth = 20 + (level - 1) * 4
maxFocus  = 10 + (level - 1) * 2
```

### 2.4 Published experience table

Cumulative experience required to *reach* the lesson. Dummy kills grant **0**.

| Lesson | Cumulative XP | From previous |
| ---: | ---: | ---: |
| 1 | 0 | — |
| 2 | 10 | 10 |
| 3 | 25 | 15 |
| 4 | 45 | 20 |
| 5 | 70 | 25 |
| 6 | 100 | 30 |
| 7 | 140 | 40 |
| 8 | 190 | 50 |
| 9 | 250 | 60 |
| 10 | 320 | 70 |
| 11 | 400 | 80 |
| 12 | 490 | 90 |
| 13 | 590 | 100 |
| 14 | 700 | 110 |
| 15 | 820 | 120 |
| 16 | 950 | 130 |
| 17 | 1090 | 140 |
| 18 | 1240 | 150 |
| 19 | 1400 | 160 |
| 20 | 1570 | 170 |

College quest rewards (on top of other quests): first lessons 15, second 20,
Alder's leave 25. Rooms for lessons 11–20 are a later content pass.

---

## 3. College loop (lessons 1–5)

Teacher-and-dummy. The orchard dummy and the six hearth dummies stay up after a
win ([ADR-0037](../adr/0037-first-time-spawns.md)).

1. **Arrival.** Porter, lantern-court, personal Primer in the pack.
2. **Flint spark.** South Orchard. Orchard Ember is Flint's practice spark. It
   stays castable even if the Ember leaf is not yet inked.
3. **First lessons.** Look around the hearth. Defeat that School's hearth dummy. Talk
   to the mentor. Inks the three starters at rank 1. Quest id `first-lessons-<school>`.
4. **Second lessons.** Cast the School's first starter in the hearth. Talk to the
   mentor. Opens the first three-card offer (lesson 4). Quest id
   `second-lessons-<school>`.
5. **Alder's leave.** Talk Alder, then the mentor. Opens the second offer
   (lesson 5). Quest id `third-lessons-<school>`.

Second-lesson cast targets:

| School | Cast |
| --- | --- |
| Ember | `ember` |
| Thorns | `briar` |
| Veil | `shade` |
| Stars | `azimuth` |
| Stone | `keystone` |
| Steel | `strike` |

Lessons 6–20 open three cards when the character level rises. Pending offers
persist. Repeat command ids do not reroll.

---

## 4. How a pick works

The server builds three cards. The living frame paints them as clickable buttons
with title, badge, numbers, and description. Clicking sends `1`, `2`, or `3`.
Typed `1` / `2` / `3` stay canonical when no conversation is open.

### 4.1 Card kinds

| Kind | Badge | Meaning |
| --- | --- | --- |
| `upgrade` | Rank II–V | Owned leaf +1 |
| `unlock` | New | Own-school leaf at rank 1 |
| `courtesy` | Courtesy | Neighbor School *starter* at rank 1, from lesson 8 |
| `vital` | Vital | +2 health, +1 focus (padding when the pool is thin) |

### 4.2 Soft weights

Tag overlap and own-school count bias the book toward itself.

| Kind | Weight |
| --- | --- |
| Upgrade | `10 + 4×tagOverlap + 2×ownSchool` (`×1.3` if 5+ own-school leaves) |
| Unlock | `8 + (4 if ownSchool < 4) + 3×tagOverlap` (`×0.6` if 5+ own-school; `×0.5` at lessons 4–5) |
| Courtesy | `3` |
| Vital | `1` |

If all three starters are already rank 5, the last slot prefers an unlock so the
book cannot stall on upgrades alone.

### 4.3 Neighbor courtesy (lesson 8+)

Only the neighbor's **first three** leaves can appear.

| School | Neighbors |
| --- | --- |
| Ember | Thorns, Veil, Stone |
| Thorns | Ember, Veil, Steel, Stars |
| Veil | Ember, Thorns, Stone |
| Stars | Thorns, Steel |
| Stone | Ember, Veil |
| Steel | Thorns, Stars |

---

## 5. Tags

Every leaf has one tag. Offers use the tag for weighting, not a type chart.

| Tag | Typical work |
| --- | --- |
| `strike` | Damage, sometimes burn or a mend on the hit |
| `control` | Skip the foe's answer, riposte, or weaken |
| `ward` | Turn or halve the next blow, or brace |
| `gift` | Heal, restore focus, ready a later hit, or insight |

If `tag` is missing, the engine infers: heal / restore-focus / insight → gift;
avoid-hit / brace / halve-hit / `*ward*` → ward; skip-counter / riposte / weaken
→ control; else strike.

---

## 6. Effect glossary

Numbers below are rank I unless a rank table says otherwise. Presentation keys
do not decide damage.

| Effect | Engine | What students see |
| --- | --- | --- |
| *(none, with `damage`)* | Hostile hit | Named damage. Optional burn. |
| `skip-counter` | `encounter.effects` | Damage, and the foe cannot answer this round. **Not applied in a classroom duel.** |
| `weaken` | `encounter.effects` | Damage, then the foe's next blow is −2 (floor 1). **Not applied in a classroom duel.** |
| `riposte` | Hostile hit + lock | Damage. Refused until `hitThisEncounter`. |
| `avoid-hit` | `ignoreNextHit` | The next blow misses. `blaze-mantle` also burns the attacker (1×1). |
| `halve-hit` | `halveNextHit` | The next blow is halved. The foe still answers. |
| `heal` | Self | Restore health, optional focus. |
| `restore-focus` | Self | Restore focus only. |
| `brace` | Self, once per fight | +4 max health and +4 current. |
| `ready-strike` | `nextAttackBonus = 1` | The next `attack` lands +1. |
| `ready-spell` | `readySpellIds`, bonus 2 | The next listed leaf deals +2 damage. |
| `insight` | Self, `context: any` unless noted | Prints authored text. Live exceptions: [§6.3](#63-insight-that-is-still-copy). |
| `leech` | Hostile hit + caster mend | Damage the foe, then restore `heal` on the caster. Capped at max health. No mend clause if nothing is restored. |

Burning (`burningRounds` × `burningDamage`) applies to enemies, not duel
opponents. `minLevel` on older JSON is leftover; `cast` checks an inked leaf
(except Ember).

### 6.1 Special locks

- **Ember** is always castable (Flint's orchard spark). Ranked numbers still
  come from an inked Ember leaf when one exists.
- **Riposte** waits until you have been hit in this fight.
- **Buttress** waits until you have been struck.

### 6.2 Ready leaves

`ready-spell` bonus is a flat **+2** on the next matching cast, then clears.

| Spell | Readies |
| --- | --- |
| Stoke | Ember, Cinder Snap |
| True North | Azimuth, Flare |

### 6.3 Insight that is still copy

These print authored sentences today. They do **not** yet change rooms, doors,
or fixtures. Do not write features that assume they already do.

| Spell | Printed promise |
| --- | --- |
| Ask-First | The next living fixture will name whether it cuts or feeds. |
| Night-Eye | The next turning is named. |
| Quiet Step | The next door says if someone waits beyond it. |
| Stillness | The next locked door says key or shoulder. |

Live insight:

- **Chart** reprints discovered room titles. It does not name fog.

---

## 7. School kits

Seven leaves each. The first three are college starters.

### 7.1 Ember — Mentor Cinder — hearth `hearth-ember`

Strike and linger. Fire that stays.

| # | Id | Name | Tag | Rank I | What it does |
| ---: | --- | --- | --- | --- | --- |
| 1 | `ember` | Ember | strike | F4 D5 burn 2×1 | Taught flame. Flint's orchard spark; always castable. |
| 2 | `cinder-snap` | Cinder Snap | control | F3 D3 skip | Sharp spark. The foe cannot answer. |
| 3 | `hearth-ward` | Hearth Ward | ward | F3 avoid | The next blow misses. |
| 4 | `flame-breath` | Flame-Breath | strike | F5 D4 burn 1×1 | Gust of open flame. One burn. |
| 5 | `heart-fire` | Heart-Fire | gift | F3 restore 4 | Any context. Keep unused fire as focus. |
| 6 | `blaze-mantle` | Blaze-Mantle | ward | F4 avoid + burn | Next blow misses; the attacker takes burn 1×1. |
| 7 | `stoke` | Stoke | gift | F3 ready | Next Ember or Cinder Snap deals +2. |

### 7.2 Thorns — Mentor Briar — hearth `hearth-thorn`

Lash, hold, mend.

| # | Id | Name | Tag | Rank I | What it does |
| ---: | --- | --- | --- | --- | --- |
| 1 | `briar` | Briar | strike | F4 D4 burn 2×1 | Living thorns that cling. |
| 2 | `bind` | Bind | control | F3 D3 skip | Vines hold the next swing. |
| 3 | `greenstitch` | Greenstitch | gift | F4 heal 6 | Mend in or out of a fight. |
| 4 | `prune` | Prune | strike | F3 D6 | Clean cut. No cling. |
| 5 | `thornwall` | Thornwall | ward | F3 avoid | The next blow finds thorn and misses. |
| 6 | `sap` | Sap | gift | F3 heal 4 + focus 2 | Smaller mend and a little focus. |
| 7 | `ask-first` | Ask-First | gift | F2 insight | Copy only today. See §6.3. |

### 7.3 Veil — Mentor Mist — hearth `hearth-veil`

Fold, cut, miss.

| # | Id | Name | Tag | Rank I | What it does |
| ---: | --- | --- | --- | --- | --- |
| 1 | `shade` | Shade | strike | F4 D6 | Cold fold that cuts the unguarded side. |
| 2 | `slip` | Slip | ward | F3 avoid | The next blow finds empty air. |
| 3 | `quiet-step` | Quiet Step | gift | F2 insight | Copy only today. See §6.3. |
| 4 | `after-image` | After-Image | control | F3 D4 skip | The fold cuts first. They cannot answer. |
| 5 | `hush` | Hush | strike | F5 D8 | The longer dark. Late shadowy cut. |
| 6 | `pale` | Pale | ward | F3 halve | Next blow is halved. Foe still answers. |
| 7 | `unname` | Unname | control | F3 D4 weaken | A named cut, then the next blow is −2. |

### 7.4 Stars — Mentor Lumen — hearth `hearth-stars`

Named light and the chart.

| # | Id | Name | Tag | Rank I | What it does |
| ---: | --- | --- | --- | --- | --- |
| 1 | `azimuth` | Azimuth | strike | F3 D5 | Measured point of light. Instant. |
| 2 | `flare` | Flare | strike | F4 D4 burn 2×1 | Named light that lands and stays. |
| 3 | `night-eye` | Night-Eye | gift | F2 insight | Copy only today. See §6.3. |
| 4 | `transit` | Transit | control | F3 D3 skip | The point lands first. |
| 5 | `wane` | Wane | ward | F3 avoid | A dim that turns the next blow. |
| 6 | `chart` | Chart | gift | F2 insight | **Live:** reprints explored room titles. No fog. |
| 7 | `true-north` | True North | gift | F3 ready | Next Azimuth or Flare deals +2. |

### 7.5 Stone — Mentor Quern — hearth `hearth-stone`

Weight, hold, patience.

| # | Id | Name | Tag | Rank I | What it does |
| ---: | --- | --- | --- | --- | --- |
| 1 | `keystone` | Keystone | strike | F5 D6 | Short heavy blow. |
| 2 | `stomp` | Stomp | control | F4 D4 skip | Steals footing. Foe cannot answer. |
| 3 | `brace` | Brace | ward | F3 brace | +4 max and current health, once per fight. |
| 4 | `quarry` | Quarry | strike | F5 D8 | Slower, harder hit. |
| 5 | `lintel` | Lintel | ward | F3 avoid | Stone turns the next blow. |
| 6 | `stillness` | Stillness | gift | F2 insight | Copy only today. See §6.3. |
| 7 | `buttress` | Buttress | gift | F3 heal 5 | Small heal. Locked until you have been struck. |

### 7.6 Steel — Mentor Edge — hearth `hearth-steel`

Cut, answer, hold the edge.

| # | Id | Name | Tag | Rank I | What it does |
| ---: | --- | --- | --- | --- | --- |
| 1 | `strike` | Strike | strike | F3 D6 | Clean taught cut. No linger. |
| 2 | `riposte` | Riposte | control | F3 D7 | Answer after a hit. Locked until struck. |
| 3 | `ready-steel` | Ready Steel | gift | F2 ready-strike | Next `attack` +1. |
| 4 | `guard-break` | Guard-Break | control | F3 D4 skip | Beaten guard. Foe cannot answer. |
| 5 | `draw` | Draw | strike | F3 D4 heal 2 | Leech cut. Lands, then you mend. |
| 6 | `second-wind` | Second Wind | gift | F3 heal 5 | Small heal, any context. |
| 7 | `oath-edge` | Oath-Edge | strike | F5 D9 | Held cut. Costs more. Lands more. |

---

## 8. Rank tables

`F` = focus cost. `D` = damage. `H` = heal. `R` = restore focus. Burn is
`rounds × damage`. Skip / weaken / avoid / ready do not grow a second number
unless the table lists one.

### Ember

| Leaf | I | II | III | IV | V |
| --- | --- | --- | --- | --- | --- |
| Ember | F4 D5 burn 2×1 | F4 D6 | F3 D6 | F3 D7 | F3 D8 |
| Cinder Snap | F3 D3 skip | F3 D4 | F2 D4 | F2 D5 | F2 D6 |
| Hearth Ward | F3 avoid | F3 | F2 | F2 | F2 |
| Flame-Breath | F5 D4 burn 1×1 | F5 D5 | F4 D5 | F4 D6 | F4 D7 |
| Heart-Fire | F3 R4 | F3 R5 | F2 R5 | F2 R6 | F2 R6 |
| Blaze-Mantle | F4 avoid+burn | F4 | F3 | F3 | F3 |
| Stoke | F3 ready | F3 | F2 | F2 | F2 |

### Thorns

| Leaf | I | II | III | IV | V |
| --- | --- | --- | --- | --- | --- |
| Briar | F4 D4 burn 2×1 | F4 D5 | F3 D5 | F3 D6 | F3 D7 |
| Bind | F3 D3 skip | F3 D4 | F2 D4 | F2 D5 | F2 D6 |
| Greenstitch | F4 H6 | F4 H7 | F3 H7 | F3 H8 | F3 H9 |
| Prune | F3 D6 | F3 D7 | F2 D7 | F2 D8 | F2 D9 |
| Thornwall | F3 avoid | F3 | F2 | F2 | F2 |
| Sap | F3 H4 R2 | F3 H5 R2 | F2 H5 R2 | F2 H6 R2 | F2 H7 R2 |
| Ask-First | F2 insight | F2 | F1 | F1 | F1 |

### Veil

| Leaf | I | II | III | IV | V |
| --- | --- | --- | --- | --- | --- |
| Shade | F4 D6 | F4 D7 | F3 D7 | F3 D8 | F3 D9 |
| Slip | F3 avoid | F3 | F2 | F2 | F2 |
| Quiet Step | F2 insight | F2 | F1 | F1 | F1 |
| After-Image | F3 D4 skip | F3 D5 | F2 D5 | F2 D6 | F2 D7 |
| Hush | F5 D8 | F5 D9 | F4 D9 | F4 D10 | F4 D11 |
| Pale | F3 halve | F3 | F2 | F2 | F2 |
| Unname | F3 D4 weaken | F3 D5 | F2 D5 | F2 D6 | F2 D7 |

### Stars

| Leaf | I | II | III | IV | V |
| --- | --- | --- | --- | --- | --- |
| Azimuth | F3 D5 | F3 D6 | F2 D6 | F2 D7 | F2 D8 |
| Flare | F4 D4 burn 2×1 | F4 D5 | F3 D5 | F3 D6 | F3 D7 |
| Night-Eye | F2 insight | F2 | F1 | F1 | F1 |
| Transit | F3 D3 skip | F3 D4 | F2 D4 | F2 D5 | F2 D6 |
| Wane | F3 avoid | F3 | F2 | F2 | F2 |
| Chart | F2 insight | F2 | F1 | F1 | F1 |
| True North | F3 ready | F3 | F2 | F2 | F2 |

### Stone

| Leaf | I | II | III | IV | V |
| --- | --- | --- | --- | --- | --- |
| Keystone | F5 D6 | F5 D7 | F4 D7 | F4 D8 | F4 D9 |
| Stomp | F4 D4 skip | F4 D5 | F3 D5 | F3 D6 | F3 D7 |
| Brace | F3 +4 hold | F3 | F2 | F2 | F2 |
| Quarry | F5 D8 | F5 D9 | F4 D9 | F4 D10 | F4 D11 |
| Lintel | F3 avoid | F3 | F2 | F2 | F2 |
| Stillness | F2 insight | F2 | F1 | F1 | F1 |
| Buttress | F3 H5 after hit | F3 H6 | F2 H6 | F2 H7 | F2 H8 |

### Steel

| Leaf | I | II | III | IV | V |
| --- | --- | --- | --- | --- | --- |
| Strike | F3 D6 | F3 D7 | F2 D7 | F2 D8 | F2 D9 |
| Riposte | F3 D7 after hit | F3 D8 | F2 D8 | F2 D9 | F2 D10 |
| Ready Steel | F2 next attack +1 | F2 | F1 | F1 | F1 |
| Guard-Break | F3 D4 skip | F3 D5 | F2 D5 | F2 D6 | F2 D7 |
| Draw | F3 D4 H2 | F3 D5 H2 | F2 D5 H2 | F2 D6 H3 | F2 D7 H3 |
| Second Wind | F3 H5 | F3 H6 | F2 H6 | F2 H7 | F2 H8 |
| Oath-Edge | F5 D9 | F5 D10 | F4 D10 | F4 D11 | F4 D12 |

---

## 9. Command surface

| Command | Who owns it | Note |
| --- | --- | --- |
| `spells` / `grimoire` / `book` | Engine `handleSpells` | Reads the Primer. Foxed blanks for unearned leaves. |
| `spells <leaf>` | Same | One page: rank, numbers, mentor hand. |
| `cast <leaf> [target]` | Engine `handleCast` | Checks ink (except Ember), focus, and special locks. |
| `stats` | Engine `handleStats` | School, leaf count, next lesson. No silent XP bar. |
| `1` / `2` / `3` | `handleSay` while an offer is pending | Same as clicking a Primer card. |
| `help spells` / `help cast` | Help catalog | Mentions clickable leaves. |

The client must not invent cards, ranks, or damage. `play-state.primer` is the
only painted offer.

---

## 10. Authoring a new leaf

1. Add `packages/content/spells/<id>.json`. File name equals `id`.
2. Required: `name`, `school`, `description`, `focusCost`, `targetType`,
   `context`, `presentationKey`, `helpText`.
3. Primer fields: `tag`, `pennedBy`, five-row `ranks`.
4. Add the id to `SCHOOL_LEAVES` in `packages/game-engine/src/primer.ts` if it
   belongs on a School page. The content loader does not invent kit order.
5. Do not reuse another School's numbers as a type-advantage. If two leaves
   share a presentation key, that is art only.
6. Run `pnpm --filter @greenwood/content validate`.
7. Update **this file** in the same ticket.

Retired Ember ids (`coal-breath`, `banked-coals`, `ash-shroud`, `kiln`) rewrite
to the fire names on character load. Do not put the old ids in new content.

---

## 11. Held for later

- Rooms and quests for lessons 11–20.
- Insight leaves that actually name a door, fixture, or waiting body.
- Enemies spending focus.
- Shop, Strength, type chart, random wipes — still refused.

---

## 12. Id index

| Id | School | Command |
| --- | --- | --- |
| `after-image` | veil | `cast after-image` |
| `ask-first` | thorn | `cast ask-first` |
| `azimuth` | stars | `cast azimuth` |
| `bind` | thorn | `cast bind` |
| `blaze-mantle` | ember | `cast blaze-mantle` |
| `brace` | stone | `cast brace` |
| `briar` | thorn | `cast briar` |
| `buttress` | stone | `cast buttress` |
| `chart` | stars | `cast chart` |
| `cinder-snap` | ember | `cast cinder-snap` |
| `draw` | steel | `cast draw` |
| `ember` | ember | `cast ember` |
| `flame-breath` | ember | `cast flame-breath` |
| `flare` | stars | `cast flare` |
| `greenstitch` | thorn | `cast greenstitch` |
| `guard-break` | steel | `cast guard-break` |
| `hearth-ward` | ember | `cast hearth-ward` |
| `heart-fire` | ember | `cast heart-fire` |
| `hush` | veil | `cast hush` |
| `keystone` | stone | `cast keystone` |
| `lintel` | stone | `cast lintel` |
| `night-eye` | stars | `cast night-eye` |
| `oath-edge` | steel | `cast oath-edge` |
| `pale` | veil | `cast pale` |
| `prune` | thorn | `cast prune` |
| `quarry` | stone | `cast quarry` |
| `quiet-step` | veil | `cast quiet-step` |
| `ready-steel` | steel | `cast ready-steel` |
| `riposte` | steel | `cast riposte` |
| `sap` | thorn | `cast sap` |
| `second-wind` | steel | `cast second-wind` |
| `shade` | veil | `cast shade` |
| `slip` | veil | `cast slip` |
| `stillness` | stone | `cast stillness` |
| `stoke` | ember | `cast stoke` |
| `stomp` | stone | `cast stomp` |
| `strike` | steel | `cast strike` |
| `thornwall` | thorn | `cast thornwall` |
| `transit` | stars | `cast transit` |
| `true-north` | stars | `cast true-north` |
| `unname` | veil | `cast unname` |
| `wane` | stars | `cast wane` |
