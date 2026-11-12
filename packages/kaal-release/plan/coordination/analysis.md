# Coordination: analysis

The CTO handover asked seven questions. Evidence is from the repository and the open pull request list of 12 Nov 2026. Nothing was run.

## 1. Where it belongs

In the `kaal-release` Skill, as a script (Owner decision, 12 Nov). The kaal-release PLAN (#1350) constrains how:

- F5/I2: shipped files hold no KAAL identity. The Script therefore carries no collector, control or branch-lineage name. KAAL's conventions are supplied by a **declaration the consumer owns**. KAAL's declaration lives in `engineering/release-management/` (Delivery, not shipped).
- N2: no runtime dependency on KAAL. The Script cannot import the existing KAAL code.
- N3, T9: written for a Skill-only 0.0.1, and amended (see 00-changes.md).
- I3 and F3: the Skill never forces a decision. "One promotion in flight" is therefore a declared policy, not a built-in. If it is not declared, the Script reports so.
- I9, F8: Release owns the decision whether progression is allowed. The Script lists recommendations, not verdicts.

## 2. What exists and is reused

- **track Work** (old release-management/C7: #1363, #1364) is on the blocked `kaal/engineering-release-management` collector, not on `main`. Its gatherer already reads open pull requests, review state at the head commit, unresolved threads, behind-base, auto-merge, CI per check (newest run of each name) and collector distance to `main`. Its sort already yields "branch with no pull request" and "collector with no promotion pull request". It has no priority, no dependency, no SYNC purpose, no REVISE and no pair invariant. Its ideas are ported, not imported (N2). Its old id C7 now belongs to the DO template. Moving branches to conform is acceptable (Owner, 12 Nov).
- **C12 / #1435** derives a pull request TYPE from the title and a registry of types from the templates. Only the PLAN and ACT templates are on `main`. SYNC, PROMOTION and DO templates arrive with #1441 to #1445. Until then those TYPEs are "unsupported", and the Script reports it.
- **kaal-engineer-skill** checks Skill conformance (T7). Whether it accepts a `scripts/` directory is unverified.

## 3. Input and output contract

See requirements.md (F2 to F4). Input is a facts file plus a declaration file. Output is an ordered list and a separate "not judged" list.

## 4. Promotion SYNC vs development SYNC

GitHub cannot say; the SYNC template's Reason chapter is prose and is not parsed. What is derivable is structural:

- A SYNC whose base is the collector of the **declared current candidate**, or of an open promotion, is a promotion SYNC.
- A SYNC into any other collector is a development SYNC.
- Which collector is the candidate is CPO priority, so it is declared. With no declaration the SYNC's purpose is UNKNOWN and reported.

## 5. Detecting an incomplete promotion and the next candidate

The promotion lane is busy while an open promotion request into the target exists, or an open promotion SYNC exists. It is released when the promotion request is **merged**, a GitHub fact. "Collector ahead of `main`" must not be used: promotions squash, so a promoted collector that survives looks ahead forever and would produce a false OPEN PR (a trap in the old track Work sort). The next candidate is the first declared candidate that is not yet promoted, and the next action for it is OPEN PR (SYNC) when behind the target, or OPEN PR (PROMOTION) when fresh and no promotion request exists.

Live observation: the open list on 12 Nov shows two PROMOTIONs into `main` (#1428 and #1440) and SYNC #1430. From GitHub alone the current pair cannot be told. This is the case the declared candidate settles.

## 6. First increment

The pure judge, a runner on a facts file and a declaration file, and the Cases. No gatherer.

## 7. Outside the increment

See 00-changes.md.

## Assumptions

- Review is current only if it names the head commit.
- A missing or ambiguous fact is reported, never guessed.
- The SYNC convention (merge commit into the collector) and the squash promotion into `main` hold as recorded in the Delivery target.
