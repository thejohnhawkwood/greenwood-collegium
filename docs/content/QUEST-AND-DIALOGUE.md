# Quest text and dialogue

Exported from the live JSON. This file is a reading copy; the game does not load it.
Regenerate with `node tools/export-quest-text.mjs`.

Quest speech is `packages/content/quests/<id>.json`: `introNarration` when the quest
starts, `reminderNarration` if you talk to the giver again, `completionNarration` when
it finishes, and each objective `label`.

NPC lines are fixtures on `packages/content/rooms/<id>.json`. `dialogue` is the standing
line; `dialogueTree` is a set of nodes the engine picks between. `talk <name>` prints the
standing beat, then starts any quest whose `giverNpcId` is that character and whose
`requiresQuestIds` are already complete.

The register is set by [`../narrative/GREENWOOD_NARRATIVE_STYLE_GUIDE.md`](../narrative/GREENWOOD_NARRATIVE_STYLE_GUIDE.md).

Quests: 44. Speaking characters: 21.

## Quests

### Arrival at the Collegium

- id: `arrival-at-the-collegium`
- giver: `npc-porter-bramble`
- reward: 10 experience, `porters-cord`

**Intro**

The Greenwood Collegium is the bright place in an old wood. Blue lanterns hang in the oak. The well at the roots is cold. Inside these walls you are safe enough to learn. Outside them, the wood keeps what it takes.

You are here to train as a defender. Ember, Thorns, Veil, Stars, Stone, and Steel are six Schools, and you will pick a path when Headmaster Alder is ready. The work is the same on every path: learn the leaf, stand the dummy, and bring classmates when a thing will not square up for one.

The faculty have been outside. Porter Bramble still wears the weather in his coat. Instructor Flint's ear is notched from a lesson that was not a game. Healer Fen has sat with students who came back quiet. Alder does not trade in rumours, and he has faced what the tower counts in the dark.

Under the Clock Tower the old abbey is still there. Something in it has not finished counting. East of the meadow the moor has its own hunger. South, past the orchard, the river has people who take boats and biscuits that are not theirs.

Porter Bramble is in this court. Type look. Say hello so he knows you arrived. Type help if you want the words. Then take the key and go north.

**Reminder**

Porter Bramble stays at your side until Arrival is finished. The lanterns still drift. The well is still cold. Type look, say hello, take key, then north to the Great Hall.

**Complete**

_none_

**Objectives**

- `look` (look): Look around Lantern Court. Type look to see Lantern Court.
- `speak` (say): Say hello so Porter knows you arrived.
- `take` (take): Take the Small Copper Key from Porter. Type take key.
- `arrive` (visit): Type north to reach the Great Hall.

### First Lessons: Ember

- id: `first-lessons-ember`
- reward: 15 experience, `hearth-biscuit`

**Intro**

The copper grate ticks as it cools. Two oatcakes sat too near the coals earlier and the burnt-sugar smell is still in the room. Cinder does not take her eyes off the straw dummy in the corner. "Walk the hearth first. I want you knowing where the fire is before you feed it. Then take that dummy down — mine, the one in here, not the one Flint keeps out in his orchard. When it is done, come and talk to me. I will open the Ember leaf in your Field Primer and ink the stem."

**Reminder**

Look around this hearth, put the hearth dummy down, then talk to Cinder. The grate is still warm and she has not moved from it.

**Complete**

Cinder takes the Primer, sets it on her knee, and inks the stem of the Ember leaf in three short strokes. She blows on the page before she shuts it. "Rank one. That is a real mark, not a sticker." She hands it back warm. "Next time you will not be swinging at it. You will be casting."

**Objectives**

- `look-hearth` (look): Look around the hearth.
- `defeat-dummy` (defeat): Defeat the hearth dummy.
- `report` (talk): Return and talk to Mentor Cinder.

### First Lessons: Thorns

- id: `first-lessons-thorn`
- reward: 15 experience, `hearth-biscuit`

**Intro**

Briar is halfway through pruning the trellis and does not stop. Cut stems go in a pile at her feet, and the room smells of sap and wet soil. "Walk the hearth first. Look at what I have taken off that trellis and what I have left on it — that is most of the School, if you want it early." She nods at the straw dummy. "Then put that one down. Mine, the one in here, not the one Flint keeps out in his orchard. Come back and talk to me after. I will open the Thorns leaf in your Field Primer and ink the stem."

**Reminder**

Look around this hearth, put the hearth dummy down, then talk to Briar. She is still on the trellis and the shears are still out.

**Complete**

Briar wipes the sap off her paws before she will touch the book. She inks the stem of the Thorns leaf, holds the page open until it dries, then closes it. "Rank one. A cut in the right place is worth more than a strong swing." She goes back to the trellis. "Next time you will not be swinging. You will be casting."

**Objectives**

- `look-hearth` (look): Look around the hearth.
- `defeat-dummy` (defeat): Defeat the hearth dummy.
- `report` (talk): Return and talk to Mentor Briar.

### First Lessons: the Veil

- id: `first-lessons-veil`
- reward: 15 experience, `hearth-biscuit`

**Intro**

There are dried lavender stalks in a jar on the sill and pale curtains across the window, hung double so the light comes through in strips. Mist waits until you have stopped moving before she speaks. "Walk the hearth. Look at all of it, including the mirror, and then stop looking at the mirror." She glances at the straw dummy. "Put that one down. Mine, in here, not the one Flint keeps out in his orchard. Then come and talk to me. I will open the Veil leaf in your Field Primer and ink the stem." She does not say anything else, and does not fill the gap.

**Reminder**

Look around this hearth, put the hearth dummy down, then talk to Mist. She is waiting, and she will not fill the silence for you.

**Complete**

Mist inks the stem of the Veil leaf without comment, then turns the book so you can see the mark. "Rank one." She lets that sit. "Quiet work still counts as work. Next time you will be casting, not swinging."

**Objectives**

- `look-hearth` (look): Look around the hearth.
- `defeat-dummy` (defeat): Defeat the hearth dummy.
- `report` (talk): Return and talk to Mentor Mist.

### First Lessons: Stars

- id: `first-lessons-stars`
- reward: 15 experience, `hearth-biscuit`

**Intro**

Lumen is writing a column of figures and finishes it before she looks up. Brass instruments are laid out on felt beside the star-wheel, each one in its own spot. The room smells of lamp-oil and ink. "Walk the hearth and look at the instruments, but do not pick them up. Charts first. Wonder keeps." She indicates the straw dummy with the end of her pen. "Then put that one down. Mine, in here, not the one Flint keeps out in his orchard. Come back and talk to me. I will open the Stars leaf in your Field Primer and ink the stem."

**Reminder**

Look around this hearth, put the hearth dummy down, then talk to Lumen. The star-wheel has not moved and neither has she.

**Complete**

Lumen rules a faint line first, then inks the stem of the Stars leaf along it. "Rank one." She checks the mark against the line and is satisfied. "Next time you will be casting rather than swinging. Take the reading before you take the shot."

**Objectives**

- `look-hearth` (look): Look around the hearth.
- `defeat-dummy` (defeat): Defeat the hearth dummy.
- `report` (talk): Return and talk to Mentor Lumen.

### First Lessons: Stone

- id: `first-lessons-stone`
- reward: 15 experience, `hearth-biscuit`

**Intro**

Quern has a block of granite up on the bench and is marking it with chalk, a line at a time. Stone-dust greys both paws to the wrist. The room smells of wet rock and chalk. "Walk the hearth. Put your paw flat on the keystone while you are at it, so you know what holds this roof up." He takes his time getting to the rest. "Then the straw one. Mine, in here, not the one Flint keeps out in his orchard. Come back and talk to me. I will open the Stone leaf in your Field Primer and ink the stem."

**Reminder**

Look around this hearth, put the hearth dummy down, then talk to Quern. He has not hurried a sentence yet and he has not dropped one either.

**Complete**

Quern sets the chalk down, dusts one paw on his apron, and inks the stem of the Stone leaf. Grey dust still greys the margin. "Rank one." He looks at it a moment. "Weight first, speech second. Next time you will be casting instead of swinging."

**Objectives**

- `look-hearth` (look): Look around the hearth.
- `defeat-dummy` (defeat): Defeat the hearth dummy.
- `report` (talk): Return and talk to Mentor Quern.

### First Lessons: Steel

- id: `first-lessons-steel`
- reward: 15 experience, `hearth-biscuit`

**Intro**

Four mail shirts hang in a row, each one oiled and none of them polished for show. Edge is rubbing linseed into a strap and does not put it down. "Walk the hearth. Name your stance out loud before you swing at anything, and keep naming it until you stop having to." He tips his head at the straw dummy. "That one. Mine, in here, not the one Flint keeps out in his orchard. Then come and talk to me. I will open the Steel leaf in your Field Primer and ink the stem."

**Reminder**

Look around this hearth, put the hearth dummy down, then talk to Edge. The anvil is still bright from this morning's work.

**Complete**

Edge wipes his paws on a rag that has seen worse, then inks the stem of the Steel leaf. A little oil darkens one corner of the page anyway. "Rank one. Nobody hands you the second one." He goes back to the strap. "Next time you will be casting, not swinging."

**Objectives**

- `look-hearth` (look): Look around the hearth.
- `defeat-dummy` (defeat): Defeat the hearth dummy.
- `report` (talk): Return and talk to Mentor Edge.

### Second Lessons: Ember

- id: `second-lessons-ember`
- reward: 20 experience, `ink-rag`

**Intro**

Cinder has banked the grate down to a low working fire and dried soot sits on her whiskers. She turns the Primer around so the Ember page faces you. "Swinging is finished. Cast ember at the dummy in here and I will watch your paws while you do it. Then talk to me. After that the Primer holds one ink of its own, and you spend it: open the book and type ink and the vein's name."

**Reminder**

Cast ember at the hearth dummy in this hearth, then talk to Cinder. She wants to see your paws while you do it.

**Complete**

Cinder shuts the Primer on the grate-side table and leaves her paw flat on the cover a moment. "Better. You named the fire before you fed it." She slides the book back to you. "There is one ink in there now that is yours to spend. Open the Primer and type ink and the vein's name."

**Objectives**

- `cast-starter` (cast): Cast ember in the hearth.
- `report` (talk): Talk to Mentor Cinder.

### Second Lessons: Thorns

- id: `second-lessons-thorn`
- reward: 20 experience, `ink-rag`

**Intro**

A thorn has caught Briar's cloak again and she leaves it there while she opens the Primer to the Thorns page. "No more swinging. Cast briar at the dummy in here. Aim for one place and hold it — that is the whole trick, and it is harder than hitting everything." She taps the page. "Then talk to me. After that the Primer holds one ink that is yours. Open the book and type ink and the vein's name."

**Reminder**

Cast briar at the hearth dummy in this hearth, then talk to Briar. Pick one place and hold it.

**Complete**

Briar frees her cloak from the thorn at last, which takes her two tries. "You held it in one place. Good. Most first-years spray it about and call that enthusiasm." She pushes the Primer back across the bench. "One ink in there now, and it is yours. Open the Primer and type ink and the vein's name."

**Objectives**

- `cast-starter` (cast): Cast briar in the hearth.
- `report` (talk): Talk to Mentor Briar.

### Second Lessons: the Veil

- id: `second-lessons-veil`
- reward: 20 experience, `ink-rag`

**Intro**

The curtains shift, though the window is shut and the door behind you is shut. Mist opens the Primer to the Veil page and sets one finger on it. "You are finished swinging. Cast shade at the dummy in here. Then talk to me." She waits long enough that you nearly answer. "After that the Primer holds one ink of its own. Open the book and type ink and the vein's name."

**Reminder**

Cast shade at the hearth dummy in this hearth, then talk to Mist. Do not get caught in the mirror on the way past.

**Complete**

Mist closes the Primer and holds it a moment before she gives it back. "You did not announce it first. That is the lesson, and most of them take longer." The curtains move again. "One ink in there is yours now. Open the Primer and type ink and the vein's name."

**Objectives**

- `cast-starter` (cast): Cast shade in the hearth.
- `report` (talk): Talk to Mentor Mist.

### Second Lessons: Stars

- id: `second-lessons-stars`
- reward: 20 experience, `ink-rag`

**Intro**

Dried ink spots Lumen's primaries in three or four places where she has pushed a nib too hard. She opens the Primer to the Stars page and squares it with the edge of the desk. "Swinging is behind you. Cast azimuth at the dummy in here. Take your bearing before you throw anything." She turns the page toward you. "Then talk to me. After that the Primer holds one ink of yours. Open the book and type ink and the vein's name."

**Reminder**

Cast azimuth at the hearth dummy in this hearth, then talk to Lumen. Take the bearing first.

