# Product PLAN: supporting the Owner viewpoint (provisional number 26/11/02/01)

Markdown only. No Node, Definition, claim, package, workflow or policy changes.

## 1. Intent

Kai: Engineering already supports the delivery viewpoint. Product should support the Owner viewpoint equally well: the Owner can see what is wanted, in what order, what a decision means, and what was decided. Product prepares; the Owner decides.

## 2. Where Product stands (surveyed 2 Nov 2026)

- `kaal/product` holds `packages/skills/kaal-product` 0.0.1 (#277 contract, #516 PLAN Definition). Content only: Capability Node, Product Direction Definition, PLAN Definition, ownership claim, test file. No scripts.
- It is 46 commits behind main, 2 ahead (last commit 30 Oct). No open Product PRs.
- `kaal-product` is not on npmjs (404).
- Depends on Core (KAAL Capability, KAAL Definition). Dev dependencies kaal-core, kaal-graph, kaal-hosting, kaal-testing at 0.0.1; tests build kaal-core and kaal-hosting.

## 3. Gap against the Owner viewpoint

Product defines five concepts (wanted increment, backlog, roadmap, priority, decision preparation) but gives the Owner no stated way to see them: nothing says where the objects live, how a decision preparation is shaped, how a recorded choice reaches Change/Project, or how Product Direction relates to Intent and to Engineering's PROSE (Product to Engineering). The following are candidates for later DO work, each to be confirmed by Kai:

1. **Owner view**: a defined, repeatable Owner-facing reading of Product Direction. For each wanted increment the Owner sees: the product Intent it serves; the Requirements that define its success; its priority and place in the roadmap; the open and recorded decisions; and the verification status and evidence supporting readiness. Without the Intent, Requirements and evidence, Product would be only a backlog and decision tracker and would not support product fitness.
2. **Decision preparation shape**: options, what choosing each means, the choice recorded as made; and the hand-over of a selected increment to Change/Project.
3. **PROSE seam**: how a selected increment becomes Engineering input, without Product taking over delivery.
4. **Process fit**: whether Product's PLAN (Prioritize, Launch, Adaption, Now) is offered as a process template on kaal-process (#852). Not a dependency. #851 places Product on the Plan side of the loop, not as one of the eight delivery capabilities.

### Reuse, not a second model

Product presents and interprets existing evidence for Owner decisions; it owns none of it:

- Test Case traces across the loops (Intent, Requirements, Architecture, Defects) stay Testing's, and trace and reach semantics stay Graph's. Product reads them and does not define a second traceability model.
- Product adds no verifier and no consumer content. It does not re-run or re-judge verification; it shows what Testing and Graph report and what that means for readiness.
- Intent and Requirements remain Intent's and Requirements'; Product refers to them.
- The Owner decides; Product prepares each decision. Engineering retains delivery responsibility.

No new machinery is proposed. The Owner view is a reading of what already exists.

## 4. Package question

Rule: a capability gets an npm package only if a non-KAAL repo can benefit for non-KAAL work. Product Direction could plausibly serve other repos, but 0.0.1 ships only Markdown Nodes that need Core to register, and nothing here shows outside use. Recommendation: **internal-only for now** (promote to main, no npm publish, no `files`/publish workflow work). Revisit once item 1 or 2 above gives a concrete non-KAAL use. Kai decides.

## 5. SYNC need

`kaal/product` needed main merged in (merge commit) before further work. Under the standing SYNC policy (SYNC main → kaal/* when it unblocks development or is next for promotion) that needs no Owner ask, and it has been done (#909). Promotion to main (squash) and npm publication remain separate Owner decisions, judged on their own; this PLAN authorizes neither.

## 6. Cross-capability needs

- Core: Capability/Definition admission only; no new ask.
- Engineering: PROSE seam (item 3); to be raised with Engineering's thread once Kai confirms scope.
- Change/Project: hand-over of a selected increment (item 2); no thread exists for Change or Project yet.
- Process: item 4 only.
- Intent, Requirements, Testing, Graph: Product reads their existing traces and evidence (item 1); no change is asked of them. To be confirmed with their threads once Kai confirms scope.
- Review (separate capability, `kaal/review`): needs its own thread and SYNC; not covered here.

## 7. Decisions for Kai

1. Confirm the scope in section 3 (which of items 1-4 become DO work, in what order).
2. Confirm internal-only (section 4).

These are proposals. Approving this PLAN as a review outcome does not settle the scope (1) or internal-only distribution (2); they stay open until the Owner decides them.

## 8. Not covered

The PLAN does not add objects, storage or a registry for Product Direction, does not change the Product or PLAN Definitions, and does not decide anything for the Owner. The Review capability is handled separately.

## 9. Verified by / Validated by

Markdown only; required checks on this PR. Independent review and Owner review of scope and decisions.
