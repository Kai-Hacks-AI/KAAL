# C103 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the Requirement, the Architecture, the control and the source `judge-act.mjs`) and the Cases T1260 to T1266 and T1299, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, no hook, no ruleset and no setting outside the drafts.

## Mechanism

- release/I56 is the contract: an ACT enters a collector only when the Cases that apply to its Change are really green.
- **The collector is an artifact-driven workspace, measured from its content.** It may receive any number of PLANs while work is underway. Each adds or amends Cases together with the KAAL artifacts and relationships that justify them (Intent, Requirement, Architecture, Defect), and so changes which Cases are applicable and how many are RED. Any number of DOs then implement the work and turn those Cases GREEN; exactly one ACT follows. Pull requests and commits transport the work and give it provenance. Their titles, first-parent history and merge shapes are not read: the judge takes a folder, never Git.
- **What applies** (`applicableCases`): the Intents that the Change record (`C<n>.md`) implements, widened along the one-way relationships (`serves`, `addresses`, `has`, read from the elements, placed or still drafted in the Change folder) to every element that reaches one; then every Case that is in the Change folder or `tests` one of those elements, wherever it stands. A Case parked as `T<n>.red.mjs` is RED by construction; a Case is not really green while any file carrying its id is parked. A relationship amended away drops the Cases it alone justified; a retired Case is simply absent.
- **Only an ACT is held** (T1299). The check runs on every pull request into a collector and looks at the ACT beside the Change folder (`<Change>.act.md`), nothing else of the pull request: no ACT, PASS (a PLAN lands with its Cases red, a DO lands while the rest is still red); an ACT is judged by the Cases. The folder that is not there is UNKNOWN. An ACT of another Change holds nothing here. Presence only is read; what an ACT must contain is another control's.
- **Verdicts.** FAIL when an applicable Case is parked red or observed RED; the message is `finish your work first: <Cases> of N applicable Cases are not really green`, with the count of red, green and unknown. UNKNOWN when none of that holds but a Case was not observed green, or no Case applies: UNKNOWN never passes. PASS only when every applicable Case is not parked and observed GREEN. PASS is not an approval and not a merge decision.
- **Observations come from Testing.** The judge takes `{ '<scope>/T123': 'GREEN' | 'RED' | 'UNKNOWN' }`; the exit code of a test run is never a verdict. Which folder to measure, which Change, and the adapter from Testing's report are the wiring's; the check can run locally or in CI against the checked-out branch.
- **Two concerns, kept apart.** Content measurement (this Change) says whether the work is finished. Transport authorization (whether a given PR may add, change or retire a Case or an artifact: a DO that weakens a Case, the phase from the envelope, the ratchet of kaal-change change/F56) is a different control, aligned with kaal-change's contracts, in its own Change. hold Act does not guess it from history.
- The Cases build collectors as plain folders and make the work arrive by hand: PLAN 1 (a Change, a Requirement draft, two RED Cases), PLAN 2 (an Architecture draft and a Case beside it that is applicable only through the relationships; unrelated Cases stay out), a DO unparking Cases, PLAN 3 (retire one Case, add one, place an element so that it wins over its draft), a copy of a Case left parked, PLAN 4 (a relationship amended away drops its Cases), DOs finishing. The command line is run on them, and in a Git repository whose commit titles lie (PLAN, DO, ACT) with identical answers.

## Installation, timing and risks

- **Nothing is installed here.** The workflow, the hook mirror and a gate in the collecting ruleset are later slices; the workflow and the hook reach `.github` and `.githooks` by WIRE, the ruleset by the Owner, by hand.
- **Dependencies, named:** Testing's observation (expected-failures ACT #2123, not yet on `main`) and the hand-over of observations from the CI lanes, which is engineering's Change. Until the lanes hand observations over, the `.red.mjs` exclusion stays.
- **A Case file is read by two regular expressions** (`export const id`, `export const tests`), the shape every Case here has; a Case that does not state them is not found, so it is not required, and the Case runner of engineering still refuses unnamed Cases.
- **A collector's relationships are read from frontmatter** (`implements`, `serves`, `addresses`, `has`). A new relationship kind in KAAL's contracts has to be added to the list; the widening to Defects follows when their relationship is the same one-way kind.

