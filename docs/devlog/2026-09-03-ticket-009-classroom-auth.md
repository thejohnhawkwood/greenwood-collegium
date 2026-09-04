# 2026-09-03 — Ticket 009 classroom authentication

## Intent

Replace temporary identity in production with classroom accounts: owner bootstrap, invite, password, session, sign-in, sign-out, and disable.

## Machine

Home desktop, branch `ticket-009-classroom-auth`.

## What changed

- Sessions and invites tables plus repository methods
- Argon2id password hashing
- HttpOnly session cookie
- Production sockets refuse guests
- Classic sign-in, invite, and bootstrap forms

## PRD / ADR

- PRD Appendix E Ticket 009, 10.1, 14.4
- ADR-0005, ADR-0013

## Classroom note

An invite is a one-time key. The server stores only a hash of that key. The password is hashed with Argon2id. The browser never chooses who you are.

## Next

Ticket 010: reconnection and idempotency.

## Open questions

Teacher password-reset tokens are not in this slice. Movement mid-session is still in memory until disconnect writes `roomId` back.
