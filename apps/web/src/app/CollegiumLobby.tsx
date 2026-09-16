import type { PlayState } from "@greenwood/contracts";
import { CharacterPortrait } from "./CharacterPortrait.js";

export function CollegiumLobby({
  open,
  state,
  onEnter,
  onTravel,
}: {
  open: boolean;
  state?: PlayState;
  onEnter: () => void;
  onTravel: (title: string) => void;
}) {
  if (!open || !state) return null;
  const destinations = state.minimap.rooms.filter(
    (room) => room.state === "explored" && room.title,
  );
  return (
    <div className="lobby-overlay" onClick={onEnter}>
      <div
        className="lobby-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lobby-heading"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <h2 id="lobby-heading">Collegium lobby</h2>
          <button type="button" onClick={onEnter}>
            Enter play
          </button>
        </div>
        <div className="lobby-self">
          <div className="portrait-mat">
            <CharacterPortrait visual={state.character.visual} name={state.character.name} />
          </div>
          <div>
            <h3>{state.character.name}</h3>
            <p className="small-copy">
              You last stood in {state.room.title}. Speech still reaches whoever shares that room.
            </p>
            <button type="button" onClick={onEnter}>
              Enter the Collegium
            </button>
          </div>
        </div>
        <section aria-labelledby="lobby-travel-heading">
          <h3 id="lobby-travel-heading">Travel along known paths</h3>
          <p className="small-copy">
            Only rooms you have already visited appear. Typed <code>travel</code> does the same.
          </p>
          {destinations.length ? (
            <ul className="lobby-destinations">
              {destinations.map((room) => (
                <li key={room.id}>
                  <button type="button" onClick={() => onTravel(room.title!)}>
                    {room.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="small-copy">
              Explore a neighbouring room first, then return here to travel.
            </p>
          )}
        </section>
        <section aria-labelledby="lobby-peers-heading">
          <h3 id="lobby-peers-heading">Collegians present</h3>
          {state.peers.length ? (
            <ul className="lobby-peers">
              {state.peers.map((peer) => (
                <li key={peer.id}>
                  <CharacterPortrait
                    visual={peer.visual}
                    name={peer.name}
                    decorative
                    crop="avatar"
                  />
                  <span>
                    {peer.name}
                    <small>{peer.roomTitle ?? "somewhere in the Collegium"}</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="small-copy">No other Collegians are signed in right now.</p>
          )}
        </section>
      </div>
    </div>
  );
}
