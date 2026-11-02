# Requirements ownership: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **requirements/N7** [requirements/I10, requirements/I12]: This Change changes no Node, no contract and no package file. It adds documents under `plan/ownership/` only. `requirements/N1`, `N3` and `N5` stay as they are.
- **requirements/N8** [requirements/I13]: Nothing here starts a SYNC, a promotion or a publish. Each needs the Owner's explicit authorization.

## Functional

- **requirements/F17** [requirements/I10]: **Ownership.** Requirements owns, and no other capability redefines: the `Requirement` Definition, the identification rule of `requirements/F12`, the `Serves` Definition of `requirements/F13`, and the Requirements-side reading of `Placement` (`requirements/F1`–`F6`). The consuming capability owns its Requirement instances and their outgoing Edges. Requirements keeps no store, registry or index.
- **requirements/F18** [requirements/I11]: **The map.** The map in [Architecture](architecture.md) lists each existing piece of Requirements and traceability work with its owner, state and blocker. A piece planned or merged only to a collector is Planned or In progress, never Delivered.
- **requirements/F19** [requirements/I12]: **Hand-offs.** Requirements asks for, and does not write:
  - from Intent: Intent elements as Nodes that a `Serves` Edge can name by name and id (`intent/C1`, `intent/F1`–`F5`);
  - from Architecture: `Placement` Edges to Requirement Nodes (`architecture/C8`), and Architecture's own element identification;
  - from Graph: traversal and `check()` for pinned ids, already on `main`;
  - from Testing and Packaging: their Test Case and dependency traces (#745, #746), which Requirements only cites.
  Each request is a comment or PLAN on the owner's PR, and no thread acts for another.
- **requirements/F20** [requirements/I12]: **Open boundaries to settle with the owners.** Whether a Requirement's trigger needs a Node of its own (`requirements/F13` says a trigger is not an Intent and defines no Node for it). Whether a `Serves` Edge may point to an Intent of another capability. Each of these is raised on the owner's PR and decided there.
- **requirements/F21** [requirements/I13]: **Sequence.** Requirements work proceeds in this order, and each step waits for the one above it:
  1. Agree the hand-offs of `requirements/F19` with the Intent and Architecture owners.
  2. DO `requirements/C10` on `kaal/requirements`: `Serves`, identification and the Definition sentence, behind the Owner's review of its PLAN.
  3. Packaging readiness (`requirements/C7`) after `core/C29` and the Hosting scoped rename.
  4. SYNC `main` → `kaal/requirements`, only when the promotion is next in line or development is blocked without main, never for freshness alone.
  5. Promotion, then the first publish as `@kaihacksai/kaal-requirements`, each on the Owner's authorization.
- **requirements/F22** [requirements/I10]: **Rename.** The package is `kaal-requirements` today. It takes the `@kaihacksai/` scope with the same registry migration as the other capabilities. Requirements does not rename itself ahead of Hosting 0.0.1.
- **requirements/F23** [requirements/I14]: **Defects in the Requirements loop.** The Owner placed Defects in the Requirements loop beside functional and nonfunctional Requirements (2 November), and decided the ownership (2 November, 21:21): **`kaal-defect` owns the Defect concept.** It is incubated in the Testing capability for now and may later become its own Skill. Defect instances are owned by their context, as Requirements and everything else are. The boundary:
  - **A Requirement** specifies what must or must not hold. Requirements owns the concept; the consuming context owns the instances.
  - **A Defect** records an observed deviation. `kaal-defect`, hosted in Testing, owns the concept. The context where it was observed owns each instance.
  - **The obligation arising from a Defect**, that the deviation be corrected so the Requirement holds, is stated as a Requirement. Requirements owns that obligation and traces it with `Serves` like any other.
  - **A Test Case** supplies the RED evidence of a Defect and its execution semantics. Testing owns both.
  Requirements defines no Defect concept, Node or identifier. Its Defect identification is `kaal-defect`'s.
- **requirements/F24** [requirements/I14]: **Existing F10 and T11 stand.** This PLAN does not supersede `requirements/F10` or `requirements/T11` (plan/love): a Defect's record is its owner's, not Requirements', and the owner is now `kaal-defect`. Aligning the Node's Defect wording with `kaal-defect` is the following Change that F10 already names, taken with `kaal-defect`'s owner. T11 is not weakened or rewritten meanwhile.
