# Architecture

An investigation against `02-requirements.md`, read from `kaal/genesis` at 1679d40 and from `Kai-Hacks-AI/KAAL-genesis` at 8dfab52. Nothing is built, sealed or established. Where I recommend, I say so; the forks are the Owner's.

## The answer in short

Core already supplies everything a Learning needs except a meaning for "Learning" and a place to keep Learnings. So:

- **A Learning is an ordinary Node.** Its identity is the SHA-256 of its bytes, it is sealed with a bare `seals/<ID>` marker, it refers to other Nodes by name and ID. Nothing in Core changes.
- **It does need a type of its own**, not for Core's sake but for discovery: KAAL finds definitions and Skills by type alone, and a Learning is found the same way. That type is a Node born in the new package, not in Core.
- **A BRAIN is a directory that someone names.** It holds sealed Learnings and their seals, nothing else, and has no identity, no list and no default.
- **Relationships need nothing new.** Core's Edge (a pointer written into the later Node's own bytes, to Nodes already sealed) is enough. "Cited by" is derived by reading, never stored.
- **What is genuinely missing** is three Nodes (`Learning`, `BRAIN`, `Learning KAAL`), a Skill whose scripts check, establish, find and trace Learnings, the decision of how a BRAIN is named, and two things Core does not give an installed Skill: a public way to ask whether a non-Skill Node is admitted (the nearest supported route is registration into a throwaway copy, which works), and any check of citations in a Node's body (the Skill supplies it). Everything else is reused.

## What exists, and what is missing

| Need | Exists | Missing |
|---|---|---|
| Identity of a Learning (R5) | Core: Node ID is the SHA-256 of exact bytes. Sealing: `artifact-id.mjs` with no domain prints exactly it | nothing |
| Immutability, written once (R7) | Core: changed bytes are another Node. Sealing: `seals/<ID>` markers, `seal.mjs write|check|list` | nothing |
| Refer to other Learnings (R13) | Core `Edge`: pointer from the source Node, to Nodes already sealed, by `{name, id}`; no identity of its own | nothing |
| Recognise a Learning by type (R9, R10) | Core `Node` Form, `type` by reference; KAAL Definitions and Skills are found this way | a type Node for Learning |
| Admit a Node in a graph (R9) | `registerSkill()` (public): admits the installed KAAL plus a contribution, all checks before any write; used by `register-skill --check` against a throwaway copy | no public admission of non-Skill Nodes; Core states but does not check citations in a body; named as a gap below |
| Join without becoming Core (R15) | `registerSkill()`: a Skill plus further Nodes (as `kaal-changing` carries `ROWING`, `WORK`, `RATIFICATION`) | the package |
| Say what BRAIN is | Mnemonic KAAL Definitions exist (`BASS`, `ROWING`, `WORK`, `RATIFICATION`) | `BRAIN` |
| Name the evidence (R12) | Change ID (address-free, defined by Changing KAAL, computed by Sealing under `KAAL Change v1`); carriers are identified by SHA-256 | a line form to cite it |
| Keep a place apart from the Engine (R1, R22) | Change `08/03`: Engine, Record and Subject are independent, named when used | the fourth place, BRAIN, named the same way |
| Agent discovers a capability | Agent Skills `description`, `.kaal/AGENTS.md` navigation, BASS | the Skill's text |
| Protect against removal (R24) | `preserve-seals`, `preserve-sealed-changes`: identity-based, baseline against candidate | a later control for a BRAIN's place (not here) |
| Decide something is understanding (R18) | nobody; Retro and Intent leave judgement to the agent and Owner | nobody, deliberately |

## The three Nodes

All three are born in `packages/kaal-learning/kaal/`, sealed with Node seals, and delivered by `registerSkill()`. Core is untouched, which makes this an ordinary Change.

1. **`Learning`**, a KAAL Definition. States what a Learning is: understanding established from experience, reusable beyond the occasion, naming the situation it applies to; not the experience itself; written once; grown by another Learning that refers to the earlier by name and ID; carrying no status; referring to its evidence by identity. A Node is a Learning exactly when its type refers to this Node. It is the type of every Learning.
2. **`BRAIN`**, a KAAL Definition and a mnemonic (Be Right And Improve Network). States that a BRAIN is the Learnings a reader has been given, no more; that it is named by whoever uses it and its place is not its identity; and that no BRAIN is the one KAAL has. It refers to `Learning` by name and ID.
3. **`Learning KAAL`**, a Skill, typed by `Skill`. The capability for establishing and finding Learnings; its scope is that alone; it is not Core, not a Change's step and not Sealing. Same shape as `Intent`, `Retro` and `Changing KAAL`.

