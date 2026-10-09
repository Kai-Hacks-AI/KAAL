# Architecture

An investigation against `02-requirements.md`, read from `kaal/genesis` at 1679d40 and from `Kai-Hacks-AI/KAAL-genesis` at 8dfab52. Nothing is built, sealed or established. Where I recommend, I say so; the forks are the Owner's.

## The answer in short

Core already supplies everything a Learning needs except a meaning for "Learning" and a place to keep Learnings. So:

- **A Learning is an ordinary Node.** Its identity is the SHA-256 of its bytes, it is sealed with a bare `seals/<ID>` marker, it refers to other Nodes by name and ID. Nothing in Core changes.
- **It does need a type of its own**, not for Core's sake but for discovery: KAAL finds definitions and Skills by type alone, and a Learning is found the same way. That type is a Node born in the new package, not in Core.
- **A BRAIN is a directory that someone names.** It holds sealed Learnings and their seals, nothing else, and has no identity, no list and no default.
- **Relationships need nothing new.** Core's Edge (a pointer written into the later Node's own bytes, to Nodes already sealed) is enough. "Cited by" is derived by reading, never stored.
- **What is genuinely missing** is three Nodes (`Learning`, `BRAIN`, `Learning KAAL`), a Skill whose scripts check, establish, find, show and near Learnings, Skill Nodes and Changes, the decision of how a BRAIN is named, and two things Core does not give an installed Skill: a public way to ask whether a non-Skill Node is admitted (the nearest supported route is registration into a throwaway copy, which works), and any check of citations in a Node's body (the Skill supplies it). Everything else is reused.

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

- **Name**: not unique. Two Learnings may share a name, as the original BRAIN's `testing` was born three times; the ID tells them apart.

Whether the body is prescribed or free was Fork 3, decided by the Owner: structured, with the understanding as prose.

### Prose and mechanics

*Owner decision, Fork 3:* a Learning is structured and deterministically readable, with its understanding as prose. Its content is therefore of two kinds, kept apart because they are read differently. **Prose** is for an Agent to read and judge; a script never interprets it. **Mechanics** are for a script to decide; each has an exact grammar and a deterministic check, and none needs anyone to infer what a value means. (In the rest of this document the two section names are the working names used in the prototype, `Applies when` and `Evidence`; the analysis below proposes the clearest terms and does not freeze them.)

