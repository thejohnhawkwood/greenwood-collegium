# Design Sprint DS-007: Combat frame

## Status

Implemented (Lock-in Chorus, including party and the Silk Queen). Owner: Philip Bird.

The owner picked **D** on 16 September 2026: a twelve-second Hearthstone /
Pictionary shot clock, real enemy focus, defend, and flee. See
[ADR-0034](../adr/0034-lock-in-combat.md). Party of three and What Still Sleeps
followed the same day ([ADR-0035](../adr/0035-party-chorus.md)).

Related law: [ADR-0017](../adr/0017-combat-engine.md) (server decides combat),
[ADR-0018](../adr/0018-ember-presentation.md) (presentation never rolls),
[PRD §10.7–10.8](../PRD.md) and [§12.9](../PRD.md).

## Release Target

v0.0 foundation. Visual combat is the next interface sprint after DS-001–006.
Party of three and the Silk Queen are in. Dummy and hatchling stay solo. One
shared spawn; first-timers still see it ([ADR-0037](../adr/0037-first-time-spawns.md)).

## Owner

Philip Bird.

## 1. Observed Problem

Combat is still a story-log lesson. A student types `attack dummy` or `cast ember dummy`. The engine takes a turn and writes `[COMBAT]` narration. Talk already
lives on the room painting with buttons. Inventory already opens a bag. Combat
is the last major verb that still feels like “keep typing at a wall of text.”

The owner asked for a later look in which the foe occupies the centre of the
visual pane, legal moves are buttons, enemy vitals are visible, and text is
feedback rather than the only way to act. Combat stays turn-taking: not Final
Fantasy ATB, not a WoW global cooldown. A future party fight with a boss will
also be turn-taking with the boss and the party members.

Stats and levelling are rudimentary (health, damage, a mild species weapon
feel). Students have not yet given enough play evidence to justify Strength,
Stamina, Agility, crit, hit chance, or a type chart.

## 2. Evidence

- Token menus already send `attack` and `cast` from
`apps/web/src/app/presence-actions.ts`. The room painting does not become a
fight stage.
- Talk uses `ConversationStage`: centre overlay, buttons send `say 1` / `say 2`,
the log keeps a short beat. Combat has no equivalent.
- `play-state` now projects an optional `encounter`: enemy id, name, health,
focus, lock deadline, and legal moves. CombatStage buttons send those
commands. Typed commands stay canonical.
- Enemies have a real `maxFocus` field (Practice Dummy 6, Silk Hatchling 8,
default 6). They do not spend focus yet.
- One Collegian fights one spawn. Encounter status is `awaiting_intents` or
`closed`. The first targeted `attack` or `cast` squares up only. Later
commands lock and resolve; the enemy still replies in the same locked
command. There is no stored party initiative list.
- Player defaults: health 20, focus 10, attack 4. Practice Dummy: 8 health, 2
attack. Silk Hatchling: 10 health, 3 attack. Damage is
`attack + floor(roll * 3) - 1` with an injectable random source.
- Species “combat” is `speciesWeaponFit` flavour (“the sword feels right”), not
a hidden to-hit table.
- Level 3 opens a three-spell School kit. Ember stays orchard practice.
- PRD §10.7 still lists defend, flee, status icons, and loot. Those are not
first-class in the current encounter loop.

## 3. User Story

As a Collegian, I need to see whom I am fighting and which moves I may take on
this turn so that I can choose a lesson action without rereading the scrollback,
while still being able to type the same words.

As a later party of three, we need a turn structure that does not park two
students as audience while one thinks.

## 4. Hypothesis

We believe a combat stage that reuses the talk pattern — centre foe, buttons
that send existing commands, vitals from the server, narration as feedback —
will make dummy and hatchling fights readable. We further believe that party
wait, not missing Strength, is the real risk when the queen arrives. Five
scenarios keep those questions separable so a later agent cannot “improve”
combat into ATB, tab-target, or a twelve-stat sheet.

This document does not claim a measured classroom outcome. Flow and enjoyment
notes below are hypotheses until students fight.

