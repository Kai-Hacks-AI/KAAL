# C102 change

## PLAN

1. Add the drafts in `interface.md`: the Intent I55, the Requirement F79, the Architecture A70, the manifest `app.json` and the workflow source `inspector.yml`, and the Cases T1250 to T1254, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow under `.github`, no ruleset, no setting, no App and no key.

## Mechanism

- release/I55 is the contract: the Inspector acts with the least privilege its judgement needs, and the part that judges a change never holds the key that signs. Owner: release management.
- The manifest `app.json` lists exactly four permissions: `checks: write` (to post one check per control), `contents: read`, `pull_requests: read` and `metadata: read`. It lists no webhook and no subscribed event: the workflow starts the Inspector, nothing starts it from outside. It carries no `contents: write`, no `pull_requests: write`, no `statuses`, no `administration` and no merge or approval permission: the Inspector never opens, approves or merges a pull request, and never pushes.
- The workflow source has two jobs. The judge job has `permissions: contents: read`, checks out the base commit as the trusted judge, fetches the head as Git data, runs the controls registered at the station and uploads the verdicts as an artifact; it names no secret. The sign job needs the judge job, downloads the verdicts, and is the only job that names the key (`INSPECTOR_PRIVATE_KEY`); it checks out only the base commit, never code from the head, and uses the verdicts only as data.
- UNKNOWN never passes: a verdict that is missing or unreadable is posted as a failure.
- The Cases derive their positives from the real sources and make their negatives by hand: a manifest with an extra permission, a workflow whose judge job names a secret, a workflow whose sign job checks out the head all must be refused by the same judgement.

## Installation, timing and risks

- **Creating the App is the Owner's, by hand**, from `app.json`, once this Change has merged and its ACT is on `main`. The key is stored as a secret of the sign job's environment by the Owner; nothing records how.
- **The workflow reaches `.github` by a WIRE**, after the judge, the sign step and the template of controls are on `main`.
- **A check pinned to the App can only be required once the App exists**: the ruleset source gets its integration id in a later Change, by the ruleset update procedure.
- **A pull request from a fork gets no secret on `pull_request`**, so the sign job cannot sign and the check would be absent. KAAL promotes from branches of the same repository, so nothing is lost today; an external contributor flow is a later question for controls and for the Owner, not decided here.
- **The record of a verdict is the contract of controls, not ours.** The sign step posts one check per control and writes the same judgement in the common log contract (control id, ref, outcome, finding). Nothing here names or shapes that record; the Cases pin no field of it. The DO follows the contract once it is on `main`.
- The design of controls may still move; the Cases pin only what release owns (identity and separation), never the judging rules.