| Part | Kind | Exact rule | Decided by |
| --- | --- | --- | --- |
| Frontmatter | mechanical | Exactly `name` and `type` (`type` is the Engine's `Learning`, by name and ID). **No other field, ever**: Core's Form admits nothing else, so a Learning with an added field is not a Node by Form and cannot be admitted as one. No tags, status, date, author, confidence or lineage field. | Core's admission, and the Skill's type check |
| Title | mechanical | The first body line is `# <name>`, equal to the frontmatter `name`. | Skill |
| Understanding | prose | Free Markdown between the title and the situation section. The only mechanical reading is citations. | Agent; Skill scans citations |
| Situation section | heading mechanical, content prose | Exactly one, after the understanding and before the evidence section; its content is not empty and is never parsed. | Skill (presence, order, not empty) |
| Citations | mechanical | Every 64-hex ID in the understanding or situation is written `<name> <ID>` and is a sealed Node with that exact name. | Skill |
| Evidence section | wholly mechanical | The last section. Every non-blank line is `<64-hex ID>` or `<64-hex ID>  <relative path>` (two spaces) and nothing else is in it, not even prose. At least one line (Fork 2). The ID names a sealed KAAL artifact (Fork 8); the path, required for a directory artifact and refused for a one-file artifact, names a regular file inside it (confined, F6). There is no kind label: the kind is the kind in whose seals the ID is found, and a label would be a second claim to check. | Skill, and Sealing through it, in the places given |

*What the prototype does and does not yet enforce.* It checks Form and type, the title, that the situation section is present, ordered and not empty, citations, and every evidence line's grammar and resolution. It does not yet refuse a second situation section or an empty understanding, and the added-field case was not run; the rules above are the contract for the implementation, and these three need cases in it.

A new structured element is added only with an exact grammar, a deterministic check and a reader who needs it; "might be useful" does not qualify. The two prose parts are where the understanding lives. The situation text is prose on purpose: a script that matched it would be pretending to know when something applies, which is the Agent's judgement.

**The terms, from what each must mean.** The situation section states, in general terms, the circumstance in which a later actor should bring this understanding to bear. It is the writer's statement, compared by the reader with the reader's own present circumstance; it is not the circumstance in which the Learning was learned (that is evidence). The evidence section lists what experience left behind that supports the understanding: several, each identified and resolvable, giving traceability and not proof (Fork 2).

- For the situation: *Context* is already overloaded in KAAL (bounded context, context window, Subject). *Conditions* suggests a predicate a script could evaluate, which it is not. *Relevance* is the reader's judgement of fit, not something a writer states. *Applies when* is accurate but half a sentence and a property, not a noun; *Use when* belongs to a Skill's `description`, instructions to use something, where a Learning is understanding to weigh. **Recommended: `Situation`.**
- For the evidence: *Provenance* means an origin or chain of custody, which in KAAL is already what identity and Edges do. *Source* is one thing and collides with source code and "source of truth". *Justification* is an argument, prose, and would invite prose into the one section that must have none. KAAL already says "evidence" in this sense (Review: "the observed Work with its evidence"; Changing KAAL: `work/` holds "support and evidence"). **Recommended: `Evidence`**, defined as above.

The two names live in exactly two places once implemented: the text of the `Learning` definition Node and the Skill's structure check. Settling them before the first Node is sealed costs an edit in each; the drafts and the prototype of `04-evidence.md` carry the working names and would be re-drafted with them.


## Where a BRAIN is and how it is found

A BRAIN is a directory:

```
<brain>/
├── …              Markdown Nodes in any folders, under any readable names
└── seals/<ID>     one empty marker per Learning, named by the Learning's ID, as for any Node
```

- **Located by argument.** Every script takes `--brain <dir>`, repeatable for reading, exactly one for establishing. There is no default in a script, no key in Core's `config`, no registry, and nothing remembered. Who tells the agent which BRAIN to use is the Owner, the operator, or the host's own `AGENTS.md` in its own words; the first is a sentence in a conversation, the others are host files KAAL does not own. A repository's own wrapper (a root `npm` script) may name a directory for that repository, as `.kaal` is named by the root scripts today; that is the repository's choice, never the Skill's.
- **This repository's placement (Owner decision, Fork 1).** This repository's own BRAIN is the root-level `brain/` directory, named explicitly by this repository's own wrapper or configuration (a root script that passes `--brain brain`, or the repository's `AGENTS.md` telling an agent to). That is a fact about this repository and not a KAAL convention: the Skill, Core and the Engine contain no `brain/`, no default path and no rule that a BRAIN is called that; another repository, a second BRAIN or a BRAIN outside any repository is named the same way, by its own locator. The Skill therefore has no `--brain` default and no fallback: an invocation without a locator is refused, and no part of it reads the Engine's location, the Record's, the Subject's or the current working directory to find one. The wrapper is repository machinery, outside the delivery boundary of `packages/kaal-learning/`, and is a later Change (nothing here creates `brain/` or the wrapper).
- **Not derived.** A script never looks for a BRAIN beside the Engine, in a Change, or in the Subject. That a BRAIN happens to be in the Subject's repository is a fact about one use.
- **Names and places belong to the people and agents who work in it (Owner decision, Fork 4).** A BRAIN is a shared human and agent workspace, so a Learning may be called anything readable, may live in any folder, and may be renamed or moved later: nothing depends on either. Identity is content: the ID is the SHA-256 of the exact bytes, the seal is named by that ID, and references are `<name> <ID>`. No script derives anything from a file name or a folder, so the organisation can never become a second identity (R5) or a hidden ontology the scripts rely on. The smallest organisation that works is one reserved name, `seals/` at the top, for marker files and nothing else; everything else is free. A Learning is found by Form and type (R10) at any depth. Markdown without Form (a `README.md`, say) and files that are not Markdown are not candidates and are ignored; links are never followed. A convention, not a rule: lower-case hyphenated names and folders by topic, so that a person browsing the repository finds what an Agent finds.
- **The establisher chooses the place.** `establish` takes `--path <relative .md path>`, chosen by whoever establishes, never derived from the name or the ID. It refuses a path that is absolute, contains `..`, does not end in `.md`, lies under `seals/`, resolves outside the BRAIN through a link, or already holds a file (establishing never replaces a file). If the same bytes are already held in the BRAIN at any path, it says `already held at <path>` and writes nothing, so a Learning is not filed twice by identity. A failed run removes what it created, including a folder it made.
- **Flat seals, by identity.** `seals/<ID>` does not mirror the folders, so moving a Learning touches no seal. This is Core's own arrangement for Nodes, which sit anywhere in an Engine while their seals sit in one place by ID.
- **Seal validity and preservation are different questions.** *Validity*, which the BRAIN can answer alone: a Learning is sealed when `seals/<its ID>` passes Sealing's check, so a Learning whose bytes were edited is another, unsealed Node; every seal has its Learning; a rename or a move changes nothing. *Preservation*, which it cannot: that nothing sealed has disappeared. A Learning deleted together with its seal leaves a BRAIN that is whole and smaller, and only a baseline held elsewhere can say so, which is the baseline and candidate control of Change `08/03` (#71), judged by identity (every sealed ID of the baseline is present in the candidate, at any path). Judged that way a move or rename passes and a deletion fails, and no path is compared. That control is a later Change (R24).
- **Seals travel with their Learnings.** The Node seal for a Learning is in the BRAIN beside it, so the BRAIN is complete without the Engine's `seals/`. This is the same principle Change `08/03` set for Records (R4): what attests a thing is kept where the thing is.
- **Combining is union by identity.** The same ID is the same Learning wherever it is filed, so copying one BRAIN into another loses nothing and changes no Learning, ID or seal, and there is nothing to synchronise. What can now clash is only two *different* Learnings given the same path, which is a matter of filing (one is placed under another name) and not of identity; this is the cost of free names, which the flat layout did not have. Choosing what to carry is a human act, and this is also the portable form: a BRAIN handed to another instance is a directory of files.