**Complete**

Lumen notes something in the margin of her own book before she says anything about yours. "You took the bearing first. That is the difference between a charted shot and a lucky one." She hands the Primer back. "One ink in there is yours to spend. Open the Primer and type ink and the vein's name."

**Objectives**

- `cast-starter` (cast): Cast azimuth in the hearth.
- `report` (talk): Talk to Mentor Lumen.

### Second Lessons: Stone

- id: `second-lessons-stone`
- reward: 20 experience, `ink-rag`

**Intro**

Quern sets both paws flat on the bench, grey to the wrist, and takes his time. "Swinging is done with. Cast keystone at the dummy in here. Set your feet before you set anything else." He turns the Primer to the Stone page. "Then talk to me. After that the Primer holds one ink of its own. Open the book and type ink and the vein's name."

**Reminder**

Cast keystone at the hearth dummy in this hearth, then talk to Quern. Set your feet first.

**Complete**

Quern puts the Primer on the keystone shelf, closes it, and leaves it there while he thinks. "Your feet were right. Everything else can be taught." He passes it back. "One ink in that book is yours now. Open the Primer and type ink and the vein's name."

**Objectives**

- `cast-starter` (cast): Cast keystone in the hearth.
- `report` (talk): Talk to Mentor Quern.

### Second Lessons: Steel

- id: `second-lessons-steel`
- reward: 20 experience, `ink-rag`

**Intro**

Edge's mail shirt clicks once as he leans over and opens the Primer to the Steel page. "You have swung at it. Now cast strike at the dummy in here, and name the stance out loud first, same as before." He straightens up. "Then talk to me. After that the Primer holds one ink that belongs to you. Open the book and type ink and the vein's name."

**Reminder**

Cast strike at the hearth dummy in this hearth, then talk to Edge. Name the stance out loud first.

**Complete**

Edge picks the Primer up off the anvil and leaves a little linseed on the cover doing it. "You named it before you threw it. That habit will keep you standing." He hands it over. "One ink in there is yours. Open the Primer and type ink and the vein's name."

**Objectives**

- `cast-starter` (cast): Cast strike in the hearth.
- `report` (talk): Talk to Mentor Edge.

### Alder's Leave: Ember

- id: `third-lessons-ember`
- reward: 25 experience, `hearth-mitts`

**Intro**

Cinder hangs the tongs on their nail and shuts the grate door, which she has not done once while you were learning here. "That is me finished. There are three things this hearth can teach you and you have had all three." She jerks her head at the ceiling. "Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on that Clock Tower stair, finish that before you come back here. When he tells you the grounds will teach the rest, come and talk to me and I will close the page."

**Reminder**

Talk to Alder in the High Study, then come back and talk to Cinder. The grate door is still shut, and she is still standing next to it.

**Complete**

Cinder inks Alder's leave under the Ember stem and shuts the book properly this time. "That is the whole of the college in this hearth. From here on the lessons come off the grounds, and each one puts one ink in that book for you to spend." She takes the mitts off the grate rail and pushes them at you. "Take those. My paws know the heat by now and yours do not. Eat something warm before you walk a cold road."

**Objectives**

- `talk-alder` (talk): Talk to Headmaster Alder.
- `report` (talk): Return and talk to Mentor Cinder.

### Alder's Leave: Thorns

- id: `third-lessons-thorn`
- reward: 25 experience, `thorn-ring`

**Intro**

Briar closes the shears and hangs them up, and for once does not find another stem that needs taking off. "Three lessons and the trellis is still standing. Some years that is not how it goes." She wipes the sap off her paws. "Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish that first. When he says the grounds will teach you the rest, come back and talk to me and I will close the page."

**Reminder**

Talk to Alder in the High Study, then come back and talk to Briar. The shears are hung up and she has left them there.

**Complete**

Briar inks Alder's leave under the Thorns stem and presses the page flat with her palm. "That is the college part done. The grounds teach the rest, and each lesson out there puts one ink in the book for you to spend." She works a thin ring round until the join sits flat, then sets it in your paw. "Cut in the right place and you will not need to cut twice. Eat something warm before you walk a cold road."

**Objectives**

- `talk-alder` (talk): Talk to Headmaster Alder.
- `report` (talk): Return and talk to Mentor Briar.

### Alder's Leave: the Veil

- id: `third-lessons-veil`
- reward: 25 experience, `quiet-cloak`

**Intro**

Mist draws the double curtain fully back, which lets the whole of the afternoon into a room you have only seen in strips. "Three lessons. You have stopped announcing yourself before you move, which is the one I was waiting on." She leaves the curtain open. "Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish that first. When he says the grounds will teach the rest, come back and talk to me."

**Reminder**

Talk to Alder in the High Study, then come back and talk to Mist. She has left the curtain open and has not said why.

**Complete**

Mist inks Alder's leave under the Veil stem, then holds the book shut a moment before she gives it back. "The college part is finished. The grounds teach the rest, and each lesson out there leaves one ink in the book for you." She folds a short cloak once and hands it over. "That is quieter than what you are wearing. Eat something warm before you walk a cold road."

**Objectives**

- `talk-alder` (talk): Talk to Headmaster Alder.
- `report` (talk): Return and talk to Mentor Mist.

### Alder's Leave: Stars

- id: `third-lessons-stars`
- reward: 25 experience, `glass-ring`

**Intro**

Lumen rolls the chart you have been working from and ties it, then writes your name on the outside of it. "Three lessons, and your last bearing was within a degree. I have kept worse charts from older students." She sets the roll aside. "Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish that first. When he says the grounds will teach the rest, come back and talk to me."

**Reminder**

Talk to Alder in the High Study, then come back and talk to Lumen. Your chart is rolled and tied with your name on it.

**Complete**

Lumen rules a line and inks Alder's leave under the Stars stem along it. "The college part is closed. The grounds teach the rest, and each lesson out there leaves one ink in the book for you to spend." She puts a small glass ring on top of your rolled chart. "That is for counting, not for seeing. Take both. Eat something warm before you walk a cold road."

**Objectives**

- `talk-alder` (talk): Talk to Headmaster Alder.
- `report` (talk): Return and talk to Mentor Lumen.

### Alder's Leave: Stone

- id: `third-lessons-stone`
- reward: 25 experience, `slate-cap`

**Intro**

Quern sets the chalk down and puts his paw on the keystone, the way he had you do it on your first day. "Three lessons. The roof is where it was. So are you." He takes a while getting to the rest of it. "Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish that before you come back. When he says the grounds will teach the rest, talk to me and I will close the page."

**Reminder**

Talk to Alder in the High Study, then come back and talk to Quern. The chalk is down and the keystone has not shifted.

**Complete**

Quern inks Alder's leave under the Stone stem, slowly, and leaves grey dust in the margin again. "The college part is finished. The grounds teach the rest, and each lesson out there leaves one ink in the book for you." He dusts off a felt cap with a slate-grey band and holds it out. "The hill can wait. It has waited longer than the College has stood. Eat something warm before you walk a cold road."

**Objectives**

- `talk-alder` (talk): Talk to Headmaster Alder.
- `report` (talk): Return and talk to Mentor Quern.

### Alder's Leave: Steel

- id: `third-lessons-steel`
- reward: 25 experience, `wooden-guard`

**Intro**

Edge racks the practice blade you have been using and does not hand you another one. "Three lessons, and you named your stance every time without me asking after the second. That is the whole of what I teach." He wipes his paws. "Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish that first. When he says the grounds will teach the rest, come back and talk to me."

**Reminder**

Talk to Alder in the High Study, then come back and talk to Edge. Your practice blade is on the rack and he has not taken it down again.

**Complete**

Edge inks Alder's leave under the Steel stem and leaves a thumbprint of linseed on the corner, as he has every time. "College part is done. The grounds teach the rest, and each lesson out there puts one ink in the book for you." He oils a light wooden guard and fits it on your off paw himself. "That is a guard. It is not a shield and I will not have you calling it one. Eat something warm before you walk a cold road."

**Objectives**

- `talk-alder` (talk): Talk to Headmaster Alder.
- `report` (talk): Return and talk to Mentor Edge.

### The Bell Below

- id: `the-bell-below`
- reward: 15 experience, `listening-charm`

**Intro**

Alder sets the silver tuning fork on the blotter beside three rings of old mint tea and waits until you meet his good yellow eye. Moonlight from the round window lies in a pale coin on the oak. "I am trusting you with the first honest question this school has asked in a long time. Listen. A deep bell sounds under our feet — not the cheerful hour-bell, but an old abbey note that rolls through these beams like a cart over wet cobbles. The old bronze is gone. We have an empty oak frame in the Clock Tower to prove it, and the timber still answers as if the metal had never left. I will not invent a cause from a rumour. Examine the Empty Bell Frame, the Bell Ledger in the Archive Cellar, and the Listening Stone in the Quiet Chapel. Then talk alder here. Bring me facts, not a pretty story."

**Reminder**

Alder does not raise his voice. He does not need to. The fork rests on the blotter, and somewhere far below a deeper note answers it. "Down to the Great Hall. East from the North Quad for the Clock Tower — feel the empty oak frame, still warm where the bronze used to hang. North from Library Stacks for the Archive Cellar, where the air smells of dust and binding-glue; read the keeper's hand. West from the Herb Garden for the Quiet Chapel, past the crushed mint and the bees; set your paw on the Listening Stone and count the beats. Then return and talk alder. Type quests if you lose the list. I asked you because I need a Collegian who will look before they guess."

**Complete**

You lay out what you found: an empty frame that still pulses like a living thing, a keeper's record that the bell was taken on a wet night, and three slow beats in the chapel root. Alder rests the fork against the oak. For a moment a deeper note answers it, and the High Study smells of beeswax and old feathers. "The wood remembers that welcome. The bell is gone, and the living timber still carries the sound. That is the true part. What first woke it is a later question. You did this school a service. I will not forget who brought me facts."

**Objectives**

- `check-frame` (examine): Examine the Empty Bell Frame in the Clock Tower. Alder sent you to prove the bell is gone. Type east from the North Quad.
- `read-ledger` (examine): Examine the Bell Ledger in the Archive Cellar. The keepers wrote down what was taken. Type north from Library Stacks.
- `listen` (examine): Examine the Listening Stone in the Quiet Chapel. Feel whether the pulses match the tower. Type west from the Herb Garden.
- `report` (talk): Bring Alder the three facts in the High Study. Type up from the Great Hall.

### The Bell Wakes

- id: `the-bell-wakes`
- reward: 15 experience, `piper-stair-charm`

**Intro**

Alder picks the fork up and sets it down again, slower this time. The oak chair creaks. Somewhere below the Clock Tower a warmer note answers, closer than the old abbey sound, and it comes up through the floor rather than down from the tower. "You already proved the wood can carry a welcome. Something below the Clock Tower has begun to answer. I would not send a first-year down that stair if I had another pair of eyes I trusted. Piper Mole has been alone in the Silk Gallery too long. He sits on a crate with silk-dust on both paws, and he is afraid. Talk to him. Examine the Stair Rope, the Silk Thread, and the Waking Husk. Then come back and talk alder here. One hungry child is not proof of a queen. Look first, and name what you actually saw. I am counting on you."

**Reminder**

Alder counts the stair on one talon. The scarred eye stays shut. "East from the North Quad. Down from the Clock Tower — the rope will pulse in your paw like a living thing. Talk piper in the Silk Gallery. He has been holding that dark with a dented tin whistle, and he deserves to be heard. Examine the Stair Rope, the Silk Thread — warm as bread from an oven — and the Waking Husk in the Cocoon Nave, where the husks hang like empty lanterns. Then talk alder here. Type quests for the list. Finish this before the silk learns another name."

**Complete**

You report the pulsing rope, the warm thread, Piper's watch, and the opened husk still smelling faintly of sweetness that should not be sweet so far below. Alder listens to the end. For a moment the High Study is only ink, dust, and the faint answering shiver of the fork. "A hatchling woke before the score allows. The silk is a cradle, not a throne. That is enough for one Collegian, and you were the Collegian I asked. When three can stand together, we will ask what still sleeps."

**Objectives**

- `check-rope` (examine): Examine the Stair Rope on the Bell Stair. Feel whether the pulses still climb the oak. Type down from the Clock Tower.
- `hear-piper` (talk): Talk piper in the Silk Gallery. He has been alone down there, and Alder wants you to hear him. Type down from the Bell Stair.
- `check-thread` (examine): Examine the Silk Thread in the Silk Gallery. Piper needs someone else to name what it is doing.
- `check-husk` (examine): Examine the Waking Husk in the Cocoon Nave. Prove whether a child woke too soon. Type east then south from the gallery.
- `report` (talk): Take the stair, Piper, thread, and husk back to Alder in the High Study. Type up from the Great Hall.

