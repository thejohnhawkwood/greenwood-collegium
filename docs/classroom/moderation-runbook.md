# Teacher controls and the next classroom reset

## Before the next class

Deploy the reviewed change through the normal human-controlled release process and
apply migration `0007_classroom_moderation.sql` with the existing migration command.
Production must report PostgreSQL persistence; memory mode is a temporary local preview.
Sign in as the owner and open **Roster → Full student reset → Preview reset**.

The preview counts student accounts, characters and old student invites. A full reset
permanently deletes those accounts, their sessions, character progress, quests, held
items and personal starter items. It disconnects their live clients. It preserves staff
accounts and retained speech records. Type **RESET STUDENTS** to execute the reviewed
reset, then generate a fresh batch of student invites. If the classroom changed since
the preview, review a fresh preview first. No live reset was executed by the agent.

## Associate each student privately

Under **Roster → Unused invites**, each token has a **Permanent reference**. You can
also **Download unused tokens** as a text file or **Download class list** as CSV.
You may generate up to 200 student invites in one batch. Put the real student's
name beside the token in your private class list outside this repository. Give
that student the corresponding token. After redemption the teacher download still
keeps the token, hash, username, and Collegian so you can join your private name
list locally. Do not put real names into the game's login or Collegian fields,
and do not upload a class list to the server.
Search the roster by username, character, or reference. Names and IDs are selectable.

## Admit and moderate

- **Approvals:** review the submitted login and character together. Approve both to
  admit the student, or enter feedback and reject so they can try again using the same
  account. Pending/rejected names never enter player presence or room speech.
- **Mute:** stop that account's speech for the selected duration; other play continues.
  **Unmute** releases it early.
- **Timeout:** stop play and disconnect until expiry. **End timeout** releases it early.
  Reconnecting or changing browsers does not bypass a timeout.
- **Pause student chat:** stop student speech across every room while staff can still
  speak. **Resume student chat** restores it. This setting survives restart.
- **Disconnect:** end the current connection; the student may reconnect.
- **Disable account:** revoke access and disconnect. **Restore account** permits a new
  sign-in; existing expired/revoked sessions do not become valid again.
- **Remove character:** permanently remove character progress and owned/personal items,
  leaving the login to submit a new character for approval.
- **History:** review recent teacher actions. If an operation reports an error, refresh
  the roster before retrying: an applied restriction/reset may have succeeded even if
  its separate audit write failed.

## Read a semester's speech

Open **Speech**, choose a **Class day**, and read accepted `say` from every room in
chronological order. Days/times in the pane use America/Edmonton. Messages include the
speaker's name at the time, login and room, with account/character/invite references
available in details. Automatic updates append without pulling your reading position.
Turn updates off to read a fixed set; use **Load next 200 messages** or **Check for newer
messages** as needed. The day selector refreshes while open.

**Export this day as text** downloads all retained messages for that day, including
UTC timestamps and stable references. Save exports in a private school-approved
location outside the checkout. Match the reference to your private student list if
an incident needs follow-up. Deleting/resetting an account does not erase its retained
speech. The application does not record chat from before this feature was deployed.

The live database retains six calendar months. Old entries disappear from reads at
expiry and are physically pruned at startup and hourly. Exported copies and database
backups are separate; manage their retention in the school's normal process. If speech
storage is unavailable, the server rejects new speech instead of silently delivering an
unrecorded message. Students see the recording notice during creation and approval.

## Layout and next playtest

The staff pane occupies the right tree's space on wide screens. On narrow screens it
stacks below the game and can be collapsed. Typed commands remain the main game input.
Students receive no teacher pane, roster or log access.

During the next school-browser check, scroll up while peers speak/arrive, verify the
new-message button restores live following, inspect the open species menu, and compare
NPC blue/player blue, green items, red combat, gold quests and grey narration. Ask
students whether category labels and contrast help them follow events. No separate
classic UI needs to be retained for future iterations.
