# C16 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The rule ended up small: one route table and one GREEN test, read from the head's own effective rulesets, inside the existing `Promotion Source` check. No registry, record, new context or ruleset change.
- Splitting the code by what it may touch worked: `promotionSource` and `readRequired` read nothing, the script reads GitHub, and the stub for the GitHub CLI lets one Case run the whole path (green, red, pending, unreadable).

## Learned

- Three earlier designs were wrong in the same way: they invented machinery (a registry, qualifier records, a second context) where the branch's own ruleset already says what passing means. The Owner's "smallest possible path" and the CPO's "GREEN for every stock" removed all of it.
- A node:test file is not a Case here: Cases export `id`, `tests`, `title` and `run`, and an exported `run` collides with a helper of the same name.
- "Latest run" needed care: the newest run decides, but only on the exact commit and by the required app, and a newer run still in progress is not green. The first draft let an in-progress run hide a completed one, which would have qualified a head on stale evidence. The CPO's condition 1 is what caught it.
- Real data mattered: the tip of a ready collector carries reruns after a first failed `Branching` run, so "no run ever failed" would have blocked every promotion.

## Lacked

- The job does not yet supply `KAAL_HEAD_SHA` and a token. Promoted before the `.github` Change, this DO would make every promotion exit 2. The `.github` Change is a separate step and must come first.
- A definition of full PDCA GREEN for collectors: it is whatever the collector ruleset requires, and that ruleset's Change is not written.
- Classic branch protection is not read; this repository uses rulesets only.

## Longed For

- The `.github` Change (head sha, read-only token) on `main`, then promotion of this DO, then the Owner's `wire/*` ruleset so #1705 can travel.

## Follow-ups

- **C16 is a bridge, to be replaced.** Owner (15 Nov 2026): keep this trajectory, extending the existing Promotion Source check, but it will be replaced by a control in the new ruleset structure (one ruleset per target: promotion = `main`, integration = `kaal/**`, hotfixing = `hotfix/*`, wiring = `wire/*`, publishing = tags, each with its own checks). When that structure exists, the route table and the GREEN rule move into the promotion ruleset's own control and `Promotion Source` retires with F2 freshness getting its own required home. Nothing here should be built to outlive that.