### What Still Sleeps

- id: `what-still-sleeps`
- reward: 20 experience, `copied-still-score`

**Intro**

Alder does not lift the fork. He looks at you the way he looks at a load-bearing beam — the good yellow eye fierce, the scarred one already decided. The High Study smells of beeswax and old feathers. "Three can stand. South of the Cocoon Nave the cradle is no longer empty. I have felt it through these beams — a heavier note than the hatchling. It does not move when the hatchling moves. It waits. I will not send one Collegian into that room. Take two classmates who can lock a move on the same clock as you. Examine the wrapping in the nave. Examine the Still Score. If she squares up, do not invent heroics. Lock together until she falls. Then come back and talk alder here. This is the work I saved for students I trust to come home."

**Reminder**

Alder counts three on his talons. Moonlight still lies in a pale coin on the blotter. "East from the North Quad, then down, east, south. Examine the wrapping in the Cocoon Nave before you take the south door. Do not go into the cradle alone. Examine the Still Score — the button is the part I cannot see from this oak. If the Silk Queen stands, lock together until she falls. Then talk alder here. Type quests for the list. The school is watching this one, and I would rather watch you walk back up that stair."

**Complete**

You name the score, the button, the three who stood, and Holm. Alder listens to the end. The fork answers once. He does not lift it again. "You did not invent a monster. You finished a lesson I could not fight for you. Holm kept that stair so first-years would not walk it dark. We will keep his name in the High Study. Go to class. Eat something warm. If your paws are shaking, talk to Fen. Then, when you can stand a cold wind, come back. The grounds east of the meadow have their own hunger, and I will not send you still hungry from this one."

**Objectives**

- `read-wrapping` (examine): Examine the Keeper's Wrapping in the Cocoon Nave. Leave him covered. Type south from the Webbed Cloister.
- `stand-together` (visit): Reach the Deep Cradle with classmates. Alder will not accept a solo report from that room. Type south from the Cocoon Nave.
- `read-score` (examine): Examine the Still Score in the Deep Cradle. The button is the part Alder cannot see from the High Study.
- `defeat-queen` (defeat): Defeat the Silk Queen with two classmates. She will not square up for fewer than three. Lock together until she falls.
- `report` (talk): Bring the wrapping, the score, and the queen back to Alder in the High Study. Type up from the Great Hall.

### The Meadow Fork

- id: `the-meadow-fork`
- giver: `npc-shepherd-wren`
- requires: `what-still-sleeps`
- reward: 25 experience, `moor-boots`

**Intro**

Wren sets a tin plate of oatcakes by the peat fire. The kettle ticks. One peg by the door is empty. "Sit. Colm has not come in. The flock was due at dusk yesterday. I will not invent a walker from an empty peg. Examine the Waystone on the track south of here — abbey mark south, sheep-scratch north, three chalked circles. Then come back and talk wren. Eat first. The Hall of Schools stays east. You typed north from the meadow. Good."

**Reminder**

Wren does not raise her voice. The oatcakes are still warm. "South to the waystone. Examine it. Then talk wren here. Type south from the croft. Type north from the East Meadow if you lost the hedge. Type quests if you lose the list."

**Complete**

You name the three chalked circles and the empty peg. Wren pours tea too hot and does not apologise. She sets a pair of moor boots by the door. "The waystone told you the chapel count. East is the fold. Eat again before you go. I told Colm not to."

**Objectives**

- `walk-track` (visit): Reach the Moor Track. Type north from the East Meadow. The Hall stays east for class.
- `hear-wren` (talk): Talk wren in Wren's Croft. Sit. Eat. Type north from the Moor Track.
- `read-waystone` (examine): Examine the Waystone on the Moor Track. Three chalked circles. Type south from the croft.
- `report` (talk): Return and talk wren at the croft. Type talk wren.

### The Uncounted Flock

- id: `the-uncounted-flock`
- giver: `npc-shepherd-wren`
- requires: `the-meadow-fork`
- reward: 25 experience, `wren-wool-charm`

**Intro**

Wren's tea is already too hot. Peat-smoke hangs in her fur. "East of the track is the fold. The latch was lifted, not broken. Hoof-marks go out. None come in. Examine the Empty Fold and Colm's Crook — ash wood, his knife-marks, set down carefully. A mist-crow has been sitting the rail. Defeat it if it squares up. Then talk wren. I will not invent blood where there is none."

**Reminder**

"Type east from the Moor Track. Examine the Empty Fold and Colm's Crook. Defeat the mist-crow. Then talk wren here. Leave the crook. I still have a peg for it. Type quests for the list."

**Complete**

You name the lifted latch and the crook that was not dropped. Wren ties a twist of fold-wool for you and looks at the empty peg. "The stones next. They were not in last winter's count. Colm went to look. I told him not to."

**Objectives**

- `reach-fold` (visit): Reach the Sheepfold. Type east from the Moor Track.
- `read-fold` (examine): Examine the Empty Fold. Latch lifted, not broken. No blood.
- `read-crook` (examine): Examine Colm's Crook. Leave it. Wren still has a peg.
- `defeat-crow` (defeat): Defeat the Mist Crow on the fold rail.
- `report` (talk): Return and talk wren at the croft. Type talk wren.

### The Stones That Were Not There

- id: `the-stones-that-were-not-there`
- giver: `npc-shepherd-wren`
- requires: `the-uncounted-flock`
- reward: 30 experience, `abbey-mark-ring`

**Intro**

Wren counts on her fingers and does not like the number. "East of the fold. Last winter there were seven standing stones. There are eight. Examine the Abbey Mark on the old ring — three circles, Collegium mason. Examine the New Stone. It is wet when the others are only damp. It hums the chapel count. Then talk wren. Stars would help you count. Stone would help you wait. Either way, come home."

**Reminder**

"Type east from the Sheepfold. Examine the Abbey Mark and the New Stone. Then talk wren here. Type quests for the list. I told Colm not to go. I am telling you to look and come back."

**Complete**

You name eight where seven stood. Wren's ears go flat. She presses a clay ring into your paw. The rubbing stays in the bag. "Last winter there were seven. There are eight. North of the stones the peat-cut opens. I hate sending you. If you find him, you come to me before you go to Alder. I am owed that."

**Objectives**

- `reach-stones` (visit): Reach the Standing Stones. Type east from the Sheepfold.
- `read-mark` (examine): Examine the Abbey Mark. Three circles. Old mason-work.
- `read-new-stone` (examine): Examine the New Stone. Wet. Humming. Not a year of lichen.
- `report` (talk): Return and talk wren at the croft. Type talk wren.

### The Barrow Mouth

- id: `the-barrow-mouth`
- giver: `npc-shepherd-wren`
- requires: `the-stones-that-were-not-there`
- reward: 35 experience, `peat-lantern`

**Intro**

Wren's kettle ticks too fast. She hates this sentence and says it anyway. "North of the stones, through the peat-cut — black water, old tea and iron, fog at the knee. The barrow mouth opens under a lip of turf. Examine Colm's Spare Cloak on the stone. Wet wool, not silk. Enough to scare. Not a body. The Barrow Guard is peat-and-bone that is not a dog. Defeat it if it squares up. Then talk wren. If you find him, you come to me before you go to Alder. I am owed that."

**Reminder**

"Type north from the Standing Stones, then north again. Examine the spare cloak. Defeat the barrow-guard. Then talk wren here. Do not skip me for the High Study. Type quests for the list."

**Complete**

You name the folded cloak and the guard that was not a dog. Wren's paws shake once on the kettle. She puts a small peat lantern in your off paw. It is not the crook. "You found the spare. Now the lip of the barrow. Examine what the fog took. Then come to me. Do not go to Alder first."

**Objectives**

- `reach-mouth` (visit): Reach the Barrow Mouth. Type north from the Peat Cut.
- `read-cloak` (examine): Examine Colm's Spare Cloak. Wet wool, not silk. Not a body.
- `defeat-guard` (defeat): Defeat the Barrow Guard at the hill-lip.
- `report` (talk): Return and talk wren at the croft before Alder.

### What the Fog Took

- id: `what-the-fog-took`
- giver: `npc-shepherd-wren`
- requires: `the-barrow-mouth`
- reward: 40 experience, `fog-glass-bead`

**Intro**

Wren does not sit. The peat fire pops. "The lip of the barrow. Examine what the fog took. Then talk wren here. Then talk fen in the Infirmary — soap, rosemary, honey, the breathing wheel. I am owed the name before Alder is. Sit with Fen after. Nobody earns extra courage by pretending not to hurt."

**Reminder**

"Examine what the fog took under the barrow lip. Talk wren. Then talk fen. Type east from the Porter Lodge for the Infirmary. Type quests for the list. Whatever you find, report it as you found it."

**Complete**

You told Wren, then sat with Fen until your paws felt like paws again. Wren closes your paw around a fog-glass bead. Two keepers. Two witnesses who lived. Piper under the tower. Wren at the kettle. Eat. The bronze in the hill is Alder's question now.

**Objectives**

- `read-colm` (examine): Examine what the fog took under the Barrow Mouth lip. Leave him covered. Do not talk colm.
- `tell-wren` (talk): Talk wren at the croft before Alder. She is owed that.
- `sit-fen` (talk): Talk fen in the Infirmary. Sit. Honey. Type east from the Porter Lodge.

### The Bronze in the Hill

- id: `the-bronze-in-the-hill`
- reward: 50 experience, `patched-hood`

**Intro**

Alder does not lift the fork. Wren will not go in, and he will not ask her to. "The bronze is in the hill. Holm wrote that it was taken on a wet night. This is where it was taken to. Visit the Barrow Nave — down from the Barrow Mouth. Examine the Abbey Bronze. Then talk alder here. One more after that. Not alone. The thing that walks the fog used our welcome for a mouth."

**Reminder**

"Down from the Barrow Mouth. Examine the Abbey Bronze. Then talk alder in the High Study. Type up from the Great Hall. Wren stays at the croft. She is owed that. Type quests for the list."

**Complete**

You name peat-stained bronze and three pulses that should not ring. Alder listens to the end. He sets a patched hood on the desk. Wool and stitch. Wren spared it. It is not the bronze. "The Quiet Chapel was telling the truth. One more. Not alone. The Fog Walker used our welcome for a mouth. Eat something warm before you take two classmates into that hollow."

**Objectives**

- `reach-nave` (visit): Reach the Barrow Nave. Type down from the Barrow Mouth.
- `read-bronze` (examine): Examine the Abbey Bronze. Peat-stain. Three pulses. Holm's wet night ends here.
- `report` (talk): Bring the bronze back to Alder in the High Study. Type up from the Great Hall.

### The Thing That Walks

- id: `the-thing-that-walks`
- reward: 60 experience, `wren-hearth-charm`

**Intro**

Alder counts three on his talons. Wren blesses you and stays at the croft. "One more. Not alone. Take two classmates who can lock a move on the same clock as you. Visit the Fog Hollow north of the Barrow Nave. Defeat the Fog Walker. Then talk alder here. Fog thickens when you lock. The count is still three. When it falls the hollow should smell like rain on a hearth-stone, not sweetness. Nobody yet knows who carried the bronze in there. Do not guess at it. Eat after. Sleep after."

**Reminder**

"Three Collegians. Type north from the Barrow Nave. Defeat the Fog Walker. Then talk alder here. Type up from the Great Hall. Type quests for the list. I would rather watch you walk back to Wren's kettle."

**Complete**

You name the hollow that smelled like rain on a hearth-stone. Alder listens to the end. The fork stays on the blotter. "The wood remembers. The moor remembers. That is enough for one year. Eat. Sleep. Who took the bronze into the hill — if the walker only learned to use it — is a later question. Holm's name stays in this study. Colm's stays at Wren's kettle. Go to class."

**Objectives**

- `reach-hollow` (visit): Reach the Fog Hollow with classmates. Type north from the Barrow Nave.
- `defeat-walker` (defeat): Defeat the Fog Walker with two classmates. It will not square up for fewer than three.
- `report` (talk): Bring the hollow back to Alder in the High Study. Type up from the Great Hall.

### The Empty Byre

- id: `the-empty-byre`
- giver: `npc-foldhand-hobb`
- requires: `the-meadow-fork`
- reward: 20 experience, `fold-mitts`

**Intro**

Hobb trims the lamp and does not sit down. "Byre north of Wren's croft. Straw banked up the walls, gate sound, latch still dropped. Not one sheep in it." He sets the lamp on the bench harder than he meant to. "No wool caught on the nails. No prints in the mud outside. Go and examine the empty stall yourself, then try the mist-lane east of it. Something has been standing in that lane three nights running and the fog does not move around it. Come back and talk hobb. I would rather know than keep guessing at my own straw."

