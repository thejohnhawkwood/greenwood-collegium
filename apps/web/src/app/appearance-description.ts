import {
  APPEARANCE_LOOK_LABELS,
  appearanceLook,
  resolveAppearance,
  resolveVisualGender,
  type CharacterVisual,
} from "@greenwood/contracts";

export function appearanceDescription(visual: CharacterVisual): string {
  const a = resolveAppearance(visual.appearance);
  const gender = resolveVisualGender(visual.gender);
  const look = APPEARANCE_LOOK_LABELS[appearanceLook(a)];
  return `${visual.speciesId}, ${gender}, ${look} look, ${a.build} build, ${a.palette} colouring`;
}
