import {
  authCharacterOptionsSchema,
  authSessionPublicSchema,
  authSuggestedNameSchema,
  type AuthCharacterOptions,
} from "@greenwood/contracts";
import { useEffect, useState, type FormEvent } from "react";

export type CharacterGateProps = {
  username: string;
  onReady: () => void;
  onSignedOut: () => void;
};

export function CharacterGate({ username, onReady, onSignedOut }: CharacterGateProps) {
  const [options, setOptions] = useState<AuthCharacterOptions | undefined>();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/auth/character-options", { credentials: "same-origin" })
      .then(async (response) => {
        const parsed = authCharacterOptionsSchema.safeParse(await response.json());
        if (!cancelled && parsed.success) {
          setOptions(parsed.data);
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
  }, []);

  async function suggestName() {
    setError("");
    const response = await fetch("/auth/suggested-name", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const parsed = authSuggestedNameSchema.safeParse(await response.json().catch(() => undefined));
    if (!response.ok || !parsed.success) {
      setError("Could not suggest a name. Type one of your own.");
      return;
    }
    setName(parsed.data.name);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/auth/character", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") ?? ""),
        speciesId: String(data.get("speciesId") ?? ""),
        gender: String(data.get("gender") ?? ""),
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
  }

  return (
    <section className="auth-gate" aria-labelledby="character-heading">
      <h2 id="character-heading">Who arrives at the Collegium?</h2>
      <p className="creation-intro">{options?.intro ?? "Loading the woodland road."}</p>
      <p>
        Your classroom login is <strong>{username}</strong>. That is not your character name.
      </p>
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {options ? (
        <form className="auth-form" onSubmit={(event) => void submit(event)}>
          <label>
            Species
            <select name="speciesId" required defaultValue={options.species[0]?.id ?? ""}>
              {options.species.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Gender</legend>
            {options.genders.map((gender, index) => (
              <label key={gender.id} className="choice-row">
                <input
                  type="radio"
                  name="gender"
                  value={gender.id}
                  required
                  defaultChecked={index === 0}
                />
                {gender.label}
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
          <button type="submit">Enter the Collegium</button>
        </form>
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
