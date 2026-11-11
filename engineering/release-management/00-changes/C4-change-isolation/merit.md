# C4 merit

The initial hypothesis of the Owner is Migrate + Improve. The assessment below confirms it for the control and splits it by realization, because most of the machinery works and is only relocated by a migration that has no other reason. Nothing is terminated in this PLAN. Each decision separates the control (what it decides) from the realization (what carries it out).

| Realization | Decision | Reason |
| --- | --- | --- |
| The control: Intent, Requirements, Architecture, Cases (I3, F4 to F6, A17 to A23) | Migrate | `main` holds none of them (`baseline.md`). They are added to release management. The control gets an identity that its mechanisms point at. |
| Judge `check.mjs` | Retain + Improve | It is the one realization of the rules, it is tested (46 green tests) and it replays `main`'s history (O3). It stays where it is. It gains an exported verdict function with PASS, FAIL and UNKNOWN (F4) and a record (F6). The command line keeps its exit statuses until the retirement criteria are met. |
| Ledger `transitions.json` | Retain | It is state, not machinery, and it admitted the landings of O3. Spent entries stay as history. |
| Attestation and review machinery: `attest.mjs`, `attestation.mjs`, `attesters.json`, `change-isolation-review*.yml`, `merge-group-review.yml`, `merge-group-admission.yml` | Retain | It serves one rule of this control, the carried ledger entry, and it works at the queue. It is out of the first migration. Its handler failing on an ordinary Change (H3) is a defect for a Change of its own. Whether the carried entry is still the route is an Owner decision. It is a Terminate candidate only on that decision, and not on the observation that the last use was on 8 Nov. |
| Guard declaration `Change-Isolation.md` | Retain + Enhance | It gains the hook placement (F5): `runs: [ci, hook]`. |
| Declaration `push.md`, `push-check.sh` and `pre-push` | Improve, then Terminate the Change Isolation part | The hook is a placement, so it stays. Its judgment of this control moves to the control's own declaration with the same judge and the same ledger (H1, H2). The duplicate Change Isolation block of `push-check.sh` and the mention in `push.md` are terminated only when the retirement criteria of `transition.md` are met. |
| `change-isolation.yml` and the Change Isolation job of `merge-group.yml` | Retain | They execute and they carry the check that the rulesets require (O1, O2, O5). Moving them would give no protection and would put the required context at risk. |
| Rulesets and the merge queue | Retain | No change is authorized here. `guard Integration` owns the preventive requirement. The context names Change Isolation and Change Isolation (review) are kept so that no ruleset needs to change. |
| Four `.red.mjs` files and the four listed test files | Improve | The `.red.mjs` files are green and run nowhere (H4). They are renamed and listed in Engineering CI in a Change of their own (S5), which is also the known wiring gap of create Plan. |
| `engineering/controls/README.md`, section Change Isolation | Terminate, after the DO | It describes a planned Control and is stale (H6). It is superseded by I3, F4 to F6 and A17 to A23 and is removed or redirected when the DO closes, not before. |
| `first-use-acceptance.md`, the ledger plans and the trial note | Retain | They are the record of how the ledger came to be. |

## Guard

Guard stays the concept that connects the control's declared check to the hook, CI and the queue. The findings H1 to H3 are defects of the current machinery (a hook that skips the ledger, one declaration for three controls, a handler that fails ordinary Changes), not of the concept. The control demonstrates the way of working and replaces nothing of Guard. The improvements are made to the machinery so that Guard consumes the control as declared.

## Not decided here

- Whether `check.mjs` moves into release management. Nothing observed asks for it.
- Whether the three writers of the check named Change Isolation (O6) should be separated. It needs an observation of how GitHub evaluates a required context first.
- Whether `guard Integration` binds the new declaration. It is the Owner's and the CPO's.
