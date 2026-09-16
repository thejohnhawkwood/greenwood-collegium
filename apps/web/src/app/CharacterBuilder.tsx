import {
  APPEARANCE_LOOK_LABELS,
  DEFAULT_APPEARANCE,
  appearanceLook,
  resolveVisualGender,
  type Appearance,
  type VisualGender,
} from "@greenwood/contracts";
import { useMemo, useState } from "react";
import { AppearanceEditor } from "./AppearanceEditor.js";
import { appearanceDescription } from "./appearance-description.js";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { KNOWN_SPECIES } from "./portrait-layers.js";

const GENDERS: Array<{ id: VisualGender; label: string }> = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
];

/** Local compositor harness. It does not talk to the server or invent game outcomes. */
export function CharacterBuilder() {
  const [speciesId, setSpeciesId] = useState<(typeof KNOWN_SPECIES)[number]>("fox");
  const [gender, setGender] = useState<VisualGender>("female");
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);
  const visual = { speciesId, gender, appearance };
  const catalog = useMemo(
    () =>
      KNOWN_SPECIES.flatMap((id) =>
        GENDERS.map((choice) => ({
          speciesId: id,
          gender: choice.id,
          appearance: DEFAULT_APPEARANCE,
        })),
      ),
    [],
  );

  return (
    <main className="builder-page" aria-labelledby="builder-heading">
      <h1 id="builder-heading">Character builder test</h1>
      <p>
        Pick a species, a body, and a complete look. Courtyard, Scriptorium, and Road are finished
        paintings. Size and colouring wash that plate.
      </p>
      <div className="creation-layout builder-layout">
        <figure className="creation-preview">
          <span className="eyebrow">Live preview</span>
          <CharacterPortrait visual={visual} name={`${speciesId} ${gender}`} />
          <figcaption>
            <strong>
              {speciesId} · {gender} · {APPEARANCE_LOOK_LABELS[appearanceLook(appearance)]}
            </strong>
            <p>{appearanceDescription(visual)}</p>
          </figcaption>
        </figure>
        <form className="auth-form builder-form" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="creation-fields">
            <label>
              Species
              <select
                value={speciesId}
                onChange={(event) =>
                  setSpeciesId(event.target.value as (typeof KNOWN_SPECIES)[number])
                }
              >
                {KNOWN_SPECIES.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend>Body</legend>
              {GENDERS.map((choice) => (
                <label key={choice.id} className="choice-row">
                  <input
                    type="radio"
                    name="gender"
                    value={choice.id}
                    checked={gender === choice.id}
                    onChange={() => setGender(choice.id)}
                  />
                  {choice.label}
                </label>
              ))}
            </fieldset>
            <AppearanceEditor
              value={appearance}
              onChange={setAppearance}
              preview={{ speciesId, gender }}
            />
          </fieldset>
        </form>
      </div>
      <section className="builder-catalog" aria-labelledby="builder-catalog-heading">
        <h2 id="builder-catalog-heading">All species, both bodies</h2>
        <ul className="builder-grid">
          {catalog.map((entry) => (
            <li key={`${entry.speciesId}-${entry.gender}`}>
              <button
                type="button"
                className={
                  entry.speciesId === speciesId && entry.gender === gender
                    ? "builder-card builder-card-current"
                    : "builder-card"
                }
                onClick={() => {
                  setSpeciesId(entry.speciesId);
                  setGender(resolveVisualGender(entry.gender));
                }}
              >
                <CharacterPortrait
                  visual={entry}
                  name={`${entry.speciesId} ${entry.gender}`}
                  decorative
                />
                <span>
                  {entry.speciesId} {entry.gender}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