*Alternatives considered.* A flat layout of `<ID>.md` files was proposed in the first drafts: it made drift checkable by comparing a file name with its hash and made combining conflict-free, and it was rejected by the Owner because Markdown Nodes are a shared human and agent workspace in which readable names and organisation matter. Nothing is lost that the check needs: it recomputes the ID of every Node it reads and never trusted the name. The original BRAIN made a Learning's *path* its identity, kept lineages as directories, chained their seals and had a default root `brain/learning`. That is the conflation the Intent forbids, and Core's identity has since replaced the need: location cannot be identity when identity is the hash.

## Verifying a BRAIN

Two layers, kept apart because only the first is Core's.

**What Core decides, reached through Core's public API.** `admit()` and `candidates()` are not exported (and stay unexported, as ruled), so an installed Skill cannot call them. Core's public API does admit a graph: `registerSkill()` admits the installed KAAL together with a contribution, with every check before any write, and the engineering Skill's `register-skill --check` already uses it against a throwaway copy so that Core decides. `kaal-learning` does the same. It copies the Engine to a throwaway directory and registers, in memory, the `Learning KAAL` Node (it satisfies the rule that a contribution carries a Node typed by `Skill`; its bytes are the installed ones, so registering them changes nothing) plus the Learning and a seal marker for it. Core then refuses, naming the Node, unless the Learning is Form-valid, sealed (by that marker) and typed, by name and ID, by an admitted Node. Nothing is written to the Engine or to the BRAIN. This needs the `kaal-core` package to be resolvable, exactly as `register-skill` does; without it `check` says that Core admission was not run and refuses to call the BRAIN checked.

**What Core does not decide, which the Skill decides and says so.** Core's admission does not read a Node's body. These are the Skill's own checks, written for Learnings:

1. Every Markdown file with Form is a candidate, whatever it is called and wherever it lies; its ID is the hash of its bytes (Sealing's `artifact-id.mjs`, bare). The same bytes at two paths are one Learning, reported as such.
2. **A seal is what Sealing says it is.** The Learning is sealed when Sealing's own check (`seal.mjs check`: an empty regular file named by the ID) passes in its BRAIN's `seals/`; existence of a path is never taken for a seal. A non-empty file or a directory at `seals/<ID>` is not a seal: that Learning is not sealed, every use of it (checking, citing, evidence, "already held") treats it so, and `check` names the entry. Every seal has its Learning. The one marker supplied in memory by Establishing (below) stands in only for the draft being established; every marker that already exists is judged by Sealing.
3. Its type is the Engine's `Learning`, by name and ID.
4. **Structure**: the body begins `# <name>`, then the understanding, then the situation section (working name `## Applies when`, not empty), then the evidence section as the last section; its exact grammar is in "Prose and mechanics".
5. **Citations**: the understanding (everything between the frontmatter and `## Evidence`) cites a Node only in the form Core's own Nodes use, `<name> <ID>`. Every 64-hex ID there must be the ID of a Node found in the given Engine or BRAINs, that is **sealed**, with its **exact name** immediately before the ID and a single space. An absent ID, an unsealed target, a name that is not the target's, a bare ID, and a Learning citing itself are each refused. This is Edge's rule (to already-sealed Nodes, by name and ID) checked, since Core states it and does not check it of a body.
6. **Evidence** lines are `<ID>  <path>` and only in `## Evidence`. A 64-hex ID in the understanding is a citation, never evidence, so the two cannot be confused: a Change ID written into the understanding is refused as a citation of nothing.
7. **Evidence resolves**, when `--record` is given: each line is a sealed KAAL artifact found in the places given (see "Evidence: a sealed KAAL artifact"). Without `--record`, `check` reports evidence as unverified for the whole BRAIN.

The Skill therefore holds one copy of Core's meaning: the Form, in the three-line frontmatter regex it needs to read `name` and `type`. That duplication is stated, not hidden, and it is held by a check, as `One meaning has one definition` asks: the engineering acceptance runs the Skill's reading and Core's own `candidates()` over every Node in the installed KAAL and the packages and requires them to agree, and the Skill never decides admission itself, since that is the layer above.

*The genuine gap, named.* An installed Skill has no supported way to call Core's Node reading directly; the nearest supported route is registration, used above as an oracle. Three ways to close it differently, none needed now: (a) accept the copy of the Form, held by the acceptance check (**chosen by the Owner, Fork 7, provisionally**); (b) a Core Change that exports one read-only function, travelling alone, after which the copy goes; (c) make `kaal-learning` a Core concern, which the Intent rules out. Fork 7.

*The graph helper, as the Owner decided (Fork 7, PR comment 2026-10-09).* The minimum graph reading lives inside `kaal-learning`, knowingly provisionally: graph handling is a candidate for a future independent `kaal-graph` Skill, the way Sealing grew out of a helper. So it is kept as one isolated unit with a narrow, stated responsibility, easy to extract. It reads a Node's Form (`name`, `type`) and ID; indexes the Nodes of the directories it is given by ID; resolves a `<name> <ID>` reference and says whether the target is held, sealed (by Sealing's check) and rightly named; and derives forward and reverse references for discovery. It does not establish or interpret meaning: what a Node, an Edge, a type or admission is stays Core's, reached through `registerSkill()` as above, and the helper's reading is held to Core's by the acceptance check. Nothing else in the Skill reads Node bytes, so extraction means moving that unit and its tests and changing imports. This Change introduces no Core API change and does not build `kaal-graph`. The delivered Skill runs without the engineering repository: it needs only Node's standard library, the Sealing Skill's scripts (which it declares, R15) and the `kaal-core` package for admission; the acceptance checks against Core's `candidates()` live in `engineering/` and are not part of what is delivered.

