import {
  APPEARANCE_LIVE_FIELDS,
  APPEARANCE_LOOK_BLURBS,
  APPEARANCE_LOOK_LABELS,
  APPEARANCE_LOOKS,
  appearanceFieldOptions,
  appearanceLook,
  appearanceSchema,
  snapAppearanceValue,
  type Appearance,
  type AppearanceEditorField,
  type VisualGender,
} from "@greenwood/contracts";
import { CharacterPortrait } from "./CharacterPortrait.js";

export function AppearanceEditor({
  value,
  onChange,
  preview,
}: {
  value: Appearance;
  onChange: (value: Appearance) => void;
  preview?: { speciesId: string; gender?: VisualGender };
}) {
  const selectedLook = appearanceLook(value);
  return (
    <fieldset className="appearance-choices appearance-workshop">
      <legend>Your appearance</legend>
      <p className="workshop-hint">
        Choose a complete painted look. Size and colouring wash that plate. Clothes are not stamped
        on.
      </p>
      <fieldset className="look-catalog">
        <legend>Look</legend>
        <ul className="look-grid">
          {APPEARANCE_LOOKS.map((look) => {
            const parsed = appearanceSchema.safeParse({ ...value, clothing: look });
            return (
              <li key={look}>
                <button
                  type="button"
                  className={look === selectedLook ? "look-card look-card-current" : "look-card"}
                  aria-pressed={look === selectedLook}
                  onClick={() => {
                    if (parsed.success) onChange(parsed.data);
                  }}
                >
                  {preview ? (
                    <CharacterPortrait
                      visual={{
                        speciesId: preview.speciesId,
                        gender: preview.gender,
                        appearance: parsed.success ? parsed.data : value,
                      }}
                      name={`${preview.speciesId} ${look}`}
                      decorative
                    />
                  ) : null}
                  <strong>{APPEARANCE_LOOK_LABELS[look]}</strong>
                  <span>{APPEARANCE_LOOK_BLURBS[look]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>
      {APPEARANCE_LIVE_FIELDS.map(([key, label]) => {
        const options = appearanceFieldOptions(key);
        const index = options.findIndex((choice) => choice === value[key]);
        return (
          <label key={key} className="workshop-slider">
            <span>
              {label}
              <strong>{titleCase(String(value[key]))}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={options.length - 1}
              step={1}
              value={index < 0 ? 0 : index}
              aria-valuetext={String(value[key])}
              onChange={(event) => {
                const next = snapAppearanceValue(key, Number(event.target.value));
                const parsed = appearanceSchema.safeParse({ ...value, [key]: next });
                if (parsed.success) onChange(parsed.data);
              }}
            />
          </label>
        );
      })}
    </fieldset>
  );
}

export function workshopSnap(
  current: Appearance,
  key: AppearanceEditorField,
  index: number,
): Appearance {
  return { ...current, [key]: snapAppearanceValue(key, index), version: 2 };
}

function titleCase(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
