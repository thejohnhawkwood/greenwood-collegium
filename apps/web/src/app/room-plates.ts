/** Presentation labels for painted room plates. Play still uses server room text. */
export const COLLEGIUM_ROOM_PLATES = [
  {
    id: "lantern-court",
    title: "Lantern Court",
    blurb: "Blue lanterns drift beneath the welcoming arms of an ancient oak.",
  },
  {
    id: "great-hall",
    title: "Great Hall",
    blurb: "Six bright banners hang above tables built around living oaks.",
  },
  {
    id: "west-cloister",
    title: "West Cloister",
    blurb: "Rain-dark arches frame a walk of moss and old promises.",
  },
  {
    id: "east-gate",
    title: "East Gate",
    blurb: "A broad oak gate opens toward a clover-bright meadow.",
  },
  {
    id: "south-orchard",
    title: "South Orchard",
    blurb: "Low apple boughs shelter a well-used practice clearing.",
  },
  {
    id: "north-quad",
    title: "North Quad",
    blurb: "Four paths meet around a sundial that refuses to hurry.",
  },
  {
    id: "observatory",
    title: "Observatory",
    blurb: "Brass instruments wait beneath a roof the colour of old pennies.",
  },
  {
    id: "music-loft",
    title: "Music Loft",
    blurb: "Strings and sunbeams share a little room above the quad.",
  },
  {
    id: "clock-tower",
    title: "Clock Tower",
    blurb: "Patient gears count the hours beneath an empty bell frame.",
  },
  {
    id: "library-stacks",
    title: "Library Stacks",
    blurb: "Tall shelves shelter the papery hush of a thousand journeys.",
  },
  {
    id: "scriptorium",
    title: "Scriptorium",
    blurb: "Ink, lamplight, and careful mistakes inhabit the copying desks.",
  },
  {
    id: "archive-cellar",
    title: "Archive Cellar",
    blurb: "Cool roots cradle the school's paper memory.",
  },
  {
    id: "lecture-theatre",
    title: "Lecture Theatre",
    blurb: "Chalk constellations climb above tiers of polished benches.",
  },
  {
    id: "refectory",
    title: "Refectory",
    blurb: "Fresh bread perfumes a bright room built for making room.",
  },
  {
    id: "kitchens",
    title: "Kitchens",
    blurb: "Copper pans catch the glow of an industrious oven.",
  },
  {
    id: "porter-lodge",
    title: "Porter Lodge",
    blurb: "A ticking kettle keeps company with a regiment of labelled keys.",
  },
  {
    id: "infirmary",
    title: "Infirmary",
    blurb: "Honey-coloured light warms clean beds and folded blankets.",
  },
  {
    id: "dormitory-oak",
    title: "Oak Dormitory",
    blurb: "Patchwork quilts and oak beams promise a sturdy night's sleep.",
  },
  {
    id: "dormitory-willow",
    title: "Willow Dormitory",
    blurb: "Willow shadows lace a quiet room of green quilts.",
  },
  {
    id: "east-meadow",
    title: "East Meadow",
    blurb: "Bees stitch the clover beneath a wide, unhurried sky.",
  },
  {
    id: "herb-garden",
    title: "Herb Garden",
    blurb: "Fragrant paths wind between neatly labelled beds.",
  },
  {
    id: "greenhouse",
    title: "Greenhouse",
    blurb: "Warm glass shelters bright seedlings and one unhappy bed.",
  },
  {
    id: "quiet-chapel",
    title: "Quiet Chapel",
    blurb: "Rosemary and coloured light fill a small place for stillness.",
  },
  {
    id: "pottery-shed",
    title: "Pottery Shed",
    blurb: "Clay freckles the wheels, the benches, and almost everything else.",
  },
  {
    id: "river-landing",
    title: "River Landing",
    blurb: "Willow roots hold a little landing above the slow brown river.",
  },
] as const;

export type CollegiumRoomPlate = (typeof COLLEGIUM_ROOM_PLATES)[number];