*What check cannot see.* A Learning deleted together with its seal leaves a BRAIN that is whole and smaller. Nothing inside a directory can know what it used to hold, as the Kernel's genesis seal and the Change seals rely on a baseline held elsewhere. For a BRAIN in a repository that baseline is the target revision, and the control is the one Change `08/03` designed for Records: baseline and candidate places resolved independently, judged by identity. It is a later Change that follows the Record locator, and a BRAIN is valuable without it (R24). It is shown in the evidence as the one refusal that does not fail.

## Establishing

`establish --engine <kaal-dir> --brain <dir> --record <kaal-dir>… <draft>`. Establishing a new Learning is not the same act as checking an established BRAIN, and it is stricter.

1. **Pre-write validation of a draft that has no file and no seal in the BRAIN.** The command is `establish --engine <kaal-dir> --brain <dir> [--record <kaal-dir>…] --path <relative .md path> <draft>`. The draft is a file anywhere, typically in the `work/` of the Change being done; its path is not identity. Its ID is computed (Sealing). It is then examined as a prospective member: Core is asked by the throwaway registration above, with the **prospective seal supplied in memory**, so nothing is written or sealed in the destination to find out; the Skill's own checks 3 to 6 run on the draft's bytes against the Engine and the BRAINs given; and the evidence resolves (below). The destination is untouched by every one of these.
2. **Evidence is mandatory, and must resolve to establish.** *Owner decision, Fork 2:* every established Learning identifies at least one supporting evidence source, and `establish` refuses a draft with none (the prototype's `no evidence line` case). Evidence gives traceability, not mechanical proof that the understanding is right; whether it is understanding stays a judgement. *Owner decision, Fork 8:* the evidence must be a sealed KAAL artifact, verified as set out in "Evidence: a sealed KAAL artifact" below; a line that does not resolve is refused, naming it, and is never skipped or accepted unverified.
3. **Already held.** If the same bytes exist at any path of the BRAIN and the seal passes Sealing's check, nothing is written and it says where. If a file already exists at `--path` with other bytes it is refused. If the same bytes exist but have no seal, the seal is written (the bytes are the ones the ID was computed from); afterwards the seal is checked by Sealing and a marker that still fails (for example a non-empty file already at that path) fails the run, naming it, and is never overwritten or removed.
4. **Writing.** Only after every check passes: the file is written to a temporary name and renamed to `--path` (making the folders it needs), then Sealing's `seal.mjs write` makes the seal. If any step fails, what this run created is removed; nothing existing is touched. Establishing never edits the draft, never replaces a file and never removes a seal.
5. **After.** The established-BRAIN `check` can be run at once; it is the same code with the seal now real.

### Evidence: a sealed KAAL artifact

*Owner decision, Fork 8:* evidence is a sealed KAAL artifact, not a closed Change. Sealing is the trust boundary: an artifact qualifies because the domain that defines it gave it an identity and it was sealed. An unsealed observation, Incident, Request, test output or arbitrary file does not qualify by having bytes or a hash, and `Change` is one kind of evidence, not the definition of it.

**How a cited artifact is verified, using Sealing's own semantics.** Sealing does not decide what an artifact's identity is: the artifact's domain does, in one of Sealing's four forms (a file or a directory, unnamed or named) under a domain name, and the domain also decides where seals of its kind are kept. Sealing then does two things, computes an ID in the form and domain it is told and checks a marker in the seals directory it is told. So verifying a cited artifact needs three facts that belong to the artifact's own domain: where its seals are, the form and domain of its identity, and where artifacts of that kind are found. For an evidence line the Skill therefore does this, in the places it is given (the Engine, the Records and the BRAINs, each a directory with `seals/`):

1. Find a place in which the ID is sealed, by Sealing's `seal.mjs check`, in the seals location of a kind it knows.
2. In that same place find the artifact whose identity, recomputed by Sealing in that kind's form and domain, is the ID. A seal with no such artifact means the artifact was deleted or altered, and does not qualify.
3. For a directory kind, check that the path names a regular file inside it (confined, as in F6). For a one-file kind, there is no path.

The artifact stays where it lives and means what its domain says. The Learning cites only the ID (and a path inside a directory kind): it never states where the artifact is or what kind it is. The kind is not a label on the line, since a label would be a second claim; it is the kind in whose seals the ID is found. The line is `<ID>` for a file kind and `<ID>  <path>` for a directory kind, and a path on a file kind or none on a directory kind is refused.

| Kind | Seals | Identity (Sealing) | Found | Path |
| --- | --- | --- | --- | --- |
| Node (a Skill, a Definition, another Learning) | `seals/<ID>` | SHA-256 of the exact bytes, no domain | Markdown with Form anywhere in the place | none |
| Change | `seals/changes/<ID>` | `KAAL Change v1`, unnamed directory | `changes/<name>/YY/MM/DD/CC/` | required |
| Work tree | `seals/trees/<ID>` | `KAAL Tree v1`, named directory | the `work/` of a Change | required |

These rows are what Core and Changing KAAL already define; they are not new. `kaal-learning` restates three facts per row, a duplication of the same kind as the copied Form and handled the same way: a named risk, held by an acceptance check against the domains, until a domain offers a form a verifier can call. A kind is added by adding its row, in a Change of its own.

**What qualifies in practice.** A test result or an Incident becomes evidence by being sealed: kept in the `work/` of a Change it is covered by that Change's and that Work tree's seals and is cited with its path; a collected carrier that is itself sealed as a Node is cited by its ID. The same bytes unsealed are not evidence, however precisely they are identified.

**Implementation limits, not the definition of evidence.** A sealed artifact of a kind with no row (any domain that has not been added, or whose artifacts the table cannot find) is refused by that implementation with the message "not sealed in any place given, in any kind this implementation can verify", which says why without claiming the artifact is unsealed. What a seal attests is that these exact bytes were sealed by their domain, not that they are true or were the right evidence: evidence is traceability, not proof (Fork 2).

**Where evidence is looked for.** `establish` takes any number of `--record` places and no longer requires one: a Learning resting on a sealed Node needs only the Engine; one resting on a Change or Work tree needs the Record that holds it. A Learning whose evidence lines do not all resolve in the places given is refused. `check` without any `--record` reports evidence as unverified for the whole BRAIN, and does not verify the part it could.

`establish` does not decide that the draft is understanding. That judgement is the agent's and, where the Owner wants it, a Reviewer's: a draft Learning is a result with an identity and `kaal-review` can name it (`--of Learning`) like an Intent. KAAL has no new seat for this.

The Skill's text (`SKILL.md`, the agent-facing form) carries the practice, which is where the judgement lives (BASS: Bare and Skill do the part that cannot yet be a Script):

1. **Look first.** `find` over the BRAINs, Skills and Changes you were given for what already applies. Read what comes back before writing anything.
2. **Decide what the evidence is.** A retrospective is one writer's account. Read the observations across the experience; the recurring ones, the ones that changed a decision and the ones a later actor would repeat are candidates; a single observation usually is not.
3. **Say whether it is understanding.** Could a different actor in a different Change use it? Does it say what to do, and when? If not, it is an observation and stays evidence.
4. **Choose its home.** If a capability or process text already owns this practice, the learning belongs there, as a Change to that text, and a Learning only cites it. If it is a want, it is a Request or an Intent. If it is a failure of what KAAL intends to hold, it is an Incident. A Learning is for understanding that has no other owner.
5. **Grow, don't duplicate.** If a Learning already holds the understanding, don't write it again; if you can say something the earlier one does not (a correction, a narrower case, a wider one), write that, cite the earlier by `<name> <ID>`, and say in one sentence what changed.
6. **Write it, check it, establish it.**

## Reaching knowledge within a bounded context

*Owner input on the PR (Kai, 2026-10-09), taken as architecture direction:* BRAIN is needed for 0.0.1 so that an Agent can discover and navigate relevant knowledge within bounded context. An unfamiliar question must reach relevant Skill Nodes, Changes and Learnings without pre-known IDs and without loading everything. Skills already carry immutable Nodes, so BRAIN connects to them and does not duplicate them. Learning Nodes are established through Changes.

**The problem, measured.** KAAL's knowledge already sits in three kinds of place: Skill Nodes (the meaning of each capability), Changes (the Records: Intent, review, three retrospectives each), and, once they exist, Learnings. In the scratch host of `04-evidence.md` that is 115 KB of text for six Skills, 25 Changes and 5 Learnings, growing with every Change. An Agent cannot load that, and today nothing but memory of an ID or a grep leads from a question to the right Change.

**The shape: one read-only surface, three tiers, derived from the bytes that exist.**

0. **Admission on the read side.** Discovery shows as a Learning only what the BRAIN holds as one: a Markdown file with Form, at any name and depth, typed by the Engine's `Learning` (name and ID, the Engine's `Learning` itself sealed), with its own seal passing Sealing's check. Anything else in a BRAIN directory (an unsealed draft, a wrongly typed Node, a misnamed copy, a bad marker) is a candidate that is not admitted: it is never labelled a Learning, never counted among matches, and never joined by `near`. It appears only as a count line ("BRAIN files not admitted: N; run check"), so an Agent knows a BRAIN needs attention without a refused draft entering its knowledge. Skills are admitted by the same rule against `Skill`. Evidence is judged lightly here (reading without Records is permitted and says evidence is unverified); the full Core and structure checks remain `check`'s, and discovery does not claim them.
1. **Cards, bounded.** `find` takes the Agent's own words (the Agent is an LLM and phrases its own terms) and returns, per kind, at most `--limit` cards (default small), each: kind, name or Change address, a short ID, and one line. The line is what each kind already has: a Skill Node's first sentence, a Learning's *Applies when*, a Change's Intent (its first non-heading line), plus the single best-matching line from the text. It always says how many more matched and that narrowing the terms is the way to see them. A Learning's card also shows where it is filed in its BRAIN (`@ <path>`), clipped, as a hint for people and for reading with `show` or a file tool; it is never a reference, which is always the ID. The Agent never needs an ID in advance: IDs are in the output.
2. **Edges, bounded.** `near <id>` returns the neighbours of a Skill Node, a Learning or a Change, by the references that already exist, in both directions and with two relations kept apart. *Citation* is `<name> <ID>` in a Node's body or in a Change's own Work and retrospectives: for a Skill, the Learnings and Changes that cite it; for a Learning, the Skills and earlier Learnings it cites, the later Learnings that cite it and the Changes that cite it (applying or establishing it); for a Change, the Skills and Learnings it cites. *Evidence* is the `<ID>  <path>` lines of a Learning: for a Learning, the Changes it rests on; for a Change, the Learnings resting on it. A citation is checked against the known name and ID, as in the Skill's rule, so a bare ID is no edge. Nothing is stored for this. Navigation from a hit to the next hit is following references, which is how KAAL says an Agent finds anything ("follow references from Core").
3. **Full text, on demand and in pieces.** `show <id> [--from O] [--bytes N]` prints at most N bytes (default 1500, never more than 4000) of one Learning, Skill Node or a Change's Intent, and ends with the range it printed, the total, and the `--from` that continues, so an Agent reads a long Node in pieces by choice. Reading on is the Agent's decision after a card made it worth it.

