import type { DialogueChoice, DialogueNode, DialogueTree, RoomFixture } from "./state.js";

export function formatDialogueNode(npcName: string, node: DialogueNode): string {
  const lines = [npcName, "", node.text];
  const choices = node.choices ?? [];
  if (choices.length > 0) {
    lines.push("");
    for (const choice of choices) {
      lines.push(`Type say ${choice.say} — ${choice.label}`);
    }
  }
  return lines.join("\n");
}

export function conversationChoice(node: DialogueNode, spoken: string): DialogueChoice | undefined {
  const needle = spoken.trim().toLowerCase();
  if (needle.length === 0) {
    return undefined;
  }
  return (node.choices ?? []).find((choice) => choice.say.toLowerCase() === needle);
}

export function treeNode(tree: DialogueTree, nodeId: string): DialogueNode | undefined {
  return tree.nodes[nodeId];
}

export function startNode(tree: DialogueTree): { id: string; node: DialogueNode } | undefined {
  const node = tree.nodes[tree.start];
  return node ? { id: tree.start, node } : undefined;
}

export function fixtureTree(fixture: RoomFixture): DialogueTree | undefined {
  return fixture.dialogueTree;
}

export function misfitNodeId(tree: DialogueTree): string | undefined {
  if (tree.nodes.misfit) {
    return "misfit";
  }
  return tree.start;
}
