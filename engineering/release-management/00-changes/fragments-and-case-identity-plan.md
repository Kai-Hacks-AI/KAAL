# One fragment per Change, and the identity of a Case (PLAN)

Change `release-management/C14`. PLAN, nothing is built; the failing Cases (`C14/T1` to `C14/T8`) are in `04-test/fragments.red.mjs`, carried unwired. The Cases of this Change already use the identity this PLAN proposes.

## Intent (Owner, 10 November 2026)

Every Change landed in a collector conflicts with the next one on the same lines: the register, the README, the Cases list and the Change-id pattern. Kai: "collector carries the overarching change; each PR carries its change; and the collector is computed from all PRs merged into it." "Content in context, so nothing should ever stand alone: permanent tests, covering intent, requirements, etc. of the target, sit next to the target; temporary tests, as part of a given change, sit next to the change." "Careful, it's not the path, paths might change; it's the concern." "Given Test points at what they test: X-ID/T.. seems a clean shot." A Case can test several things, so its identity has one owner at the nearest shared parent, and it lists everything it covers; requirements and architecture nodes follow the same pattern. And: "it is arguably not a release management thing", the Owner places it with Engineering, because it touches several capabilities.

This PLAN keeps two things apart. **Target: the rule** (sections 1 to 4) is what stays true once built, written to be read without this Change. **Change: the migration** (section 5) is how release management gets there and ends with it.

**C14 fits the control chain; it does not define a parallel release model.** `station-control-chain-map.md` is the inventory of stations, positions, carriers and controls; section 5 of that map shows where each C14 verdict is invoked, from existing implementations.

## Hosted by release management, intended owner Engineering

Same pattern as GUARD: born in KAAL, abstracted later. Release management hosts this Change for now and Engineering is the intended owner. To make moving it out cheap:

- **The general rule** (sections 1 to 4: fragments, computed views, Case identity, ownership of Cases, requirements and architecture nodes) is written without any release-management word and lives in one document, `00-changes/ownership-and-identity-rule.md` (the DO writes it), with its script in `05-src/fragments/` and no other capability's code importing anything else of release management.
- **Alignment with the structured-documentation investigation in kaal-change.** Engineering incubates this rule here; the reusable data model (nodes with an id, one owner, and typed edges such as `tests`, `refines`) is the subject of the separate kaal-change investigation of structured documentation. This PLAN uses the smallest model that serves it (an owner and a `tests:` or `refines:` list per node) and moves no implementation: the script stays here, behind that model, until the investigation names its own, and then the script adopts it or hands over. Who owns what is explicit: the **rule** is Engineering's (intended), the **data model** is kaal-change's to define, the **application and migration** are release management's.
- **Release management's application** (section 5: its own Cases and Changes under the rule, and the migration of its own T numbers) stays in release management and moves nothing out. When Engineering takes the rule, the document and the script move, and release management keeps only its application.

## 1. One fragment per Change

A Change is a folder, `00-changes/<C-ID>/`, and a pull request touches only that folder (plus the target files its DO changes). Its entry is `change.md`, with a front matter the script reads:

| Field | Meaning |
| --- | --- |
| `id` | the C-ID, equal to the folder name |
| `title` | the verb Object line that today sits in the register |
| `phase` | PLAN, DO or ACT |
| `features` | the F-ids it moves |
| `ends` | the condition that retires its temporary Cases (empty when it has none) |
| `targets` | the X-IDs of the target nodes the Change changes (empty for a PLAN) |

**Change ownership is not target ownership.** The Change folder belongs to the Change. The files a Change edits belong to their targets, which have their own owners; a cross-cutting Change (several capabilities, or the root documents) is legitimate and declares every target it touches in `targets`. The declaration is a claim, not trust, and the check judges it against evidence the pull request cannot write:

- the **changed paths** come from Git (`base...head`, the same input Change Isolation reads), never from the pull request body;
- each changed path outside the Change folder must resolve, through the **target map** read from the **base** (X-ID to directory, from the architecture), to an X-ID listed in `targets`; an undeclared path is a finding, and a declared target no path touches is a finding;
- the declaration does not widen what may travel together: **Change Isolation stays the authority** (Core alone, `.github` alone), and a Change that declares both is still refused by it;
- a target owned by another capability needs that owner's review through the ordinary approval route; nothing in the fragment replaces an approval.

Nothing a Change adds is a line in a file another Change also edits. The register, the README rows, the Cases list and the Change-id pattern are **views**: computed from the fragments by `05-src/fragments/view.mjs`, a deterministic script (sorted by id, no clock, no randomness). The views are not committed. The overarching Change of a collector, its intent and its list of Changes, is the computed view of the fragments merged into it, and it is what the promotion's pull request body carries.

**The check, by boundary.** No view is committed, and no boundary trusts text a pull request wrote about itself. Each boundary recomputes from the Git tree of the commit it judges:

| Boundary | What is recomputed and judged | Evidence |
| --- | --- | --- |
| Pull request | the fragment alone: folder equals `id`, fields valid, `targets` against the changed paths (above), Cases' owners exist; no view is consumed | the head tree and the base map |
| Merge group (collector tip) | the whole view over the collector tip plus the group's Change: duplicate C-ID and the next free one, Case identities unique within their owner, aliases resolve; serialized, so no two pull requests collide | the merge-group tree |
| Promotion | the computed view of the collector at the promotion head, which is the **promotion body**; the body must equal it | the promotion head's tree |

