# Investigation: what KAAL already supports

Read against `kaal/genesis` at 752db5e. No Change dated 2026-10-09 exists there yet; `08/04` is held by open #70 and #72. Nothing here is implemented. Findings are marked **supported** (exists and is sealed or shipped), **by wording** (exists only in unsealed prose) or **gap** (not there).

## 1. Core: what the backbone gives a composition

- **Identity and reference.** A Node's ID is the SHA-256 of its exact bytes. Nodes refer to each other by `{name, id}`; a Node may refer only to Nodes born before it (Edge, `core/Edge.md`). Supported.
- **Direction is built in.** Because a reference points only at earlier-born Nodes, a Node that composes others is always born after them, and the composed Nodes cannot name it. Whatever composes is downstream of what is composed. Supported, and it is the structural reason "the Process owns the relationships" is natural here rather than imposed: `Intent`, `Review` and `Changing KAAL` are sealed and none of them can ever cite a Process born later.
- **Discovery of capabilities.** `installedSkills()` and `installedExtensions()` return `{name, id}` of admitted Nodes typed by Core's `Skill` / `Extension` (anchored on exact ID). Supported. They answer "what does this instance hold", not "what relates to what".
- **CASE has four dimensions**: Core, Agent, Skills, Extensions. There is no Process dimension, and none is needed to *state* a Process: a Process is not registered, it is read.
- **Back-references.** "Cited by" is not stored; it is derived by reading (the same conclusion as #72's Architecture). A subject-first Agent cannot follow references *from* `Intent` to the Processes that compose it. Gap, but not a Core gap: a derived read.

## 2. The capabilities in question

| Capability | What its Node states | Where its Way of Working lives | Cross-capability wording found |
|---|---|---|---|
| `Intent` (`7317b19e…22cf`, Skill) | stating what is wanted and why, establishing it as a target; "bound to no process"; examinable "by anyone and from any viewpoint" | `kaal-intent` SKILL.md (unsealed) | Step 6 of SKILL.md: "Where the optional `kaal-review` Skill is installed, an Intent may be reviewed like any result, with `--of Intent`…". **By wording.** |
| `Review` (`7c3d4d8e…6d5f`, Skill) | examining any result, reporting, convergence; "specific to none"; scope excludes "when a review is owed, which actor reviews… what is done with findings" | `kaal-review` SKILL.md; `review.mjs write/check/converged` | None. Review names no other capability. **Clean.** |
| `Changing KAAL` (`7b247073…96c2`, Skill) | "the capability for managing changes to KAAL through KAAL's change process. Its scope is that alone." | `kaal-changing` SKILL.md, `references/rowing.md`, `retro.md`, `change-state.mjs`, `next-change.mjs` | Steps 2 and 3 name `kaal-intent` and `kaal-review` ("where installed… a Change does not need Review to work"); depends on `kaal-sealing` as a stated installation prerequisite. **By wording.** |

Three things follow.

1. **The coupling the Intent wants to avoid already exists in two places, softly and in unsealed wording**: `kaal-intent` step 6 points at Review, and `kaal-changing` points at Intent and Review and requires Sealing. Both are phrased as optional ("where installed"). The sealed Nodes themselves are clean. Nothing here is changed by this Change; it is recorded so that the model can say what would have to move for the criterion to hold literally.
2. **Optional Skills are not installed by default.** This repository's own `.kaal/skills` holds `kaal-changing`, `kaal-collecting`, `kaal-engineering`, `kaal-retro`, `kaal-sealing`; `kaal-intent` and `kaal-review` are in `packages/` only. So `installedSkills()` on this repository's `.kaal` does not list them. A composition must say what it does when a participant is absent.
3. **Review's round carries one identity.** A round names the result reviewed and its exact identity, the outcome, the Reviewer statement and findings (`review.mjs write … --of <Name> --identity <id>`). What the result was examined *against* is "what the review was asked to examine the result against" (SKILL.md step 1) and is stated in the findings text. The round has no field for the standard or the lens. Supported as is; provenance of the lens is prose.

## 3. ROWING, the Reviewer seat, and convergence

- **ROWING** (`Review Observed Work, Intelligent Not Generalized`) is a KAAL Definition: the discipline for review of the Change's Work, anchored to the Change's Intent, Requirements and Architecture. "Not Generalized" keeps the review with the Change that was intended. Supported.
- **The Reviewer seat** is assigned under the Owner's authority, never inferred from capability; the Worker never fills it; a helper on the Worker's side is part of the Worker (07/08, 07/07). **By wording**, in `kaal-changing` and `rowing.md`.
- **Convergence** is Review's judgment about one directory of rounds and one identity (`review.mjs converged <dir> <identity>`); Changing KAAL's compass (`change-state.mjs`) reads `review/NN.md` as rounds for the Work.
- **Consequence for targeted reviews.** Review is already neutral about *what* is reviewed (`--of Intent` works). Whether a targeted review counts for a Change is therefore decided by where and for what identity its round is placed, not by anything in Review. A scratch run (evidence, section 5) shows: a round `--of Intent` in a directory other than `review/` leaves `change-state` unchanged, and the same round placed in `review/` makes the compass report the Change's `review/01.md` as malformed. For another result the separation is therefore structural (the compass detects the mismatch). For a targeted review of the Work itself it is not: a round naming the Work's identity is read as a ROWING round wherever it is placed in `review/`, whatever its lens or Reviewer statement (evidence §5a). There the separation is Process-controlled placement and authority discipline.
- **Who holds the seat for a targeted review** is not answered by Changing KAAL, because Changing KAAL only knows the seat for the Work. Review's own rule applies to any round written: it states under whose authority and in what independence of the result's maker. Whether a lens review needs an *assigned* actor at all is the open question (architecture, Q4).

## 4. Existing Change artifacts

A Change record is `work/`, `review/`, three retros; `work/` holds "Intent, Requirements, Architecture and the support and evidence", with no required names. SKILL.md allows other meaningful artifacts to join a record "where a capability or process calls for them; they do not replace or reorder the steps" and warns against phase metadata. The Change ID covers every regular file in the tree, so any directory a Process calls for would be sealed with the rest. **Not demonstrated here:** whether `check-kaal-admission` accepts a closed Change with a directory other than the five named; I did not close or seal anything.

## 5. Is `kaal-changing` already a Process?

Yes in substance, and in the strictest form. It names participants (Intent and Review as optional, Sealing as a prerequisite, and its own retrospectives), states relationships (Intent is the fixed target; Review is of the Work, not the Intent; seals precede retros), states a feedback loop (work ⇄ review), fixes seats (Owner, Worker, Reviewer) and states its boundary (a Change; the Record). It does three different jobs, which a Process concept separates:

1. **Keeping a record**: layout, allocation, closure by seal (machinery).
2. **A compass**: one deterministic definition of order (`change-state.mjs`).
3. **Composition**: where Intent, Review and Retro sit relative to each other.

Only the third is the Process concept in the Intent, and the first two are what makes a Change a closed Change (the compass's order *is* the closure predicate). The architecture (§7.1) breaks the capability into ten responsibilities and sorts them. The second is a *prescriptive* property that one Process chose (Changing KAAL fixes an order); the concept must not require it. Its Node already draws this line in words: "the capability for managing changes to KAAL **through KAAL's change process**… not the changes themselves, and not the tools". The capability and "KAAL's change process" are already two things in the sealed text.

## 6. Naming (`kaal-changing` vs `kaal-process-change`)

- KAAL names a capability by what it is for (`kaal-intent`, `kaal-review`, `kaal-sealing`, `kaal-collecting`); the *kind* of thing is carried by the Node's type and found by type alone ("found by Node type alone", `core/Skill.md`, `core/Extension.md`).
- A delivery name is placement, not identity (open #43; 07/08 drew the same line for seats). A name that carried the kind (`kaal-process-…`) would introduce a second classification that Core does not read and that could disagree with the type.
- A sealed Node cannot be renamed: changed bytes are another Node, and the old one stays. Renaming a package or an Agent Skill directory changes delivery, not capability identity.
- **Reading:** the name question follows from the responsibility question. The inventory above and the architecture's comparison of supersession and separation (§7) decide what each capability is responsible for; a name then expresses that. `kaal-process-change` fits a capability whose responsibility is the Change Process, not the one whose responsibility is the governed Change. No rename of anything existing is proposed.

## 7. BRAIN and `kaal-learning` (#72, read only, not touched)

#72 is open (review round 04 pending) and nothing in it is relied on as established. What it contributes to this question: a derived read surface (`find`, `near`, `show`) that finds Skill Nodes, Learnings and Changes from the Agent's own words with a byte budget and follows references both ways; Learnings cite Skill Nodes by `{name, id}` and say only what experience adds; "not a gate". A Process lens statement is the same kind of thing as a Learning in one respect, a Node citing earlier Nodes, and the same kind of thing as a Skill in another. Whether lens discovery rides on that surface is a question for after #72 is reviewed (architecture, Q14). BRAIN would hold *learning about lenses* (for example, "an Intent review before establishment catches how-leaks"), never the lens's meaning.

## 8. What is genuinely missing

| # | Gap | Not a gap because | Evidence |
|---|---|---|---|
| G1 | The relationships between capabilities live in unsealed Agent Skill wording, not in a Node, so a Core-following Agent cannot see them and they are not pinned to the capability bytes they were written for. | Core can already hold such a statement as a Node citing earlier Nodes. | §2 |
| G2 | No statement of a *lens* (subject, standard, expectation) exists anywhere; the only lens exercised so far was supplied in a GitHub comment. | Review can already examine any result with an identity. | evidence §1 |
| G3 | The standing of a targeted review is undefined: not a ROWING round, not recorded, no stated seat. | For other subjects the compass detects a mismatch; for the Work itself only placement and the Reviewer's statement separate it (§3). | §3, scratch run |
| G4 | An *internal* lens needs a Way of Working to examine against, and only Intent has one. No `kaal-requirements`, `kaal-architecture`, code or operations Way of Working exists. External lenses need only an identified upstream result and are available for every pair. | — | §2 |
| G5 | Timing: results are immutable once established, so an internal lens on an established subject yields no fixable finding. A Process has to say whether the lens applies before or after establishment. | — | evidence §2 |
| G6 | A Process that pins composed capabilities by exact ID has to be re-born when one of them is; KAAL has no supersession rule. | — | §1 |
| G7 | An Agent cannot, from a subject, find the lenses that concern it without prior knowledge of names; "cited by" is derived by reading. | Discovery of installed capabilities exists. | §1, §2 point 2 |

None of G1 to G7 needs Core to change, a Node Form extension, a new relationship model, or a new package *to state*. G6 and G7 need a decision about supersession and about the read surface, both owned elsewhere (see Questions).

## 9. The code, function by function (read for the Owner's direction on separation)

Read: `packages/kaal-changing/skills/kaal-changing/scripts/change-state.mjs` and `next-change.mjs`, `engineering/change-seal/helpers/{compass,process,changes,admission,preservation,cli}.ts`, `packages/kaal-github/src/{controls,kaal}.ts`. "Artifact" means true of any Change as a sealed directory tree; "Process" means true only of Changes made by the ROWING/WORK order.

### 9.1 `change-state.mjs`

| Piece | What it does | Nature |
|---|---|---|
| `changes(kaalDir)`, the address grammar `<name>/YY/MM/DD/CC`, `present()` | which directories are Changes | artifact |
| `next-change.mjs` | allocates the next `CC`, never reuses a gap | artifact |
| `SEALS`, `TREE_SEALS` | where Change seals and named-tree seals live | artifact |
| `changeId()` (`KAAL Change v1`), `namedTreeId()` (`KAAL Tree v1`) | which tree is a Change, which is a named tree, delegated to Sealing for the hash | artifact |
| `sealedIds()`, `sealedTreeIds()`, `closedChanges()` | **a Change is closed exactly when the ID of its current tree has a seal** | artifact |
| `checkChanges()`, first two checks | a Change seal or a tree seal that matches no tree means sealed history was altered or removed | artifact |
| `checkChanges()`, last check | "`<c>` is closed but its `work/` is not sealed" | **mixed**: it names `work/`, a Process directory, yet admission relies on it today |
| `stateOf()` override | `SEALED HISTORY DAMAGED` outranks the order | artifact (wrapped in the process function) |
| `derive()`, the `closed` early return | a sealed tree is `CHANGE CLOSED`, `next: none`, **with no look at its contents** | artifact |
| `WORK`, `currentWorkId()` | `work/` as the one recognized named tree; `checkChanges()` resolves tree seals against it | **artifact (compatibility rule)**, used by the Process too |
| `REVIEW`, `RETRO_*` names | which sub-trees and files the order talks about | Process |
| `rounds()` | reads `review/NN.md`, requires one `Work: <id>` and one `Result:` line, a gapless sequence | Process (and a second parser of Review's round form) |
| `derive()`, the rest | stages `WORK OPEN`, `REVIEW CONVERGED`, `WORK SEALED`, retro order, historical forms flagged in an open Change, `next:` and whose act | **Process: ROWING, convergence, Work seal, retro order, next actor** |
| `compass({identity, markers})` | takes Sealing's calls as arguments | seam |
| the CLI `sealing()` | finds `kaal-sealing` beside it | artifact need, shared |

### 9.2 What reads it

| Consumer | Calls | Needs from Changing | Needs from the Process |
|---|---|---|---|
| `engineering/change-seal` `changes.ts` | `sealChange`, `sealWork` (bare seals) | artifact | none |
| `process.ts` `sealWorkStep`, `closeStep` | `stateOf` gates the write: only after review converged, only with the three retros | artifact + Process | **the only place the Process order is enforced** |
| `admission.ts` | `preserveChanges`, `newChanges`, `stateOf` must say `CHANGE CLOSED`, then its `problems` | artifact | none in effect (see 9.3) |
| `preservation.ts` | `closedChanges` | artifact | none |
| `packages/kaal-github` controls | run the root npm commands (`check-kaal-admission`, `preserve-kaal-changes`, `preserve-kaal-seals`) across a process boundary; import nothing | via those commands | none |

### 9.3 Two findings that bear on the separation

1. **Admission today checks artifact closure, not Process fulfilment.** Because `derive()` returns `CHANGE CLOSED` for any sealed tree before it looks inside, `admit` accepts a Change that never went through work, review or retros if its tree carries a seal. Shown in a scratch run (evidence §5c): a Change holding one note, sealed with the bare `seal` command, is `WORK OPEN` before and `CHANGE CLOSED` after, and `admit` returns `admitted`. The Process order is enforced only by the *writing* steps (`close-kaal-change`, `seal-kaal-work`), which refuse out of order, and by review. This is not introduced by this Change and is not fixed by it.
2. **Historical Changes are valid because closure is artifact-level.** The early forms (`retro.md`, `retro-observe.md`, no review) are never re-examined: a sealed tree is closed, whatever it contains. The historical-form warnings in `derive()` apply only to an *open* Change. So separating the Process from the artifact cannot invalidate history provided closure and preservation stay artifact-level, which they already are.

These two are the "artifact identity and structural validity versus fulfilment of a particular Process" distinction the Owner asked for. It is already present in the code, unnamed.