*Why the type is not the Skill Node.* A Learning typed by `Learning KAAL` would make every Learning's type change whenever the practice text is improved, and a BRAIN would then hold Learnings under several types for one meaning. The definition of what a Learning is changes slowly; the instructions for establishing one change often. They are two Nodes for the same reason `WORK` and `Changing KAAL` are.

*Why not no type.* A Node with no `type` is a candidate root of the type chain (`admit()` starts the chain with it). Learnings must be typed, and by a Node that is not `Skill`, because a Node is a KAAL Skill exactly when its type refers to `Skill`.

Draft text of all three and of four candidate Learnings, with their IDs, is in `04-evidence.md`. The IDs are provisional until the text is final.

## What a Learning looks like

Core's Form is frontmatter `name` and `type`, and nothing else is a Form. A Learning therefore carries its structure in its body, as `Retro` and `Intent` do, and `check` reads that structure:

```
---
name: <the understanding, as a short phrase>
type:
  name: Learning
  id: <ID of the Learning Node>
---

# <the same phrase>

<The understanding, standing alone: what is understood, and what to do differently because of it.>

## Applies when

<The situation in which a later actor should recall it.>

## Evidence

<ID>  <path>
<ID>  <path>
```

- **The understanding** is prose. Any 64-hex ID in it is an Edge, written `<name> <ID>` as in Core's own Nodes ("CASE 6cffa0…"): it must be the ID of a sealed Node in the graph (Engine plus BRAINs supplied), with that Node's exact name immediately before it. This is where one Learning grows from another. Core states this rule for Edges and does not check it of a body; the Skill checks it.
- **Applies when** is what discovery shows first. It is the difference between a Learning and a note: an observation does not know when it applies.
- **Evidence** is a list of `<ID>  <path>` lines in the form `reach.md` already uses. `<ID>` identifies the evidence (today a closed Change, by its address-free ID); `<path>` is a file inside it. At least one line is required; a Learning with no experience behind it is an opinion. No PR number, branch, commit or check may appear, as nothing in `.kaal` carries them.
- **Name**: not unique. Two Learnings may share a name, as the original BRAIN's `testing` was born three times; the ID tells them apart.

Whether to prescribe these headings or leave the body free, as `Intent` does, is Fork 3.

## Where a BRAIN is and how it is found

A BRAIN is a directory:

```
<brain>/
├── <ID>.md        a sealed Learning, named by its own ID
└── seals/<ID>     an empty marker, as for any Node
```

- **Located by argument.** Every script takes `--brain <dir>`, repeatable for reading, exactly one for establishing. There is no default in a script, no key in Core's `config`, no registry, and nothing remembered. Who tells the agent which BRAIN to use is the Owner, the operator, or the host's own `AGENTS.md` in its own words; the first is a sentence in a conversation, the others are host files KAAL does not own. A repository's own wrapper (a root `npm` script) may name a directory for that repository, as `.kaal` is named by the root scripts today; that is the repository's choice, never the Skill's.
- **Not derived.** A script never looks for a BRAIN beside the Engine, in a Change, or in the Subject. That a BRAIN happens to be in the Subject's repository is a fact about one use.
- **Named by its ID, so identity cannot drift from the file.** `<ID>.md` is checkable by recomputing the hash: a renamed or edited file is found without asking a baseline. The name carries no meaning that identity does not already have; the check recomputes and compares, and the path is never trusted.
- **Flat, undated, unlineaged.** Order is not stored. A Learning can only refer to Nodes sealed before it, so the references are the order. There is no allocation (contrast Changes, which need a number), so two actors establishing at once cannot collide: the same bytes are one file; different bytes are different Learnings.
- **Seals travel with their Learnings.** The Node seal for a Learning is in the BRAIN beside it, so the BRAIN is complete without the Engine's `seals/`. This is the same principle Change `08/03` set for Records (R4): what attests a thing is kept where the thing is.
- **Combining is union.** Copying the files of one BRAIN into another can never conflict (same ID, same bytes), so there is nothing to synchronise and no direction to choose. Choosing what to carry is a human act, and this is also the portable form: a BRAIN handed to another instance is a directory of files.

