# Classroom roles

The Greenwood Collegium is managed by the teacher. Students may play, write, test, or code at different depths. Agents assist; they do not own the product.

## Owner / teacher

- Philip Bird is product owner and repository maintainer.
- Creates accounts and invites when auth exists.
- Reviews and merges pull requests.
- Operates Render. Agents do not receive production secrets.
- Decides when a design sprint may start.

## Student player

- Signs in with a classroom account (later tickets).
- Types commands. Does not need to read the code.
- Reports bugs with fictional or approved display names only.

## Student contributor

Bounded work only:

| Ladder | Typical work | Touches |
|---|---|---|
| Writer | Room or help prose | `packages/content/rooms` |
| Tester | Repro steps, extra cases | `*.test.ts`, issue reports |
| Coder | One command or one bug | a single package plus tests |
| Observer | Read README, PRD, diffs | no write access required |

Student content must be original, school-appropriate, and free of classmate personal information.

## Agent

- Reads `docs/context/CURRENT.md` first.
- Executes one issue-sized ticket.
- Does not merge its own pull request.
- Does not deploy Render or rotate secrets.

## Reviewer / public

The repository is public. Outsiders may open issues. They never receive student data or production credentials.
