export const OBJECT_PLATE_FILES = [
  "object-noticeboard",
  "object-courtyard-well",
  "object-school-banners",
  "object-borrowing-register",
  "object-breathing-wheel",
  "object-slate-labels",
  "object-practice-rules",
  "object-key-board",
  "object-ink-blotter",
  "object-flood-marker",
  "object-place-card",
  "object-listening-stone",
  "object-watering-jug",
  "object-star-wheel",
  "object-snail-sundial",
  "object-folded-page",
  "object-blackboard",
  "object-recipe-slate",
  "object-seedling-tray",
  "object-bee-skep",
  "object-dream-mobile",
  "object-sock-puppet",
  "object-empty-bell-frame",
  "object-bell-ledger",
  "object-promise-mosaic",
  "object-wayboard",
  "small-copper-key",
  "practice-sword",
  "practice-staff",
  "practice-sling",
  "moss-bound-primer",
  "object-silk-thread",
  "object-stair-rope",
  "object-caught-lantern",
  "object-waking-husk",
  "object-still-score",
  "straw-practice-scrap",
  "torn-silk-strand",
  "queen-silk-cord",
] as const;

const OBJECT_PLATE_ALIASES: Record<string, string> = Object.fromEntries(
  OBJECT_PLATE_FILES.map((id) => [id, id]),
);

const PLACEMENT_ALIASES: Record<string, string> = {
  "object-school-chart": "object-school-banners",
  "object-hall-banners": "object-school-banners",
  "object-ember-grate": "object-practice-rules",
  "object-thorn-trellis": "object-seedling-tray",
  "object-veil-mirror": "object-listening-stone",
  "object-stars-wheel": "object-star-wheel",
  "object-stone-keystone": "object-promise-mosaic",
  "object-steel-anvil": "object-practice-rules",
  "object-orchard-apples": "object-seedling-tray",
  "item-straw-practice-scrap": "straw-practice-scrap",
  "item-torn-silk-strand": "torn-silk-strand",
  "item-queen-silk-cord": "queen-silk-cord",
  "item-enemy-practice-dummy-south-orchard-loot-straw-practice-scrap": "straw-practice-scrap",
  "item-enemy-silk-hatchling-cocoon-nave-loot-torn-silk-strand": "torn-silk-strand",
  "item-enemy-silk-queen-deep-cradle-loot-queen-silk-cord": "queen-silk-cord",
  "item-copper-key-lantern-court": "small-copper-key",
  "item-practice-sword-south-orchard": "practice-sword",
  "item-practice-staff-south-orchard": "practice-staff",
  "item-practice-sling-south-orchard": "practice-sling",
  "item-primer-library-stacks": "moss-bound-primer",
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function objectArtSrc(id: string, name?: string): string | undefined {
  const exact = OBJECT_PLATE_ALIASES[id] ?? PLACEMENT_ALIASES[id];
  if (exact) return `/art/objects/${exact}.png`;
  const named = name ? slug(name) : "";
  for (const plate of OBJECT_PLATE_FILES) {
    if (id.includes(plate) || (named && (plate === named || plate === `object-${named}`))) {
      return `/art/objects/${plate}.png`;
    }
  }
  return undefined;
}
