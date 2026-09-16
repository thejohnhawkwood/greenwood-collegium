import {
  authCharacterOptionsSchema,
  authSessionPublicSchema,
  authSuggestedNameSchema,
  DEFAULT_APPEARANCE,
  resolveAppearance,
  resolveVisualGender,
  type CharacterVisual,
  type VisualGender,
  type AuthCharacterOptions,
} from "@greenwood/contracts";
import { useEffect, useState, type FormEvent } from "react";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { appearanceDescription } from "./appearance-description.js";
import { AppearanceEditor } from "./AppearanceEditor.js";

export type CharacterGateProps = {
  initialVisual?: CharacterVisual;
  needsApproval?: boolean;
  reviewReason?: string;
  username: string;
  onReady: () => void;
  onSignedOut: () => void;
};

export function CharacterGate({
  username,
  onReady,
  onSignedOut,
  needsApproval,
  reviewReason,
  initialVisual,
}: CharacterGateProps) {
  const [options, setOptions] = useState<AuthCharacterOptions | undefined>();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [speciesId, setSpeciesId] = useState(initialVisual?.speciesId ?? "");
  const [gender, setGender] = useState<VisualGender>(resolveVisualGender(initialVisual?.gender));
  const [appearance, setAppearance] = useState(
    resolveAppearance(initialVisual?.appearance ?? DEFAULT_APPEARANCE),
  );
  const [step, setStep] = useState<"identity" | "workshop">("identity");
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const visual = { speciesId, gender, appearance };

  useEffect(() => {
    let cancelled = false;
    void fetch("/auth/character-options", { credentials: "same-origin" })
      .then(async (response) => {
        const parsed = authCharacterOptionsSchema.safeParse(await response.json());
        if (!response.ok || !parsed.success) throw new Error("Choices unavailable");
        if (!cancelled) {
          setOptions(parsed.data);
          setSpeciesId((current) => current || parsed.data.species[0]?.id || "");
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("The Collegium could not load character choices.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function suggestName() {
    setError("");
    try {
      const response = await fetch("/auth/suggested-name", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speciesId, gender }),
      });
      const parsed = authSuggestedNameSchema.safeParse(
        await response.json().catch(() => undefined),
      );
      if (!response.ok || !parsed.success) {
        setError("Could not suggest a name. Type one of your own.");
        return;
      }
      setName(parsed.data.name);
    } catch {
      setError("Could not suggest a name. Type one of your own.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch("/auth/character", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: needsApproval ? String(data.get("username") ?? username) : undefined,
          name: String(data.get("name") ?? ""),
          speciesId: String(data.get("speciesId") ?? ""),
          gender: String(data.get("gender") ?? ""),
          appearance,
        }),
      });
      const payload: unknown = await response.json().catch(() => undefined);
      if (!response.ok) {
        setError(errorMessage(payload, "That Collegian could not be created."));
        return;
      }
      const parsed = authSessionPublicSchema.safeParse(payload);
      if (!parsed.success || !parsed.data.characterComplete) {
        setError("That Collegian could not be created.");
        return;
      }
      onReady();
    } catch {
      setError("Your Collegian could not be saved. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="auth-gate" aria-labelledby="character-heading">
      <h2 id="character-heading">Who arrives at the Collegium?</h2>
      <p className="creation-intro">{options?.intro ?? "Loading the woodland road."}</p>
      <p>
        Your classroom login is <strong>{username}</strong>. That is not your character name.
      </p>
      {needsApproval ? (
        <p>
          Your teacher will approve both names before you enter. Player speech is recorded for
          teacher review for six months.
        </p>
      ) : null}
      {reviewReason ? <p role="alert">Please try again: {reviewReason}</p> : null}
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {options ? (
        <div className="creation-layout">
          <figure className="creation-preview">
            <span className="eyebrow">Your Collegian</span>
            <CharacterPortrait visual={visual} name={name || "Your Collegian"} />
            <figcaption>
              <strong>{name || "A new beginning"}</strong>
              <p>{appearanceDescription(visual)}</p>
              <small>This appearance stays with you in the realm.</small>
            </figcaption>
          </figure>
          <form className="auth-form" onSubmit={(event) => void submit(event)}>
            <fieldset disabled={saving} className="creation-fields">
              {step === "identity" ? (
                <>
                  {needsApproval ? (
                    <label>
                      Classroom login
                      <input
                        name="username"
                        defaultValue={username}
                        minLength={3}
                        maxLength={32}
                        pattern="[A-Za-z0-9][A-Za-z0-9_-]*"
                        required
                        autoComplete="username"
                      />
                    </label>
                  ) : null}
                  <label>
                    Species
                    <select
                      name="speciesId"
                      required
                      value={speciesId}
                      onChange={(event) => setSpeciesId(event.target.value)}
                    >
                      {options.species.map((species) => (
                        <option key={species.id} value={species.id}>
                          {species.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <fieldset>
                    <legend>Gender</legend>
                    {options.genders.map((choice) => (
                      <label key={choice.id} className="choice-row">
                        <input
                          type="radio"
                          name="gender"
                          value={choice.id}
                          required
                          checked={gender === choice.id}
                          onChange={() => setGender(resolveVisualGender(choice.id))}
                        />
                        {choice.label}
                      </label>
                    ))}
                  </fieldset>
                  <label>
                    Given name
                    <input
                      name="name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                      }}
                      autoComplete="off"
                      required
                      minLength={2}
                      maxLength={24}
                    />
                  </label>
                  <p>
                    <button type="button" onClick={() => void suggestName()}>
                      Suggest a name
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (name.trim().length < 2 || !speciesId) {
                        setError("Choose a species and given name first.");
                        return;
                      }
                      setError("");
                      setStep("workshop");
                    }}
                  >
                    Next: paint your Collegian
                  </button>
                </>
              ) : (
                <>
                  <input type="hidden" name="speciesId" value={speciesId} />
                  <input type="hidden" name="gender" value={gender} />
                  <input type="hidden" name="name" value={name} />
                  {needsApproval ? <input type="hidden" name="username" value={username} /> : null}
                  <AppearanceEditor
                    value={appearance}
                    onChange={setAppearance}
                    preview={{ speciesId, gender }}
                  />
                  <p className="workshop-summary">{appearanceDescription(visual)}</p>
                  <p>
                    <button type="button" onClick={() => setStep("identity")}>
                      Back to name and species
                    </button>
                  </p>
                  <button type="submit">
                    {saving
                      ? "Saving your Collegian…"
                      : needsApproval
                        ? "Submit names for approval"
                        : "Enter the Collegium"}
                  </button>
                </>
              )}
            </fieldset>
          </form>
        </div>
      ) : error ? (
        <button type="button" onClick={() => setReload((value) => value + 1)}>
          Retry character choices
        </button>
      ) : null}
      <p>
        <button
          type="button"
          onClick={() => {
            void fetch("/auth/sign-out", { method: "POST", credentials: "same-origin" }).then(
              onSignedOut,
            );
          }}
        >
          Sign out
        </button>
      </p>
    </section>
  );
}

function errorMessage(payload: unknown, fallback: string): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }
  return fallback;
}
