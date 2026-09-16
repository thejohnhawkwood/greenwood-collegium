export const OBJECT_PLATE_FILES = [
  "object-noticeboard",
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
] as const;

const OBJECT_PLATE_ALIASES: Record<string, string> = Object.fromEntries(
  OBJECT_PLATE_FILES.map((id) => [id, id]),
);

const PLACEMENT_ALIASES: Record<string, string> = {
  "object-school-chart": "object-school-banners",
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