## 5. Constraints

- Turn-taking. Not ATB. Not a real-time GCD. Not timed button minigames
(Paper Mario / Super Mario RPG hits / *Clair Obscur: Expedition 33*).
- Server authority. React paints. Socket handlers dispatch. The engine rolls.
- Typed commands stay canonical. Buttons send `attack`, `cast <id>`, and later
`defend` / `flee` if those verbs exist.
- Keyboard access, colour never the only cue, reduced motion before DS-008
effects, skippable presentation.
- Classroom: no PvP, Infirmary on defeat, inventory kept, no student data in
the client payload.
- One process, one game truth. No second combat service.
- Hold new combat stats until named student evidence. See § Stats and
progression.

## 6. Proposed Design

No scenario is accepted. Section 18 records how a later *code* slice should
choose. The five scenarios share one pipeline:

```text
button or typed verb → engine turn → foe card updates from play-state →
story log narrates the result
```

Enemy **Health** is real and should be shown as soon as any visual frame
exists. Enemy **Focus** does not exist. Every scenario must either omit it or
label “no focus” in words. Do not draw an empty purple bar and call it focus.

## 7. Alternatives Considered

Rejected for this product, not merely deferred:

- Final Fantasy ATB / active time: the owner ruled it out; a ticking bar also
fights accessibility and classroom pause.
- WoW-style GCD tab-target: the browser would start to feel like it owns
timing; the PRD forbids a real-time action combat system.
- Timed “press A as the star hits” minigames: well loved in Mario RPGs and
Expedition 33; they make combat a motor test and break reduced-motion.
- Importing D&D 5e or Baldur’s Gate 3 sheets (STR, DEX, concentration, tiles).
- Wizard101 pip decks and cash-shop cards.
- Darkest Dungeon stress and death. The *role* idea is usable; the tone is not.

## 8. Scope

This sprint’s scope is the written record: five scenarios, a current-combat
inventory, a short flow and game survey, and a hold on new stats.

A future implementation sprint, when named, may add an optional
`play-state.encounter` object and a centre combat stage. That is not this
commit.

## 9. Non-Scope

- Combat React frame, Ember text effect (DS-008), school visual grammars
(DS-009), glyph rooms (DS-010).
- Party persistence, queen encounter, new spells, new stats, migrations.
- Defend / flee / loot unless a later engine ticket adds them.
- An ADR that picks a scenario. ADR-0017 already owns “the server decides.”

## 10. Data and Event Changes

None in this pass.

A later visual slice will need `play-state` to project, at minimum: encounter
id, enemy id and name, enemy health and max health, whose turn (in words), and
legal commands the client may send. Combat events already carry enemy health on
`combat.started` and action results. The hole is the continuous read model, not
the event names.

A later party slice will need new encounter states. Do not pretend lock-in is a
skin on today’s `handleAttack`.

## 11. Accessibility Review

Any later frame must:

- Name the foe and whose turn it is in text, not only a gold ring.
- Disable illegal buttons and say why (`Not enough focus`, `Not your turn`).
- Keep the command input usable; Tab and 1–4 remain first-class.
- Preserve `[COMBAT]` labels already shipped in DS-001.
- Skip or omit motion. DS-008 may animate Ember only after a reduced-motion
alternative exists.
- Never put login names, tokens, or other students’ private vitals on a
neighbour’s card.

## 12. Acceptance Criteria

For this document:

- [x] Five distinct turn-taking scenarios are written.
- [x] Current engine and `play-state` limits are named, including missing
  ```
  enemy focus.
  ```
- [x] Flow and game takeaways cite sources, not slogans.
- [x] No scenario is marked Accepted.
- [x] `CURRENT.md` and the sprint index point here and forbid silent
  ```
  implementation.
  ```

For a future UI slice (unchecked):

- [ ] Dummy fight shows a centre foe card, real enemy health, and buttons that
  ```
  send existing commands.
  ```