## The three small controls of the ACT, and where this one sits

Owner, 20 Nov 2026: the process of getting a Change done is release; the Change object is kaal-change's. So the three controls and their stations are release's, and what the ACT's format is comes from kaal-change by Exchange.

| control | station | says | state |
| --- | --- | --- | --- |
| `hold Act` | `23 - collecting`, first advisory, required only when the Owner authorizes it | FAIL while an ACT stands and an applicable Case is not really green | this Change |
| `demand Act` | `30 - promoting`, required | FAIL when every applicable Case of a carried Change is really green and its ACT is missing; it cannot sit on 23, where it would deadlock the DO that closes the last red | its own Change, after this one |
| `verify Act` | with the ACT, at 23 and again at 30 | FAIL when an ACT does not have the ACT's format | its own Change; needs the format from kaal-change |

- **Exchange, not a definition.** Release does not define the format. It seeks from kaal-change a judgement of an ACT (its offer is the Skill description; our seek goes in `references/exchanges.md`). Until kaal-change offers it, `verify Act` has nothing to call and stays unplanned in detail; the Exchange request goes to its thread through the coordinator. The 4L shape is probably owned by a retrospective capability that does not exist yet; that is kaal-change's to route, not ours.
- **Hooks, advisory and local, the same judge each.** `hold Act` (an ACT pushed while Cases are red), `verify Act` (a malformed ACT before push) and `demand Act` ("Change closed, ACT due" once a push makes everything really green) each get a mirror in the pre-push dispatcher (`.githooks/new/pre-push.d`, a WIRE since `stages.json` is exact). A hook never blocks, a verdict that cannot be told is a note, and the required check at its station stays authoritative. The hook needs an observed run of the applicable Cases; locally that is the runner on those Cases, which is why the hooks are their own slice behind the adapter from Testing's report.
- **Order.** This Change, then the workflow and WIRE, the adapter, the `23` ruleset gate (Owner); `demand Act` after the ACT shape is settled; `verify Act` after the Exchange is answered; the three hooks last.

## Rollout of `hold Act`, detective first

The CPO (20 Nov 2026) asked for the rollout to be explicit, following KAAL's detective-first pattern, and not to broaden this Change into its siblings. The control is declared `detective` now and `designed`; it becomes preventive only in the Change that makes the check required.

1. **Observe.** The judge's PASS, FAIL and UNKNOWN are observed on real collector pull requests, by running the command line on them, with nothing blocked. The observation of Testing is a precondition (its adapter is a later slice); until it exists the observed runs are hand-made and say so.
2. **Advisory check.** A workflow `hold Act` runs on pull requests into a collector behind a feature flag (a repository variable, off by default; when set to `advisory` it reports and never fails the pull request, when unset it does not run). Evidence is collected from it: the minimum of the control, `real:1`, is a run on a real collector pull request, and `provoked:1:fail` is a scratch collector with an ACT and a red Case. This is a WIRE with the Owner's go; it is not part of this Change.
3. **Required.** Only after the evidence is validated and the Owner explicitly authorizes it is the check declared on the `23 - collecting` station and loaded into its ruleset, by the Owner. Then the control is preventive, its `type` and its evidence line change (a preventive control asks for two real runs), and release/CTL26 observes that the requirement is in force.

Judgement stays apart from enforcement throughout: the judge never blocks, the place that asks it decides what a verdict does, and the day the check is required UNKNOWN does not pass. The siblings `demand Act` and `verify Act` have their own Changes and their own rollout; nothing of them is in this one.
