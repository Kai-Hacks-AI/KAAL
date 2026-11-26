# C91 change

## PLAN

1. Add the drafts in `interface.md` (the control, the Requirement, the Architecture, the `promoting.json` source, the declaration in `stages.json` and the amended workflow source) and the Cases T1129 to T1134, all RED.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, no control declaration outside the drafts, nothing under `.github`, no ruleset and no setting.

## Mechanism

- release/CTL20 is preventive and has release/I50. It is the requirement that uses the report of release/CTL19, as release/CTL5 uses that of release/CTL2.
- `promoting.json` lists a third required check, `verify Triggers`, with the integration of the other two (15368), after them. The setting `do_not_enforce_on_create` stays false. `stages.json` declares the check in the Promoting stage's `required_status_checks` rule, traced to release/CTL20, so `verify Stages` judges the source against the declaration.
- The required check name is the job name of the workflow source. The Case derives it from the source, never from a list kept by hand.
- The workflow source runs on `merge_group` too: the base is `merge_group.base_sha`, the head the queue branch `merge_group.head_ref`, fetched as Git data. The pull request path is unchanged. A missing ref, an absent judge or an unresolvable commit is still UNKNOWN (exit 2), never a pass.
- Ten existing Cases fix the shape of the promoting source and fail once it has a third check or `stages.json` declares it: release/T481, T482, T483, T485, T511, T512, T513, T516 and T733 (they state the exact list of required checks, or that no other check exists) and release/T1124, which compares the workflow source with the draft of release/C90. The DO amends each to the new truth and names each amendment in its pull request; none is skipped or disabled. They are Cases that protect something enduring and not a Change, which the Owner wants beside their elements; moving them is not part of this Change.

## Installation, timing and risks

- **Installing is the Owner's, by hand.** The ruleset update procedure applies `promoting.json` to the live `promoting` ruleset (27571743). It is a hard swap, as with release/CTL10. Not before: the workflow of release/C90 and its merge_group amendment are installed under `.github/workflows` (two WIREs, each reaches `main` by a PROMOTION), and `verify Triggers` has run green on a real pull request into `main`.
- **A pull request created with the default GITHUB_TOKEN starts no `pull_request` workflow**, so the required check would never report. The Dispatcher (release/C72) must raise its pull requests with its App token. Noted for that Change.
- **Integrating** is not touched: see `C91.md`.
- **The legacy promotion ruleset** (24951062) is not touched. Its merge queue stays; the new check runs there through `merge_group`.

## Ids

Change `release/C91`, control `release/CTL20`, Requirement `release/F68`, Architecture `release/A63`, Cases T1129 to T1134 (T1135 to T1138 stay free), allocated 18 Nov 2026. No Gap id: the Owner took the Gap out of the metamodel on 18 Nov.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change `kaal/release/gate-verify-triggers`: add `CTL20.md`, `F68.md`, `A63.md`, the third check in `promoting.json`, the declaration in `stages.json`, the amended `verify-triggers.yml`; amend the Cases that fix the old list; rename T1129 to T1134 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md`. T1129 to T1134 are element or target Cases and stay beside their elements; this Change holds no change-semantic Case.