**The output budget.** Counting cards bounds nothing if a card can be long, and Form allows an arbitrarily long name. So the bound is in bytes, stated by the command: `find` and `near` take `--budget` (default 2000 bytes) and stop adding cards when it is spent, clip every name to a fixed width with "…(+N chars)" so the reader knows it was clipped (the address is never clipped: every card carries the first 12 hex digits of the ID outside the clipped name, and `near` and `show` refuse a prefix that matches more than one Node or Change, asking for more digits), clip each *Applies when* and Intent line the same way, and end with what they left out. A card is printed whole or not at all. The budget is for the whole output, not only for cards: before any card is printed, room is reserved for one continuation note per list (each at most 130 bytes) and one closing line, so the notes are never the thing that is dropped and the sum of cards, notes and closing line stays within the budget (a budget too small for the notes alone yields only the notes). Continuation is the same in both commands: `find` says `N more; … continue with --after K`, and `near` says, for each list that the limit or the byte budget cut short, `N more of "<list>"; continue with --after K`, with K the count already seen. `--after` applies to every list of one `near` call. Every list obeys this, including the evidence a Learning rests on that has no card (a sealed Definition Node, say): it is listed as a bounded list of `<name> [<12 digits>]` lines, one per artifact, and continued with `--after` like any other, and nothing is printed as a bare dump. `show` is bounded by `--bytes` and continues with `--from`, and reads any Node of the Engine by its ID, carded or not, so an omitted reference can be inspected. The only thing that grows with the corpus is the scan time.