**Reminder**

"Examine the empty stall north of the croft. Defeat the fold-hound in the mist-lane if it is still there. Then talk hobb. Type north from Wren's Croft. Type east from the byre."

**Complete**

Hobb hears you out, then goes and stands in the lane himself for a while to see that it is only a lane. When he comes back he pulls the mitts off his own paws and puts them in yours. "Take those. The mist gets into your claws out here and you will want them." He looks at the empty bell-loop again. "It was not a sheep and it was not a dog, and I still have no bell. Sile is at the mere north of the lane, and she has her own wrong thing. Talk sile. Eat at the croft on your way."

**Objectives**

- `read-stall` (examine): Examine the Empty Stall in the Croft Byre. Type north from Wren's Croft.
- `defeat-hound` (defeat): Defeat the Fold Hound in the Mist Lane. Type east from the Croft Byre.
- `report` (talk): Talk hobb in the Wool Shed. Type east from the croft, or south from the lane.

### The Mere That Keeps

- id: `the-mere-that-keeps`
- giver: `npc-reedcutter-sile`
- requires: `the-empty-byre`
- reward: 20 experience, `reed-cloak`

**Intro**

Sile lays a cut reed flat on the water and holds it there. Not one ripple goes out from it. "That is not right, and you can see for yourself that it is not right." She takes the reed back. "Go and examine the still water, close enough to see there is nothing under that light holding it up. If it squares up at you, finish it. Then talk sile. I do not want a mystery. I want a mere I can call across."

**Reminder**

"Examine the still water. Defeat the reed-wisp if it is on the mere. Then talk sile. Type north from the Mist Lane."

**Complete**

Sile walks to the edge, cups her paws, and shouts her brother's name across the water. It comes back off the far reeds, thin but whole. She listens to it a little longer than she needs to. "There." She takes the short oiled cloak off her own shoulders and puts it on yours. "Kern is east past the stones, chalking lintels and getting a number he does not care for. He counts stones, I count reeds, and neither of us goes near that barrow. Tell him the mere gave my voice back."

**Objectives**

- `read-mere` (examine): Examine the Still Water at Reed Mere. Type north from the Mist Lane.
- `defeat-wisp` (defeat): Defeat the Reed Wisp at Reed Mere.
- `report` (talk): Talk sile at Reed Mere.

### The Ninth Scratch

- id: `the-ninth-scratch`
- giver: `npc-stoneward-kern`
- requires: `the-mere-that-keeps`
- reward: 25 experience, `lintel-band`

**Intro**

Kern opens the tally-book to last winter's page and turns it so you can read the figure. Eight, in his own hand, with the date beside it. "Eight. Now go and examine the scratch stone and tell me what you make of a ninth." He closes the book. "North of here there is a ditch with something in the water that collects metal. If it will not let you look, finish it. Then talk kern. Sile says her mere gave her voice back. Good. My field has gained a stone."

**Reminder**

"Examine the scratch stone. Defeat the ditch-lurker in the black ditch. Then talk kern. Type east from the Standing Stones. Type north from the lintel field."

**Complete**

Kern chalks a dot on the ninth stone at last, then writes a nine in the book underneath the eight and does not cross the eight out. "Both numbers are true. That is the part I dislike." He hands you a plain metal band with no stone in it. "Wear it or pocket it, it is honest either way. A bell gone from Hobb's shed, a voice kept off Sile's mere, a stone added to my field. Three wrong things on one moor inside a month. Talk kern again when you have a moment and we will put them on one page."

**Objectives**

- `read-scratch` (examine): Examine the Scratch Stone in the Lintel Field. Type east from the Standing Stones.
- `defeat-lurker` (defeat): Defeat the Ditch Lurker in the Black Ditch. Type north from the Lintel Field.
- `report` (talk): Talk kern in the Lintel Field.

### The Cut Painter

- id: `the-cut-painter`
- giver: `npc-skipper-marram`
- reward: 15 experience, `river-boots`

**Intro**

Marram wipes tar off his paws and holds up the stub of rope still tied to the landing post. The cut end is flat and clean. "Weather frays a rope for a fortnight before it gives. A knife ends it between one breath and the next." He drops the stub. "Go east to the willow bend and examine the cut painter on that end, then come back and talk marram. Four boats this morning, three now. I would like to know which of those two things happened before I go shouting about it."

**Reminder**

"Examine the cut painter at Willow Bend. Then talk marram. Type south from the South Orchard to the landing, then east."

**Complete**

Marram holds both rope ends together, the one from the post and the one you describe, and the cuts match. He does not look pleased to be right. "A knife, then. Somebody walked my landing in the dark." He sets a pair of tarred boots by the post and pushes them toward you with one foot. "Those will keep the river out of your toes. There is a young one on the willow root wearing a thief's jerkin with nothing on the cord. He has not run, which interests me. Talk nett."

**Objectives**

- `reach-bend` (visit): Reach Willow Bend. Type east from River Landing.
- `read-painter` (examine): Examine the Cut Painter at Willow Bend.
- `report` (talk): Talk marram at River Landing. Type west from Willow Bend.

### The Biscuit Crate

- id: `the-biscuit-crate`
- giver: `npc-deckhand-nett`
- requires: `the-cut-painter`
- reward: 20 experience, `biscuit-tin`

**Intro**

Nett draws the shape of the crate in the mud with one finger, including the mark on the lid. "College mark, burnt into the end board. I carried it out of your own store and down the bank myself, so I know the one." He rubs the drawing out. "South then east, the cargo hollow. Examine the biscuit crate and you will see I am not lying about the mark. There is a deck-hand on the skiff-line who will not let you past. Then talk nett. I carried that tin once. I am not carrying it again."

**Reminder**

"Examine the biscuit crate in the cargo hollow. Defeat the deck-hand on the skiff-line. Then talk nett. Type south from Willow Bend."

**Complete**

Nett takes the dented tin, turns it until the College mark is facing up, and hands it straight back to you. "There. Now it is yours and not theirs, and I have carried it the right direction once." He sits back down on the root. "Midge is west and then south, on the heron post. She hung a whistle up so the landing would hear a rope go. The camp took it off the nail the same week they took your crate. Talk midge. I am going to sit here until Marram trusts me with a knot again."

**Objectives**

- `read-crate` (examine): Examine the Biscuit Crate in the Cargo Hollow. Type south from the skiff-line.
- `defeat-hand` (defeat): Defeat the Deck Hand on the Skiff Line. Type south from Willow Bend.
- `report` (talk): Talk nett at Willow Bend.

### The Kept Whistle

- id: `the-kept-whistle`
- giver: `npc-heron-midge`
- requires: `the-biscuit-crate`
- reward: 20 experience, `skipper-whistle`

**Intro**

Midge taps the empty nail with the butt of her spear. It rings. "Bright, you see. Eleven years of weather on that post and the nail is bright, because something was hanging on it until recently." She grounds the spear again. "Examine the whistle post yourself. Then north to the rope-island, where they have put somebody to keep the cut end cut. Finish that and talk midge. A warning nobody can hear is just one more thing they took."

**Reminder**

"Examine the whistle post. Defeat the rope-sentry on the rope-island. Then talk midge. Type south from the rope-island."

**Complete**

Midge takes the whistle off the sentry's cord, blows it once, and the note carries all the way up the bank to the landing. Somewhere up there a door opens. "That is what it is for." She threads it onto a fresh cord and puts it in your paw rather than back on the nail. "You keep that until this is finished. They posted a grown badger on an island to stop one whistle sounding, which tells you the camp is worth guarding. Marram is at the landing. Talk marram."

**Objectives**

- `read-post` (examine): Examine the Whistle Post at Heron Post.
- `defeat-sentry` (defeat): Defeat the Rope Sentry on the Rope Island. Type north from Heron Post.
- `report` (talk): Talk midge at Heron Post.

### The Black Mooring

- id: `the-black-mooring`
- giver: `npc-skipper-marram`
- requires: `the-kept-whistle`
- reward: 30 experience, `boarding-oar`

**Intro**

Marram ties a proper knot on the landing post, slowly, so you can watch him do it. "That is how a painter is meant to look. Remember it." He straightens up. "South from the slip is their camp, and there is a grown otter in it wearing a coat with his buttons done up, keeping four things that are not his. Defeat the river captain, then talk marram. One trained Collegian can square up to him. Taking a classmate is the wiser of the two plans, and I will think no less of you for it. I will send otters down for the tins."

**Reminder**

"Defeat the river captain in the pirate camp. Then talk marram. Type south from the Otter Slip."

**Complete**

Marram counts the boats twice before he says anything, which takes a while, because there are four of them again. He reties the willow-bend painter himself rather than let anyone else do it. "Four. That is the number that belongs here." He puts a short notched oar in your paws. "Keep that. It is a tool for keeping a boat yours, and you have earned the loan of it." He is already coiling the next rope. "Go and eat in the refectory. Midge will want her whistle back on that nail before dark, and you are the one who ought to hang it."

**Objectives**

- `reach-camp` (visit): Reach the Pirate Camp. Type south from the Otter Slip.
- `defeat-captain` (defeat): Defeat the River Captain in the Pirate Camp.
- `report` (talk): Talk marram at River Landing.

### The Missing Pages

- id: `the-missing-pages`
- giver: `npc-librarian-quill`
- reward: 10 experience, `librarians-ribbon`

**Intro**

Quill opens A Small Guide to Remarkable Woodland Birds beneath the green-shaded lamp. Cloth bookmarks hang from neighbouring volumes like bright tongues, and the little clock ticks much more quietly than seems mechanically reasonable. One awkward gap shows where the lantern-wren page ought to sit. "The lantern-wren entry is missing — the page about the bird that carries its own small lantern through dusk. Read the Ink Blotter in the Scriptorium, west of these stacks, where the air smells of gall and drying paper. Then the Folded Page in the Music Loft, west of the North Quad, where a stand has been wobbling through three verses. Please examine both, then come back and talk quill. Leave the fragile page where it is; tell me where to collect it. We need a careful reader, not a tug-of-war. Blame is a poor bookmark."

**Reminder**

Quill taps the gap in the field guide with one careful talon. Ink has dried on her waistcoat like a constellation of honest mistakes. "Examine the Ink Blotter in the Scriptorium and the Folded Page in the Music Loft. Then talk quill here. Type west to reach the Scriptorium. Type west to reach the Music Loft from the North Quad. Type east to reach Library Stacks. Type quests to check your notes. I would rather have the words back than a name to scold."

**Complete**

Quill listens to your account of the copied birdsong and the wobbly music stand. The green lamp makes a small, patient circle on the register. "An unfinished errand, then, not a thief." She writes down where to collect the page and prepares a proper wooden wedge for the stand. "You found the missing words without inventing an accusation. That is good scholarship. The lantern wren may now go home to its book."

**Objectives**

- `read-blotter` (examine): Examine the Ink Blotter in the Scriptorium (west of Library Stacks). Type west to reach the Scriptorium.
- `find-page` (examine): Examine the Folded Page in the Music Loft (west of North Quad). Type west to reach the Music Loft.
- `report` (talk): After both discoveries, talk quill in Library Stacks. Type east to reach Library Stacks.

### A Little Room to Grow

- id: `a-little-room-to-grow`
- giver: `npc-groundskeeper-tansy`
- reward: 10 experience, `tansy-seed-pouch`

**Intro**

Tansy shows you a sketch of drooping moonmint, the pencil lines still smelling faintly of the greenhouse. A bumblebee bumps a lavender head, considers the matter, and tries again with more dignity. Her apron is full of twine, and her claws are dark with honest soil. "My greenhouse bed is unhappy — the leaves hang like wet washing, and I will not guess why. Before we change anything, examine the Seedling Tray in the Greenhouse north of here, and the Watering Jug in the Pottery Shed east of the South Orchard. Then talk fen in the Infirmary; he knows when a living thing needs air as well as water. Come back and talk tansy when you have all three observations. My first idea used to be more water. We lost a cactus that way."

**Reminder**

"Look for the cause, not just the droop," Tansy says, brushing soil from a slate label. Mint, thyme, and sage crowd the raised beds. "Examine the Seedling Tray and the Watering Jug, and talk fen in the Infirmary — clean linen, rosemary, and a painted breathing wheel. Type north to reach the Greenhouse. Type east to reach the Pottery Shed. Type east to reach the Infirmary. Type west to reach the Herb Garden. Your quests list keeps the notes."

**Complete**

