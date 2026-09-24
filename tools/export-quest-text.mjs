// Writes docs/content/QUEST-AND-DIALOGUE.md, a reading copy of the live quest and
// dialogue text. The game never loads that file. Run: node tools/export-quest-text.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const content = join(root, "packages", "content");

function loadDir(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")));
}

const SPINE = [
  "arrival-at-the-collegium",
  "first-lessons-ember",
  "first-lessons-thorn",
  "first-lessons-veil",
  "first-lessons-stars",
  "first-lessons-stone",
  "first-lessons-steel",
  "second-lessons-ember",
  "second-lessons-thorn",
  "second-lessons-veil",
  "second-lessons-stars",
  "second-lessons-stone",
  "second-lessons-steel",
  "third-lessons-ember",
  "third-lessons-thorn",
  "third-lessons-veil",
  "third-lessons-stars",
  "third-lessons-stone",
  "third-lessons-steel",
  "the-bell-below",
  "the-bell-wakes",
  "what-still-sleeps",
  "the-meadow-fork",
  "the-uncounted-flock",
  "the-stones-that-were-not-there",
  "the-barrow-mouth",
  "what-the-fog-took",
  "the-bronze-in-the-hill",
  "the-thing-that-walks",
  "the-empty-byre",
  "the-mere-that-keeps",
  "the-ninth-scratch",
  "the-cut-painter",
  "the-biscuit-crate",
  "the-kept-whistle",
  "the-black-mooring",
  "the-missing-pages",
  "a-little-room-to-grow",
  "porters-night-round",
  "fens-linen",
];

const quests = loadDir(join(content, "quests"));
const rooms = loadDir(join(content, "rooms")).sort((a, b) => a.id.localeCompare(b.id));
const byId = new Map(quests.map((quest) => [quest.id, quest]));
const ordered = [
  ...SPINE.filter((id) => byId.has(id)).map((id) => byId.get(id)),
  ...quests.filter((quest) => !SPINE.includes(quest.id)).sort((a, b) => a.id.localeCompare(b.id)),
];

const speakers = [];
for (const room of rooms) {
  for (const fixture of room.fixtures ?? []) {
    if (fixture.kind === "npc" && (fixture.dialogue || fixture.dialogueTree)) {
      speakers.push({ room, fixture });
    }
  }
}

const out = [];
const say = (line = "") => out.push(line);
const block = (text) => say(text ? text.trim() : "_none_");

say("# Quest text and dialogue");
say("");
say("Exported from the live JSON. This file is a reading copy; the game does not load it.");
say("Regenerate with `node tools/export-quest-text.mjs`.");
say("");
say("Quest speech is `packages/content/quests/<id>.json`: `introNarration` when the quest");
say("starts, `reminderNarration` if you talk to the giver again, `completionNarration` when");
say("it finishes, and each objective `label`.");
say("");
say("NPC lines are fixtures on `packages/content/rooms/<id>.json`. `dialogue` is the standing");
say("line; `dialogueTree` is a set of nodes the engine picks between. `talk <name>` prints the");
say("standing beat, then starts any quest whose `giverNpcId` is that character and whose");
say("`requiresQuestIds` are already complete.");
say("");
say(
  "The register is set by [`../narrative/GREENWOOD_NARRATIVE_STYLE_GUIDE.md`](../narrative/GREENWOOD_NARRATIVE_STYLE_GUIDE.md).",
);
say("");
say(`Quests: ${ordered.length}. Speaking characters: ${speakers.length}.`);
say("");
say("## Quests");
say("");

for (const quest of ordered) {
  say(`### ${quest.title}`);
  say("");
  say(`- id: \`${quest.id}\``);
  if (quest.giverNpcId) say(`- giver: \`${quest.giverNpcId}\``);
  if (quest.requiresQuestIds?.length) {
    say(`- requires: ${quest.requiresQuestIds.map((id) => `\`${id}\``).join(", ")}`);
  }
  const item = quest.itemRewardTemplateId ? `, \`${quest.itemRewardTemplateId}\`` : "";
  say(`- reward: ${quest.experienceReward} experience${item}`);
  say("");
  say("**Intro**");
  say("");
  block(quest.introNarration);
  say("");
  say("**Reminder**");
  say("");
  block(quest.reminderNarration);
  say("");
  say("**Complete**");
  say("");
  block(quest.completionNarration);
  say("");
  say("**Objectives**");
  say("");
  for (const objective of quest.objectives ?? []) {
    say(`- \`${objective.id}\` (${objective.kind}): ${objective.label}`);
  }
  say("");
}

say("## Dialogue");
say("");
for (const { room, fixture } of speakers) {
  say(`### ${fixture.name}`);
  say("");
  say(`- id: \`${fixture.id}\``);
  say(`- room: ${room.title} (\`${room.id}\`)`);
  say("");
  if (fixture.dialogue) {
    say("**Standing line**");
    say("");
    block(fixture.dialogue);
    say("");
  }
  const tree = fixture.dialogueTree;
  if (tree?.nodes) {
    say("**Tree**");
    say("");
    const names = Object.keys(tree.nodes);
    const first = tree.start;
    for (const name of [first, ...names.filter((n) => n !== first)]) {
      const node = tree.nodes[name];
      if (!node) continue;
      say(`- \`${name}\`${name === first ? " (start)" : ""}: ${node.text.trim()}`);
      for (const choice of node.choices ?? []) {
        say(`  - say \`${choice.say}\` ${choice.label} → \`${choice.next}\``);
      }
    }
    say("");
  }
}

writeFileSync(join(root, "docs", "content", "QUEST-AND-DIALOGUE.md"), out.join("\n"));