*Alternative considered.* The original BRAIN made a Learning's *path* its identity, kept lineages as directories, chained their seals and had a default root `brain/learning`. That is the conflation the Intent forbids, and Core's identity has since replaced the need: location cannot be identity when identity is the hash.

## Verifying a BRAIN

Two layers, kept apart because only the first is Core's.

**What Core decides, reached through Core's public API.** `admit()` and `candidates()` are not exported (and stay unexported, as ruled), so an installed Skill cannot call them. Core's public API does admit a graph: `registerSkill()` admits the installed KAAL together with a contribution, with every check before any write, and the engineering Skill's `register-skill --check` already uses it against a throwaway copy so that Core decides. `kaal-learning` does the same. It copies the Engine to a throwaway directory and registers, in memory, the `Learning KAAL` Node (it satisfies the rule that a contribution carries a Node typed by `Skill`; its bytes are the installed ones, so registering them changes nothing) plus the Learning and a seal marker for it. Core then refuses, naming the Node, unless the Learning is Form-valid, sealed (by that marker) and typed, by name and ID, by an admitted Node. Nothing is written to the Engine or to the BRAIN. This needs the `kaal-core` package to be resolvable, exactly as `register-skill` does; without it `check` says that Core admission was not run and refuses to call the BRAIN checked.

**What Core does not decide, which the Skill decides and says so.** Core's admission does not read a Node's body. These are the Skill's own checks, written for Learnings:

1. `<ID>.md` hashes to its own name (Sealing's `artifact-id.mjs`, bare).
2. The Learning is sealed in its BRAIN's `seals/`, and every seal has its Learning.
3. Its type is the Engine's `Learning`, by name and ID.
4. **Structure**: the body begins `# <name>`, then `## Applies when` (not empty), then `## Evidence`.
5. **Citations**: the understanding (everything between the frontmatter and `## Evidence`) cites a Node only in the form Core's own Nodes use, `<name> <ID>`. Every 64-hex ID there must be the ID of a Node found in the given Engine or BRAINs, that is **sealed**, with its **exact name** immediately before the ID and a single space. An absent ID, an unsealed target, a name that is not the target's, a bare ID, and a Learning citing itself are each refused. This is Edge's rule (to already-sealed Nodes, by name and ID) checked, since Core states it and does not check it of a body.
6. **Evidence** lines are `<ID>  <path>` and only in `## Evidence`. A 64-hex ID in the understanding is a citation, never evidence, so the two cannot be confused: a Change ID written into the understanding is refused as a citation of nothing.
7. **Evidence resolves**, when Records are given (see Establishing for when they must be).

The Skill therefore holds one copy of Core's meaning: the Form, in the three-line frontmatter regex it needs to read `name` and `type`. That duplication is stated, not hidden, and it is held by a check, as `One meaning has one definition` asks: the engineering acceptance runs the Skill's reading and Core's own `candidates()` over every Node in the installed KAAL and the packages and requires them to agree, and the Skill never decides admission itself, since that is the layer above.

*The genuine gap, named.* An installed Skill has no supported way to call Core's Node reading directly; the nearest supported route is registration, used above as an oracle. Three ways to close it differently, none needed now: (a) accept the copy of the Form, held by the acceptance check (recommended); (b) a Core Change that exports one read-only function, travelling alone, after which the copy goes; (c) make `kaal-learning` a Core concern, which the Intent rules out. Fork 7.

*What check cannot see.* A Learning deleted together with its seal leaves a BRAIN that is whole and smaller. Nothing inside a directory can know what it used to hold, as the Kernel's genesis seal and the Change seals rely on a baseline held elsewhere. For a BRAIN in a repository that baseline is the target revision, and the control is the one Change `08/03` designed for Records: baseline and candidate places resolved independently, judged by identity. It is a later Change that follows the Record locator, and a BRAIN is valuable without it (R24). It is shown in the evidence as the one refusal that does not fail.

## Establishing

`establish --engine <kaal-dir> --brain <dir> --record <kaal-dir>… <draft>`. Establishing a new Learning is not the same act as checking an established BRAIN, and it is stricter.

1. **Pre-write validation of a draft that has no file and no seal in the BRAIN.** The draft is a file anywhere, typically in the `work/` of the Change being done; its path is not identity. Its ID is computed (Sealing). It is then examined as a prospective member: Core is asked by the throwaway registration above, with the **prospective seal supplied in memory**, so nothing is written or sealed in the destination to find out; the Skill's own checks 3 to 6 run on the draft's bytes against the Engine and the BRAINs given; and the evidence resolves (below). The destination is untouched by every one of these.
2. **Evidence must resolve to establish.** At least one `--record` is required, else `establish` refuses before reading the draft. Every evidence line must be a closed Change: a directory in a given Record whose recomputed Change ID is the line's ID, with its Change seal in that Record's `seals/changes/`, containing the named path as a regular file. **The only supported kind of evidence in this architecture is a closed Change.** Any other kind (a carrier hash, a collection address, an unclosed Change, an ID in no Record) is refused, naming the line; it is never skipped and never accepted unverified. A new kind is admitted by adding its resolver in a Change of its own. (Reading is more permissive on purpose: `check` of a portable BRAIN without a Record reports "evidence unverified" for the whole BRAIN and exits 0, and with a Record refuses any line that does not resolve. A reader without the Records can still read; only establishing needs them.)
3. **Already held.** If `<brain>/<ID>.md` exists with exactly the draft's bytes and its seal, nothing is written and it says so. If it exists with other bytes it is refused (changed bytes are another Node, so this cannot occur for a file named by its own ID, but the check stands). If the file exists but its seal does not, the seal is written (the bytes are the ones the ID was computed from).
4. **Writing.** Only after every check passes: the file is written to a temporary name and renamed to `<ID>.md`, then Sealing's `seal.mjs write` makes the seal. If any step fails, what this run created is removed; nothing existing is touched. Establishing never edits the draft, never replaces a file and never removes a seal.
5. **After.** The established-BRAIN `check` can be run at once; it is the same code with the seal now real.

`establish` does not decide that the draft is understanding. That judgement is the agent's and, where the Owner wants it, a Reviewer's: a draft Learning is a result with an identity and `kaal-review` can name it (`--of Learning`) like an Intent. KAAL has no new seat for this.

The Skill's text (`SKILL.md`, the agent-facing form) carries the practice, which is where the judgement lives (BASS: Bare and Skill do the part that cannot yet be a Script):

1. **Look first.** `find` the BRAINs you were given for what already applies. Read what comes back before writing anything.
2. **Decide what the evidence is.** A retrospective is one writer's account. Read the observations across the experience; the recurring ones, the ones that changed a decision and the ones a later actor would repeat are candidates; a single observation usually is not.
3. **Say whether it is understanding.** Could a different actor in a different Change use it? Does it say what to do, and when? If not, it is an observation and stays evidence.
4. **Choose its home.** If a capability or process text already owns this practice, the learning belongs there, as a Change to that text, and a Learning only cites it. If it is a want, it is a Request or an Intent. If it is a failure of what KAAL intends to hold, it is an Incident. A Learning is for understanding that has no other owner.
5. **Grow, don't duplicate.** If a Learning already holds the understanding, don't write it again; if you can say something the earlier one does not (a correction, a narrower case, a wider one), write that, cite the earlier by `<name> <ID>`, and say in one sentence what changed.
6. **Write it, check it, establish it.**

## Discovering and using

`find --engine <kaal-dir> --brain <dir>… [<term>…]` prints each admitted Learning as `{name, id}`, the BRAIN it came from, its *Applies when* paragraph and the IDs of Learnings that cite it, filtered by the terms if any. `show <id>` prints one. `trace --record <kaal-dir> <id>` lists the Changes whose files mention that ID. All three read and write nothing.

- **Matching is not judged by a script.** `find` lists and filters by plain text; deciding that this Architecture is the situation a Learning applies to is the agent's reading of *Applies when*. A semantic index would be a cache, never an authority, and is not proposed.
- **What brings an agent to `find`** is the Skill's `description` (it is loaded wherever the Skill is installed), written for the moments the evidence shows: before Requirements or Architecture are committed, before a review, when a retrospective is being turned into something kept. There is no hook in Changing KAAL (R16). A host that wants learning consulted says so in its own `AGENTS.md`.
- **Use is a citation.** A Work that applies a Learning cites it in its own text by name and ID, as it would cite any Node. `trace` then answers "which Records cite this". A Learning nothing cites is not shown unused (an actor may have read and acted without writing it down); one that many cite is shown used. A Learning is never marked by being cited.
- **Where Records are** is a locator too: `--record` names a directory of Changes, as Change `08/03` names Records, and none is assumed.

## Relationships between learnings

Core already provides the semantics: an Edge is written in the source Node's bytes, points only at sealed Nodes, and has no identity of its own. For Learnings that means:

- **A refinement, correction or counter-case is another Learning that cites the earlier by name and ID.** Order follows from birth: only an earlier Node can be cited. The earlier one is unchanged. The scratch run in `04-evidence.md` shows a Learning citing another, with the first then reporting "cited by 1".
- **No relation vocabulary is introduced** (`supersedes`, `contradicts`, `tests`). The original BRAIN needed relation Nodes because its identity was a path inside a lineage; here a citation is a citation, and what kind is said in a sentence.
- **The test for a typed relation later** is a decision a tool must make without a reader: for example, excluding superseded Learnings from `find` by default. Nothing in the exercise needed that; a reader choosing from four short *Applies when* lines does not.
- **No lineage.** A topic is not a place. A reader who wants "everything about review" searches by term, and finds Learnings that cite each other by following the IDs.

## Compatibility with Engine, Record and Subject

BRAIN is a fourth place. It is neither Engine (it is not KAAL's meaning or machinery) nor Record (it is not what KAAL kept about Work it governed) nor Subject, but it reads from Records and is read before Work on a Subject. All four are named when used; any two may coincide.

| Mode | Engine | Record | Subject | BRAIN |
|---|---|---|---|---|
| Engineer (this repository) | `.kaal/` | as Change `08/03` | this repository | a directory the Owner names for this repository (Fork 1), consulted by argument |
| Embed (e.g. Enercon) | `.kaal/` in the host | the host's choice | the host | none unless the host names one; an embedded KAAL without a BRAIN learns nothing and loses nothing. It may be pointed at a BRAIN held elsewhere, read-only |
| External | anywhere, not in the Subject | the operator's store | a repository with no KAAL artifact | the operator's, outside the Subject; nothing is written to the Subject for learning |

- Learning from a Subject's experience (an Incident or a Request carrier collected from a client, a PR's operation) is Learning from evidence the operator holds; the Learning lands in the operator's BRAIN, not in the client. That a client reads a BRAIN is the operator's decision to share files.
- Seals follow the principle of `08/03`: Node seals remain with the Engine for Engine Nodes; a BRAIN's Learnings carry their own beside them.
- The Skill itself is delivered like every other: `kaal-<capability>`, a package under `packages/`, installed by the installer on the Engine's Skill reports. It writes nothing under `.kaal/` and adds no instance-owned state directory, so the installer's drift rule is not touched (a pattern three Changes met).

## Does this respect the boundaries?

| Boundary | How |
|---|---|
| Reuse Core's Node model and identity | A Learning is a Node, ID is the SHA-256 of bytes; admission is Core's, reached through `registerSkill()` into a throwaway copy of the Engine; the checks Core does not make (structure, citations, evidence) are the Skill's and are named as such |
| Reuse Sealing | Identity from `artifact-id.mjs` (bare), seals from `seal.mjs`; no domain, no marker form, no seal namespace added |
| Independent optional Skill | A package that joins by `registerSkill()`; needs only Sealing beside it; not installed by embedding |
| Learning not a gate in Changing KAAL | No file, step, phase, check or text of Changing KAAL, Review, Retro changes |
| No new roles or approval | A BRAIN's host governs acceptance; KAAL records no author, approver or status |
| Location not identity or meaning | Located by argument; named `<ID>.md` only as a checked convention, with the path never trusted |
| Not every finding becomes a Node | The Skill's practice makes "not a Learning" and the other homes explicit; the exercise shows six dispositions, two of them "no Node" |

## Transition (proposal; nothing is authorised)

Each step is its own Change, green, in this order.

1. **Birth `Learning`, `BRAIN`, `Learning KAAL` and the Skill.** `packages/kaal-learning/` (Nodes, seals, `SKILL.md`, scripts `check`, `establish`, `find`, `show`, `trace`), `engineering/kaal-learning/` acceptance with the refusal matrix (R27), the self-install projection. First Skill Node outside Core is sealed with the repository's engineering bootstrap helper, an intended exception, as for `Sealing`. Needs `kaal-sealing` beside it and the `kaal-core` package resolvable (as `register-skill` already does), and says so.
2. **Establish the first Learnings and open this repository's BRAIN.** The drafts here, reviewed as results by an assigned Reviewer; whichever of them the Owner accepts. They ride a Change as vehicle, because this repository admits one closed Change per proposal; that is the repository's admission rule and not KAAL's, and it also gives the Learnings a reviewed Work to be established from.
3. **Control for a BRAIN's place in a governed repository**, after the Record locator exists, so one baseline/candidate resolution serves both. `.github` and controls, alone.
4. Only then, if use shows it: an index as a cache, typed relations, supersession-aware listing.

## Risks and honest limits

- **Judgement stays judgement.** Nothing here makes an agent write a good Learning. The checks make a bad one visible (no evidence, wrong type, unresolved reference), not wrong.
- **Evidence is only as durable as its holder.** A Learning cites a Change by ID; anyone without the Record cannot resolve it. That is stated, not hidden, and the Learning's own text must stand without it.
- **Deletion is invisible from inside** (above). The control is a later Change.
- **`kaal-core` must be resolvable** for Core admission, as for registration. A host that has only Core's deployed artifacts can read a BRAIN and run the Skill's own checks, but `check` says Core admission was not run and does not report the BRAIN as checked. How a host obtains the package is the composition question the open `08/03` sibling raises, not this Change's.
- **A copied Form.** The Skill reads `name` and `type` with its own copy of Core's three-line Form. It is held by an acceptance check against Core's `candidates()` on every real Node, and removed if Core ever exports a read-only reader (Fork 7).
- **Only closed Changes are evidence** for now. A Learning from a collected Incident or a test result cannot be established until that kind has a resolver. This is the cost of refusing, instead of accepting unverified, and is deliberate.
- **`find` by plain text** will not scale to thousands of Learnings, and will not match a synonym. Both are fine at the scale the exercise shows (four Learnings from eight Changes) and are the reason not to build an index before use shows it is needed.
- **The type Node is fixed by its ID.** A reborn `Learning` Definition (new bytes) leaves existing Learnings typed under the old one; an Engine then needs both. This is the supersession gap every Skill has, not new.
- **Ordering of births is a constraint.** `Learning` is sealed first, `BRAIN` cites it, `Learning KAAL` cites both; the Learnings cite `Learning`. Any change to the first changes every ID below it.
- **Parallel Changes.** `08/03` is taken by three open PRs; this Change took `08/04` because `next-change` allocates optimistically. Whichever lands later renumbers, and the staged Change moves whole.

## Forks for the Owner

- **Fork 1. Where does this repository's own BRAIN live?** (a) A `brain/` directory at the repository root, named by a root `npm` wrapper, with every script still requiring `--brain`. (b) Its own repository. (c) Inside `.kaal/`: not recommended, since that places it with the Engine. **I recommend (a)**: it shares this repository's Reviewer and controls, and stays a choice of this repository, not of the Skill.
- **Fork 2. Is evidence required?** At least one `<ID>  <path>` line per Learning. **I recommend yes.** Without it a Learning is indistinguishable from an opinion, and the Intent's distinction between evidence and understanding disappears.
- **Fork 3. Prescribed headings or free body?** `Applies when` and `Evidence` as fixed headings (as `Retro` fixes its four) or a free body checked only for Form, type and evidence. **I recommend fixed headings**: discovery needs *Applies when*, and the checks for citation and evidence need somewhere to look.
- **Fork 4. File names in a BRAIN.** `<ID>.md` (recommended: checkable, no collisions, no meaning in the path) or readable names with the ID embedded. Readable names cost a second rule to check and another to refuse when they disagree.
- **Fork 5. How an accepted Learning gets into this repository.** Riding a Change as vehicle, reviewed as a result with `kaal-review` (recommended), or a separate lighter admission for `brain/`, which would be a control and a new governance path.
- **Fork 6. The historical BRAIN.** Leave `KAAL-genesis` where it is as read-only evidence and re-establish a Learning from it only when current work calls for it (recommended), or migrate. Its nodes have no `type` and a path identity, so they are not Learnings as KAAL now means it; a new Learning can cite one by its byte ID as evidence, which names it without importing it.
- **Fork 7. The copied Form or a Core export?** The Skill keeps a copy of Core's Form, held by an acceptance check against Core (recommended, nothing changes in Core), or a Core Change first exports one read-only reader and the copy never exists. The second is cleaner and slower, and Core has been kept small on purpose.
- **Fork 8. Evidence kinds.** Only closed Changes are accepted when establishing (recommended). Another kind (a collected carrier, a test result) is added only with its own resolver in its own Change.