You describe the soaked soil, blocked drainage, and clay-rinsing jug, then pass along Fen's advice. Tansy lays out a clean jug and a slender tool for clearing the tray. A bee tries the lavender again, with no more dignity than before. "A little room for air. That was what the roots needed." She writes your findings on the garden checklist. "You have the beginnings of a gardener: you noticed before you meddled. The moonmint may yet stand up."

**Objectives**

- `inspect-tray` (examine): Examine the Seedling Tray in the Greenhouse (north of Herb Garden). Type north to reach the Greenhouse.
- `inspect-jug` (examine): Examine the Watering Jug in the Pottery Shed (east of South Orchard). Type east to reach the Pottery Shed.
- `ask-fen` (talk): Talk fen in the Infirmary (from Lantern Court: east, north, east). Type east to reach the Infirmary.
- `report` (talk): After gathering all three observations, talk tansy in Herb Garden. Type west to reach the Herb Garden.

### Porter's Night Round

- id: `porters-night-round`
- giver: `npc-porter-bramble`
- requires: `arrival-at-the-collegium`
- reward: 10 experience, `path-boots`

**Intro**

Porter taps the whistle against his coat and does not blow it. "Arrival is done. The night round is a walk, not a race. Type west to the West Cloister and look at the arches. Then the lodge: east back to this court, east to the East Gate, north to the Porter Lodge. Come back and talk porter. I will be here. The kettle in the lodge can mind itself."

**Reminder**

"West to the West Cloister. Then east, east, and north to the Porter Lodge. Come back and talk porter in Lantern Court. Type quests if you lose the list. It is a walk."

**Complete**

You name the moss in the cloister and the kettle in the lodge. Porter sets a pair of soft boots on the noticeboard ledge. Court-dust already sits in the seams. "Wear them if you like. They will not make you faster, and they will not turn a blow. The round is the point."

**Objectives**

- `walk-cloister` (visit): Walk the West Cloister. Type west from Lantern Court.
- `walk-lodge` (visit): Reach the Porter Lodge. Type east to Lantern Court, east to the East Gate, then north.
- `report` (talk): Return and talk porter in Lantern Court. Type south from the lodge, then west.

### Fen's Linen

- id: `fens-linen`
- giver: `npc-healer-fen`
- requires: `arrival-at-the-collegium`
- reward: 10 experience, `linen-wrap`

**Intro**

Fen folds one more bandage and sets the honey where you can see it. "Sit if you need to. If you can walk, I want a clean smell that is not this room. Type west to the Porter Lodge, south to the East Gate, west to Lantern Court, south to the South Orchard, then west to the Herb Garden. Mint and rosemary. Then come back and talk fen. I will have the linen warm."

**Reminder**

"West from here to the lodge, south to the gate, west to the court, south to the orchard, west to the Herb Garden. Then come back and talk fen. Type quests for the list. Honey is still here."

**Complete**

You come back smelling of mint. Fen ties a clean linen wrap so it sits like a vest. Soap, rosemary, and the press. "Wear it after a hard stair. It is not courage. It is linen. Eat something warm."

**Objectives**

- `walk-garden` (visit): Reach the Herb Garden. Type west to the Porter Lodge, south to the East Gate, west to Lantern Court, south to the South Orchard, then west.
- `report` (talk): Return and talk fen in the Infirmary. Type east to the orchard, north to the court, east to the gate, north to the lodge, then east.

### One Page For Three

- id: `one-page-for-three`
- giver: `npc-stoneward-kern`
- requires: `the-ninth-scratch`
- reward: 25 experience, `fold-tally-page`

**Intro**

Kern turns the tally-book around and pushes it across the lintel toward you, open at a clean page. "Three of us have each been sure of a small wrong thing and none of us has written them down together. That is how a moor gets a reputation instead of a record." He hands you the chalk. "Go back to Hobb and get the night his bell went. Then Sile, for the night the mere took her voice. Bring both to me and talk kern. I will put them under my own date and we will see whether we have three problems or one."

**Reminder**

"Talk hobb in the Wool Shed for the night of the bell. Talk sile at the Reed Mere for the night of the voice. Then talk kern here in the Lintel Field. Type west from the Lintel Field for the stones."

**Complete**

Kern writes all three down, then sets his chalk on the dates and does not move it for a while. "The same three nights. Hobb's bell, Sile's mere, my stone, inside one week and inside two miles." He tears the page out along a fold and gives it to you. "Take that to Shepherd Wren, and then to Headmaster Alder if she says so. I am not sending a student under a hill and I am not guessing at a cause. But three animals keeping careful counts were all wrong in the same week, and somebody above my station should be holding that page."

**Objectives**

- `ask-hobb` (talk): Talk hobb in the Wool Shed for the night of the bell.
- `ask-sile` (talk): Talk sile at the Reed Mere for the night of the voice.
- `report` (talk): Talk kern in the Lintel Field.

### Quill's Second Book

- id: `quills-second-book`
- giver: `npc-librarian-quill`
- requires: `the-missing-pages`
- reward: 20 experience, `oak-and-bronze-book`

**Intro**

Quill has the borrowing register open at a page she does not like. "One more gap, and this one is older than your lantern wren." She turns the register so you can read the line. "Oak and Bronze. Thin, warped boards, gilt worn off the spine. Signed out to the High Study and never signed back. I do not accuse the Headmaster of theft; I accuse the Headmaster of a desk." She marks the line with one finger. "Ask him where it went. If he sends you to the cellar, mind the roots. Something has been nesting down there and the lavender is losing."

**Reminder**

"Ask Alder about Oak and Bronze. Type talk alder in the High Study. Then the Archive Cellar, and mind the bats. Then talk quill."

**Complete**

Quill takes the book, opens the boards flat, and looks along the warp with one eye closed like a joiner checking a plank. "Not damaged. Seasoned." She finds the borrowing slip inside, reads it, and pencils one word on it rather than three.

"Misfiled. Not stolen, not late, misfiled." She sets the book down and looks at you properly. "You understand that this is the better ending and also the duller one. Most of them are." She slides it back across the desk. "Keep it for a week. It is about cradles cut from living trees, and you have been under that tower. Read the fourth chapter and then come and argue with me about it."

**Objectives**

- `ask-alder` (talk): Ask Alder about the book. Type talk alder in the High Study.
- `reach-cellar` (visit): Reach the Archive Cellar. Type north from the Library Stacks.
- `clear-root` (defeat): Move the bat on the root. Type attack bat.
- `clear-shelf` (defeat): Move the bat over the high shelf. Type attack bat.
- `clear-stair` (defeat): Move the bat on the stair root. Type attack bat.
- `report` (talk): Talk quill in the Library Stacks.

### Shellington

- id: `shellington`
- giver: `npc-mentor-lumen`
- requires: `first-lessons-stars`
- reward: 25 experience, `shellington-diary`

**Intro**

Lumen turns her own book around so you can see the column she has been keeping. It is a list of dates with one name at the top and nothing written beside the last four. "Shellington borrowed a bearing book from this hearth in the spring and has not brought it back, which I could forgive. He also stopped writing to me, which I cannot." She closes it. "A crow-stile on the east moor, past the barrow. Somebody saw him sitting on it. He is corrupted, and I am told that is a word people use to mean finished. It is not. Bring him back to me and I will do the rest."

**Reminder**

"Shellington is on the crow-stile east of the barrow mouth. Bring him down and bring him back. Then talk lumen."

**Complete**

Lumen has the Infirmary send for Fen before she says anything to you, which is the right order and not the polite one. Then she reads the last two pages of the diary twice.

"He wrote down that he said no." She sets it flat. "Hold on to this. I want it read by somebody who is not me, and I want it read by somebody who was out there." She starts a fresh column in her own book with today's date in it. "He will be a fortnight mending and he will be insufferable about the bearing book. Go and eat something."

**Objectives**

- `reach-stile` (visit): Reach the Crow Stile. Type east from the Barrow Mouth.
- `bring-him-down` (defeat): Bring Shellington down. Type attack shellington.
- `report` (talk): Talk lumen at the Hearth of Stars.

### The Borrowed Ink

- id: `the-borrowed-ink`
- giver: `npc-collegian-quire`
- requires: `arrival-at-the-collegium`
- reward: 20 experience

**Intro**

Quire pats the empty side pocket one more time and then makes herself stop. "Squat bottle, cork stoppered, wax over the cork with a Q scratched in it. Third desk from the window in the Scriptorium. Court, north to the Great Hall, west into the Stacks, west again." She hitches the satchel. "I need it to ink a leaf tonight and I will not get another bottle out of the stores until Thursday. Bring it to me here and I will make it worth the walk. Or do not, and we will both know what happened."

**Reminder**

"The Scriptorium, third desk from the window. Squat bottle, wax over the cork. Type take ink. Then bring it back and talk quire, or do not."

**Complete**

_none_

**Objectives**

- `fetch` (take): Take the Borrowed Ink in the Scriptorium. Type west from the Library Stacks, then take ink.
- `give-back` (talk): Bring the ink to Quire at the East Gate. Type talk quire.
- `use-it` (cast): Or use the ink on your own leaf. Type cast ember.

## Dialogue

### Collegian Quire

- id: `npc-collegian-quire`
- room: East Gate (`east-gate`)

**Standing line**

Quire has her boots laced and her satchel strapped, and she keeps patting an empty side pocket. "I am walking to the moor road within the hour and my ink is sitting on a desk in the Scriptorium. Third time this term." She gives up on the pocket. "I cannot go back for it and keep the light. Talk quire if you have legs and an hour."

### Headmaster Alder

- id: `npc-headmaster-alder`
- room: The High Study (`headmaster-study`)

**Standing line**

"Sit, if you will. The High Study smells of beeswax and last winter's ink. Choose a School first. The thing that tolls beneath our feet can wait until you can stand with others."

**Tree**

- `welcome` (start): "Sit, if you will. The High Study smells of beeswax and last winter's ink, and moonlight from that round window lies in a pale coin upon my blotter. I am Alder. You will not find a house here. You will find a School. Ember for fire held in a grate, not spilled on the rafters. Thorns for growth that knows how to guard a path. The Veil for work done in honest shadow. Stars for a bearing written before you walk. Stone for a keystone that carries weight without a speech. Steel for a blade kept flat until it is needed. Each is a craft. Pick one now. The hearths do not open until you have chosen. And do not go hunting the thing that tolls beneath our feet until you have a School. The wood can wait. First lessons cannot."
  - say `1` School of Ember → `chosen-ember`
  - say `2` School of Thorns → `chosen-thorn`
  - say `3` School of the Veil → `chosen-veil`
  - say `4` School of Stars → `chosen-stars`
  - say `5` School of Stone → `chosen-stone`
  - say `6` School of Steel → `chosen-steel`
- `chosen-ember`: "Ember. Fire that is held, not spilled — a sheltered coal, not a wild blaze that eats the rafters. Your hearth is open. Down the stair to the Great Hall, where the banners hang and the stone still holds the day's warmth. South to Lantern Court, then east through the East Gate and the clover meadow until six banners mark the Hall of Schools. East from there is Ember. Look around that hearth. Defeat the dummy. Talk to Mentor Cinder. Do not waste the hours."
- `chosen-thorn`: "Thorns. Growth that knows how to guard itself — a vine trained, not a snare left to wander the cloister. Your hearth is open. Down the stair to the Great Hall. South to Lantern Court, then east through the East Gate and the clover meadow until six banners mark the Hall of Schools. East, then north, is Thorns. Look around that hearth. Defeat the dummy. Talk to Mentor Briar. Do not waste the hours."
- `chosen-veil`: "The Veil. What is unseen still acts — a moth in silver shadow, a truth that does not need to shout. Your hearth is open. Down the stair to the Great Hall. South to Lantern Court, then east through the East Gate and the clover meadow until six banners mark the Hall of Schools. East, then south, is the Veil. Look around that hearth. Defeat the dummy. Talk to Mentor Mist. Do not waste the hours."
- `chosen-stars`: "Stars. Light that names a path — not a wish flung at the night, but a mark written before the hour changes. Your hearth is open. Down the stair to the Great Hall. South to Lantern Court, then east through the East Gate and the clover meadow until six banners mark the Hall of Schools. East, then north, then north again, is Stars. Look around that hearth. Defeat the dummy. Talk to Mentor Lumen. Do not waste the hours."
- `chosen-stone`: "Stone. Patience that does not yield — a keystone that carries the weight and does not boast. Your hearth is open. Down the stair to the Great Hall. South to Lantern Court, then east through the East Gate and the clover meadow until six banners mark the Hall of Schools. South from that hall is Stone. Look around that hearth. Defeat the dummy. Talk to Mentor Quern. Do not waste the hours."
- `chosen-steel`: "Steel. A blade kept flat until it is needed — mail oiled, an anvil bright from honest work, not furniture hung for show. Your hearth is open. Down the stair to the Great Hall. South to Lantern Court, then east through the East Gate and the clover meadow until six banners mark the Hall of Schools. North from that hall is Steel. Look around that hearth. Defeat the dummy. Talk to Mentor Edge. Do not waste the hours."
- `already-chosen`: "You have a School. I can smell the hearth-smoke on you still. Finish first lessons where you chose — look around the hearth, defeat that dummy, talk to your mentor. Down the stair, south to Lantern Court, then east through the meadow until six banners mark the Hall of Schools. Your hearth is there. The bell beneath us can wait until you can stand with others. The oak will still be here when you return."
- `offer-bell`: "You have a School, and first lessons have your name. Good. Now I am trusting you with the first honest question this school has asked in a long time. Listen. A deep bell sounds under our feet — not the cheerful hour-bell, but an old abbey note that rolls through these beams like a cart over wet cobbles. The old bronze is gone. We have an empty oak frame in the Clock Tower to prove it, and the timber still answers as if the metal had never left. I will not invent a cause from a rumour. Examine the Empty Bell Frame in the Clock Tower, the Bell Ledger in the Archive Cellar, and the Listening Stone in the Quiet Chapel. Then return and talk alder here. Bring me facts, not a pretty story."
  - say `1` I will examine the three places. → `bell-active`
  - say `2` What am I listening for? → `bell-why`