- [ ] Typed `attack` / `cast` still work.
- [ ] Story log remains complete narration.
- [ ] Colour is not the only turn or category cue.

## 13. Test Plan

No new tests in this pass. A future UI slice must extend play-state contract
tests, keep combat engine tests deterministic, and add a visual round-trip that
asserts buttons emit the same verbs as typing. Browser checks use fictional
accounts. Do not claim a student recognition or “flow score.”

## 14. Implementation Summary

Documentation only. No engine, contract, or React change.

## 15. Before-and-After Evidence

Before: combat is typed, logged, and optionally started from a token menu.
After this sprint: the design record exists. The live fight is unchanged.

## 16. Outcome

Pending owner pick. Hypothesis untested in class.

## 17. Reflection

Talk-on-the-painting proved that students will click a legal line if the
painting holds the choice. Combat should steal that pattern, not invent a
second game. The queen will fail in a period if two students only watch.

---

## Appendix A — Current combat inventory

- Engine: `handleAttack`, `handleCast`, `combat-resolve`, `combat-state`.
Injectable `random()`. One spawn, one encounter. Victory XP once. Defeat
restores health and returns the Collegian to the Infirmary.
- Events: `combat.started`, `combat.turn_started`, `combat.action_resolved`,
`combat.status_applied`, `combat.ended`, `progress.experience_gained`. Each
has plain narration.
- Read model: `play-state.character.inCombat` plus the viewer’s vitals and
School kit names. No encounter object.
- Content: Practice Dummy (South Orchard), Silk Hatchling (Cocoon Nave).
- School kits at level 3 (gift, combat, combat/gift):
Ember (`ember`, `cinder-snap`, `hearth-ward`);
Thorns (`briar`, `bind`, `greenstitch`);
Veil (`shade`, `slip`, `quiet-step`);
Stars (`azimuth`, `flare`, `night-eye`);
Stone (`keystone`, `stomp`, `brace`);
Steel (`strike`, `riposte`, `ready-steel`).
- Species: proficiency is which training weapon *feels* right. It does not
change the damage formula today.

## Appendix B — Flow and what players enjoy

Mihaly **Csikszentmihalyi** (*Beyond Boredom and Anxiety*, 1975; *Flow*, 1990)
described flow as a state in which challenge and skill stay near each other,
goals are clear, feedback is immediate, and the person feels in control. Not
all eight phenomenological items are required. Jenova Chen’s *Flow in Games*
adds that the “flow zone” is a band, not a point: some players prefer the
relaxation side, some the arousal side. A classroom of thirty has both.

For this Collegium:

- **Clear goals.** “It is your turn. These buttons are legal.” Hidden crit,
hit, or type modifiers destroy this until students ask for them.
- **Immediate feedback.** The foe card must change when the server result
arrives. The log narrates; it does not hide the number.
- **Control.** Buttons send the same verbs as typing. The browser never rolls
(ADR-0017, ADR-0018).
- **Challenge and skill.** Dummy and hatchling stay short lessons. The queen
later must be a different *decision* problem, not a bigger health sponge, or
skilled students get bored and new students get anxious.
- **Concentration.** The documented killer of turn-based multiplayer flow is
**waiting**. Sequential three-person turns park two players. Gloomhaven and
Into the Breach keep everyone planning. Any party scenario that ignores this
will fail in class.
- **Evidence.** Do not claim a measured flow score. Classroom evidence comes
after students fight.

What players consistently enjoy across the games below: knowing it is their
turn; seeing the foe; a small set of distinct verbs; a short fight that still
asks a choice; watching a result they caused. What they do not enjoy: waiting,
identical “attack again,” hidden math, or a second job (decks, gear
spreadsheets) in a class period.

## Appendix C — Game survey (takeaways, not copies)

Tone and classroom safety stay Greenwood’s.

