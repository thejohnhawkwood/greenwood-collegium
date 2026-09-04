# The Greenwood Collegium
## Product Requirements Document

**Working title:** The Greenwood Collegium  
**Document version:** 0.1  
**Status:** Implementation-ready draft  
**Date:** September 3, 2026  
**Product owner:** Philip Bird  
**Primary setting:** St. Joseph's Collegiate, Brooks, Alberta  
**Repository model:** Public GitHub repository  
**Primary development environment:** Cursor with Grok 4.6, Extra High reasoning, Fast mode  
**Primary deployment target:** Render  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Problem and Opportunity](#3-problem-and-opportunity)
4. [Goals](#4-goals)
5. [Non-Goals](#5-non-goals)
6. [Product Principles](#6-product-principles)
7. [Users and Roles](#7-users-and-roles)
8. [World, Tone, and Originality](#8-world-tone-and-originality)
9. [Core Player Experience](#9-core-player-experience)
10. [Functional Requirements](#10-functional-requirements)
11. [Progressive Interface Requirement](#11-progressive-interface-requirement)
12. [Interface and Design Sprint Roadmap](#12-interface-and-design-sprint-roadmap)
13. [System Architecture](#13-system-architecture)
14. [Required Technology Stack](#14-required-technology-stack)
15. [Repository Structure](#15-repository-structure)
16. [Game Event and Command Contracts](#16-game-event-and-command-contracts)
17. [Data Ownership and Persistence](#17-data-ownership-and-persistence)
18. [Initial Data Model](#18-initial-data-model)
19. [World Content Authoring](#19-world-content-authoring)
20. [Authentication, Privacy, Moderation, and Safety](#20-authentication-privacy-moderation-and-safety)
21. [Teacher and Administrator Tools](#21-teacher-and-administrator-tools)
22. [Accessibility and Usability](#22-accessibility-and-usability)
23. [Performance, Reliability, and Reconnection](#23-performance-reliability-and-reconnection)
24. [Testing and Quality Assurance](#24-testing-and-quality-assurance)
25. [Logging, Metrics, and Observability](#25-logging-metrics-and-observability)
26. [Render Deployment Requirements](#26-render-deployment-requirements)
27. [GitHub and Open-Repository Requirements](#27-github-and-open-repository-requirements)
28. [AI-Assisted Development Protocol](#28-ai-assisted-development-protocol)
29. [Classroom Use and Curriculum Alignment](#29-classroom-use-and-curriculum-alignment)
30. [Release Roadmap](#30-release-roadmap)
31. [MVP Acceptance Criteria](#31-mvp-acceptance-criteria)
32. [Success Measures](#32-success-measures)
33. [Risks and Mitigations](#33-risks-and-mitigations)
34. [Decisions Fixed for Version 0.1](#34-decisions-fixed-for-version-01)
35. [Deferred Decisions](#35-deferred-decisions)
36. [Appendix A: Initial Command Catalogue](#appendix-a-initial-command-catalogue)
37. [Appendix B: Initial World Content Budget](#appendix-b-initial-world-content-budget)
38. [Appendix C: Design Sprint Template](#appendix-c-design-sprint-template)
39. [Appendix D: Definition of Done](#appendix-d-definition-of-done)
40. [Appendix E: Initial Implementation Ticket Sequence](#appendix-e-initial-implementation-ticket-sequence)

---

# 1. Executive Summary

The Greenwood Collegium is a browser-based, persistent, multiplayer text role-playing game inspired by classic multi-user dungeons. Players create anthropomorphic woodland-animal characters, enter an ancient academy of magic, explore connected rooms, meet other players, complete quests, collect equipment, learn spells, fight creatures, and uncover a larger mystery beneath the school.

The project has three equal purposes:

1. **A real game:** It must be enjoyable enough that students and the teacher voluntarily return to it.
2. **A living classroom example:** Its architecture and growth must make algorithms, data structures, client/server communication, persistence, modularity, debugging, testing, and interface design visible.
3. **A public proof of work:** Its Git history, issues, design records, code, tests, deployments, and successive interface generations must demonstrate authentic iterative software development.

The project will begin as a deliberately simple command-line-style MUD. The first interface will display text, accept typed commands, and expose the game's input-processing-output cycle clearly. Later design sprints will improve the same underlying game through semantic colour, persistent status displays, bags, statistics, quest panels, keyboard assistance, a minimap, a dedicated combat frame, animated textual spell effects, and eventually a coloured glyph-based presentation reminiscent of traditional terminal roguelikes.

The central architectural requirement is:

> **The game engine determines truth. The interface determines presentation.**

The server will process commands, validate actions, alter authoritative game state, persist important changes, and emit structured game events. Each client interface will render those same events differently. A basic client can print plain text. A later client can update health bars, display a target frame, animate the word **EMBER**, and draw a minimap without rewriting combat or world logic.

The initial implementation will be a **TypeScript modular monolith** in a public GitHub monorepo:

- React and Vite for the browser client
- Node.js and Fastify for the server
- Socket.IO for real-time bidirectional communication
- PostgreSQL on Render for persistent state
- Drizzle ORM and version-controlled SQL migrations
- Zod for boundary validation and shared contracts
- Vitest and Playwright for automated testing
- GitHub Actions for continuous integration
- Render Blueprint infrastructure through `render.yaml`

The production semester deployment must use persistent Render services rather than relying on an expiring free database or an idle-spinning service.

---

# 2. Product Vision

## 2.1 Vision Statement

> Create a persistent woodland-fantasy world that students control by typing, understand by inspecting, improve through design sprints, and eventually help build.

## 2.2 Product Promise

The Greenwood Collegium will allow a player to:

- open a browser;
- sign in using a classroom-safe account;
- choose or continue a woodland-animal character;
- read a vivid description of the current location;
- type a command;
- receive an immediate, meaningful response;
- see other players enter, leave, speak, and act;
- make visible progress that persists between classes;
- gradually access a richer interface without losing the command-line foundation.

## 2.3 Educational Promise

The project will allow a teacher to point to a real feature and ask:

- What was the input?
- What processing occurred?
- What output was produced?
- What data changed?
- Which module owned the rule?
- What happened on the client?
- What happened on the server?
- How was the result stored?
- How do we know the feature works?
- What user problem did the interface upgrade solve?

## 2.4 Long-Term Vision

By version 1.0, the project should support controlled student contributions to:

- room descriptions;
- items;
- NPCs;
- quests;
- help text;
- command aliases;
- interface themes;
- status displays;
- minimap symbols;
- text animations;
- tests;
- documentation;
- accessibility improvements;
- advanced game systems.

The project should be capable of remaining in use for multiple semesters. Each semester may inherit a stable version, identify new needs, and add a new generation of features.

---

# 3. Problem and Opportunity

## 3.1 Classroom Problems Addressed

Programming students often experience concepts as disconnected exercises:

- variables without meaningful state;
- conditionals without meaningful decisions;
- arrays without meaningful collections;
- functions without a system large enough to require modularity;
- client/server diagrams without a live multiplayer application;
- debugging without users who can discover unexpected behaviour;
- Git without a real shared product;
- interface design without a history of actual usability problems.

A MUD creates authentic reasons for all of these concepts.

For example, the command:

```text
cast ember rat
```

requires:

1. command input;
2. normalization and parsing;
3. player-state lookup;
4. spell lookup;
5. target resolution;
6. permission and resource checks;
7. combat calculation;
8. state mutation;
9. persistence;
10. event creation;
11. network delivery;
12. accessible presentation.

The project therefore transforms abstract programming outcomes into visible game behaviour.

## 3.2 Product Opportunity

A text-first game reduces the cost of:

- animation assets;
- sprite production;
- collision systems;
- physics;
- camera systems;
- tile-map production;
- frame-by-frame synchronization;
- complex graphical tooling.

That development capacity can instead be spent on:

- algorithms;
- commands;
- state;
- multiplayer;
- persistence;
- data structures;
- modular architecture;
- testing;
- world writing;
- interface iteration.

## 3.3 Proof-of-Work Opportunity

A public repository can show not merely a finished product, but a credible development story:

- original PRD;
- issue backlog;
- architecture decisions;
- design sprint reports;
- before-and-after interface captures;
- test growth;
- release tags;
- student-safe contributions;
- deployment history;
- retrospectives;
- refactors made for specific reasons.

---

# 4. Goals

## 4.1 Primary Product Goals

1. Deliver a playable browser-based multiplayer MUD.
2. Make typed commands the canonical means of interaction.
3. Support at least one full classroom of simultaneous players.
4. Persist character progress between sessions.
5. provide a safe, moderated classroom social space.
6. support room exploration, items, combat, quests, progression, and magic.
7. preserve a readable transcript of important events.
8. allow interface generations to improve without replacing the game engine.
9. keep the architecture readable enough to teach.
10. make the repository useful as public professional proof of work.

## 4.2 Primary Educational Goals

1. Demonstrate input, processing, and output through real commands.
2. demonstrate sequential, conditional, and iterative logic.
3. demonstrate problem decomposition and modular design.
4. demonstrate client/server relationships through live use.
5. demonstrate arrays, records, maps, sets, and graphs through game data.
6. demonstrate files, databases, migrations, and persistence.
7. demonstrate debugging with repeatable test cases.
8. demonstrate Git branches, commits, issues, pull requests, and reviews.
9. demonstrate that software design changes in response to evidence.
10. create contribution opportunities at multiple skill levels.

## 4.3 Experience Goals

The game should feel:

- mysterious;
- warm but not childish;
- literary;
- adventurous;
- readable;
- responsive;
- socially alive;
- slightly old-fashioned in a deliberate way;
- increasingly polished as the semester proceeds.

---

# 5. Non-Goals

The following are explicitly outside version 0.1:

- a massive public MMO;
- anonymous public registration;
- mobile-native applications;
- touch-first controls;
- full 2D or 3D graphics;
- a real-time action combat system;
- a full tactical tile world;
- player-versus-player combat;
- unrestricted direct messages;
- unrestricted global chat;
- voice chat;
- trading and player economies;
- user-authored executable scripts;
- AI-generated free-form NPC conversations;
- microservices;
- multi-region scaling;
- multiple independent school tenants;
- elaborate crafting;
- housing;
- guilds;
- procedural world generation;
- monetization;
- advertising;
- loot boxes or gambling mechanics;
- copying characters, locations, text, art, or lore from existing franchises.

Some of these may become later proposals. None should be smuggled into the initial build merely because an AI coding agent can generate a rough version quickly.

---

# 6. Product Principles

## 6.1 Command Line First

Every essential player action must have a typed command. Buttons, panels, and shortcuts may assist the player but must not replace the command vocabulary.

## 6.2 Server Authoritative

The browser may request an action. Only the server may decide whether the action succeeds and how game state changes.

## 6.3 Progressive Enhancement

The plain-text interface must remain a complete playable mode. Later visual layers improve understanding and delight.

## 6.4 One Engine, Multiple Renderers

A movement, chat, item, quest, or combat event must be usable by:

- the classic text renderer;
- the semantic-colour renderer;
- the persistent HUD;
- the combat renderer;
- the future glyph renderer;
- automated tests;
- development replay tools.

## 6.5 Structured Meaning Plus Plain Text

Every important event must include:

- structured data for advanced interfaces; and
- a durable plain-text fallback for accessibility, debugging, and the classic interface.

## 6.6 Gameplay Before Ornament

A feature is not complete merely because it looks impressive. It must alter or clearly present meaningful game behaviour.

## 6.7 Data-Driven Content

Rooms, items, NPC templates, spells, and quests should be declarative content validated against schemas. Student content contributors should not need to write executable server code.

## 6.8 Small, Reviewable Iterations

Every design sprint should solve a stated problem. Every implementation change should be small enough to review, test, explain, and reverse.

## 6.9 Safe by Default

Public registration, private messaging, PvP, user-generated markup, and unmoderated content are disabled unless deliberately designed and approved.

## 6.10 Original World

The project may acknowledge broad literary and game influences, but all public names, descriptions, characters, visual assets, and narrative content must be original or appropriately licensed.

## 6.11 No Hidden Magic in the Architecture

Convenient libraries may be used, but the core command flow, game state, events, and persistence should remain inspectable and explainable.

---

# 7. Users and Roles

## 7.1 Student Player

A Grade 9-12 student who primarily plays the game.

Needs:

- quick sign-in;
- clear commands;
- forgiving error messages;
- visible progress;
- reliable reconnection;
- safe social interaction;
- low reading friction;
- no need to understand the code.

## 7.2 Student Contributor

A student who contributes content, tests, documentation, or code.

Needs:

- bounded tasks;
- clear file locations;
- schemas and examples;
- contribution instructions;
- test commands;
- review feedback;
- a safe method that does not expose production secrets or student records.

## 7.3 Teacher / Game Master

The classroom teacher who operates the game and uses it instructionally.

Needs:

- account management;
- moderation;
- announcements;
- character inspection;
- movement and event tools;
- reset and recovery controls;
- audit logs;
- easy deployment;
- features that can be projected and explained.

## 7.4 Repository Maintainer

The adult product owner responsible for architecture, merges, releases, privacy, deployment, and quality.

Needs:

- CI;
- migrations;
- release notes;
- issue templates;
- dependency control;
- rollback procedures;
- backups;
- documented architecture.

## 7.5 Observer / Reviewer

A parent, administrator, colleague, recruiter, or member of the public viewing the open repository or a controlled demonstration.

Needs:

- a clear README;
- screenshots;
- architecture overview;
- release history;
- curriculum rationale;
- no access to student data;
- an optional read-only or seeded demonstration mode later.

## 7.6 System Roles

The application will recognize these roles:

- `owner`
- `teacher`
- `moderator`
- `player`
- `observer`

Permissions must be enforced on the server rather than inferred from visible interface controls.

---

# 8. World, Tone, and Originality

## 8.1 Working Setting

Deep within an ancient woodland stands the Greenwood Collegium, an academy built through colossal trees, ruined stone cloisters, burrows, bridges, towers, wells, and rootways. Young creatures arrive from surrounding woodland communities to study magical and martial disciplines. Beneath the academy and a nearby ruined abbey, an old bell has begun to ring even though no known bell remains there.

## 8.2 Tone

The intended tone combines:

- high fantasy;
- woodland folklore;
- school mystery;
- humour;
- cozy social spaces;
- real danger without graphic violence;
- moral choices;
- discovery;
- friendship and rivalry;
- stewardship of the natural world.

The game should not become grimdark, cynical, sexually suggestive, or gore-focused.

## 8.3 Moral and Thematic Direction

Appropriate recurring themes include:

- courage;
- loyalty;
- truth;
- mercy;
- sacrifice;
- friendship;
- wise use of power;
- care for the weak;
- stewardship;
- consequences of pride and secrecy.

Fantasy magic must remain clearly fictional. The project will not present real-world occult instruction, rituals, or claims.

## 8.4 Species

The game will use the term **species**, not race.

Initial species candidates:

- Mouse
- Hare
- Badger
- Otter
- Squirrel
- Mole
- Hedgehog
- Fox
- Stoat
- Owl
- Toad

Species bonuses must be modest. Species primarily provides identity, flavour, dialogue opportunities, and occasional exploration affordances. No species should be a mandatory choice for a viable build.

## 8.5 Schools of Study

Players begin as Initiates. Later they may pursue one or more schools:

- **Ember:** fire, force, destruction
- **Thorn:** plants, healing, growth
- **Veil:** illusion, stealth, enchantment
- **Stars:** light, divination, celestial mysteries
- **Stone:** defence, wards, earth
- **Steel:** martial skill and enchanted weapons

The system should support combinations rather than permanently locking players into one conventional class.

## 8.6 Originality Guardrails

The repository must not contain:

- copied prose;
- copied character names;
- copied maps;
- copied logos;
- copied game rules expressed in distinctive form;
- copyrighted franchise art;
- scraped fan-wiki content;
- trademarked branding presented as affiliation.

Inspiration may be described in project-history documents, but the public game must stand as its own work.

---

# 9. Core Player Experience

## 9.1 Core Loop

```text
EXPLORE → DISCOVER → ACT → GROW → UNLOCK → EXPLORE
```

A normal session should allow a player to:

1. log in;
2. review location and status;
3. choose a goal;
4. move through connected rooms;
5. interact with an NPC, item, puzzle, enemy, or player;
6. gain information, experience, equipment, or quest progress;
7. return to a safe location or log out;
8. continue later with progress intact.

## 9.2 First Five Minutes

A new player should be able to:

1. accept classroom rules;
2. choose a character name and species;
3. enter the Gatehouse tutorial;
4. use `look`;
5. move to another room;
6. inspect or take an item;
7. speak in a room;
8. see another player or NPC;
9. reach Lantern Court.

## 9.3 Sample Interaction

```text
GREENWOOD COLLEGIUM
----------------------------------------

Lantern Court

Ancient oak branches arch over a circular courtyard.
Blue lanterns drift between the leaves.

You see:
  Porter Bramble
  Rowan the Hare

Exits: north, east, west

> look fountain

The fountain is carved in the shape of three sleeping mice.
A copper key glints beneath the water.

> take key

You take the Small Copper Key.

> north
```

## 9.4 Session Length

The game must support:

- two-minute check-ins;
- ten-minute warm-up sessions;
- full-class demonstrations;
- longer voluntary play sessions;
- teacher-run live events.

No critical progress system should require daily attendance or punish students who play less often.

---

# 10. Functional Requirements

## 10.1 Account and Session Requirements

The system must:

- disable open public registration by default;
- allow teacher-created or invite-token accounts;
- support pseudonymous public display names;
- keep account identity separate from character identity;
- support password setup and teacher-issued reset tokens;
- use secure server-side sessions;
- allow one active character per session in version 0.1;
- allow a teacher to disable an account;
- log sign-in, sign-out, reset, disable, and role-change actions;
- restore an authenticated session after a normal page refresh;
- revoke sessions after password reset or account disablement.

Optional later authentication:

- Google Workspace authentication restricted to an approved school domain.

## 10.2 Character Requirements

A character must include:

- stable unique ID;
- account owner ID;
- approved display name;
- species;
- level;
- experience;
- current and maximum health;
- current and maximum focus;
- core attributes;
- current room;
- inventory;
- equipment;
- known spells;
- active and completed quests;
- discovered rooms;
- active status effects;
- interface preferences;
- created and updated timestamps.

Character names must:

- be unique within the active world;
- meet length limits;
- use approved characters;
- reject impersonation of staff or system accounts;
- be subject to teacher rename;
- not expose a student's legal name by default.

## 10.3 Command Interface Requirements

The command system must:

- accept one command line at a time;
- trim surrounding whitespace;
- treat verbs case-insensitively;
- normalize common abbreviations;
- support aliases;
- preserve quoted text for speech;
- identify verbs and arguments;
- resolve targets in the current context;
- detect ambiguous targets;
- return helpful syntax guidance;
- suggest likely commands after simple misspellings;
- reject excessively long input;
- rate-limit commands;
- enforce permissions on the server;
- record command outcome categories for debugging.

A command module should declare:

- canonical name;
- aliases;
- syntax;
- help text;
- category;
- minimum role;
- contextual availability;
- validator;
- handler;
- expected event types;
- tests.

## 10.4 World and Movement Requirements

The world must be composed of rooms connected by exits.

A room must support:

- stable ID;
- title;
- short and long descriptions;
- zone;
- map coordinates where applicable;
- exits;
- visible objects;
- NPC templates or spawn references;
- room flags;
- optional ambient text;
- optional interaction hooks;
- discovery metadata.

Movement must:

- validate that the exit exists;
- validate locks or conditions;
- leave the old room;
- enter the new room;
- notify appropriate players;
- update persistent character location;
- emit a new room snapshot;
- reveal the room and visible exits on the player's map;
- prevent duplicate movement from repeated network delivery.

## 10.5 Presence and Social Requirements

Version 0.1 social features:

- players visible in the same room;
- room entry and exit notices;
- room-based `say`;
- `who` list;
- safe emotes;
- server announcements;
- player reporting;
- mute and moderation controls.

Version 0.1 will not include:

- direct messages;
- private whispers;
- global public chat;
- persistent player-to-player mail;
- voice or image sharing.

All social text must be escaped and rendered as text, never interpreted as HTML.

## 10.6 Item and Inventory Requirements

The system must support:

- item templates;
- unique item instances where required;
- stackable consumables;
- inventory capacity;
- equipment slots;
- taking;
- dropping;
- examining;
- using;
- equipping;
- unequipping;
- quest items;
- server-side ownership checks.

Version 0.1 equipment slots:

- main hand;
- off hand;
- body;
- accessory.

Item categories:

- weapon;
- armour;
- consumable;
- quest;
- book;
- key;
- magical curiosity;
- ordinary object.

The server must prevent two players from successfully taking the same unique item.

## 10.7 Combat Requirements

Combat will be turn-based and server-authoritative.

Version 0.1 must support:

- entering combat;
- selecting a target;
- basic attack;
- one or more spells;
- defend;
- flee;
- enemy response;
- damage;
- healing;
- focus cost;
- status effects;
- victory;
- defeat;
- experience reward;
- loot reward;
- non-graphic recovery.

Combat state must include:

- encounter ID;
- participants;
- turn order;
- active participant;
- round number;
- health and resources;
- active effects;
- legal actions;
- encounter status.

Combat states:

```text
IDLE
STARTING
AWAITING_PLAYER_ACTION
RESOLVING_PLAYER_ACTION
RESOLVING_ENEMY_ACTION
VICTORY
DEFEAT
FLED
CLOSED
```

Combat calculations must live in the game-engine package, not in React components or Socket.IO handlers.

The engine must accept an injectable random source so combat tests can be deterministic.

### Defeat Behaviour

Classroom mode will not use harsh item loss.

On defeat:

- the character is returned to the Infirmary;
- health is restored to a safe value;
- a short non-graphic message explains what happened;
- an optional temporary fatigue effect may apply;
- quest-critical items remain intact.

## 10.8 Combat Presentation Requirements

The combat interface must ultimately support:

- player frame;
- target frame;
- health and focus bars;
- round indicator;
- legal action reminders;
- readable alternating action sequence;
- status icons with text labels;
- permanent transcript;
- skippable animation;
- reduced-motion mode;
- optional sound muted by default.

A combat animation must never determine damage, timing, legality, or state. It only presents a result already decided by the server.

### Ember Example

An Ember event may contain:

- actor ID;
- target ID;
- spell ID;
- hit result;
- fire damage;
- burning effect;
- plain-text narration;
- semantic text segments;
- optional presentation key such as `ember-burst`.

A later client may:

- brighten the word `EMBER`;
- spread letters apart;
- emit punctuation sparks;
- show a brief textual burst;
- update the target health bar;
- show `Burning: 2 rounds`;
- retain the plain-text result in the transcript.

## 10.9 Progression Requirements

Version 0.1 progression must include:

- experience;
- levels;
- maximum health growth;
- maximum focus growth;
- one or more unlocks;
- visible progress to next level.

The first public version should use a modest level cap, proposed as Level 10, to make balancing manageable.

Progression must not reward disruptive chat volume or excessive idle time.

## 10.10 Magic Requirements

Version 0.1 should include a small spell set sufficient to prove the system.

Initial examples:

- Ember
- Mend
- Ward
- Glimmer
- Rootbind
- Spark

Each spell template must define:

- ID;
- name;
- school;
- description;
- focus cost;
- valid target type;
- range or context;
- mechanical effects;
- cooldown or turn restriction if any;
- presentation key;
- help text.

## 10.11 Quest Requirements

Quests must be declarative state machines rather than arbitrary executable scripts.

A quest definition must support:

- stable ID;
- title;
- description;
- giver;
- prerequisites;
- objectives;
- state transitions;
- rewards;
- completion text;
- optional failure state.

Initial objective types:

- visit room;
- speak to NPC;
- acquire item;
- examine object;
- defeat enemy;
- use command on target;
- deliver item.

Quest progress must be:

- validated on the server;
- persisted;
- idempotent;
- visible through `quests`;
- available to a later quest panel.

## 10.12 Minimap Requirements

The minimap must be built from world data rather than hand-drawn screenshots.

Rooms should support:

- `x`;
- `y`;
- `z`;
- zone;
- glyph;
- landmark status.

The player map must:

- show the current room;
- show discovered rooms;
- show discovered exits;
- hide secret exits until revealed;
- distinguish vertical movement;
- provide a plain-text alternative;
- remain usable without colour;
- avoid revealing undiscovered content.

The world remains room-based. A minimap does not imply tile-by-tile movement.

## 10.13 Glyph Presentation Requirements

A future glyph mode may render the current room or local area using coloured characters.

Examples:

- `@` current player
- `h` hare
- `m` mouse
- `b` badger
- `r` hostile rat
- `T` tree
- `#` wall
- `~` water
- `+` door
- `*` magic
- `!` object of interest

Version 0.1 will not add tactical tile movement, line of sight, collision, or grid-based combat. Those would require a separate engine proposal.

## 10.14 Help and Onboarding Requirements

The help system must support:

- `help`;
- `help <command>`;
- command categories;
- examples;
- context-sensitive suggestions;
- beginner tutorial prompts;
- concise error recovery.

The interface should prefer:

```text
I do not recognize "attak."

Did you mean:
  attack rat
  examine rat
  help combat
```

over:

```text
Unknown command.
```

## 10.15 Interface Mode Requirements

The system must preserve major interface generations.

Proposed modes:

- `classic`
- `colour`
- `hud`
- `glyph` later

A typed command should allow switching:

```text
interface classic
interface colour
interface hud
```

The selected mode must persist as a user preference.

---

# 11. Progressive Interface Requirement

The Greenwood Collegium shall begin as a fully playable text-command application and shall support iterative interface enhancement without requiring replacement of the core game engine.

The system shall:

1. treat the server as the authoritative source of game state;
2. communicate meaningful structured game events to the client;
3. allow the same event to be rendered as plain text, enhanced text, dashboard information, animation, or glyph-based output;
4. retain a permanent readable transcript of important actions;
5. provide typed-command access to all essential player functions;
6. ensure that optional visual effects do not alter game outcomes;
7. support keyboard-first operation;
8. avoid communicating essential information through colour alone;
9. support reduced-motion and simplified-display options;
10. preserve major interface generations for demonstration, testing, and comparison;
11. allow recorded event fixtures to be replayed through multiple renderers;
12. prevent presentation code from mutating authoritative game state.

This requirement is foundational and may not be removed for convenience.

---

# 12. Interface and Design Sprint Roadmap

## 12.1 Interface Ladder

| Stage | Name | Player Experience | Primary Technical Concepts |
|---|---|---|---|
| UI 0 | Bare Terminal | Plain commands and responses | IPO, parsing, validation, sequence |
| UI 1 | Living Transcript | Semantic colours, categories, history, completion | strings, events, conditions, usability |
| UI 2 | Persistent HUD | HP, focus, XP, location remain visible | client state, reducers, DOM updates |
| UI 3 | Panels | Bags, stats, quests, spellbook | arrays, filtering, components |
| UI 4 | Minimap | Discovered rooms and exits | graphs, coordinates, sets, traversal |
| UI 5 | Combat Theatre | target frame, rounds, pacing, effects | state machines, queues, animation |
| UI 6 | Glyph Mode | coloured terminal-world rendering | grids, renderers, 2D data |
| UI 7 | Interface Studio | student themes and modules | collaboration, Git, reuse, review |

## 12.2 Mandatory Design Sprint Process

Each significant interface upgrade must begin with a written design sprint rather than a direct coding request.

Every sprint must document:

1. observed problem;
2. evidence;
3. user story;
4. design hypothesis;
5. constraints;
6. proposed interface;
7. data or event changes;
8. accessibility considerations;
9. acceptance criteria;
10. test plan;
11. implementation summary;
12. before-and-after evidence;
13. reflection and next steps.

Each sprint must produce:

- one Markdown design record;
- one GitHub issue or milestone;
- one feature branch;
- one pull request;
- updated tests;
- a screenshot or text capture where appropriate;
- a brief teacher-facing explanation.

## 12.3 DS-001: Semantic Colour and Message Categories

**Problem:** The transcript is readable but important meanings blend together.

**Hypothesis:** Consistent semantic colour and message labels will improve scanning without changing commands.

**Deliverables:**

- semantic event segment types;
- colour tokens;
- `[COMBAT]`, `[QUEST]`, `[ITEM]`, and `[SYSTEM]` labels where useful;
- no information communicated by colour alone;
- classic renderer unchanged.

**Teaching concepts:**

- classification;
- conditionals;
- structured data;
- design consistency;
- accessibility.

## 12.4 DS-002: Persistent Player Status

**Problem:** Players repeatedly type `stats` and lose track of health during combat.

**Hypothesis:** A persistent status region will reduce unnecessary commands and improve decision making.

**Deliverables:**

- player name, species, role, and level;
- HP, focus, and XP values;
- readable text bars;
- live update from character events;
- responsive layout;
- reconnection resynchronization.

**Tests:**

- damage;
- healing;
- focus spending;
- level gain;
- refresh;
- reconnect;
- browser resizing.

## 12.5 DS-003: Command Assistance and Keyboard Workflow

**Problem:** New players forget commands and experienced players repeat long commands.

**Hypothesis:** History, completion, aliases, and visible reminders will improve fluency without converting the game to mouse-first control.

**Deliverables:**

- up/down command history;
- Tab completion;
- contextual command suggestions;
- persistent reminder strip;
- shortcut settings;
- a command to focus or restore the input;
- no hijacking of printable keys while the command input is active.

## 12.6 DS-004: Bag and Equipment Panel

**Problem:** Inventory text becomes hard to scan as item count grows.

**Hypothesis:** A panel grouped by equipped items and bag contents will improve inventory decisions while preserving commands.

**Deliverables:**

- equipment section;
- inventory capacity;
- item categories;
- stack counts;
- selected item details;
- corresponding typed commands;
- screen-reader labels.

## 12.7 DS-005: Quest Tracker and Journal

**Problem:** Players forget current objectives.

**Hypothesis:** A small pinned tracker plus a full journal will improve direction without revealing solutions.

**Deliverables:**

- maximum three pinned objectives;
- full quest journal;
- current state;
- completed steps;
- rewards;
- relevant known location;
- command equivalent.

## 12.8 DS-006: Discovered-World Minimap

**Problem:** Players cannot remember how rooms connect.

**Hypothesis:** A map generated from discovered room data will reduce disorientation and create a meaningful graph-data lesson.

**Deliverables:**

- coordinate-aware room definitions;
- discovered-room set;
- discovered-exit set;
- current-location marker;
- fog of war;
- vertical level handling;
- plain-text map;
- secret-exit protection.

## 12.9 DS-007: Combat Frame

**Problem:** Combat appears as an undifferentiated wall of text.

**Hypothesis:** Separate player and target frames, round markers, legal actions, and paced events will make combat readable and exciting.

**Deliverables:**

- combat state panel;
- player and target health;
- focus;
- round;
- statuses;
- action prompt;
- transcript;
- skip control;
- result remains server-authoritative.

## 12.10 DS-008: Ember Text Effect

**Problem:** Spells are mechanically distinct but do not feel distinct.

**Hypothesis:** A short semantic text animation can give Ember identity without graphics or large assets.

**Deliverables:**

- `ember-burst` presentation recipe;
- glowing emphasis;
- punctuation sparks;
- short impact burst;
- reduced-motion alternative;
- no more than safe flashing limits;
- permanent text result;
- animation replay fixture.

## 12.11 DS-009: Magic-School Visual Grammars

Each school receives a restrained effect vocabulary.

**Ember:**

- warm glow;
- widening letters;
- sparks;
- brief expansion.

**Thorn:**

- rising characters;
- tendril-like brackets;
- text wrapping.

**Veil:**

- offset duplicates;
- fading;
- partial distortion.

**Stone:**

- heavy block text;
- downward weight;
- dust punctuation.

**Stars:**

- drifting points;
- orbital movement;
- constellation lines.

Effects must remain short, readable, optional, and non-essential.

## 12.12 DS-010: Glyph Room Renderer

**Problem:** The world remains entirely abstract even after interface upgrades.

**Hypothesis:** A coloured glyph diagram of the current room can improve spatial imagination while preserving room-based movement.

**Deliverables:**

- glyph legend;
- room-local layout data;
- player and entity markers;
- colour plus text labels;
- classic description retained;
- no tile movement.

---

# 13. System Architecture

## 13.1 Architecture Style

The initial product will be a **modular monolith**:

- one repository;
- one deployable Node.js web service;
- one PostgreSQL database;
- one browser client;
- clearly separated internal packages.

Microservices are prohibited in version 0.1.

## 13.2 High-Level Architecture

```text
BROWSER
  React Interface
  Command Input
  Transcript
  HUD / Panels / Map / Effects
          |
          | HTTPS + Socket.IO
          |
NODE WEB SERVICE ON RENDER
  Fastify HTTP Server
  Authentication and Sessions
  Socket Gateway
  Command Dispatcher
  Game Application Services
          |
          | calls
          |
PURE GAME ENGINE
  Movement Rules
  Combat Rules
  Quest Rules
  Item Rules
  Permission Rules
          |
          | repositories
          |
POSTGRESQL
  Accounts
  Characters
  Progress
  Inventory
  Discoveries
  Logs
```

## 13.3 Layer Responsibilities

### Browser Client

May:

- collect commands;
- request actions;
- display snapshots;
- apply structured events to local presentation state;
- animate confirmed results;
- store non-sensitive interface preferences;
- reconnect and request resynchronization.

May not:

- determine damage;
- create rewards;
- move a character without server confirmation;
- alter quest state;
- grant items;
- determine permissions.

### Transport Layer

Responsible for:

- HTTP routes;
- Socket.IO connection;
- authentication context;
- request validation;
- command acknowledgement;
- event delivery;
- reconnect handshake.

Must not contain core game rules.

### Application Layer

Responsible for:

- coordinating a use case;
- loading required state;
- invoking the game engine;
- persisting changes;
- publishing events;
- applying idempotency;
- opening transactions.

### Game Engine

Responsible for:

- pure rules;
- legal action checks;
- state transitions;
- deterministic calculations;
- domain events.

The engine should have no dependency on:

- React;
- Fastify;
- Socket.IO;
- PostgreSQL;
- Drizzle;
- Render;
- browser APIs.

### Persistence Layer

Responsible for:

- repositories;
- transactions;
- database queries;
- migrations;
- mapping database records to domain state.

### Content Layer

Responsible for:

- validated room definitions;
- exits;
- item templates;
- NPC templates;
- spells;
- quests;
- help text;
- semantic presentation keys.

## 13.4 Production Hosting Shape

For simplicity and cost control:

- Vite builds the React client.
- Fastify serves the built static files.
- Fastify also serves HTTP routes.
- Socket.IO attaches to the same underlying HTTP server.
- Browser, API, and real-time connection use one origin.
- One Render Web Service runs the application.
- One Render Postgres instance stores persistent state.

In development:

- Vite runs its development server.
- Fastify runs separately.
- Vite proxies API and Socket.IO traffic to Fastify.

---

# 14. Required Technology Stack

## 14.1 Required Core Stack

| Area | Technology | Requirement |
|---|---|---|
| Runtime | Node.js 24 LTS | Pin through repository configuration |
| Language | TypeScript, strict mode | Required across client, server, engine, and shared contracts |
| Frontend | React 19.x | Component-based client interface |
| Frontend tooling | Vite 8.x | Development server and production build |
| HTTP server | Fastify 5.x | Routes, plugins, validation, logging |
| Real-time | Socket.IO 4.x | Bidirectional events, rooms, acknowledgements, reconnection |
| Database | PostgreSQL 18 on Render | Persistent relational state |
| ORM/query layer | Drizzle ORM | Typed queries close to SQL |
| Migrations | Drizzle Kit SQL migrations | Version-controlled and run before deployment |
| Validation | Zod 4 | Validate commands, HTTP bodies, socket payloads, events, and content |
| Testing | Vitest | Unit, contract, and integration tests |
| Browser/E2E testing | Playwright | Real browser workflows |
| Package management | pnpm workspaces | Monorepo dependency and script management |
| CI | GitHub Actions | Typecheck, lint, test, build, and content validation |
| Deployment | Render Web Service + Render Postgres | Semester production environment |
| Infrastructure definition | `render.yaml` | Reproducible Render Blueprint |
| Logging | Fastify/Pino structured logs | Correlation IDs and redaction |
| Formatting | Prettier | Consistent formatting |
| Linting | ESLint | TypeScript and React rules |
| Documentation | Markdown + Mermaid | GitHub-readable project documentation |

## 14.2 Styling Requirements

The core project will use:

- plain CSS;
- CSS custom properties;
- semantic design tokens;
- feature-organized stylesheets;
- minimal dependencies.

The initial project will not use:

- Tailwind;
- Bootstrap;
- Material UI;
- a large component library;
- a heavy animation framework.

Reason: the interface is itself part of the course's design history. Students should be able to inspect the CSS responsible for colour, layout, emphasis, and animation.

A later design sprint may propose an additional styling tool, but it must document the problem it solves.

## 14.3 Client State Requirements

Initial client state will use:

- React state;
- reducers;
- context where necessary;
- a single event-application pathway.

No external state-management library is required initially.

A later ADR may approve one if client state becomes difficult to reason about. The UI must not maintain a competing authoritative copy of game rules.

## 14.4 Authentication Components

Required:

- secure, opaque session token;
- database-backed session;
- `HttpOnly` cookie;
- `Secure` in production;
- appropriate `SameSite` policy;
- Argon2id password hashing;
- one-time invite and reset tokens;
- origin checks;
- server-side role checks.

## 14.5 Development Database Modes

The repository should support:

1. **PostgreSQL mode:** required for realistic integration and production.
2. **In-memory development mode:** permitted for the earliest local vertical slice, unit tests, and classroom demonstrations.

The in-memory mode must implement the same repository interfaces. It must never be presented as persistent production storage.

## 14.6 Version Policy

- Exact package versions are pinned in the lockfile.
- Major-version upgrades require a dedicated issue.
- Database major version is explicitly pinned.
- Dependencies must not be added solely because the coding agent prefers them.
- Every new runtime dependency requires a one-sentence rationale in the pull request.

---

# 15. Repository Structure

Proposed monorepo:

```text
greenwood-collegium/
├─ apps/
│  ├─ web/
│  │  ├─ src/
│  │  │  ├─ app/
│  │  │  ├─ components/
│  │  │  ├─ features/
│  │  │  ├─ renderers/
│  │  │  ├─ state/
│  │  │  ├─ styles/
│  │  │  └─ accessibility/
│  │  └─ AGENTS.md
│  └─ server/
│     ├─ src/
│     │  ├─ auth/
│     │  ├─ commands/
│     │  ├─ application/
│     │  ├─ sockets/
│     │  ├─ http/
│     │  ├─ persistence/
│     │  ├─ moderation/
│     │  └─ observability/
│     └─ AGENTS.md
├─ packages/
│  ├─ game-engine/
│  │  ├─ src/
│  │  │  ├─ movement/
│  │  │  ├─ combat/
│  │  │  ├─ quests/
│  │  │  ├─ items/
│  │  │  └─ permissions/
│  │  └─ AGENTS.md
│  ├─ contracts/
│  │  ├─ src/
│  │  │  ├─ commands/
│  │  │  ├─ events/
│  │  │  ├─ snapshots/
│  │  │  └─ errors/
│  ├─ content/
│  │  ├─ rooms/
│  │  ├─ items/
│  │  ├─ npcs/
│  │  ├─ spells/
│  │  ├─ quests/
│  │  ├─ help/
│  │  └─ schemas/
│  └─ test-utils/
├─ drizzle/
│  ├─ migrations/
│  └─ meta/
├─ docs/
│  ├─ PRD.md
│  ├─ architecture/
│  ├─ adr/
│  ├─ design-sprints/
│  ├─ curriculum/
│  ├─ classroom/
│  └─ releases/
├─ scripts/
│  ├─ validate-content/
│  ├─ seed-world/
│  ├─ backup/
│  └─ load-test/
├─ .cursor/
│  └─ rules/
├─ .github/
│  ├─ workflows/
│  ├─ ISSUE_TEMPLATE/
│  └─ pull_request_template.md
├─ AGENTS.md
├─ .cursorignore
├─ .gitignore
├─ .env.example
├─ render.yaml
├─ pnpm-workspace.yaml
├─ package.json
├─ README.md
├─ CONTRIBUTING.md
├─ CODE_OF_CONDUCT.md
├─ SECURITY.md
├─ CHANGELOG.md
├─ LICENSE
└─ THIRD_PARTY_NOTICES.md
```

## 15.1 Repository Rules

- `main` must always be deployable.
- generated build output is not committed;
- secrets are never committed;
- production database exports are never committed;
- student account data is never committed;
- world content uses stable IDs;
- migrations are immutable after release;
- architecture decisions are recorded in `docs/adr`;
- interface upgrades are recorded in `docs/design-sprints`;
- all packages have clear public boundaries.

---

# 16. Game Event and Command Contracts

## 16.1 Command Request

Every command request should conceptually contain:

- schema version;
- command ID;
- session identity from server context;
- character ID from server context;
- raw input;
- client timestamp for diagnostics only;
- last known event sequence;
- interface mode.

The client must not be allowed to claim a different account, role, or character through command payload fields.

## 16.2 Command Response

The server must acknowledge each command with:

- command ID;
- accepted or rejected status;
- error code where relevant;
- human-readable message;
- resulting event sequence range;
- indication that a full resync is required where relevant.

## 16.3 Event Envelope

Every game event should include:

- `eventId`;
- `sequence`;
- `schemaVersion`;
- `type`;
- `occurredAt`;
- `audience`;
- `roomId` or encounter context where applicable;
- structured payload;
- plain-text narration;
- optional semantic segments;
- optional presentation key.

## 16.4 Semantic Text Segments

Narration should not require the client to parse prose to find meaning.

A narration may contain segments such as:

- ordinary text;
- actor;
- target;
- location;
- item;
- spell;
- damage;
- healing;
- quest;
- system;
- danger;
- command.

Example concept:

```text
[actor: Bramble] casts [spell: Ember] at [target: Briar Warden]
for [damage: 8 fire damage].
```

The classic renderer concatenates plain text.

The colour renderer styles semantic segments.

The combat renderer uses structured values to update frames and run an optional effect.

## 16.5 Required Initial Event Types

- `system.connected`
- `system.notice`
- `system.error`
- `session.snapshot`
- `room.snapshot`
- `room.entered`
- `room.left`
- `entity.entered`
- `entity.left`
- `chat.said`
- `character.updated`
- `inventory.updated`
- `equipment.updated`
- `item.taken`
- `item.dropped`
- `quest.updated`
- `map.discovered`
- `combat.started`
- `combat.turn_started`
- `combat.action_resolved`
- `combat.status_applied`
- `combat.ended`
- `progress.experience_gained`
- `progress.level_gained`
- `moderation.notice`

## 16.6 Event Ordering

- Each connected character receives monotonically increasing event sequence values.
- The client ignores already-applied events.
- If a gap is detected, the client requests a snapshot.
- Critical mutations are persisted before success is acknowledged.
- Replayed or duplicated command IDs must not duplicate rewards or actions.

## 16.7 Replay Harness

The repository must contain curated event fixtures for:

- movement;
- room chat;
- item pickup;
- quest progress;
- level gain;
- combat;
- Ember;
- defeat;
- reconnect.

A development page or test harness should replay these events through each renderer. This becomes both a regression tool and a classroom demonstration.

---

# 17. Data Ownership and Persistence

## 17.1 Static Content in Git

The following are version-controlled content:

- room definitions;
- exits;
- room descriptions;
- item templates;
- NPC templates;
- enemy templates;
- spells;
- quests;
- help entries;
- map glyphs;
- semantic presentation keys.

## 17.2 Persistent Player State in PostgreSQL

The following are stored in the database:

- accounts;
- roles;
- sessions;
- characters;
- location;
- health and focus;
- experience and level;
- inventory item instances;
- equipment;
- learned spells;
- quest progress;
- discoveries;
- interface preferences;
- moderation records;
- chat records;
- command audit metadata.

## 17.3 Ephemeral Runtime State

The following may initially remain in memory:

- active socket connections;
- room connection membership;
- short-lived command locks;
- active combat presentation queue;
- online status;
- temporary rate-limit counters.

Any ephemeral state necessary for correctness after a restart must be moved to persistent or reconstructable storage.

## 17.4 Persistence Strategy

Critical changes use write-through persistence:

- room movement;
- inventory ownership;
- rewards;
- XP;
- level;
- quest state;
- learned spell;
- equipment.

UI preferences may be debounced.

On disconnect during combat:

- the connection enters a grace period;
- reconnection restores the encounter where practical;
- after timeout the server safely disengages the player;
- no duplicated rewards may occur;
- current persistent health is retained.

## 17.5 World Versioning

Every deployment must expose a world-content version.

Content changes that affect persistent references must include:

- stable IDs;
- migration notes;
- fallback handling for removed content;
- validation;
- release note.

Room, item, quest, and spell IDs must not be casually renamed after release.

---

# 18. Initial Data Model

The final schema may differ, but version 0.1 should plan for these entities.

## 18.1 Accounts

Fields:

- ID;
- username;
- password hash;
- status;
- role;
- optional private student reference;
- accepted-rules timestamp;
- created timestamp;
- updated timestamp;
- last sign-in timestamp.

## 18.2 Sessions

Fields:

- ID;
- account ID;
- token hash;
- created timestamp;
- expiry timestamp;
- revoked timestamp;
- last-seen timestamp;
- IP and user-agent metadata only if approved and needed.

## 18.3 Characters

Fields:

- ID;
- account ID;
- name;
- species ID;
- level;
- experience;
- HP;
- focus;
- core attributes;
- room ID;
- status;
- created timestamp;
- updated timestamp.

## 18.4 Character Discoveries

Fields:

- character ID;
- room ID;
- first discovered timestamp;
- discovery method;
- revealed exit IDs.

## 18.5 Item Instances

Fields:

- instance ID;
- template ID;
- owner character ID or room ID;
- quantity;
- durability if later required;
- metadata;
- created timestamp.

## 18.6 Equipment

Fields:

- character ID;
- slot;
- item instance ID.

## 18.7 Character Spells

Fields:

- character ID;
- spell ID;
- learned timestamp;
- mastery or rank later.

## 18.8 Character Quests

Fields:

- character ID;
- quest ID;
- state;
- objective progress;
- started timestamp;
- completed timestamp;
- version.

## 18.9 UI Preferences

Fields:

- account or character ID;
- interface mode;
- reduced motion;
- high contrast;
- font size;
- transcript density;
- panel visibility;
- shortcut configuration;
- sound enabled.

## 18.10 Chat Log

Fields:

- message ID;
- account ID;
- character ID;
- room ID;
- content;
- timestamp;
- moderation status.

## 18.11 Command Audit

The system should avoid retaining every raw command indefinitely unless required.

Suggested fields:

- command ID;
- account ID;
- character ID;
- command category;
- command verb;
- success/failure;
- error code;
- room ID;
- timestamp;
- latency.

Raw command text may be retained for a shorter configurable moderation/debugging window.

## 18.12 Moderation Actions

Fields:

- action ID;
- target account;
- actor account;
- action type;
- reason;
- created timestamp;
- expiry timestamp;
- revoked timestamp.

---

# 19. World Content Authoring

## 19.1 Content Format

World content should be stored as declarative JSON files with generated JSON Schema support for editor completion.

Reasons:

- easy to inspect on GitHub;
- safe for student contributions;
- no executable content;
- reviewable diffs;
- machine validation;
- usable by scripts and tests.

## 19.2 Content Validation

The content-validation command must detect:

- duplicate IDs;
- missing references;
- broken exits;
- unreachable required rooms;
- invalid coordinates;
- unknown item templates;
- unknown NPCs;
- invalid quest transitions;
- invalid spell presentation keys;
- missing plain-text descriptions;
- illegal HTML or scripts;
- inappropriate content markers where possible.

## 19.3 Room Content Rules

Every room must have:

- stable ID;
- title;
- short description;
- long description;
- at least one valid exit unless intentionally terminal;
- zone;
- map placement or explicit `unmapped`;
- school-appropriate language;
- original text.

## 19.4 Exit Rules

Exits may be:

- directional;
- named;
- locked;
- hidden;
- conditional;
- one-way;
- vertical;
- portal-based.

Reciprocal exits should be validated where expected, but the system must allow intentional one-way movement.

## 19.5 Student Content Workflow

A student room contribution should require:

1. a proposal;
2. purpose in the world;
3. room data;
4. original description;
5. exit diagram;
6. interaction or discovery;
7. content validation;
8. peer or teacher review;
9. merge approval.

Student content must never include personal information about classmates.

---

# 20. Authentication, Privacy, Moderation, and Safety

## 20.1 Classroom Mode

`CLASSROOM_MODE=true` is the default production configuration.

Classroom mode must:

- disable public registration;
- disable private messaging;
- disable PvP;
- enable chat and moderation logging;
- require approved accounts;
- expose teacher moderation tools;
- prevent public player lists outside the authenticated game;
- use school-appropriate content settings.

## 20.2 Data Minimization

The game should not require:

- legal name;
- home address;
- birth date;
- personal phone;
- personal email;
- social-media identity.

A private teacher reference may connect an account to a student where operationally necessary. That reference must not appear in public gameplay or repository content.

## 20.3 Privacy Policy Requirement

Before broad student use, the maintainer must establish:

- what data is collected;
- why it is collected;
- who can access it;
- how long it is retained;
- how it is deleted;
- how moderation logs are handled;
- how parent, school, and division requirements apply.

The software must provide configurable retention and account-purge tools. The PRD does not replace school-division privacy policy or legal review.

## 20.4 Chat Safety

Required safeguards:

- room-only chat;
- length limits;
- rate limits;
- plain-text rendering;
- reporting command;
- mute;
- temporary freeze;
- account disable;
- teacher review;
- auditable actions.

A profanity filter may assist but must never be treated as the whole moderation system.

## 20.5 Input Security

All user input must be treated as untrusted.

Required controls:

- Zod validation;
- command length limits;
- chat length limits;
- rate limiting;
- Unicode normalization where appropriate;
- server-side permission checks;
- parameterized database access;
- no user HTML;
- no dynamic code execution;
- no command interpolation into shell commands;
- no client-provided role or account authority.

## 20.6 Secret Management

- Real `.env` files are excluded by `.gitignore`.
- Real `.env` files and credential files are excluded by `.cursorignore`.
- Secrets are stored in Render environment variables.
- `.env.example` contains names and safe examples only.
- Production database URLs, session secrets, admin tokens, and API keys never enter prompts, screenshots, issues, or commits.
- Agent access to deployment credentials is not required for ordinary coding.

## 20.7 Open-Repository Separation

The public repository may include:

- schemas;
- seeded fictional accounts;
- fake chat fixtures;
- sample logs;
- screenshots with fictional names.

It must not include:

- production logs;
- student mappings;
- real chat exports;
- database backups;
- passwords;
- tokens;
- email lists;
- screenshots exposing student identity.

---

# 21. Teacher and Administrator Tools

## 21.1 Required Version 0.1 Tools

Teacher or owner must be able to:

- create account;
- issue invite;
- reset password;
- disable account;
- rename character;
- inspect character;
- inspect location;
- view online users;
- announce message;
- mute character;
- kick connection;
- freeze account;
- teleport character;
- summon character;
- restore health;
- grant or remove a test item;
- reset quest;
- view moderation history;
- place server into maintenance mode;
- export a backup;
- run a world validation report.

## 21.2 Game Master Commands

Proposed commands:

```text
admin announce <message>
admin inspect <character>
admin goto <room>
admin teleport <character> <room>
admin summon <character>
admin heal <character>
admin give <character> <item>
admin spawn <npc> [room]
admin mute <character> [duration]
admin freeze <character> [duration]
admin kick <character>
admin resetquest <character> <quest>
admin status
```

All admin commands must:

- require server-enforced permission;
- be logged;
- provide confirmation;
- avoid exposing private account details to ordinary players.

## 21.3 Teacher Event Tools

Later versions may support:

- scheduled announcements;
- weather changes;
- opening or closing world gates;
- spawning an event NPC;
- temporary room descriptions;
- class-wide quest activation;
- mystery clues;
- teacher-authored event scripts using approved declarative actions.

No teacher event tool should require direct production database editing.

---

# 22. Accessibility and Usability

## 22.1 Accessibility Target

The Web interface should target WCAG 2.2 AA practices appropriate to the application.

## 22.2 Keyboard Requirements

- All essential functions work by keyboard.
- Command input has a clear focus state.
- A predictable method returns focus to command input.
- Panels are reachable in a logical order.
- Escape closes temporary panels and returns focus appropriately.
- Printable keys are not globally hijacked while typing.
- Shortcut use is optional.
- Every shortcut has a command equivalent.

## 22.3 Colour Requirements

- Colour never carries the only meaning.
- Text labels or symbols accompany status.
- text and interface contrast meet the selected accessibility target;
- high-contrast mode is available;
- semantic colours are defined centrally.

## 22.4 Motion Requirements

- Respect `prefers-reduced-motion`.
- Provide an explicit in-game reduced-motion option.
- Allow players to skip combat effects.
- Avoid rapid repeated flashes.
- Keep ordinary effects short.
- Do not move the command input unexpectedly.
- Preserve all results in text.

## 22.5 Screen Reader Requirements

- Important events are exposed through an appropriate live region.
- Repeated decorative animation characters are hidden from assistive technology where necessary.
- Permanent transcript remains navigable.
- panels have headings;
- buttons have labels;
- health bars expose numerical values;
- map has a text alternative;
- target and turn changes are announced without overwhelming the user.

## 22.6 Readability Requirements

- Default font is a legible monospace font available without proprietary distribution.
- users can increase font size;
- line length remains readable;
- transcript density can be reduced;
- decorative ASCII does not block essential text;
- classroom projector mode may use larger text and simplified panels.

## 22.7 Responsive Baseline

Primary design target:

- desktop and school laptop browsers;
- approximately 1280×720 and above.

The application should remain functional at approximately 1024×600, though panels may collapse.

Mobile browser support is best effort and not a version 0.1 acceptance requirement.

---

# 23. Performance, Reliability, and Reconnection

## 23.1 Concurrency Target

Version 0.1 must support:

- 30 simultaneous classroom players;
- one teacher account;
- active room chat;
- movement;
- several simultaneous combats.

Stretch target:

- 100 connected users on one instance after load testing.

## 23.2 Response Targets

Excluding an asleep hosting service:

- command acknowledgement should normally appear within 500 ms;
- same-room chat should normally appear within 500 ms;
- room movement and snapshot should normally appear within 750 ms;
- local game-engine operations should normally complete within 50 ms;
- combat animation may take longer, but the server result must already be known.

## 23.3 Reconnection

The client must:

- detect disconnect;
- display connection status;
- stop presenting unconfirmed commands as successful;
- attempt reconnection;
- restore the authenticated session;
- provide the last known sequence;
- receive missed events where available;
- request a fresh snapshot where recovery is incomplete;
- prevent duplicate command effects.

## 23.4 Restart Safety

The application must not rely on Render's local filesystem for persistent game state.

On restart:

- accounts remain;
- characters remain;
- location remains;
- inventory remains;
- quest progress remains;
- discoveries remain;
- moderation records remain.

Online presence may be reconstructed.

## 23.5 Graceful Shutdown

On shutdown:

- stop accepting new commands;
- acknowledge maintenance state;
- complete or safely reject in-flight transactions;
- close socket connections with a reconnect message;
- close database pool;
- emit final structured logs.

## 23.6 Scaling Boundary

Version 0.1 uses one application instance.

Before multiple application instances are enabled, the project must add:

- shared Socket.IO adapter;
- cross-instance room/event coordination;
- externalized rate limits where required;
- session consistency;
- concurrency testing;
- a new architecture decision record.

---

# 24. Testing and Quality Assurance

## 24.1 Testing Pyramid

### Unit Tests

Required for:

- command normalization;
- parser;
- alias resolution;
- movement rules;
- permission rules;
- damage;
- status effects;
- experience;
- quest transitions;
- item ownership;
- map discovery;
- content validators.

### Contract Tests

Required for:

- command request schemas;
- command response schemas;
- event schemas;
- snapshot schemas;
- semantic narration;
- backward-compatible event fixtures.

### Integration Tests

Required for:

- authentication;
- session;
- database repositories;
- transactions;
- command dispatcher;
- Socket.IO connection;
- room broadcasts;
- persistence;
- reconnect;
- admin permissions.

### End-to-End Tests

Required user journeys:

1. sign in;
2. select character;
3. enter world;
4. look;
5. move;
6. see another player;
7. say message;
8. take item;
9. start and finish combat;
10. reload;
11. verify state persisted;
12. switch interface mode.

## 24.2 Content Tests

Automated checks must verify:

- unique IDs;
- all references valid;
- required world reachable;
- no impossible tutorial path;
- map coordinate consistency;
- quest objective validity;
- item reward validity;
- plain-text fallback exists;
- no executable markup.

## 24.3 Renderer Tests

Curated event fixtures must be rendered in:

- classic;
- colour;
- HUD;
- combat;
- reduced motion;
- high contrast.

The classic renderer is a regression baseline and may not be allowed to silently break.

## 24.4 Accessibility Tests

Automated and manual checks:

- keyboard-only path;
- focus order;
- colour contrast;
- reduced motion;
- screen-reader labels;
- zoom;
- large font;
- text alternative for map;
- no essential image-only text.

## 24.5 Security Tests

Test:

- role escalation;
- acting as another character;
- duplicate command ID;
- repeated reward claim;
- long command input;
- rapid chat;
- HTML/script input;
- invalid socket payload;
- expired session;
- disabled account;
- unauthorized admin command;
- stale client state.

## 24.6 Load Test

A scripted classroom simulation should:

- connect at least 30 clients;
- place groups in shared rooms;
- move;
- chat;
- run commands;
- enter combat;
- disconnect and reconnect;
- record latency and error rates.

## 24.7 Manual Playtest

Every release candidate requires:

- teacher playtest;
- at least one beginner playtest;
- multi-user playtest;
- one deliberately adversarial input session;
- written observations.

---

# 25. Logging, Metrics, and Observability

## 25.1 Structured Logging

Logs must be structured and include:

- timestamp;
- level;
- service version;
- request or command correlation ID;
- account ID where appropriate;
- character ID where appropriate;
- event type;
- duration;
- error code.

Logs must redact:

- passwords;
- session tokens;
- reset tokens;
- database URLs;
- secrets.

## 25.2 Metrics

Track:

- connected users;
- reconnects;
- commands by category;
- command success/failure;
- unknown commands;
- median and p95 latency;
- chat rate-limit events;
- server errors;
- database errors;
- active encounters;
- content validation failures.

## 25.3 Product Analytics

Avoid invasive tracking.

Useful classroom-safe aggregate measures:

- most-used commands;
- commands players fail to remember;
- rooms with high abandonment;
- quest steps where progress stalls;
- interface mode usage;
- panel usage;
- reconnect frequency.

The system must not add third-party advertising or behavioural tracking.

## 25.4 Error Handling

User-facing errors must include:

- stable error code;
- plain-language explanation;
- likely corrective action.

Internal stack traces must not be sent to ordinary clients.

---

# 26. Render Deployment Requirements

## 26.1 Required Render Resources

- one Node Web Service;
- one persistent Render Postgres database;
- one Blueprint defined by `render.yaml`.

## 26.2 Required Blueprint Features

The Blueprint should define:

- Node runtime;
- build command;
- start command;
- pre-deploy migration command;
- health-check path;
- environment variables;
- database;
- region;
- deployment trigger after CI checks pass;
- graceful shutdown allowance.

## 26.3 Required Environment Variables

At minimum:

```text
NODE_ENV
DATABASE_URL
SESSION_SECRET
ADMIN_BOOTSTRAP_TOKEN
CLASSROOM_MODE
PUBLIC_REGISTRATION
ALLOWED_ORIGINS
LOG_LEVEL
WORLD_VERSION
RAW_COMMAND_RETENTION_DAYS
CHAT_RETENTION_DAYS
```

No real secret values appear in the repository.

## 26.4 Build and Deploy Flow

1. GitHub pull request passes CI.
2. approved change merges to `main`.
3. Render builds the monorepo.
4. Render runs database migrations before start.
5. application starts.
6. readiness endpoint confirms database and content load.
7. Render shifts traffic.
8. clients reconnect and resynchronize.

## 26.5 Health Endpoints

- `/health/live`: process is running.
- `/health/ready`: database reachable, content valid, server ready.
- `/version`: safe build and world version only.

## 26.6 Production Plan Requirement

A semester deployment must not use an expiring free PostgreSQL database.

An idle-spinning web service is also inappropriate for the first minutes of a scheduled class. Use an always-available service plan for normal semester operation, or wake and verify the service before class only as a temporary development measure.

## 26.7 Backups

Required:

- managed database backups appropriate to the selected Render plan;
- manual export before risky migrations;
- periodic encrypted export to approved teacher-controlled storage;
- tested restore procedure;
- backup files excluded from Git.

---

# 27. GitHub and Open-Repository Requirements

## 27.1 Required Root Documents

- `README.md`
- `docs/PRD.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `LICENSE`
- `THIRD_PARTY_NOTICES.md`
- `AGENTS.md`

## 27.2 Recommended Licensing

Proposed:

- code: MIT License;
- original written world content and educational documentation: CC BY 4.0 notice;
- third-party assets: individually documented.

The final license choice should be confirmed before the first public release.

## 27.3 Branch Model

- `main` is protected and deployable;
- work occurs on short-lived feature branches;
- pull requests are required for normal changes;
- CI must pass before merge;
- direct emergency changes are documented afterward;
- releases are tagged.

## 27.4 Commit and Pull Request Quality

Commits should be understandable.

Pull requests must state:

- problem;
- change;
- scope exclusions;
- tests;
- screenshots or transcript where applicable;
- migration impact;
- accessibility impact;
- student-facing explanation;
- AI assistance used.

## 27.5 GitHub Issue Types

- Bug
- Feature
- Design Sprint
- World Content
- Accessibility
- Student Contribution
- Refactor
- Security
- Documentation
- Release

## 27.6 Architecture Decision Records

Use ADRs for decisions such as:

- Socket.IO over raw WebSocket;
- Drizzle over alternatives;
- static content in JSON;
- one-origin deployment;
- no Tailwind initially;
- server-authoritative events;
- no DMs in classroom mode;
- single instance;
- future scaling adapter.

## 27.7 Public Proof-of-Work Features

The README should prominently show:

- current live version;
- screenshots of interface generations;
- architecture diagram;
- command example;
- release ladder;
- curriculum alignment;
- design sprint index;
- test status;
- contribution guide;
- privacy statement that no student data is stored in the repo.

---

# 28. AI-Assisted Development Protocol

## 28.1 Primary Tooling

Primary coding environment:

- Cursor
- Grok 4.6
- Extra High reasoning
- Fast mode

The model is a development assistant, not a runtime dependency and not the product architect of record.

## 28.2 AI Development Principle

> Do not ask the agent to build the entire MUD in one prompt.

Large undifferentiated prompts will encourage:

- tangled layers;
- premature features;
- duplicated types;
- client-side authority;
- untested code;
- unnecessary dependencies;
- unreviewable diffs.

Work must be issue-sized.

## 28.3 Required Agent Workflow

For each non-trivial ticket, the agent must:

1. read the PRD;
2. read relevant ADRs;
3. read relevant package instructions;
4. inspect current code;
5. restate the requirement;
6. identify files expected to change;
7. identify tests;
8. identify risks;
9. propose a plan before editing;
10. implement the smallest complete slice;
11. run typecheck, lint, and tests;
12. summarize the diff;
13. disclose unresolved concerns.

## 28.4 Required Root AGENTS.md Rules

The root instructions should state:

1. TypeScript strict mode is required.
2. The server is authoritative.
3. React components never contain game rules.
4. Socket handlers coordinate; they do not calculate domain outcomes.
5. The game engine has no Web, database, or framework dependency.
6. All external input is validated.
7. All significant game events include plain text.
8. Classic interface compatibility may not be removed.
9. No new dependency without rationale.
10. No schema change without a migration.
11. No secret or production data may be read, logged, or committed.
12. Every behaviour change requires tests.
13. World content remains declarative.
14. Accessibility is part of acceptance, not a later patch.
15. Do not modify unrelated files.
16. Do not silently weaken types to make tests pass.
17. Never use `any` as a shortcut without documented justification.
18. Update documentation when behaviour changes.

## 28.5 Cursor Project Rules

Version-controlled rules in `.cursor/rules` should be scoped:

- `architecture.mdc`
- `engine.mdc`
- `server.mdc`
- `web.mdc`
- `contracts.mdc`
- `content.mdc`
- `database.mdc`
- `testing.mdc`
- `security.mdc`
- `accessibility.mdc`

Rules should remain focused and refer to canonical examples rather than repeating the whole PRD.

## 28.6 Agent Security

- `.env` and credentials are excluded from agent context.
- Production deployment actions remain human-controlled.
- The agent may not receive a production database dump.
- The agent may not automatically merge its own pull request.
- Terminal commands that alter infrastructure or data require explicit review.
- AI review supplements, but does not replace, CI and human review.

## 28.7 AI Disclosure

Each pull request includes:

```text
AI assistance:
- Tool/model:
- Planning assistance:
- Code generation:
- Tests generated:
- Human review performed:
- Known limitations:
```

This is not an apology. It is part of the project's transparent development record.

---

# 29. Classroom Use and Curriculum Alignment

## 29.1 Classroom Development Rhythm

A feature demonstration may follow this pattern:

1. students experience a problem;
2. class describes the problem;
3. class separates needs from proposed solutions;
4. teacher opens a design sprint;
5. students sketch or predict;
6. teacher shows the agent plan;
7. class reviews the file tree and modules;
8. implementation is completed in a branch;
9. tests fail or pass visibly;
10. class examines the diff;
11. feature deploys;
12. students evaluate whether the problem improved.

## 29.2 CSE1010: Computer Science 1

Natural connections:

- algorithms;
- IPO;
- iterative and incremental development;
- structured control;
- programming languages;
- computer systems;
- misconceptions about computer science;
- development life cycle.

Example:

```text
Input: attack rat
Processing: parse, validate, calculate, update
Output: combat events and new state
```

## 29.3 CSE1110: Structured Programming 1

Natural connections:

- sequential algorithms;
- input;
- processing;
- output;
- variables;
- data types;
- testing;
- syntax, runtime, and logic errors.

Appropriate student tasks:

- command normalization;
- help output;
- simple status calculation;
- item description formatter;
- test cases.

## 29.4 CSE1120: Structured Programming 2

Natural connections:

- selection;
- iteration;
- nested conditions;
- repeated processing;
- modular blocks;
- accumulation;
- minimum and maximum.

Appropriate tasks:

- combat conditions;
- inventory loops;
- enemy turn logic;
- quest checks;
- list formatting.

## 29.5 CSE1210: Client-Side Scripting 1

Natural connections:

- Internet and Web architecture;
- client/server relationships;
- HTTP;
- browser-to-server flow;
- markup;
- page organization;
- design and debugging.

Class activity:

- trace a typed command from browser to server and back.

## 29.6 CSE1910: CSE Project A

The repository can provide a strong project context because students can:

- connect outcomes from multiple courses;
- prepare a plan;
- clarify purpose;
- define deliverables;
- establish timelines;
- explain terminology, tools, and processes;
- define resources;
- establish success indicators;
- monitor and adjust;
- present and evaluate.

Appropriate project examples:

- add one command;
- add one validated room cluster;
- design a help system;
- build a status display;
- write a test suite for a subsystem.

## 29.7 CSE2010 and CSE2110

Natural connections:

- top-down design;
- modules;
- subprograms;
- cohesion;
- coupling;
- scope;
- parameters;
- reusable code;
- documentation;
- debugging.

The repository structure deliberately separates:

- parser;
- movement;
- combat;
- items;
- quests;
- persistence;
- presentation.

## 29.8 CSE2120: Data Structures 1

Natural data structures:

- room lists;
- item arrays;
- inventory records;
- spell maps;
- online-player sets;
- quest state records;
- coordinate tables.

## 29.9 CSE2130: Files and File Structures 1

Natural connections:

- content files;
- import;
- export;
- sequential data;
- persistent records;
- backup;
- migration;
- comparison of file and database storage.

## 29.10 CSE2210: Client-Side Scripting 3

Natural connections:

- procedural client scripts;
- reusable interface modules;
- arrays;
- rendering collections;
- event handling;
- maintainability;
- collaboration.

## 29.11 CSE3120: Object-Oriented Programming 1

Possible later analysis:

- Character;
- Player;
- NPC;
- Room;
- Item;
- Spell;
- Quest;
- Encounter.

The course may compare object-oriented models with the project's actual data-oriented or procedural choices. The project does not need to force every feature into inheritance merely to appear object-oriented.

## 29.12 CSE3210: Server-Side Scripting 1

Direct connections:

- Web server;
- database;
- server-side scripting;
- multitier design;
- client requests;
- server validation;
- data handling;
- scalability;
- maintainability.

## 29.13 Grade 9 Participation

Grade 9 students may participate through:

- command use;
- pseudocode;
- testing;
- bug reports;
- room writing;
- flowcharts;
- interface critique;
- simple HTML/CSS;
- supervised GitHub observation;
- content validation.

The same artifact can support different depth without pretending all students are completing the same technical outcomes.

## 29.14 Curriculum Source

Curriculum alignment is based on the Alberta Education Computing Science Program of Studies supplied with the course project, including CSE1010, CSE1110, CSE1120, CSE1210, CSE1910, CSE2010, CSE2110, CSE2120, CSE2130, CSE2210, CSE3120, and CSE3210.

---

# 30. Release Roadmap

## 30.1 Foundation: v0.0 — One Room, One Command

Purpose:

- prove repository;
- prove CI;
- prove deployment;
- prove typed contracts;
- prove one command round trip.

Deliverables:

- monorepo;
- Web client;
- server;
- health endpoint;
- Socket.IO connection;
- `look`;
- one room;
- classic transcript;
- shared event schema;
- tests;
- Render deployment.

## 30.2 Vertical Slice: v0.0.2 — Two Players in Lantern Court

Deliverables:

- temporary development identity;
- room membership;
- movement between three rooms;
- same-room presence;
- `say`;
- reconnect snapshot;
- event sequencing.

## 30.3 Persistence Slice: v0.0.3 — Return Tomorrow

Deliverables:

- PostgreSQL;
- migrations;
- accounts;
- sessions;
- characters;
- saved location;
- Render Postgres;
- teacher bootstrap account.

## 30.4 MVP: v0.1 — First Lantern

Target content:

- 25 rooms;
- 15-20 commands;
- 6 friendly NPCs;
- 5 enemy templates;
- 15 item templates;
- 3 introductory quests;
- 3-6 spells;
- basic combat;
- XP and levels;
- inventory;
- persistence;
- moderation;
- classic interface;
- one full classroom load test.

This is the first complete playable release.

## 30.5 v0.2 — The Academy Becomes a Game

Adds:

- six Schools of Study;
- more equipment;
- quest journal;
- spellbook;
- Old Abbey dungeon;
- expanded enemy abilities;
- persistent status HUD;
- semantic colour;
- command assistance;
- bags and statistics panels.

## 30.6 v0.3 — The Living Greenwood

Adds:

- minimap;
- day/night;
- weather;
- NPC schedules;
- parties;
- cooperative encounters;
- secrets;
- locked doors;
- broader world events;
- teacher event controls;
- combat theatre;
- spell visual grammars.

## 30.7 v0.4 — Glyphs Beneath the Boughs

Adds:

- glyph room renderer;
- interface switching;
- expanded replay harness;
- high-contrast glyph theme;
- optional local diagrams;
- no tactical tile movement yet.

## 30.8 v1.0 — The Student-Built Collegium

Adds:

- stable contribution schemas;
- room contribution pipeline;
- item and NPC contribution templates;
- student interface themes;
- contribution documentation;
- releases built from reviewed student work;
- public showcase material;
- stable classroom operations.

---

# 31. MVP Acceptance Criteria

The MVP is accepted only when all of the following are true.

## 31.1 Connection and Accounts

- A teacher can create an account.
- A player can accept an invite and establish credentials.
- A player can sign in and sign out.
- A disabled account cannot connect.
- A refreshed page restores a valid session.
- No secret appears in client code or repository history.

## 31.2 Character

- A player can create or select a character.
- Character name and species persist.
- Location persists.
- Level, XP, HP, and focus persist.
- Interface preference persists.

## 31.3 World

- At least 25 valid rooms load.
- All required references pass validation.
- A new player can reach Lantern Court.
- Movement notifies players in old and new rooms.
- Invalid movement gives a helpful response.
- Discovered rooms persist.

## 31.4 Commands

- At least 15 canonical commands work.
- Aliases work.
- Case and whitespace are normalized.
- Ambiguous targets produce choices.
- Common misspellings produce suggestions.
- Invalid commands cannot crash the server.
- Duplicate command IDs do not duplicate results.

## 31.5 Multiplayer

- 30 clients can connect in a load test.
- Same-room players see one another.
- Same-room `say` is delivered.
- Entry and exit notices are delivered.
- Private messaging is unavailable.
- Moderation tools operate and are audited.

## 31.6 Inventory

- Items can be examined, taken, dropped, used, equipped, and unequipped where allowed.
- One unique item cannot be owned by two characters.
- Inventory survives refresh and reconnect.
- Invalid item operations do not mutate state.

## 31.7 Combat

- A player can start a legal encounter.
- Turn order is enforced.
- Basic attack works.
- At least three spells work.
- Damage, healing, focus, and status effects work.
- Enemy responds.
- victory awards XP once.
- defeat safely returns the character.
- reconnect does not duplicate rewards.
- combat results remain available in plain text.

## 31.8 Quests and Progression

- At least three quests can start, progress, and complete.
- Quest state persists.
- rewards are granted once.
- level gain works.
- the player can view progress.

## 31.9 Interface

- Classic mode is fully playable.
- Semantic event data exists even if advanced mode is not yet complete.
- Keyboard-only play is possible.
- meaningful content is not colour-only.
- reduced-motion setting exists before animated combat effects ship.
- important events have plain-text fallback.

## 31.10 Deployment and Quality

- CI passes.
- migrations run before production start.
- readiness check passes.
- production uses persistent Postgres.
- restart preserves required state.
- backup and restore have been tested.
- README and PRD are current.
- no student data is in the repository.

---

# 32. Success Measures

## 32.1 Product Measures

- percentage of class able to enter the world unaided;
- median time to first successful command;
- command error rate;
- reconnection success;
- number of voluntary return sessions;
- number of rooms explored;
- quest completion;
- combat completion without teacher intervention.

## 32.2 Interface Measures

For each design sprint:

- did repeated command use decrease;
- did task completion improve;
- did confusion reports decline;
- did keyboard use remain strong;
- did accessibility regress;
- did the feature create clutter;
- did players choose to keep the new mode.

## 32.3 Educational Measures

- students can describe the command IPO cycle;
- students can trace client-to-server flow;
- students can identify at least three modules;
- students can explain why the server is authoritative;
- students can identify a data structure used by the game;
- students can describe one bug and its test;
- students can explain why the interface changed;
- students can interpret a pull request diff at an appropriate level.

## 32.4 Repository Measures

- regular meaningful commits;
- issues tied to changes;
- passing CI;
- architecture records;
- design sprint records;
- release tags;
- student-safe contributions;
- no secret leaks;
- no production data leaks.

---

# 33. Risks and Mitigations

## 33.1 Scope Explosion

**Risk:** The fun of the concept encourages too many systems before a playable version.

**Mitigation:**

- release ladder;
- explicit non-goals;
- issue-sized work;
- vertical slices;
- no feature without acceptance criteria;
- no tactical grid in version 0.1.

## 33.2 AI-Generated Architectural Entanglement

**Risk:** The coding agent puts rules in UI components, duplicates contracts, or introduces unnecessary packages.

**Mitigation:**

- root and scoped agent rules;
- pure game-engine package;
- plan before edits;
- dependency rationale;
- human diff review;
- architecture tests;
- small PRs.

## 33.3 Student Social Misuse

**Risk:** Chat, naming, or social behaviour becomes inappropriate.

**Mitigation:**

- controlled accounts;
- room-only chat;
- no DMs;
- logging;
- moderation;
- rate limits;
- clear rules;
- rapid teacher controls.

## 33.4 Privacy Exposure Through Public Repository

**Risk:** logs, screenshots, data exports, or names enter Git history.

**Mitigation:**

- pseudonyms;
- explicit forbidden files;
- `.gitignore`;
- `.cursorignore`;
- fake fixtures;
- pre-commit checks;
- reviewer checklist;
- private operational storage.

## 33.5 Hosting Cold Starts or Data Loss

**Risk:** free hosting sleeps or free database expires.

**Mitigation:**

- paid persistent semester resources;
- health checks;
- backups;
- startup verification;
- no local-file persistence.

## 33.6 Connection Interruptions

**Risk:** school network interruptions duplicate or lose actions.

**Mitigation:**

- command IDs;
- acknowledgements;
- event sequence;
- reconnection recovery;
- snapshot resync;
- idempotent rewards.

## 33.7 UI Overwhelms the Command Line

**Risk:** panels and shortcuts convert the project into an ordinary Web RPG.

**Mitigation:**

- typed commands remain canonical;
- classic mode preserved;
- command line remains central;
- every panel has a command equivalent;
- no bare-key hijacking while typing.

## 33.8 Animation Reduces Readability

**Risk:** effects become distracting, inaccessible, or slow.

**Mitigation:**

- short effects;
- skip;
- reduced motion;
- plain transcript;
- no essential animation;
- safe flash limits;
- classroom sound muted.

## 33.9 Content Quality Inconsistency

**Risk:** student contributions vary in tone, mechanics, or appropriateness.

**Mitigation:**

- style guide;
- schemas;
- content proposal;
- review;
- teacher approval;
- stable examples;
- original-content requirement.

## 33.10 Database and Migration Errors

**Risk:** rapid AI changes damage persistent data.

**Mitigation:**

- migrations in Git;
- pre-deploy migration;
- backup before risky migration;
- integration tests;
- no manual production schema edits;
- rollback plan.

---

# 34. Decisions Fixed for Version 0.1

The following decisions are fixed unless changed through an ADR:

1. browser-based game;
2. TypeScript end-to-end;
3. React/Vite client;
4. Node/Fastify server;
5. Socket.IO real-time transport;
6. PostgreSQL persistence;
7. Drizzle migrations;
8. Zod contracts;
9. public GitHub monorepo;
10. Render deployment;
11. modular monolith;
12. same-origin production deployment;
13. server-authoritative game state;
14. room-based world;
15. turn-based combat;
16. declarative JSON world content;
17. no public registration;
18. no direct messages;
19. no PvP;
20. classic interface permanently retained;
21. structured events plus plain-text fallback;
22. plain CSS and no large UI framework;
23. design sprint required for major interface upgrades;
24. classroom mode default;
25. no generative-AI NPC dialogue in the live game.

---

# 35. Deferred Decisions

The following may be decided later through design or architecture records:

- final product name;
- final logo;
- exact attribute names;
- exact damage formulas;
- exact Level 10 progression curve;
- final species list;
- exact starting spell list;
- Google Workspace authentication;
- public read-only demo;
- party size;
- multi-instance scaling;
- glyph-room layout format;
- tactical encounter proposal;
- sound design;
- localization;
- final content license;
- whether selected advanced systems use classes, functions, or mixed patterns;
- whether a dedicated client-state library becomes necessary.

---

# Appendix A: Initial Command Catalogue

## A.1 Core MVP Commands

| Category | Command | Examples |
|---|---|---|
| Help | `help` | `help`, `help attack` |
| Observation | `look` | `look`, `look fountain` |
| Observation | `examine` | `examine key` |
| Movement | `north` / `n` | `north` |
| Movement | `south` / `s` | `south` |
| Movement | `east` / `e` | `east` |
| Movement | `west` / `w` | `west` |
| Movement | `up` / `u` | `up` |
| Movement | `down` / `d` | `down` |
| Movement | `go` | `go tower` |
| Social | `say` | `say Meet me in the library.` |
| Social | `who` | `who` |
| Character | `stats` | `stats` |
| Character | `inventory` / `i` / `bag` | `inventory` |
| Character | `equipment` | `equipment` |
| Character | `quests` | `quests` |
| Character | `spells` | `spells` |
| Character | `map` | `map` |
| Items | `take` / `get` | `take key` |
| Items | `drop` | `drop chalk` |
| Items | `use` | `use draught` |
| Items | `equip` | `equip staff` |
| Items | `unequip` | `unequip staff` |
| NPC | `talk` | `talk porter` |
| World | `read` | `read runes` |
| World | `open` | `open door` |
| World | `search` | `search fountain` |
| Combat | `target` | `target rat` |
| Combat | `attack` | `attack rat` |
| Combat | `cast` | `cast ember rat` |
| Combat | `defend` | `defend` |
| Combat | `flee` | `flee` |
| Settings | `interface` | `interface classic` |
| Settings | `settings` | `settings` |
| Safety | `report` | `report Rowan inappropriate chat` |

## A.2 Later Commands

- `party`
- `follow`
- `trade`
- `brew`
- `study`
- `craft`
- `emote`
- `journal`
- `achievements`

These are not version 0.1 commitments.

---

# Appendix B: Initial World Content Budget

## B.1 Academy Core — 12 Rooms

1. Gatehouse
2. Lantern Court
3. Great Hall
4. West Cloister
5. Library of Moss and Ink
6. Alchemy Cellar
7. Training Yard
8. Infirmary
9. Dormitory Burrows
10. Observatory
11. Old Bell Tower
12. Rootways

## B.2 Briarwood — 7 Rooms

13. East Gate
14. Fern Road
15. Mushroom Hollow
16. Broken Bridge
17. Briar Thicket
18. Moonwell
19. Hunter's Copse

## B.3 Old Abbey — 6 Rooms

20. Abbey Approach
21. Ruined Nave
22. Cloister Garden
23. Scriptorium
24. Crypt Stair
25. Bell Vault

## B.4 Friendly NPC Budget — 6

Suggested roles:

- gate porter;
- headmaster or headmistress;
- healer;
- librarian;
- combat instructor;
- mysterious groundskeeper.

## B.5 Enemy Budget — 5

Suggested templates:

- tunnel rat;
- thorn beetle;
- briar spider;
- masked stoat bandit;
- abbey warden.

## B.6 Item Budget — 15

Include:

- starter staff;
- practice sword;
- cloak;
- healing draught;
- focus tonic;
- copper key;
- quest pages;
- mushrooms;
- chalk;
- lantern charm;
- two armour items;
- two curiosities;
- one rare reward.

## B.7 Quest Budget — 3

1. **Arrival at the Collegium**  
   Tutorial: look, move, speak, take, arrive.

2. **The Missing Pages**  
   Explore, find, and return three pages.

3. **The Bell Below**  
   Investigate the first clues at the Old Abbey.

---

# Appendix C: Design Sprint Template

```markdown
# Design Sprint DS-___: [Title]

## Status
Proposed / Approved / In Progress / Complete / Rejected

## Release Target

## Owner

## 1. Observed Problem
What happened in actual use?

## 2. Evidence
Commands repeated, errors, observations, playtest notes, screenshots, or feedback.

## 3. User Story
As a [user], I need [capability] so that [benefit].

## 4. Hypothesis
We believe [change] will improve [measurable outcome].

## 5. Constraints
Keyboard, classic mode, accessibility, screen size, server authority, privacy, time.

## 6. Proposed Design
Describe the interface and interaction.

## 7. Alternatives Considered

## 8. Scope

## 9. Non-Scope

## 10. Data and Event Changes
New event fields, snapshots, preferences, or schemas.

## 11. Accessibility Review
Colour, keyboard, focus, motion, screen reader, text fallback.

## 12. Acceptance Criteria

## 13. Test Plan
Unit, contract, integration, E2E, manual.

## 14. Implementation Summary

## 15. Before-and-After Evidence

## 16. Outcome
Did the hypothesis hold?

## 17. Reflection
What should change next?
```

---

# Appendix D: Definition of Done

A ticket is done only when:

- acceptance criteria are satisfied;
- scope is not silently expanded;
- TypeScript passes in strict mode;
- lint passes;
- unit tests pass;
- relevant integration tests pass;
- relevant E2E test passes;
- content validation passes;
- migration exists where required;
- security impact is considered;
- accessibility impact is considered;
- classic renderer still works;
- plain-text fallback exists for new events;
- documentation is updated;
- screenshots or transcript are attached where useful;
- no secrets or student data are present;
- AI assistance is disclosed;
- human review is complete;
- CI passes;
- the change is deployable;
- the issue can be demonstrated to students in plain language.

---

# Appendix E: Initial Implementation Ticket Sequence

The first implementation should proceed in this order.

## Ticket 001 — Repository Foundation

Create:

- pnpm workspace;
- app and package directories;
- strict TypeScript configuration;
- lint;
- formatting;
- Vitest;
- GitHub Actions;
- root documents;
- AGENTS.md;
- Cursor project rules.

**Exit criterion:** empty scaffold typechecks, tests, lints, and builds.

## Ticket 002 — Shared Event Contract

Create:

- event envelope;
- semantic text segment;
- plain-text narration;
- Zod schemas;
- event fixtures;
- contract tests.

**Exit criterion:** one example `room.snapshot` validates and renders to plain text.

## Ticket 003 — Pure One-Room Engine

Create:

- Room state;
- Character state;
- `look` command intent;
- pure result and event;
- unit tests.

**Exit criterion:** no Web or database dependency is required to test `look`.

## Ticket 004 — Fastify and Socket.IO Round Trip

Create:

- Fastify server;
- health endpoint;
- Socket.IO connection;
- command request;
- acknowledgement;
- event delivery.

**Exit criterion:** browser sends `look` and receives a validated room event.

## Ticket 005 — Classic React Client

Create:

- transcript;
- command input;
- connection indicator;
- plain-text renderer;
- keyboard focus;
- command history.

**Exit criterion:** UI 0 is usable with one room.

## Ticket 006 — Three-Room Movement

Create:

- exits;
- movement validation;
- room snapshots;
- discovery;
- event sequencing;
- tests.

**Exit criterion:** user can move among three rooms and cannot move through a missing exit.

## Ticket 007 — Multiplayer Presence and Say

Create:

- room membership;
- presence;
- `say`;
- entry and exit events;
- rate limits;
- two-client integration test.

**Exit criterion:** two browser sessions see one another and share room chat.

## Ticket 008 — PostgreSQL and Drizzle

Create:

- Render-compatible database connection;
- schema;
- migrations;
- repositories;
- integration-test database strategy.

**Exit criterion:** account and character records persist.

## Ticket 009 — Classroom Authentication

Create:

- owner bootstrap;
- invite token;
- password setup;
- session;
- sign-in;
- sign-out;
- disabled account;
- tests.

**Exit criterion:** no temporary identity remains in production mode.

## Ticket 010 — Reconnection and Idempotency

Create:

- command IDs;
- event sequence;
- session snapshot;
- recovery path;
- duplicate prevention.

**Exit criterion:** refresh and network interruption do not duplicate movement or rewards.

## Ticket 011 — Content Loader

Create:

- JSON schemas;
- room files;
- content validation;
- stable IDs;
- build/start failure on invalid content.

**Exit criterion:** 25-room content can load without code changes.

## Ticket 012 — Inventory Vertical Slice

Create:

- item templates;
- item instances;
- take/drop/examine;
- ownership transaction;
- persistence;
- concurrency test.

**Exit criterion:** two players cannot take the same unique item.

## Ticket 013 — Combat Vertical Slice

Create:

- encounter;
- turn;
- attack;
- enemy response;
- victory;
- defeat;
- deterministic tests.

**Exit criterion:** one complete fight runs through the classic interface.

## Ticket 014 — Spell and Ember Event

Create:

- focus;
- spell template;
- Ember;
- burning;
- presentation key;
- plain transcript;
- event fixture.

**Exit criterion:** classic client fully explains Ember without animation.

## Ticket 015 — Quest and Level Slice

Create:

- tutorial quest;
- objective events;
- reward idempotency;
- XP;
- Level 2;
- persistence.

**Exit criterion:** a new character can finish Arrival at the Collegium and retain progress.

## Ticket 016 — Teacher Controls and Moderation

Create:

- role checks;
- account controls;
- announce;
- mute;
- kick;
- inspect;
- audit log.

**Exit criterion:** teacher can operate classroom mode without database editing.

## Ticket 017 — Render Blueprint and Production Readiness

Create:

- `render.yaml`;
- build;
- migration;
- health check;
- persistent database;
- environment documentation;
- backup and restore notes.

**Exit criterion:** main deploys predictably and survives restart.

## Ticket 018 — Classroom Load Test

Create:

- 30-client simulation;
- metrics;
- failure report;
- fixes.

**Exit criterion:** MVP concurrency acceptance criteria pass.

## Ticket 019 — Begin Design Sprint DS-001

Only after the complete classic vertical slice is stable, begin semantic-colour interface work.

---

_End of Product Requirements Document._