- `bell-why`: "Which parts of the sound are true. The frame will tell you the bronze is gone and the wood still pulses. The ledger will tell you what the keepers wrote the night it was taken. The chapel stone will tell you whether the same three slow beats live in the root. Down to the Great Hall. The Clock Tower is east of the North Quad. The ledger is north of Library Stacks, where the air smells of dust and binding-glue. The listening stone is west of the Herb Garden, past the crushed mint and the bees. Bring me facts."
  - say `1` I will go. → `bell-active`
- `bell-active`: "Down to the Great Hall, then. Examine the Empty Bell Frame, the Bell Ledger, and the Listening Stone. Feel the oak. Read the keeper's hand. Set your paw on the chapel root and count the beats. Then talk alder here. I asked you because I need a Collegian who will look before they guess."
- `bell-done`: "The wood remembers. That is enough for the first question. You stood in the empty frame, you read the keeper's ink, you felt the chapel root answer. You did this school a service, and I will not forget who brought me facts instead of a rumour."
- `offer-wakes`: "You already proved the wood can carry a welcome. Something below the Clock Tower has begun to answer. A warmer note, closer than the abbey sound, and it comes up through the floor rather than down from the tower. I would not send you down that stair if I had another pair of eyes I trusted. Piper Mole has been alone in the Silk Gallery too long. He sits on a crate with silk-dust on both paws, and he is afraid. Talk to him. Examine the Stair Rope, the Silk Thread, and the Waking Husk. Then return and talk alder here. One hungry child is not proof of a queen. Look first, then name what you actually saw."
  - say `1` I will descend. → `wakes-active`
  - say `2` What am I looking for now? → `wakes-why`
- `wakes-why`: "Whether anything down there has a mouth yet, and whether that mouth is still a child. East from the North Quad, then down the Clock Tower stair — the rope will pulse in your paw like a living thing. Piper keeps the gallery. The nave is east and south of him, where the husks hang like empty lanterns. Look. Name what you saw. I am counting on you."
  - say `1` I will go. → `wakes-active`
- `wakes-active`: "Down the Clock Tower. Talk piper — he has been holding that dark with a dented tin whistle, and he deserves to be heard. Examine the Stair Rope, the Silk Thread, and the Waking Husk. Then talk alder here. Finish this before the silk learns another name."
- `wakes-done`: "A hatchling is not a queen. You named a child that woke too soon, and that is enough for one Collegian. When three can stand together, we will ask what still sleeps in the cradle south of the nave. Go to class. Eat something warm. The oak will wait."
- `offer-sleeps`: "Three can stand. South of the Cocoon Nave the cradle is no longer empty. I have felt it through the beams — a heavier note than the hatchling. It does not move when the hatchling moves. It waits. I will not send one Collegian into that room. Take two classmates who can lock a move on the same clock as you. Examine the wrapping in the nave — leave him covered. Examine the Still Score. If she squares up, do not invent heroics. Lock together. Then return and talk alder here. This is the work I saved for students I trust to come home."
  - say `1` We will go together. → `sleeps-active`
  - say `2` What are we facing? → `sleeps-why`
- `sleeps-why`: "The next mouth after the hatchling. Not a throne. Not a story. East from the North Quad, then down, east, south, and south again, until the air grows warm and the silk hangs thick as winter curtains. Examine the wrapping in the nave first. Take two classmates. If she stands, lock together. Come home with the score, not a boast."
  - say `1` We will go. → `sleeps-active`
- `sleeps-active`: "Together. South of the nave. Examine the wrapping first — leave him covered. Then the Still Score; the button is the part I cannot see from this blotter. Lock your moves on one clock until she falls. Then talk alder here. The school is watching this one, and I would rather watch you walk back up that stair."
- `sleeps-done`: "You stood in the cradle. You named the score, the button, the three who stood, and Holm. That is enough. You did not invent a monster. You finished a lesson I could not fight for you. Holm kept that stair so first-years would not walk it dark. We will keep his name in the High Study. Go to class. Eat something warm. If your paws are shaking, talk to Fen. Then, when you can stand a cold wind, come back. The grounds east of the meadow have their own hunger, and I will not send you still hungry from this one."
- `offer-moor`: "North from the East Meadow. The Hall stays east for class. The hedge-path bends east onto the moor — do not look for a door on the Infirmary tile. Talk to Shepherd Wren. She has a croft and a missing partner. Whatever is out there, it is not the queen again. Sit. Eat. Then go and look."
  - say `1` I will go north from the meadow. → `moor-active`
  - say `2` What am I walking into? → `moor-why`
- `moor-why`: "Mist. Wet wool. A flock that did not come in." Alder lays the tuning fork across the blotter. "Wren is frightened, and she has earned the right to be. Colm has not come home. I will not name a cause from behind this desk. Bring her facts, not comfort. The bronze we proved gone may be lying somewhere out there. That is a later question. Eat before you go."
  - say `1` I will go. → `moor-active`
- `moor-active`: "North from the East Meadow. Talk wren. The Hall of Schools stays east. I asked you because I need a Collegian who will look before they invent a walker in the fog."
- `watch-active`: "Wren has you. I will not steal her kettle. Bring her facts, then come back when she sends you, or when you have named what the fog took. Eat if you have not. Type north from the East Meadow if you lost the hedge."
- `offer-bronze`: "Wren will not go in, and I will not ask her to. The bronze is in the hill. Holm wrote that it was taken on a wet night. This is where it was taken to. Visit the Barrow Nave. Examine the Abbey Bronze. Then talk alder here. One more after that. Not alone. The thing that walks the fog used our welcome for a mouth."
  - say `1` I will go into the hill. → `bronze-active`
  - say `2` What am I looking for? → `bronze-why`
- `bronze-why`: "Collegium bronze, or the yoke and clapper if the hill has grown around the rest. It should not ring. It will sound the three slow pulses. The Quiet Chapel was telling the truth. Down from the Barrow Mouth. Come home with the fact, not a boast."
  - say `1` I will go. → `bronze-active`
- `bronze-active`: "Into the Barrow Nave. Examine the Abbey Bronze. Then talk alder here. Wren stays at the croft. She is owed that."
- `offer-walker`: "One more. Not alone. The Fog Walker used our welcome for a mouth. Take two classmates who can lock a move on the same clock as you. Visit the Fog Hollow north of the nave. If it squares up, lock together. Then talk alder here. Wren blesses you and stays. Eat after. Sleep after. Nobody yet knows who carried the bronze in there. Do not come back with a guess dressed as an answer."
  - say `1` We will go together. → `walker-active`
  - say `2` What are we facing? → `walker-why`
- `walker-why`: "A tall wet shape that does not keep footprints. Wool and peat. Not a lecture. A hunger that learned to walk. Fog thickens when you lock. The count is still three. When it falls the hollow should smell like rain on a hearth-stone, not sweetness. Come home."
  - say `1` We will go. → `walker-active`
- `walker-active`: "Three Collegians. Fog Hollow. Defeat the Fog Walker. Then talk alder here. The wood and the moor both remember. I would rather watch you walk back to the croft."
- `tally-page`: Alder reads Kern's page without comment, then sets it on the blotter and puts the tuning fork across it to hold it flat. "Three careful animals, three counts, one week. Stoneward Kern does not write a number he cannot stand behind." He looks at the dates rather than at you. "This does not tell me who carried our bronze into that hill, and I will not name a cause from behind a desk. It does tell me the moor was busy before we knew to watch it. That is worth more than a rumour. I am keeping this page. Tell Kern his book was the right place to put it."
- `walker-done`: "The wood remembers. The moor remembers. That is enough for one year. Eat. Sleep. Who took the bronze into the hill — if the walker only learned to use it — is a later question. I will not invent a thief from a fog. Holm's name stays in this study. Colm's stays at Wren's kettle. Go to class."

### Mentor Cinder

- id: `npc-mentor-cinder`
- room: Hearth of Ember (`hearth-ember`)

**Standing line**

Cinder has the grate open and a low fire working in it. "Ember is fire kept in a grate and not up in the rafters. That is the whole difference, and it takes three lessons to learn." She nods at the straw dummy in the corner. "Talk cinder when you are ready to start."

**Tree**

- `welcome` (start): "The grate ticks, and last night's oatcakes were left too near the coals again. Look around this hearth. Name the fire before you feed it. Then attack the hearth dummy in here, mine and not the one Flint keeps out in his orchard, unless you are still learning the spark on his. Come back and talk to me. I will open this School's leaf and ink its stem."
  - say `1` What does the Primer ask? → `craft`
  - say `2` I will go. → `go`
- `craft`: "The Field Primer is your book, not a decoration. I open this School's leaf and ink the stem after you look around this hearth, defeat the dummy, and talk to me. Later the Primer holds ink. Open the book and type ink and the vein's name. Do not skip the dummy. Fire that is not named will bite."
  - say `1` I understand. → `go`
- `go`: "Look around this hearth. Defeat the dummy. I will be here by the grate. The tongs stay hot. So do I."
- `lessons-done`: "The stem is inked. Cast ember at the hearth dummy for the second lesson — a sheltered coal, not a show. After that, the Primer holds one ink. Open the book and type ink and the vein's name."
- `third-lesson`: "The grate is shut and the tongs are on their nail. Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on that Clock Tower stair, finish it first. When he says the grounds will teach the rest, come back and talk to me."
- `third-done`: "This hearth has nothing left to teach you, and I am not going to invent a fourth lesson to keep you here. Each lesson off the grounds leaves one ink in the Primer. I sign the page whether I am standing at your shoulder or not." She checks the grate out of habit. "Keeper Holm kept a stair lit so first-years would not walk it in the dark. Eat something warm before you walk a cold road."

### Mentor Lumen

- id: `npc-mentor-lumen`
- room: Hearth of Stars (`hearth-stars`)

**Standing line**

Lumen has the star-wheel set and a column of figures half finished. "Stars is a bearing written down before you walk. Charts first. Wonder keeps." She taps the straw dummy in the corner with the end of her pen. "Talk lumen when you want to begin."

**Tree**

- `welcome` (start): "Ink, cold glass, lamp-oil. Look around this hearth. Charts before wonder. Then attack the hearth dummy in here, mine and not the one Flint keeps out in his orchard, unless you are still learning the spark on his. Come back and talk to me. I will open this School's leaf and ink its stem."
  - say `1` What does the Primer ask? → `craft`
  - say `2` I will go. → `go`
- `craft`: "The Field Primer is your book, not a wish flung at the night. I open this School's leaf and ink the stem after you look around this hearth, defeat the dummy, and talk to me. Later the Primer holds ink. Open the book and type ink and the vein's name. Write the hour before you name the star."
  - say `1` I understand. → `go`
- `go`: "Look around this hearth. Defeat the dummy. I will be here with the charts. Guesswork dressed as wonder will not pass."
- `lessons-done`: "The stem is inked. Cast azimuth at the hearth dummy for the second lesson. After that, the Primer holds one ink. Open the book and type ink and the vein's name."
- `third-lesson`: "Your chart is rolled and your name is on it. Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish it first. When he says the grounds will teach the rest, come back and talk to me."
- `third-done`: "This hearth has taught you what it holds. Each lesson off the grounds leaves one ink in the Primer, and I sign the page whether I am at your shoulder or not." She notes the date in her own book. "Keeper Holm kept a stair lit so first-years would not walk it in the dark. Eat something warm before you walk a cold road."