- **Dragon Quest / Pokémon.** Four verbs anyone can learn (Fight, Ability,
Item, Run). Depth is *which* ability, not a twelve-stat sheet. Trash fights
stay short.
- **Persona 5.** Stylish, one highlighted target, fast trash versus long
bosses. The loved loop is a readable payoff (“1 More,” All-Out Attack). Do
not import elemental weakness or extra turns unless a later sprint adds
types.
- **Super Mario RPG / Paper Mario.** The foe occupies the stage; the menu is
secondary. Action-command timing is ruled out. Badge-style customization
without stat soup is the useful idea.
- **Final Fantasy X / Octopath Traveler.** A visible turn queue, not ATB.
Players like knowing who is next. Octopath Boost/Break is a later hook.
- **Baldur’s Gate 3 / D&D 5e.** One actor, a meaningful choice, permission to
think. Positioning and fifth-edition stats are too heavy for v0.
Initiative-as-UI is the portable idea.
- **Into the Breach.** Telegraph the enemy’s next act; perfect information;
failure teaches. Classroom gold if a later fight shows “the hatchling will
Strike next.”
- **Gloomhaven.** Everyone locks a plan, then resolve in order. Best published
answer to party wait. Costs new encounter states.
- **Wizard101.** School identity as role (hit, ward, mend) in a children’s
MMO. Closest cultural cousin. Pip decks and cash shop are not ours.
- **Darkest Dungeon.** Position and role matter more than Strength. Tone is
too grim; the role idea is usable.
- **Sea of Stars.** Combo turns give a party a shared verb. Defer until a
party exists.
- **For the King.** Honest warning: sequential multiplayer turns feel like
watching.
- **Clair Obscur: Expedition 33.** Well regarded; its joy is timing. Out of
scope.

## Appendix D — Five scenarios

All five keep typed commands, server truth, turn-taking, and basic stats. They
differ in whose turn is visible, when buttons appear, and how a party of three
plus a boss would join later.

### A. Foe Stage

Closest to the owner request and to talk-on-the-painting.

- **Player-visible loop.** The room pane centres the enemy plate (dummy,
hatchling, later queen), the name, Health, and either Focus or the words
“no focus.” Below: legal move buttons only — Attack, the three School kit
spells if open, later Defend / Flee if the engine grows them. Each button
sends `attack …` or `cast <id> …`. The story log keeps `[COMBAT]` narration.
No `Type attack dummy` menu in the log.
- **Party future.** Small portraits on the sides; the foe stays central.
- **Engine gap.** Project the encounter onto `play-state` (enemy id, name,
health, whose turn, legal commands). Reuse NPC plate zoom.
- **Flow fit.** Best clear-goal and immediate-feedback loop for one student.
- **Classroom risk.** Weak on party wait unless a later slice adds lock-in.
- **Inspired by.** Persona 5 focus, Mario RPG stage, `ConversationStage`.

### B. Four Verbs

Classroom-simplest menu.

- **Player-visible loop.** The centre still shows the foe card. Primary
buttons: Attack, Ability, Item, Flee. Ability opens the three kit spells.
Item opens bag actions the engine already allows. Keyboard 1–4 and Tab stay
first-class (DS-003).
- **Party future.** Same menu per actor when it is their turn.
- **Engine gap.** Same encounter projection, plus a `legalVerbs` list. Flee
and defend are in PRD §10.7 but not first-class today.
- **Flow fit.** Lowest anxiety for first-years.
- **Classroom risk.** Ability as a second click every turn can feel like
homework.
- **Inspired by.** Dragon Quest, Pokémon, classic Final Fantasy command lists.

### C. Initiative Ribbon

Group-native from day one, even while the ribbon has two nodes.

- **Player-visible loop.** A turn strip (you, foe; later allies and queen).
The current actor is marked with a word, not only colour. When the strip
says *your turn*, Foe Stage buttons appear. When it says *Silk Hatchling*,
buttons disable and the log reports the reply.
- **Party future.** The ribbon grows. This is the BG3 / FFX shape.
- **Engine gap.** Encounter must store ordered `combatantIds` and `activeId`.
- 
Today there is no queue: the player acts and the enemy replies in the same
command.
- **Flow fit.** “Whose turn” is the goal.
- **Classroom risk.** A party of three becomes For the King unless think-time
is capped or lock-in is added.
- **Inspired by.** Final Fantasy X and Octopath queues, Baldur’s Gate 3
initiative, without tiles or fifth-edition stats.

