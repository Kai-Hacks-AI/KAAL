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

## One App or two (the Owner's ruling: an App, no human raise and no bot account)

**Two Apps, one per authority.** The Inspector App signs checks and holds `checks: write` only. The Dispatcher App raises the PROMOTION (draft pull requests) and holds `pull_requests: write` (it already mints its token from `KAAL_DISPATCHER_APP_ID` and `KAAL_DISPATCHER_KEY`). They are not merged, for three reasons:
- **Least privilege.** The key that signs the checks the rulesets trust must not be able to write pull requests, and the key that writes pull requests must not be able to post a trusted check.
- **Judge and sign stay apart.** The Inspector's judge job holds no secret and its sign job alone holds the key; adding pull-request write to that key would put a second authority behind the one a ruleset pins.
- **An approver is not the author.** The approval automation (`approve Sync`, `review Sync`) needs an identity that approves, and an App must never approve what it raised itself. It is a third role with its own key and `pull_requests: write` for reviews, decided in its own PLAN; it is not the Dispatcher and not the Inspector. This PLAN only records that it depends on an App.

## What the Owner does by hand (separate from anything the Changes install)

1. Create the Inspector App from `05-src/inspector/app.json` and install it on the repository only.
2. Store its private key as the secret `INSPECTOR_PRIVATE_KEY` of the sign job's environment.
3. Create and install the Dispatcher App (manifest `/mnt/project-files/release/app-manifest.json`, permission `pull_requests: write`, `metadata: read`) and store `KAAL_DISPATCHER_APP_ID` and `KAAL_DISPATCHER_KEY`.
4. The approver App, when its PLAN is approved, with the same two steps.
5. **Upload a logo for each App** when creating it (the Owner: a KAAL App has its own logo). Each App has its own logo, so the three are told apart in the check list and the audit log. GitHub takes it as an upload in the App's settings; what I know of its requirements is a square image (PNG, JPG or GIF) of at least 200 by 200 pixels, and the Owner confirms the current limits at the upload. The DO supplies the asset as a source: an SVG master and a PNG export per App under `05-src/inspector/` (and the same for the Dispatcher and the approver), drawn by the Owner or the CPO, not generated here. The App cannot be called finished without it.
6. Say when each exists. The release workflows are installed by a WIRE on the Owner's go, and pinning a check to the Inspector in a ruleset is a later Change on the Owner's go.

## Installation, timing and risks

- **Creating the App is the Owner's, by hand**, from `app.json`, once this Change has merged and its ACT is on `main`. The key is stored as a secret of the sign job's environment by the Owner; nothing records how.
- **The workflow reaches `.github` by a WIRE**, after the judge, the sign step and the template of controls are on `main`.
- **A check pinned to the App can only be required once the App exists**: the ruleset source gets its integration id in a later Change, by the ruleset update procedure.
- **A pull request from a fork gets no secret on `pull_request`**, so the sign job cannot sign and the check would be absent. KAAL promotes from branches of the same repository, so nothing is lost today; an external contributor flow is a later question for controls and for the Owner, not decided here.
- The design of controls may still move; the Cases pin only what release owns (identity and separation), never the judging rules.
