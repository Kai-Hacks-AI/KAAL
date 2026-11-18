# C71 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Walking the recorded PLAN, DO, ACT and PROMOTION of release/C65 with the draft model made the model honest: a question that could not be answered from the files became a recorded mismatch (M1 to M9) and was not smoothed over. Splitting the DO into the model first and the views after kept each pull request small, as the Owner asked. The status vocabulary (normative, observed, proposed) paid off in the CPO review: when the semantics changed, a relationship moved or was renamed in one row, and the Cases still said what was Owner-confirmed.

## Learned

I drew `PR realizes Change` as normative because the Change Definition says "a pull request is one realization of a Change". A Definition's loose sentence is not a relationship: the CPO review showed that a PR carries a Diff, names a Change and is the context in which Controls are evaluated. The same review renamed the Owner's confirmed words (`answers`, `tests`) to `refines`, `satisfies` and `verifies`, replaced `exercises` by `Source fulfills Test Case`, and made "Test Case" the object name. Each was cheap to apply because the repository keys and ids were never renamed. The collector went stale while the DO waited: main's newer `verify Stages` judge (#1927) failed the DO until a pure SYNC brought it in.

## Lacked

A Case that checks the model's claims against the Definitions that own them: M10 was found by the reviewer, not by a Case. A single place for the lists of objects and relationships in each view: they repeated what the view's diagram already says, and I recomputed them by script on every vocabulary change. The Owner's decision on the relationship words before the PLAN, so that the Cases could have named them once.

## Longed For

Views that are generated from the model's diagram and tables, not copied from them, without a tool that becomes a second source of truth. A written Owner decision on whether `refines` is the right word between a goal (Intent) and a Requirement.

## Follow-ups

- Each PR template names its view and carries the INFORMED chapter (T916 turns GREEN): a `.github` Change of its own, in release's template alignment after release/C69.
- The process control (verify Envelope) and the content control for the INFORMED chapter: separate Changes, not part of C71.
- The wording of the Change Definition, "a pull request is one realization of a Change" (M10): kaal-change's own Change.
- Open questions 1, 2 and 4 to 11 in `change.md` still need the Owner. The model lives in `engineering/metamodel/`, as the CPO decided; no capability owns it yet.
- `drafts/` in this Change folder is the PLAN's history and holds the older vocabulary. The authoritative files are `engineering/metamodel/`.
- Promote this collector.