### Mentor Edge

- id: `npc-mentor-edge`
- room: Hearth of Steel (`hearth-steel`)

**Standing line**

Edge has four mail shirts hanging oiled behind him and a strap in his paws. "Steel is a blade kept flat until it is wanted, and a stance you can name out loud." He tips his head at the straw dummy in the corner. "Talk edge when you are ready."

**Tree**

- `welcome` (start): "Metal, leather, linseed. Mail hanging oiled and unromantic. Look around this hearth. Name the stance before you swing. Then attack the hearth dummy in here, mine and not the one Flint keeps out in his orchard, unless you are still learning the spark on his. Come back and talk to me. I will open this School's leaf and ink its stem."
  - say `1` What does the Primer ask? → `craft`
  - say `2` I will go. → `go`
- `craft`: "The Field Primer is your book. I open this School's leaf and ink the stem after you look around this hearth, defeat the dummy, and talk to me. Later the Primer holds ink. Open the book and type ink and the vein's name. A sloppy stance is a kindness you have not yet been given."
  - say `1` I understand. → `go`
- `go`: "Look around this hearth. Defeat the dummy. I will be here by the anvil. Excuses stay shorter than the lesson."
- `lessons-done`: "The stem is inked. Cast strike at the hearth dummy for the second lesson. After that, the Primer holds one ink. Open the book and type ink and the vein's name."
- `third-lesson`: "Your blade is on the rack and it stays there. Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish it first. When he says the grounds will teach the rest, come back and talk to me."
- `third-done`: "This hearth is finished with you. Each lesson off the grounds leaves one ink in the Primer, and I sign the page whether I am standing at your shoulder or not." He sets the oil rag down. "Keeper Holm kept a stair lit so first-years would not walk it in the dark. Nobody handed him a medal for it either. Eat something warm before you walk a cold road."

### Mentor Quern

- id: `npc-mentor-quern`
- room: Hearth of Stone (`hearth-stone`)

**Standing line**

Quern has a granite block up on the bench, chalked in lines. "Stone is carrying weight without making a speech about it. Feet first." He looks at the straw dummy in the corner. "Talk quern when you are ready."

**Tree**

- `welcome` (start): "Wet rock after rain. Mason's chalk. The keystone watching the door. Look around this hearth. Weight first. Speech second. Then attack the hearth dummy in here, mine and not the one Flint keeps out in his orchard, unless you are still learning the spark on his. Come back and talk to me. I will open this School's leaf and ink its stem."
  - say `1` What does the Primer ask? → `craft`
  - say `2` I will go. → `go`
- `craft`: "The Field Primer is your book. I open this School's leaf and ink the stem after you look around this hearth, defeat the dummy, and talk to me. Later the Primer holds ink. Open the book and type ink and the vein's name. Carry the weight you named."
  - say `1` I understand. → `go`
- `go`: "Look around this hearth. Defeat the dummy. I will be here. I do not hurry a sentence, and I will not drop this one."
- `lessons-done`: "The stem is inked. Cast keystone at the hearth dummy for the second lesson. After that, the Primer holds one ink. Open the book and type ink and the vein's name."
- `third-lesson`: "Chalk is down. Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish it first. When he says the grounds will teach the rest, come back and talk to me."
- `third-done`: "This hearth is done with you, and I will not stretch it out. Each lesson off the grounds leaves one ink in the Primer, and I sign the page whether I am at your shoulder or not." He puts his paw on the keystone. "Keeper Holm kept a stair lit so first-years would not walk it in the dark. He was a mole who understood weight. Eat something warm before you walk a cold road."

### Mentor Briar

- id: `npc-mentor-briar`
- room: Hearth of Thorns (`hearth-thorn`)

**Standing line**

Briar has the shears out and a pile of cut stems at her feet. "Thorns is growth that knows where the path is. Anything can grow. Not everything guards." She nods at the straw dummy in the corner. "Talk briar when you want to start."

**Tree**

- `welcome` (start): "Green light. Crushed sap. Shears where you can reach them. Look around this hearth. The plants are listening. Then attack the hearth dummy in here, mine and not the one Flint keeps out in his orchard, unless you are still learning the spark on his. Come back and talk to me. I will open this School's leaf and ink its stem."
  - say `1` What does the Primer ask? → `craft`
  - say `2` I will go. → `go`
- `craft`: "The Field Primer is your book, not a pressed flower. I open this School's leaf and ink the stem after you look around this hearth, defeat the dummy, and talk to me. Later the Primer holds ink. Open the book and type ink and the vein's name. Growth that is not named will snare you."
  - say `1` I understand. → `go`
- `go`: "Look around this hearth. Defeat the dummy. I will be here among the living walls. The shears stay sharp. So do I."
- `lessons-done`: "The stem is inked. Cast briar at the hearth dummy for the second lesson — a vine trained, not a snare left to wander. After that, the Primer holds one ink. Open the book and type ink and the vein's name."
- `third-lesson`: "Shears are hung up and I am leaving them there. Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish it first. When he says the grounds will teach the rest, come back and talk to me."
- `third-done`: "You are done in here, and I will not prune a student who has stopped needing it. Each lesson off the grounds leaves one ink in the Primer, and I sign the page whether I am beside you or not." She looks along the trellis. "Keeper Holm kept a stair lit so first-years would not walk it in the dark. Eat something warm before you walk a cold road."

### Mentor Mist

- id: `npc-mentor-mist`
- room: Hearth of the Veil (`hearth-veil`)

**Standing line**

Mist stands where the curtain light falls in strips and does not step out of it. "The Veil is work done without announcing it first. Students find that harder than fire." She indicates the straw dummy in the corner. "Talk mist when you are ready."

**Tree**

- `welcome` (start): "Lavender. Cold stone. A mirror that is only a mirror until you waste time in it. Look around this hearth. Then attack the hearth dummy in here, mine and not the one Flint keeps out in his orchard, unless you are still learning the spark on his. Come back and talk to me. I will open this School's leaf and ink its stem."
  - say `1` What does the Primer ask? → `craft`
  - say `2` I will go. → `go`
- `craft`: "The Field Primer is your book. I open this School's leaf and ink the stem after you look around this hearth, defeat the dummy, and talk to me. Later the Primer holds ink. Open the book and type ink and the vein's name. Quiet work is still work. Do not skip the dummy because the room is dim."
  - say `1` I understand. → `go`
- `go`: "Look around this hearth. Defeat the dummy. I will be here in the quiet. The silence is not empty. Neither am I."
- `lessons-done`: "The stem is inked. Cast shade at the hearth dummy for the second lesson. After that, the Primer holds one ink. Open the book and type ink and the vein's name."
- `third-lesson`: "The curtain is open. You will notice that. Talk to Headmaster Alder in the High Study, up from the Great Hall. If he has you on the Clock Tower stair, finish it first. When he says the grounds will teach the rest, come back and talk to me."
- `third-done`: "This hearth is finished with you. Each lesson off the grounds leaves one ink in the Primer, and I sign the page whether I am at your shoulder or not." She lets that stand. "Keeper Holm kept a stair lit so first-years would not walk it in the dark. That is the only reason I will tell you to eat something warm before you walk a cold road."

### Groundskeeper Tansy

- id: `npc-groundskeeper-tansy`
- room: Herb Garden (`herb-garden`)

**Standing line**

"The trick with living things is to look before you fix. Especially if your first idea is more water. My first idea used to be more water. We lost a cactus that way, and I still smell that dry little disaster when I walk the rosemary path. The moonmint in the greenhouse is hanging like wet washing. A bee has more dignity than my last guess. Talk tansy if you will help."

**Tree**

- `welcome` (start): "The trick with living things is to look before you fix. Especially if your first idea is more water. My first idea used to be more water. We lost a cactus that way, and I still smell that dry little disaster when I walk the rosemary path. The moonmint in the greenhouse is hanging like wet washing. A bee has more dignity than my last guess. Talk tansy if you will help."
- `peat-mint`: "Peat-mint later, if the cut still stands. I will not send you for a sprig while a barrow is teaching you weather. Look before you pick. The rosemary path will wait. If your paws are shaking, Fen is east of the Porter Lodge."

### Heron Midge

- id: `npc-heron-midge`
- room: Heron Post (`heron-post`)

**Standing line**

Midge stands on one leg in the shallows with her spear grounded, and she does not shift when you come up the bank. "Nett will have told you about tins. I will tell you about the nail." She looks at the post beside her, where the nail is bright and empty. "I hung a whistle there eleven years ago, so anybody cutting a rope downstream would be heard doing it. Somebody took the whistle and left the nail. That is a different crime than stealing a boat, and a worse one. Talk midge."

### Healer Fen

- id: `npc-healer-fen`
- room: Infirmary (`infirmary`)

**Standing line**

"Rest and ask for help when you need it. Nobody earns extra courage by pretending not to hurt. This room smells of soap, rosemary, and warm beeswax for a reason. Helping Tansy? Those roots need air as well as water. Clear the drainage and use a clean jug; never add mysterious potions to an unhappy plant. Sit if you need to. The breathing wheel is there for anyone whose paws are still shaking."

**Tree**

- `welcome` (start): "Sit if you need to. Nobody earns extra courage by pretending not to hurt. This room smells of soap, rosemary, and warm beeswax for a reason. Helping Tansy? Those roots need air as well as water. After a hard stair or a cold road, ask if you can feel your paws. The breathing wheel is there. Honey is there. I will put the work down."
- `after-colm`: "Sit. Honey first. Can you feel your paws? The wheel on the wall is for anyone whose breath is still trying to run. Wren sent you. That is the right order. Two keepers. Two witnesses who lived. You do not have to be brave at me. Breathe. Then eat something warm."

### Porter Bramble

- id: `npc-porter-bramble`
- room: Lantern Court (`lantern-court`)

**Standing line**

"This is a school. We train woodland students to face real dangers in the Greenwood. Typed commands are how you learn. Type look, say hello, take key, then north to reach the Great Hall. Type talk porter and answer with say 1 or say 2 if you want more."

**Tree**

- `welcome` (start): "Welcome, new Collegian! I am Porter Bramble. Come in under the oak — the blue lanterns hang in the leaves like cold glass, and the well at the roots is cold and ready if you have been practicing too hard. This is the Collegium — a school. Woodland students learn here to face real dangers in the Greenwood. This is where the animals are trained. Typed commands are how you learn. Walk with me through Arrival. The coat is worn. The whistle is for calling help. I have waited through worse weather than you."
  - say `1` What should I type first? → `commands`
  - say `2` Why does the Greenwood matter? → `greenwood`
  - say `3` I am ready to walk. → `ready`
- `school`: "The Collegium is a school. Woodland students learn here to face real dangers in the Greenwood — not a storybook wood, but the real one beyond these lanterns, where the paths get wet and the night does not wait for a first-year to finish a sentence. This is where the animals are trained. Typed commands are how you learn. The oak has heard every arrival. It is still listening."
  - say `1` What should I type first? → `commands`
  - say `2` Why does the Greenwood matter? → `greenwood`
  - say `3` I am ready to walk. → `ready`
- `commands`: "Type look to see Lantern Court — the oak, the drifting blue lanterns, the mossy well, the noticeboard with its curling paper. Type say hello so the roll is not empty beside your name. Type take key; it is still in my paw, worn smooth by other first-years who thought they could skip it. Then type north to reach the Great Hall, where the stone still holds the day's warmth."
  - say `1` Repeat the school’s purpose. → `school`
  - say `yes` I understand. → `ready`
  - say `no` Say that again more slowly. → `commands`
- `greenwood`: "Outside these lanterns the wood is not a storybook. The Greenwood has wet paths, hungry nights, and things that do not wait for a first-year to finish a sentence. Students train here first — look, speak, take, walk north — so they are not surprised later. I have waited through worse weather than you. The whistle is for calling help, not for decoration."
  - say `1` What should I type first? → `commands`
  - say `2` I am ready. → `ready`
- `ready`: "Good. Stay with me through Arrival. Type take key if you have not — the metal is warm from my paw — then type north to reach the Great Hall. I will mention this again in the next room. I always do. Nagging is in the coat. The lanterns will still be drifting when you look back."
- `nag-look`: "A new room, and you still have not typed look. I described it. That does not count. Type look. I will walk. I will ask again."
  - say `1` What should I type first? → `commands`
  - say `2` I am working on it. → `nag-persist`
  - say `3` Please stop following me. → `nag-persist`
- `nag-speak`: "Fresh stones. Same problem. I have not heard say hello. The roll is empty next to your name. Type say hello. I can wait. I have waited through worse weather than you."
  - say `1` What should I type first? → `commands`
  - say `2` I am working on it. → `nag-persist`
  - say `3` Please stop following me. → `nag-persist`