**Why this stays bounded.** Every command has an explicit output cap and says what was omitted; the scan reads files so the Agent doesn't, and what it prints is cards. In the prototype, three unfamiliar questions printed 1.8 to 2.7 KB each and `near` printed 0.4 to 0.8 KB, over 115 KB scanned (`04-evidence.md` section 6). A larger corpus, or a hostile 100,000-character name, changes how long the scan takes, not how much reaches the Agent (`04-evidence.md` section 10).

**Why nothing is duplicated.** A Learning never restates a Skill's meaning. It cites the Skill Node by `<name> <ID>` and says only what experience adds, and the practice (Establishing, step 4) sends a rule that a capability already owns back to that capability. A Change is evidence and is cited by identity, never copied. `near` is therefore the join: from a Skill to the Learnings that qualify it, from a Learning to the Changes that taught it, from a Change to what was learned from it. BRAIN holds the understanding and the pointers; Nodes and Records stay where they are.

**What is stored: nothing new.** No index, no catalogue Node, no table of contents file. An index would be a second source of truth about what the Skill Nodes and Records already say, and a stale one. If the corpus ever outgrows a scan, a cache can be derived from the same bytes and discarded; it would never be an authority.

**What it uses to match.** Plain whole-word term matching, counted by distinct terms, ties by recency. That is deliberately weak: the first answer is a short list the Agent reads and re-asks, not a ranking it trusts. In the prototype it found the right Learning and the right Changes for three questions in the Agent's own words, and ranked a loosely related Skill first for one of them; the cards made that visible at a glance. Semantic matching is the Agent's job (it reads *Applies when* and the one-liners), not the script's, as BASS puts judgement before Script.

