import { resolveAppearance, resolveVisualGender, type CharacterVisual } from "@greenwood/contracts";
import { appearanceDescription } from "./appearance-description.js";
import { isKnownSpecies, portraitLayers } from "./portrait-layers.js";

/** Complete painted plate plus live build scale and palette hue. */
export function CharacterPortrait({
  visual,
  name,
  decorative = false,
  crop = "full",
}: {
  visual?: CharacterVisual;
  name: string;
  decorative?: boolean;
  crop?: "full" | "avatar";
}) {
  const appearance = resolveAppearance(visual?.appearance);
  const gender = resolveVisualGender(visual?.gender);
  const kind = visual?.speciesId ?? "unknown";
  const known = isKnownSpecies(kind);
  const layers = portraitLayers(visual);
  const label = visual ? appearanceDescription(visual) : "portrait unavailable";
  return (
    <div
      className={`character-portrait portrait-${crop}`}
      data-species={kind}
      data-gender={gender}
      data-build={appearance.build}
      data-palette={appearance.palette}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${name}: ${label}`}
    >
      {known ? (
        <div
          className={`portrait-stack portrait-build-${appearance.build} portrait-palette-${appearance.palette}`}
        >
          {layers.map((layer) =>
            layer.src ? (
              <img
                key={layer.layer}
                className={`portrait-layer portrait-layer-${layer.layer}`}
                data-layer={layer.layer}
                src={layer.src}
                alt=""
                draggable={false}
              />
            ) : (
              <span key={layer.layer} className="portrait-slot" data-layer={layer.layer} />
            ),
          )}
        </div>
      ) : (
        <p className="portrait-fallback">{visual ? `${name}: ${kind}` : "portrait unavailable"}</p>
      )}
    </div>
  );
}