**How the promotion body is trusted.** It is not trusted: it is derived. The script produces it from the tree at the promotion head; verify Envelope compares the body the pull request carries with that computed text and fails on any difference (the body is a claim, the tree is the evidence). The comparison runs in the base-controlled check, like verify Envelope's other judgments, never from the pull request's own code.

*Decision for the Owner:* computed-only (recommended), or committed views regenerated by the merge group. Committed views put the conflict back unless a bot writes them; computed-only has no shared line at all.

## 2. Content in context

- A **permanent Case** covers the intent, requirements or architecture of its target and sits next to the target (the same folder, `<name>.test.mjs`). It stays while the target stays.
- A **temporary Case** belongs to a Change and sits in the Change's folder. It ends with the Change (`ends`), and the check fails a temporary Case whose Change has ended and which is still there.
- Nothing stands alone: a Case, requirement or note outside a target's folder or a Change's folder is a finding.

## 3. The identity of a Case

`<X-ID>/T<n>`, where X-ID is the id of what the Case is owned by, for example `release-management/F21/T1` or `release-management/C11/T1`. It is the concern, never the path: a moved file keeps its identity. The number is unique within its X-ID only, so there is no global counter and no allocation across Changes.

**Several things under test.** A Case has exactly one owner and any number of covered things:

- The **owner** is the nearest shared parent of everything the Case tests; for a temporary Case it is the Change. "Parent" is **semantic ownership**, the composition the architecture states (a feature belongs to its capability, a capability to the capability that composes it), never a common folder: two nodes whose files share a directory have no shared parent unless the architecture says they do. The parent facts (`parentOf`) are read from the architecture on the base. For a **cross-capability Case** the owner is the composing capability the architecture names (for the release controls, Engineering); where no composing capability is named, the check reports the smell below.
- Each Case declares `tests:`, the list of every X-ID it covers. Identity is one; the edges can be many.
- When what a Case tests has no meaningful shared parent (the targets belong to different capabilities with no composing capability that owns the Case), the check reports a **smell**: split the Case, or make it an integration Case of the composing capability.

The same rule gives **requirements and architecture nodes** one owner and the edges they refine or are tested by; one ownership rule, not three.

## 4. Remaining collision: two Changes with the same C-ID

Because the fragment folder is named by the C-ID, two pull requests that pick the same C-ID add the same path: the second one conflicts in Git where it can be seen, and the check names the next free C-ID (the rule Branching already applies to Change Records: provisional until it lands, no allocator, each new tip checked before the next lands). C-IDs stay provisional until the Change lands, and nothing is renumbered after (fall forward).

## 5. Release management's application and the migration (fall forward)

- The existing global numbers (`T1` to `T66`, and those other threads have reserved) are **never renumbered in history**. The DO adds `00-changes/case-identities.json`, a one-time map from each old T number to its new identity (`T31` becomes `release-management/F21/T1`, and so on, owner by the rule in section 3). An old number is an alias that resolves through the map; the documentation Cases accept either until a terminating Change deletes the aliases.
- New Cases use the new identity from the day the DO lands. Cases of in-flight PLANs (for example `T67` to `T73`) keep their numbers and enter the map.
- The register, the README rows, the Cases list and the Change-id pattern become views; the committed copies are replaced by the script and deleted by the DO in one Change, which is the only Change that edits those shared lines.
- Release management's own Cases sit next to their targets or Changes under the rule; moving them is the work of the DO and its ACTs, one capability folder at a time, never one large rename.

## Cases (`C14/T1` to `C14/T8`, unwired)

`C14/T1` the view is a pure, order-independent function of the fragments (the same fragments in any order give the same bytes). `C14/T2` two fragments with the same C-ID are refused and the next free C-ID is named. `C14/T3` every changed path outside the Change folder resolves through the base target map to a declared target, an undeclared path and an untouched declared target are findings, the declaration never overrides Change Isolation, and a view is never an input a pull request edits. `C14/T4` a Case's owner is the nearest shared parent of what it tests, `tests:` lists everything covered, and a Case whose targets share no parent is reported as a smell. `C14/T5` a permanent Case sits next to its target, a temporary Case sits in its Change's folder, and a temporary Case outlives its Change only as a finding. `C14/T6` every old T number resolves through the map to exactly one new identity and none is reused. `C14/T7` requirements and architecture nodes follow the same single-owner rule with their edges. `C14/T8` the promotion body is recomputed from the promotion head's tree and a body that differs is refused, whatever the pull request's own text says.

## Open for the Owner

1. Computed-only views, recomputed at each boundary (recommended), or committed views written by the merge group.
2. Where the folder of a Change lives once Engineering owns the rule (per capability `00-changes/`, or one place).
3. The name of the nearest-shared-parent smell when the composing owner is Engineering itself.
4. When the kaal-change investigation names the structured-documentation model, whether the script adopts it or hands over (this PLAN moves nothing before then).