- `nag-take`: "Do you see my paw? The key is still in it. Type take key. I will mention this in the next doorway. And the one after that. I am a porter. Nagging is in the coat."
  - say `1` What should I type first? → `commands`
  - say `2` I am working on it. → `nag-persist`
  - say `3` Please stop following me. → `nag-persist`
- `nag-arrive`: "This is a fine room. It is not the Great Hall. From Lantern Court, type north. I will trot. I will whistle. I will not get bored. You might."
  - say `1` What should I type first? → `commands`
  - say `2` I am working on it. → `nag-persist`
  - say `3` Please stop following me. → `nag-persist`
- `nag-persist`: "Stop following you? No. Arrival is not finished. I am wonderfully patient. Type say 1 if you want the commands again."
  - say `1` What should I type first? → `commands`
  - say `yes` Fine. Tell me again. → `commands`
  - say `no` I will type it myself. → `ready`

### Librarian Quill

- id: `npc-librarian-quill`
- room: Library Stacks (`library-stacks`)

**Standing line**

"Books may travel. Their pages should generally travel together. I have a finger marking a gap in the lantern-wren guide — the bird that carries its own small lantern through dusk — and the green lamp is making a patient circle on an empty place. If something has gone astray, we begin by finding out what happened. Blame is a poor bookmark. Talk quill if you will help."

**Tree**

- `welcome` (start): "Books may travel. Their pages should generally travel together. I have a finger marking a gap in the lantern-wren guide — the bird that carries its own small lantern through dusk — and the green lamp is making a patient circle on an empty place. If something has gone astray, we begin by finding out what happened. Blame is a poor bookmark. Talk quill if you will help."
- `abbey-rubbing`: "If you bring a rubbing of an abbey mark from the moor stones, I will keep it with the lantern-wren gap and not invent a second mystery from the chalk. Paper first. Accusations never. The stacks will wait while you count to eight."
- `abbey-rubbing-kept`: "You brought the rubbing. Three circles, honest charcoal, cheap paper. I will keep it with the lantern-wren gap. The eighth stone is still a fact. Paper first. Accusations never."

### Stoneward Kern

- id: `npc-stoneward-kern`
- room: Lintel Field (`lintel-field`)

**Standing line**

Kern has a tally-board propped against a fallen lintel, and every stone in the field carries a chalk dot. "Eight. I counted them last winter, I chalked them, and I wrote eight in the book." He puts his paw flat on the ninth stone. "This one has a fresh scratch and no dot. I did not put either of those there, and I have been the only animal in this field since the frost. Talk kern if you want the rest of it."

### Reedcutter Sile

- id: `npc-reedcutter-sile`
- room: Reed Mere (`reed-mere`)

**Standing line**

Sile has a bundle of cut reed under one arm and her knife corded down against her hip. "Hobb sent you, or you wandered out here. Comes to the same thing." She tips her chin at the water. "I have cut this mere eleven years. Last week I called to my brother across it and got nothing back, and he was standing in the reeds hearing me fine. Whatever is sitting on that water is keeping things. Talk sile and I will show you. Do not drink it."

### Skipper Marram

- id: `npc-skipper-marram`
- room: River Landing (`river-landing`)

**Standing line**

"Mind the boards, they are slick." Marram wrings the water out of one sleeve. "Four boats were tied here this morning. Three now. The painter at the willow bend was cut clean through, not frayed, and the biscuit crate is gone out of the cargo hollow. Tar was still soft on the rope end, so it happened in the night. Talk marram when you want the bank walked properly."

### Piper Mole

- id: `npc-piper-mole`
- room: Silk Gallery (`silk-gallery`)

**Standing line**

"Don't— don't go past the nave alone. I keep this stair because someone has to. The silk has started to sing, warm as a living thing, and a hatchling already woke. Alder sent you? Good. Examine the threads. East is the cloister. Please come back."

**Tree**

- `welcome` (start): "I am Piper. I keep the stair below the empty frame, and I am not brave enough for what woke. Sit a moment if you can stand the hum. The silk is singing — not a pretty song, a tight, hungry note that runs from pillar to pillar and up the oak. A hatchling came out too early. If Alder sent you, stay and look. Examine the threads. Feel how warm they are. East is the cloister, where the webs hang thicker. South of that is the nave. Don't leave me guessing. I have been alone down here with a dented whistle and a crate, and I would rather hear what you name than invent a worse thing in the dark."
  - say `1` What woke? → `woke`
  - say `2` Who is the queen? → `queen`
- `woke`: "A silk-hatchling. Satchel-sized. Hungry. It clicked at me like it wanted a name, and its legs made that dry paper sound — the same sound these threads make when the deep bell rolls through the tower. It should not have woken. The husk in the nave is split and still warm. If it squares up, finish it properly and then get out. Do not leave it half-done and walk away; it gets back up, and I have watched that happen. I already ran once. I am not proud of that. The whistle was in my teeth the whole way up."
  - say `1` Who is the queen? → `queen`
- `queen`: "South of the nave. The Deep Cradle. Something bigger is still sleeping there — I have felt it through the silk, heavier than the hatchling. It does not move when the hatchling moves. It waits. It will not wake for one Collegian. I can't hold this gallery and watch that room. Bring two classmates. Lock your moves on the same clock, the way Flint taught you in the orchard. Then go back up and talk alder before I lose my nerve again. Please. The lantern-light from the tower is getting thinner, and I do not like what the threads do in the dark."
- `holm-named`: "Holm. His name was Holm. He put me on this crate and went south with the lantern-hook on his belt. I ran. I am not proud of that. Leave him covered. Do not cut the silk. Come back up even if you are angry. The lantern-light from the tower is getting thinner, and I will keep this stair if the class comes by."
- `after-queen`: "You came back. I am still on the crate. I am not all right, and I will not pretend. Holm kept this stair so first-years would not walk it dark. I will keep it if you come by. Go eat something warm. Fen will sit with you if your paws are shaking. I am the one who lived. I can say his name."

### Instructor Flint

- id: `npc-instructor-flint`
- room: South Orchard (`south-orchard`)

**Standing line**

"Which weapon do you want to try? Type take Practice Sword, take Practice Staff, or take Practice Sling. Name it in full. Then type attack dummy. The dummy comes back after a lesson. If you mean to square up with a classmate standing in this orchard — the hare or mole or fox beside you, not a story-name — type duel and their given name. Both of you must agree."

**Tree**

- `ask` (start): "Which weapon do you want to try? The sword, the staff, or the sling — they wait on the rack under the apple boughs, oiled and unromantic, while fallen blossom collects along the path. Type take Practice Sword, take Practice Staff, or take Practice Sling. A good fit steadies the paw. A poor fit feels unwieldy — we can talk about why. The dummy comes back after every lesson. A classmate standing with you is another matter: type duel and their given name, and wait until they agree."
  - say `1` Why does a weapon fit? → `fit`
  - say `2` How do I practice? → `practice`
  - say `3` I will try another weapon. → `switch`
- `fit`: "Each species has one proficiency. Hare and fox like the sword. Badger and mole like the staff. Mouse and squirrel like the sling. A fit adds a little strength. A poor fit takes a little away."
  - say `1` How do I practice? → `practice`
  - say `yes` I will try a better fit. → `switch`
  - say `no` I will keep what I have. → `keep`
- `practice`: "Type attack dummy to begin. During the lesson, attack continues. Ember still works here as practice. When your Field Primer inks a School leaf, cast that instead. Finish before you walk away. If you fall, you wake in the Infirmary, where Fen keeps clean linen and a pot of honey. If you mean to practice against a classmate standing with you, type duel and their given name. They must type duel accept. You cannot duel anyone who is not standing here with you."
  - say `1` Why does a weapon fit? → `fit`
  - say `2` I understand. → `keep`
- `misfit`: "That weapon is a poor fit for your kind. It will feel unwieldy, and your strikes will be a little weaker. Talk with me, or try another from the rack."
  - say `1` Why does a weapon fit? → `fit`
  - say `2` I will switch. → `switch`
  - say `yes` Show me the better choice. → `switch`
  - say `no` I will keep it anyway. → `keep`
- `switch`: "Good. Type take Practice Sword, take Practice Staff, or take Practice Sling — the full name. If you type take weapon I will make you choose which one."
- `keep`: "As you wish. Feet steady. Eyes open. Pride in your pocket. The apple trees will keep their crooked watch, and the dummy will still be here when you are ready to type attack dummy — or duel and a classmate's given name, if they are standing with you and they agree."
- `fog-lock`: "If the fog squares up, you lock together. Then Fen. The dummy is still here if you need the clock in your paws first. Type attack dummy. Eat after. Straw in an orchard is practice. The moor is not."

### Deckhand Nett

- id: `npc-deckhand-nett`
- room: Willow Bend (`willow-bend`)

**Standing line**

Nett sits on a willow root with his boots in the water, turning the empty cord at his neck over and over. "I know what this jerkin looks like. I wore it two months and I carried tins in it." He holds the cord out so you can see there is nothing on the end of it. "I never cut a rope. They gave the knives to the ones who liked that part. I do know which crate in the cargo hollow was the College's, because I am the one who carried it out. Talk nett if you want it back."

### Foldhand Hobb

- id: `npc-foldhand-hobb`
- room: Wool Shed (`wool-shed`)

**Standing line**

Hobb is hanging wet fleece on the pegs and counting them under his breath as he goes. "Eleven pegs, ten full. That is not the number troubling me." He nods at the empty bell-loop by the door. "The flock went out counted and the bell did not come back with them. A bell does not wander off on its own, and a fold does not go quiet for nothing. If Wren has had you read the waystone already, talk hobb and I will show you a byre that should not be empty."

### Shepherd Wren

- id: `npc-shepherd-wren`
- room: Wren's Croft (`wren-croft`)

**Standing line**

Wren has the kettle on and has not sat down since you came in. "Sit, if you like. I cannot." She glances at the door again. "Colm has not come in. The flock was due at dusk yesterday and his peg is empty. Eat something warm before you go naming anything you saw in the mist. Talk wren when you are ready."

**Tree**

- `welcome` (start): "I am Wren. Sit. The kettle is on, and the oatcakes are still warm enough to matter. Colm has not come in. The flock was due at dusk yesterday, and the peg where his crook should hang is empty. An empty peg is not proof of anything walking. Eat. Then examine the waystone on the track south of here. Come back and talk wren. Alder sent you? Good. Whatever is out on that moor, it is not the queen again."
  - say `1` Who is Colm? → `colm`
  - say `2` I will look. → `go`
- `colm`: "My partner. He counts sheep twice and writes the number down, the same way Alder does with facts. He went out to look at standing stones that were not in last winter's count. I told him not to go. Eat something. Then go and look. I am owed the truth, not a kind version of it."
  - say `1` I will look. → `go`
- `go`: "South to the waystone. Examine it. Then talk wren here. The oatcakes will keep. I will not."
- `fork-done`: "The waystone told you the same three counts the chapel knows. East is the fold. The latch was lifted, not broken. Examine the empty fold and Colm's crook. There has been a mist-crow on that rail three days running and it has worn the moss off the top of it. Defeat it if it squares up. Then talk wren. I will have the kettle too hot by then."
- `flock-done`: "The stones next. They were not in last winter's count. Colm went to look. I told him not to. East from the fold. Examine the abbey mark and the new stone. Then talk wren. I will not go with you. Someone has to keep the kettle."
- `stones-done`: "Last winter there were seven. There are eight. North of the stones the peat-cut opens, then the barrow mouth. I hate sending you. If you find him, you come to me before you go to Alder. I am owed that. Examine the wool wrap. The barrow-guard is peat-and-bone that is not a dog. Then talk wren."
- `barrow-done`: "You found the spare cloak. Now the lip of the barrow. Examine what the fog took. Then come to me. Do not go to Alder first. I asked you that already."
- `after-colm`: "Put the kettle down. I put it down too hard. Did you tell him anything? No. Do not answer that. I hate the question. Go to Fen. Sit. Honey. Tell him if you can feel your paws. I will keep this fire. I will not go into the hill."
- `stay`: "Alder can have the bronze. I will not go in. The kettle is for the living. If the fog squares up, you lock together. Then Fen. Then you come back here and eat."
- `tally-page`: Wren reads Kern's page twice and then puts the kettle down without pouring anything. "Hobb's bell. Sile's mere. Kern's stone. Three animals who count things properly, all wrong in the same week, and none of them came to me." She hands the page back and does not soften it. "That is not comfort and I will not pretend it is. Take it up to Alder. He is owed facts as much as I am, and he is the one who can do something with a date."
