# engineering/C16 change: class-aware Delivery Admission

Owner ruling (15 Nov 2026): no one-off route; do it right and plan for it. Source: CTO assessment `/mnt/project-files/pull-promotion/true-pull-architecture-assessment.md`, change 2 (`engineering/C16`). Ids C16 and T450-T459 were checked on `main` only (code search finds none); not checked against every collector and open PR.

## From, to, because

- **From:** a pull request into `main` is admitted only from `kaal/*` of this repository (`lineage.ts` `promotionSource`, run by the required check Promotion Source). `hotfix/<name>` and `wire/<name>` heads fail, so the first WIRE (#1705, githooks split) and every hotfix are blocked. Hotfix is realized today as a `kaal/hotfix` collector (`branching.md`).
- **To:** one control, **Delivery Admission**, classifies the head ref into exactly one of `kaal/**`, `hotfix/<name>`, `wire/<name>` and requires that class's evidence. Anything else fails; anything that cannot be established is "cannot judge" (exit 2). The class comes from the head ref and head repository alone, never from a title, label or body.
- **Because:** `main` needs three delivery paths with one gate each, enforced by Engineering's controls and not by convention.

## Design

1. **Pure verdict** `admit(facts)` in `engineering/delivery-admission/admission.mjs`, verdict `{ kind: pass | fail | unknown | not-applicable, class, message }`. Exit mapping as today: pass 0, fail 1, not-applicable 3, unknown 2.
2. **Classes** (head repo must equal this repository, else fail):

   | Class | Head ref | Evidence required to pass |
   | --- | --- | --- |
   | `kaal` | `kaal/` + anything | none beyond today's rule: the verdict is `promotionSource`'s, imported from `lineage.ts`, not copied. Freshness, isolation, review and the queue stay with Branching, Change Isolation and the ruleset. |
   | `hotfix` | `hotfix/<name>`, one segment of `[a-z0-9._-]`, starting with a letter or digit | (a) the body has the four hotfix chapters in order; (b) the Defect chapter names a KAAL Defect `<capability>/D<n>` that exists on `main`'s tip; (c) the Defect's RED Case is `.red.mjs` on `main`'s tip and `.test.mjs` at the head (the hotfix turns it green; the lanes that run `.test.mjs` are required checks already). |
   | `wire` | `wire/<name>`, same shape | `engineering/release-management/05-src/wiring/wire-judge.mjs` (release/C27, on `main`) returns true over the head's changed files and the pairs the body declares. The judge is reused, not reimplemented. |

3. **Fail closed.** A head ref in no class (`feature/x`, `hotfix/`, `hotfix/a/b`, upper case, a fork) fails. Evidence that is absent, unreadable or ambiguous is `unknown`, never a pass. A title, label or body that says "hotfix" or "wire" does not change the class.
4. **Facts** are gathered read-only by trusted code from the default branch's tip, the same posture as Promotion Source and Change Isolation: the event's refs, the PR body, and git object reads of the head (changed paths and blobs). Nothing of the head is checked out or run. Evidence is data (`facts.evidence`); the verdict function takes no functions and reads no files.
5. **One rule source.** The `kaal` verdict is `promotionSource`; T458 pins that the two cannot diverge while Promotion Source exists.
6. **Check, not a new authority.** A Guard check `Delivery-Admission` (`.kaal/config/guard/Delivery-Admission.md`), `trusted: admission.mjs` taken from the base revision, run by a `pull_request_target` job and by the merge-group job, like Promotion Source.
7. **Declared pairs of a WIRE** are read from the Source and Target chapters with a Markdown parser (never regex): `source -> target` lines for copies, `move <from> -> <target> sha256:<hex>` lines for moves. A line that does not parse makes the verdict `unknown`.

## Sequence (each step its own Change; none is a one-off route)

1. **This PLAN**, CPO review at the exact head. Cases T450-T459 are RED on `main` (the module does not exist).
2. **DO 1, Engineering source only** (collector `kaal/engineering/delivery-admission`): `admission.mjs`, the facts reader, the CLI, the Guard declaration. T450-T459 green. No `.github`, no ruleset. Then the ACT and the promotion.
3. **Bootstrap install of the workflow**: the workflow cannot arrive as a WIRE (no `wire/*` path exists yet), so it is one ordinary `.github`-only DO on a collector, like the WIRE template's bootstrap. It adds the job `Delivery Admission` to a workflow and to the merge-group workflow. It reports but is not yet required.
4. **Dry run on live pull requests**: the context appears on real PRs (#1705 is the first `wire/*` candidate) and is compared with Promotion Source's verdicts on every `kaal/*` PR. No step blocks a promotion in flight.
5. **Activation, Owner only** (needs Kai's go; changes `main`'s protection): add the `Delivery Admission` context to the required checks, then remove `Promotion Source` in the same edit or the next. Add-new, then remove-old. Nothing in this PLAN touches a ruleset.
6. Retire the Promotion Source workflow and `promotionSource` call site in a later Change.

## Cases (all RED on `main`: `admission.mjs` does not exist)

T450 `kaal/**` unchanged. T451 hotfix passes only with all of (a)-(c). T452 wire passes only when the judge accepts. T453 unclassified or malformed heads fail. T454 title, body and labels cannot select the class. T455 absent or unreadable evidence is `unknown`, exit 2, never pass. T456 not applicable when the base is not the default branch. T457 the CLI reads a facts file and exits per verdict; an unreadable file is exit 2. T458 the `kaal` verdict equals `promotionSource` over a table of refs. T459 the Guard declaration exists and trusts `admission.mjs` from the base revision.

## Open for the CPO

1. Hotfix target: is `hotfix/<name>` straight to `main`, replacing the `kaal/hotfix` collector of `branching.md`? This PLAN assumes yes (assessment question 2). If a hotfix may still travel as `kaal/hotfix`, that path stays admitted unchanged.
2. Hotfix evidence (c) reads "RED Case now GREEN" as a rename `.red.mjs` to `.test.mjs` on the Defect's Case, as in release/C23's DO. Confirm, or name the signal.
3. WIRE pair declaration in the body chapters (design 7), or a declaration file in the PR.
4. Whether Branching needs a change for non-`kaal/*` heads: freshness reads the head generically; T-level check in the DO, not assumed.

## Not in this Change

No workflow, ruleset, hook or Guard activation; no change to Branching, Change Isolation or Promotion Source; no rename of an existing check; no GitHub App, auto-approval or lane caller (assessment changes 1, 3, 4, 5).
