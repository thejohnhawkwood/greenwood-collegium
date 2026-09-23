import type { EquipmentSlotView } from "@greenwood/contracts";

/** Shell harness sheet. Live play uses the slots on play-state. */
export const previewEquipmentSlots: EquipmentSlotView[] = [
  { id: "helmet", label: "Helmet" },
  { id: "necklace", label: "Necklace" },
  { id: "cloak", label: "Cloak" },
  { id: "armor", label: "Armor" },
  { id: "gloves", label: "Gloves" },
  { id: "boots", label: "Boots" },
  { id: "ring-1", label: "Ring" },
  { id: "ring-2", label: "Ring" },
  {
    id: "main-hand",
    label: "Main hand",
    itemId: "item-sword",
    itemName: "Practice Sword",
  },
  { id: "off-hand", label: "Off hand" },
  { id: "ranged", label: "Ranged" },
];