### D. Lock-in Chorus

The party-and-queen scenario. Too much for the dummy unless a quiet solo
version exists (you lock one action, then watch it resolve).

- **Player-visible loop.** All living party members see the foe card and pick
a move at once. Buttons stay until everyone, or a short classroom timer,
locks. The server then resolves in a published order. A late or disconnected
student defends or skips. The courtyard must not hang.
- **Party future.** This *is* the party structure.
- **Engine gap.** New states (`awaiting_intents`, `resolving`). This is a
rules change, not CSS. Do not pretend it is a skin on today’s
`handleAttack`.
- **Flow fit.** Waiting becomes planning, which is still play. Best fit for
“party of three and the queen.”
- **Classroom risk.** Worst fit for a twenty-second dummy lesson.
- **Inspired by.** Gloomhaven (plan together, resolve in order) and Into the
Breach (know what will happen). Not Frozen Synapse chaos: resolve stays
sequential and narrated.

### E. School Role Board

Identity without a stat explosion.

- **Player-visible loop.** Foe Stage chrome, but each kit button is labeled as
a role verb the School already teaches: Steel Strike / Riposte / Ready;
Ember Ember / Cinder Snap / Hearth Ward; Stone Stomp / Brace; and the rest.
A one-line “this is a guard / a hit / a gift” sits on the button. No
Strength. No type chart.
- **Party future.** Wizard101-style roles (hit, ward, mend). A Sea of Stars
combo only after students prove they want it.
- **Engine gap.** Mostly copy. Needs authored role tags on spell JSON, not
new math.
- **Flow fit.** School choice starts to matter in the orchard, not only in
lore.
- **Classroom risk.** We invent a tank / heal / damage trinity before the
class has spoken.
- **Inspired by.** Wizard101 schools, Darkest Dungeon roles (not the tone),
Sea of Stars combos.

### Comparison

- **A** is the talk-shaped fight and the owner’s stated look.
- **B** nests A’s buttons under four verbs; better for first-hour teaching,
slower every turn.
- **C** adds whose-turn chrome; needed for a readable party, dangerous if
students wait.
- **D** is the only scenario that treats party wait as a rules problem.
- **E** is labeling and later combo hooks, not a new combat system. Hold it
until a class has fought on A.

## Appendix E — Stats and progression

**What we have.** Health, max health, focus, max focus, a single attack
number, experience, level, a three-spell kit at level 3, and species weapon
feel. Burning and a few kit flags (`braceBonus`, `nextAttackBonus`,
`ignoreNextHit`) already exist as encounter-local effects.

**What we refuse until students ask, with evidence.** Strength, Stamina,
Agility, crit, hit chance, elemental or School-versus-School type charts,
talent trees, gear score, and any stat that is not visible on the card in
words.

**What we would only add after named student evidence.** For example: “I
never knew it was my turn,” “every fight is attack again,” “Steel and Ember
felt the same,” “we sat and watched Maya think.” Those sentences would unlock
C, D, or E. They would not unlock a hidden to-hit table.

**Progression.** Arrival already grants a level. First lessons grant another
and open the kit. Do not add a talent tree so the orchard feels longer. If
the queen needs more decisions, change the *choices*, not the spreadsheet.

## 18. Owner pick

**D (Lock-in Chorus), quiet solo version**, accepted 16 September 2026.

- Twelve-second shot clock. Students may lock early. Expiry auto-defends.
- First targeted `attack` / `cast` opens the foe card. Later commands resolve.
- Enemy Health and Focus are real. Defend and flee are first-class.
- Buttons 1–4 send the projected commands. Typed words remain legal.
- Party intents and the Silk Queen use the same lock clock. A turn ribbon is still later work.
- Hold **E** and all new stats until a class has fought on this card.

