import { RoomScene } from "./RoomScene.js";
import { COLLEGIUM_ROOM_PLATES } from "./room-plates.js";

/** Local plate gallery. It does not talk to the server or invent room outcomes. */
export function RoomCatalog() {
  return (
    <main className="builder-page room-catalog-page" aria-labelledby="room-catalog-heading">
      <h1 id="room-catalog-heading">Room catalog</h1>
      <p>
        Sixty finished paintings. In play, the title, inhabitants, and exits stay server text. Open{" "}
        <code>/?rooms=1</code> to compare the plates.
      </p>
      <ul className="room-catalog-grid">
        {COLLEGIUM_ROOM_PLATES.map((room) => (
          <li key={room.id}>
            <figure className="room-catalog-card">
              <div className="room-catalog-plate">
                <RoomScene visualState={room.id} label={room.title} />
              </div>
              <figcaption>
                <strong>{room.title}</strong>
                <span>{room.blurb}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </main>
  );
}