**Which Skills and Changes are searched** is a locator like any other: `--engine` (the installed Skill Nodes, plus each Skill's `description` where an Agent Skill is installed beside it), `--record` (Changes), `--brain` (Learnings), each named when used. A host with no BRAIN still gets the Skill and Change cards: the surface is useful on day one, before one Learning exists. That is the part 0.0.1 needs.

**Use is still a citation.** A Work that applies a Learning cites it in its own text by `<name> <ID>`. `near` then also answers "which Changes cite this", and a Change that establishes a Learning cites it, so Change to Learning is derivable in both directions, distinct from the Evidence relation (what the Learning rests on). A Learning nothing cites is not shown unused; one that many cite is shown used. A Learning is never marked by being cited.

**What brings an Agent to `find`.** The Skill's `description`, which Agent Skills loads wherever it is installed, written for the moments the evidence shows: facing an unfamiliar question; before Requirements or Architecture are committed; before a review; when a retrospective is being turned into something kept. There is no hook in Changing KAAL (R16). A host that wants it consulted says so in its own `AGENTS.md`.

## Learnings are established through Changes

Settled by the Owner (Fork 5 below is therefore closed). In a governed repository a Learning enters its BRAIN as part of a Change: the Change's Work holds the draft Learning, the draft is reviewed as a result by the Reviewer seat (`kaal-review`, `--of Learning`, naming its identity), and `establish` places it in the BRAIN in the same proposal that closes the Change. The Change then cites the established Learning by `<name> <ID>` in its Work. That gives the Learning a reviewed origin without a new seat, a status or a gate: Learning is not a step of Changing KAAL, it is something a Change may do. A Change that establishes nothing is complete as it is.

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
| Engineer (this repository) | `.kaal/` | as Change `08/03` | this repository | `brain/` at the repository root (Owner decision, Fork 1), named by this repository's own wrapper and passed by argument |
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
| Location not identity or meaning | Located by argument; any name and folder inside the BRAIN, the path never read as meaning, the ID recomputed from bytes |
| Not every finding becomes a Node | The Skill's practice makes "not a Learning" and the other homes explicit; the exercise shows six dispositions, two of them "no Node" |

## Transition (proposal; nothing is authorised)

Each step is its own Change, green, in this order. The read side comes first because it is what 0.0.1 needs and works over what exists.

1. **Birth `Learning`, `BRAIN`, `Learning KAAL` and the Skill with its read side.** `packages/kaal-learning/` (Nodes, seals, `SKILL.md`, scripts `find`, `near`, `show`), `engineering/kaal-learning/` acceptance (bounded output, no ID needed, refusals), the self-install projection. Useful before any Learning exists: it already reaches Skill Nodes and Changes. First Skill Node outside Core is sealed with the repository's engineering bootstrap helper, an intended exception, as for `Sealing`. Needs `kaal-sealing` beside it and `kaal-core` resolvable only where Core admission is asked for (as `register-skill` already does).
2. **The write side.** `check` and `establish`, with the pre-write validation, citation and evidence rules, and their refusal matrix.
3. **The first Learnings and this repository's BRAIN**, established through a Change, the drafts reviewed as results by an assigned Reviewer; whichever of the candidates the Owner accepts.
4. **Control for a BRAIN's place in a governed repository**, after the Record locator exists, so one baseline/candidate resolution serves both. `.github` and controls, alone.
5. Only then, if use shows it: a derived cache, typed relations, supersession-aware listing.

## Risks and honest limits

- **Judgement stays judgement.** Nothing here makes an agent write a good Learning. The checks make a bad one visible (no evidence, wrong type, unresolved reference), not wrong.
- **Evidence is only as durable as its holder.** A Learning cites a Change by ID; anyone without the Record cannot resolve it. That is stated, not hidden, and the Learning's own text must stand without it.
- **Deletion is invisible from inside** (above). A Learning that another cites is the exception: its disappearance shows as a citation of an absent Node. The control is a later Change.
- **`kaal-core` must be resolvable** for Core admission, as for registration. A host that has only Core's deployed artifacts can read a BRAIN and run the Skill's own checks, but `check` says Core admission was not run and does not report the BRAIN as checked. How a host obtains the package is the composition question the open `08/03` sibling raises, not this Change's.
- **A copied Form.** The Skill reads `name` and `type` with its own copy of Core's three-line Form. It is held by an acceptance check against Core's `candidates()` on every real Node, and removed if Core ever exports a read-only reader or the helper becomes a `kaal-graph` Skill (Fork 7, decided provisionally by the Owner).
- **Evidence kinds are a table.** Node, Change and Work tree can be verified today; a sealed artifact of another kind is refused by the implementation (not by the architecture) until its row is added. Each row restates three facts that its domain owns, a duplication named like the copied Form.
- **`find` by plain text** is a weak matcher: it will not match a synonym, and it ranks crudely. That is acceptable because it returns a short bounded list the Agent reads and re-asks, and it is the reason not to build an index before use shows one is needed. The scan's time grows with the corpus; what reaches the Agent does not.
- **The type Node is fixed by its ID.** A reborn `Learning` Definition (new bytes) leaves existing Learnings typed under the old one; an Engine then needs both. This is the supersession gap every Skill has, not new.
- **Ordering of births is a constraint.** `Learning` is sealed first, `BRAIN` cites it, `Learning KAAL` cites both; the Learnings cite `Learning`. Any change to the first changes every ID below it.
- **File-level clashes when combining BRAINs** (the cost of free names): two different Learnings at one path. Resolved by filing one under another name; no identity or seal is involved.
- **Parallel Changes.** `08/03` is taken by three open PRs; this Change took `08/04` because `next-change` allocates optimistically. Whichever lands later renumbers, and the staged Change moves whole.

## Forks for the Owner

- **Fork 1. Where does this repository's own BRAIN live?** *Decided by the Owner (PR comment, 2026-10-09):* a root-level `brain/` directory, explicitly named by this repository's own wrapper or configuration. It is a placement for this repository, not a universal KAAL directory convention. `kaal-learning` keeps accepting an explicit BRAIN locator and never infers it from the Engine, Record, Subject or working directory. See "Where a BRAIN is", the repository placement paragraph.
- **Fork 2. Is evidence required?** *Decided by the Owner (PR comment, 2026-10-09): A, evidence is mandatory.* At least one `<ID>  <path>` line per Learning; `establish` refuses a Learning without one. Evidence is traceability, not mechanical proof that the understanding is correct. The decision does not restrict evidence to closed Changes; which kinds resolve is Fork 8.
- **Fork 3. Prescribed headings or free body?** *Decided by the Owner (PR comment, 2026-10-09):* structured, deterministically readable sections, but the names are not frozen. Mechanics and prose are separated (see "Prose and mechanics"); frontmatter carries only Core's `name` and `type`; the understanding stays prose. Recommended names for the Owner to confirm: `Situation` and `Evidence`; the prototype uses the working name `Applies when`.
- **Fork 4. File names in a BRAIN.** *Decided by the Owner (PR comment, 2026-10-09):* do not require `<ID>.md` names. Names and folders are free and human-readable; identity stays content-based and references resolve by ID, never by name. Smallest organisation: a reserved top-level `seals/`, everything else free, the establisher chooses `--path`. Seal validity and preservation are distinguished (see "Where a BRAIN is").
- **Fork 5. How an accepted Learning gets into this repository.** Closed by the Owner's input on the PR: Learnings are established through Changes (see above).
- **Fork 6. The historical BRAIN.** *Decided by the Owner (PR comment, 2026-10-09):* no migration from `KAAL-genesis`. It is archived historical material to learn from and is intended to be retired; current KAAL is the authority. Nothing is imported, no compatibility is kept and its model is not recreated. Understanding drawn from it may inform current Work and is established afresh through governed Changes, using current Nodes and semantics. (Its nodes are not sealed KAAL artifacts, so they could not be evidence in any case.)
- **Fork 7. The copied Form or a Core export?** *Decided by the Owner (PR comment, 2026-10-09):* keep the minimum graph and Form-reading helper inside `kaal-learning` for now, knowingly provisional, isolated and easy to extract as a future `kaal-graph` Skill; Core stays authoritative and no Core API change is made or built here. See "Verifying a BRAIN".
- **Fork 8. Evidence kinds.** *Decided by the Owner (PR comment, 2026-10-09):* evidence is limited to sealed KAAL artifacts, not to closed Changes. At least one sealed artifact must be cited; Sealing is the trust boundary; `Change` is not hardcoded. See "Evidence: a sealed KAAL artifact"; unsupported sealed forms are stated there as implementation limits.
