# 2026-09-07 — Ticket 018 classroom load

## Intent

Prove 30 Collegians can share the courtyard and leave crash-safe logs for tomorrow's class. Do not log student speech.

## Machine

Home desktop, branch `ticket-018-classroom-load`.

## What changed

- 30 signed-in client simulation in CI (localhost only; refuses Render)
- Process logs for seat, command verb, duration, rate limits, and redacted crashes
- `admin audit` empty text now says it is the teacher-action log, not student say

## PRD / ADR

- PRD Appendix E Ticket 018, 23.1, 24.6, 25, 31.5
- ADR-0025

## Classroom note

The school counts how many students sat down and which words they typed (`look`, `north`), not what they said to each other.

## Next

Ticket 019 is Design Sprint DS-001 (semantic colour). Do not start it unless the owner says next.

## Open questions

A live class can still fail for network or Render reasons the localhost simulation cannot see. Watch the dashboard logs.
