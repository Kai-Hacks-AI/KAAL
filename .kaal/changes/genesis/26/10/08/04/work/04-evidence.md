# Evidence

Support for `03-architecture.md`. Everything below was read or run against `kaal/genesis` at 1679d40, the historical BRAIN at `Kai-Hacks-AI/KAAL-genesis` 8dfab52 (shallow clone), and the open Change `08/03` as it stood in its PR. Interpretation is marked as such. Scratch work was done outside the repository; nothing was added to any package, seal or `.kaal` outside this Change.

## 1. The historical BRAIN

What `KAAL-genesis` held (`brain/`, a `using-brain` skill, `scripts/brain-seals.ts`):

- **Identity was a path.** "Its path is its identity." Lineages (`testing`, `review`, `change`, `ideas`, `graph`, `requirements`, `architecting`, `defects`, `skills`, `genesis`) were directories; each learning a dated unit `YY/MM/DD/CC/nodes/<name>.md`; a default root `brain/learning`, created by `create-brain` as `brain/`.
- **Edges lived inside lineages.** `A -relation-> B` with the relation itself a Node; "knowledge does not cross lineages".
- **Sealing was a chain.** One chain per lineage, one unit per learning, `seal.json` per unit with `previous`, heads in `seals.json`, sealed only on `main`.
- **Nodes had `name` and no `type`.** Under Core's Form such a Node is a candidate root of the type chain, not a typed Node; the historical learnings are therefore not Learnings as KAAL now means it.
- **20 nodes, about 30 KB, across 10 lineages.** The nodes were essays that grew by rebirth (`testing` was born three times: 597, 1818 and 1490 bytes). Many are rationale for a skill ("KAAL uses the X skill so..."), and several cite PR numbers and finding numbers as their evidence, coupling the understanding to a history that would later be renumbered.
- **What it already knew that is still relevant**, found by hand for this Change: `reviewing` (a round is justified only while it can materially increase confidence without changing the responsibility; reconsider, don't continue, when findings keep falsifying what the work claims), `architecting` (placement questions get answered inside review rounds where the answer cannot be kept; "a record does not project into BRAIN automatically"), and `managing-defects` (a Defect carries no status; what it means for work is the referrer's). The last two are the ancestors of R19 and R14 here.

What survived into Core, and what Core does better now: immutability by seal (kept), nodes referring to nodes (now by `{name, id}`, location-free), typed Nodes found by type alone (new), seals beside the thing sealed (new). What is dropped by design: path identity, lineages, relation Nodes, chains, a default root.

*Inference, not fact:* two review loops in the Changes below ran six and eight rounds (`07/06`, `07/07`). `reviewing` existed in `KAAL-genesis` and could not be found from here. Whether it would have changed either loop is not knowable; that it was undiscoverable is.

## 2. The Changes behind PRs #62 to #71

Address-free identity of each closed Change, computed with Sealing (`artifact-id.mjs --domain "KAAL Change v1"`), and each has its seal in `.kaal/seals/changes/`. The mapping from PR numbers is in the pull request description, not here.

| Change | ID |
|---|---|
| `genesis/26/10/07/05` | `222ad5b8b57b3254135f6cfad0c4cdc0771b8d8479768381602ee385875aa655` |
| `genesis/26/10/07/06` | `ed5387f4bdc244c7212ca31c51c07fb9c0643e55e904bdcfc3bb022cf5a64c8a` |
| `genesis/26/10/07/07` | `5f9d94f953822e3841d68c9cbdf5ef8ac9c5fbf5bf4994516a4dcb5ad7a2a301` |
| `genesis/26/10/07/08` | `18b0a188f357e8060d66e783bf2d840e017531e94b4af488d3e340bf03535b8d` |
| `genesis/26/10/07/09` | `4e89104a4315380a600a5369235469480d9f1d0db99de5e110b2ffff37514a9e` |
| `genesis/26/10/08/01` | `295a2e4fc7b3115ea48e93f0b04c4eb43c10e0f64c1f6e14118d5bc177e38848` |
| `genesis/26/10/08/02` | `72ee2a6383c182d1d94f6d8b2577ed2d1c67e087afb721cd255cabf1533da79e` |
| `genesis/26/10/08/03` (the open Change that closed the Record work; not yet admitted) | `93e02c7476b5aee77bbb1eb76366e043c4dc802d7b68d4f2e02f5911fa2abe5f` |

Read: the 21 retrospectives of the first seven (Worker, Owner, Reviewer each) and the review rounds where cited; the three retrospectives and the two rounds of the eighth from its PR; the Intent, Requirements and Architecture of the two other open `08/03` Changes (Intent origin, architecture risks). Nothing from chat was used.

## 3. The six themes: what recurs, and what it justifies

Criteria used, which are also the Skill's proposed practice: (a) it recurs across Changes, or it changed a decision; (b) it is reusable beyond the occasion; (c) no capability or process text already owns it; (d) it says what to do and when; (e) it is understanding and not a want or a fact about one Change.

| # | Theme | What recurs (Change, retrospective part) | Disposition |
|---|---|---|---|
| 1 | Premature architectural decisions | `07/05` Worker Lacked (proceeded on its own lean when the fork went unanswered; the whole Work rests on it). `07/06` Worker Lacked (offered a parser twice without an answer; the hand-written reader grew each round). `07/07` Worker Lacked (three Owner questions unanswered; the Work stands on defaults). `07/09` Worker Learned/Lacked (assumed a location and rebuilt). `08/03` Worker Learned/Lacked and Owner Learned (committed to a root `changes/` before asking what the Intent served; relocation was not needed). | **Candidate 1.** Two halves: the mechanism-as-hypothesis half rests on `08/03` (not yet admitted) and the Origin of a sibling Intent; the defaulted-fork half rests on four admitted Changes. Establish only what resolves. |
| 2 | Missing negative and refusal tests | `07/06` Reviewer Lacked (no statement of the accepted grammar; one spelling per round). `07/07` Reviewer Lacked (no traversal matrix: ancestor link, link erased by `..`, missing component, one per round). `07/08` Worker Lacked (wording tests catch a phrase, not a contradiction). `07/09` Reviewer Learned (a dangling link was read as absence; the suite had no refusal for it). `08/01` Reviewer Learned (a second `Findings` section was accepted). `08/02` Worker Lacked (a literal space written as "whitespace"; no habit of testing each sentence as a refusal). `08/03` Worker Lacked (the single-locator claim fails on a two-row check). | **Candidate 2.** Six admitted Changes plus one, from different capabilities, Workers and Reviewers. The strongest. |
| 3 | Repeatedly rediscovered capability dependencies | `07/05` Worker Lacked/Longed and Owner Lacked (`kaal-changing` needs `kaal-sealing`; found at use). `07/06` Worker Lacked/Longed, Owner Lacked, Reviewer Longed (six rounds hardening a reader of prose because the need is free text). `08/01` Worker Longed (Review's convergence read by Changing only if an installed prerequisite is acceptable). `07/07` Owner Lacked and `07/09` Owner Lacked (the installer needs to learn each new instance-owned directory). Open `08/03` sibling: "`compatibility` is read from free text by the installer". | **Two dispositions.** (i) The practice: the needs were found only by installing into a host that is not the source, with real data (`07/06`, `07/07`, `07/09`, `07/05`) → **Candidate 3**. (ii) A declared dependency and a declared state directory are *wants*: the `07/06` Owner said, if it recurs, establish the machine-readable meaning in its own Change. It has recurred four times. That is a **Request** for the Owner, not a Learning. |
| 4 | Integration boundaries discovered late | `07/07` Worker Lacked (path handling duplicated in two packages that cannot share code). `08/01` Worker Lacked and Owner Lacked (the same two lines of a round parsed in two places; the second finding came from the difference). `07/05` Worker Learned (two definitions of "Change" would have drifted at the first edit). `08/02` Worker Learned/Liked (Intent's identity equals Sealing's, so no second meaning exists). `07/09` (the real run found the installer boundary; the Change address moved twice under the build). | **Candidate 4** (one meaning has one definition), and Candidate 3 above. Two single-source observations are held, below. |
| 5 | Governance and Reviewer independence | `07/07` Worker Learned/Lacked, Owner Learned, Reviewer Learned/Lacked (subagent rounds counted as review; capability is not authority). `07/08` all three (authority assigns the seat; mechanisms do not). `07/09` Worker, Owner, Reviewer (appointed its own Reviewer; withdrawn). | **No Learning.** The rule is now owned by Changing KAAL's text (`Rules`: the Worker neither assigns nor controls the Reviewer; process determines the turn, authority assigns the seat). A Learning that repeated it would be a second copy of one meaning, which Candidate 4 says not to keep. The learning reached its destination by being made into the owning capability's instruction. (`07/09` ran alongside `07/07`; it could not have applied it. That is parallelism, not neglect.) |
| 6 | Learning recorded but not applied | A Reviewer opening with a chat reply and no protocol round, three times, by different sessions: `07/05` Reviewer Lacked, `08/02` Reviewer Lacked, `08/03` Reviewer Lacked; the `07/05` Reviewer's Longed (a handoff that brings the protocol into view) was still unmet at `08/03`. The Worker's habit of testing its own sentences as refusals: `08/02` Lacked, then `08/03` Lacked. The dependency wish four times (theme 3). | **Not a Learning yet; the reason BRAIN exists.** Each was recorded where it could not reach the next actor: a closed retrospective is read only by an actor who goes looking. A recurring `Lacked` or `Longed` is a missing path to the actor, not carelessness. As a Learning it would be unproven (nothing yet shows that discovery changes behaviour) so it is deferred until `kaal-learning` has run. The reviewer-entry gap is an instruction and handoff gap in Changing/Review text: a **Request** for the Owner. |

**Held, not Learnings (single source, or already owned):**

- *Baseline and candidate Records must be resolved independently* (`08/03`). One Change, and already carried as a Requirement (`R9a`). It becomes a Learning if the next place a control meets a locator (a BRAIN, Requests, Incidents) rediscovers it.
- *A sealed Node's text can be touched by a new model* (the open Collection sibling: `Collecting KAAL` says it keeps no list of clients). One occurrence, and it is a question for the Owner.
- *Parallel Changes collide on the address* (`07/09`, three open `08/03`). Owned by Changing KAAL's optimistic allocation, settled at admission.
- *Final green evidence can't be recorded after convergence without reopening Work* (`07/09`, twice). A process observation; a Request.
- *Environment limits of a review sandbox* (`07/05`). Fact about one environment.

In sum: four candidates justify Learnings (themes 1, 2, 3's practice and 4). The recurring wish for a declared dependency and for declared instance-owned state is a Request the Owner has already asked to hear if it recurred. Reviewer-entry and the unrecordable final-green result are instruction or process gaps, so Requests. The Reviewer-independence rule is already owned by Changing KAAL, so no Node. Theme 6 is the reason BRAIN exists and is deferred as a Learning. Five single-source or already-owned observations are held. The rest of what the retrospectives say stays evidence: a register of wishes is not a register of understanding, and the exercise supports R19 directly.

## 4. Candidate Learnings and the three Nodes, drafted

Text as proposed, so that the Owner and a Reviewer can judge the form and the content. **Provisional**: each ID is of the exact bytes below and changes with any edit, and each candidate Learning's type ID is the ID of the `Learning` draft. Candidates 3 and 4 cite the Skill Nodes they teach about, `Changing KAAL`, `Sealing`, by `<name> <ID>`, so that discovery can connect them (section 6). Candidates 1 and 2 cite the open `08/03` Change; that line does not resolve until it is admitted, and the check says so (section 5).

### Learning (KAAL Definition)

ID `4b671080738a4dc127e47d8ee2254d7c14243c53b9d61fef40fe316b8c736770`

````markdown
---
name: Learning
type:
  name: KAAL Definition
  id: 17bf407006223729ebcfa04476cb1ef9f0012a9f352d6a14ad37c43fde73f53a
---

# Learning

A Learning is a Node that states understanding KAAL has established from experience, so that later work can start from it instead of discovering it again. It is not the experience: a retrospective, a review round, an incident or a test result is evidence of experience, and a Learning is what was understood from it. It holds understanding that is reusable beyond the occasion it came from, and it names the situation in which it applies.

A Node is a Learning exactly when its type refers, by name and ID, to this Node, so Learnings are found by Node type alone. A Learning is written once. Understanding that grows or is corrected is another Learning, which refers to the earlier by name and ID and is never the earlier one revised; the earlier remains what it was when it was established. A Learning carries no status: whether it still holds, was refined or was applied is for whoever reads it to judge, and for the later Learnings and work that refer to it.

A Learning refers to its evidence by the identity of the evidence, never by where it is kept.
````

### BRAIN (KAAL Definition)

ID `81161037f2ff0f73dd39541a45607f9e6156d0bea8badb1cff7e40b100b12bcc`

````markdown
---
name: BRAIN
type:
  name: KAAL Definition
  id: 17bf407006223729ebcfa04476cb1ef9f0012a9f352d6a14ad37c43fde73f53a
---

# BRAIN

BRAIN is a mnemonic for KAAL's persistent learning:

```
B  Be
R  Right
A  And
I  Improve
N  Network
```

A BRAIN is a network of Learnings (Learning 4b671080738a4dc127e47d8ee2254d7c14243c53b9d61fef40fe316b8c736770): understanding that is established once and added to, so that KAAL is right more often and improves what it was wrong about without rewriting what it earlier understood. It is the Learnings a reader has been given, no more: a BRAIN is named by whoever uses it, its place is not its identity, and no BRAIN is the one KAAL has.
````

### Learning KAAL (Skill)

ID `06b23f9173091d0aaea65ece43b86b2fa6afab1c23a41d14bde6de38e1549d35`

````markdown
---
name: Learning KAAL
type:
  name: Skill
  id: 2389ba68e2c2afacea8655b1e23f6dc4c485c89c67ac0d655bb55d3c5a90096b
---

# Learning KAAL

Learning KAAL is the capability for establishing, in a BRAIN, understanding drawn from experience, and for finding what a BRAIN already holds before establishing more. A Learning is the Node that states such understanding, and BRAIN is the Learnings a reader has been given; this Skill acts on them. Its scope is that alone. It does not decide what has been learned: that is the judgement of whoever establishes it, and experience that was only collected is not thereby a Learning. It is not Sealing, which gives a Learning its identity and its seal; it is not Core; it is not a step of any process, and no process requires it. It is optional, and embedding KAAL does not install it.
````

### Candidate 1

ID `d1efdc8d3f4f5385bf25759461b016ff5e81ba731f2a93bd4189c08ce712f6a8`

````markdown
---
name: Ask what the want serves before choosing the mechanism
type:
  name: Learning
  id: 4b671080738a4dc127e47d8ee2254d7c14243c53b9d61fef40fe316b8c736770
---

# Ask what the want serves before choosing the mechanism

An Intent often names an outcome and a candidate mechanism together: a directory to move, a command line, a registry. A design that takes the mechanism as the answer spends its care on how to reach it, and the commitment hides the requirement that was actually wanted. Treat the mechanism as a hypothesis: say what in the outcome it serves, and look for the form of the outcome that does not need it. When a fork is put to the Owner and no answer comes, the Work that proceeds on a default rests on that default; name it as an assumption the Work depends on, so that a later answer can find every place it holds.

## Applies when

You are about to commit an Architecture to a mechanism, or to proceed on a default for a decision that is the Owner's.

## Evidence

222ad5b8b57b3254135f6cfad0c4cdc0771b8d8479768381602ee385875aa655  retro-work.md
ed5387f4bdc244c7212ca31c51c07fb9c0643e55e904bdcfc3bb022cf5a64c8a  retro-work.md
5f9d94f953822e3841d68c9cbdf5ef8ac9c5fbf5bf4994516a4dcb5ad7a2a301  retro-work.md
4e89104a4315380a600a5369235469480d9f1d0db99de5e110b2ffff37514a9e  retro-work.md
93e02c7476b5aee77bbb1eb76366e043c4dc802d7b68d4f2e02f5911fa2abe5f  retro-work.md
````

### Candidate 2

ID `8207626bc355edd736ba5c7617ffa180dd38b1eca21ff98e6d71b0fd3544042b`

````markdown
---
name: State what is refused with what is accepted
type:
  name: Learning
  id: 4b671080738a4dc127e47d8ee2254d7c14243c53b9d61fef40fe316b8c736770
---

# State what is refused with what is accepted

A sentence of Requirements or Architecture that says what a contract accepts is incomplete until it says what the contract refuses, and the refusals of a contract come as a class that can be listed before the first review. Review found members of one class one round at a time: each component of a path, a duplicate section, each spelling a grammar admits, a literal space against any whitespace, a link that stood for absence. Before review, take each accepting sentence, write the nearest input it must refuse and run it; for a path, a parse or a declaration, list the whole class together. A suite of positive cases does not establish an integrity claim: ask which input would make the claim false.

## Applies when

You are writing Requirements or Architecture for something that reads a path, a form or a declaration, or that claims a check or an integrity property.

## Evidence

ed5387f4bdc244c7212ca31c51c07fb9c0643e55e904bdcfc3bb022cf5a64c8a  retro-review.md
5f9d94f953822e3841d68c9cbdf5ef8ac9c5fbf5bf4994516a4dcb5ad7a2a301  retro-review.md
18b0a188f357e8060d66e783bf2d840e017531e94b4af488d3e340bf03535b8d  retro-work.md
4e89104a4315380a600a5369235469480d9f1d0db99de5e110b2ffff37514a9e  retro-review.md
295a2e4fc7b3115ea48e93f0b04c4eb43c10e0f64c1f6e14118d5bc177e38848  retro-review.md
72ee2a6383c182d1d94f6d8b2577ed2d1c67e087afb721cd255cabf1533da79e  retro-work.md
93e02c7476b5aee77bbb1eb76366e043c4dc802d7b68d4f2e02f5911fa2abe5f  retro-work.md
````

### Candidate 3

ID `542fcbf02d0deadd2662bd0c4f20326cdad99a7e11f4af7c187d23b39cecc33f`

````markdown
---
name: Run the capability where it will live before it is reviewed
type:
  name: Learning
  id: 4b671080738a4dc127e47d8ee2254d7c14243c53b9d61fef40fe316b8c736770
---

# Run the capability where it will live before it is reviewed

A capability proven only by its own acceptance suite hides what it needs beside it and what it leaves behind. Installed into a host that is not its source, with real data, it showed a sibling Skill it needed but never declared (Changing KAAL 7b2470732033e9ca6e916cf1ff7d73629bd203737aaf1894a9d621b517e896c2 needing Sealing e15f370ca679e69bdf5a4644d58138cc03d2d06f0eb1832628c4594e49dc335a), state it wrote that the installer read as drift, and a boundary in the checks around it. None was found by reasoning or by the suite. At Architecture time, list what the capability needs beside it, what it writes and where, and which other readers will meet those bytes, and probe each in such a host. A need that keeps being rediscovered is a decision waiting to be made, not understanding to repeat.

## Applies when

You are about to review or admit a capability that is installed, writes state, or is read by something other than its own tests.

## Evidence

222ad5b8b57b3254135f6cfad0c4cdc0771b8d8479768381602ee385875aa655  retro-work.md
ed5387f4bdc244c7212ca31c51c07fb9c0643e55e904bdcfc3bb022cf5a64c8a  retro-work.md
5f9d94f953822e3841d68c9cbdf5ef8ac9c5fbf5bf4994516a4dcb5ad7a2a301  retro-work.md
4e89104a4315380a600a5369235469480d9f1d0db99de5e110b2ffff37514a9e  retro-work.md
````

### Candidate 4

ID `4111e444126c39f896548346a4da1a1a6149137fa9d5b562ffdd2e74a3850a1f`

````markdown
---
name: One meaning has one definition
type:
  name: Learning
  id: 4b671080738a4dc127e47d8ee2254d7c14243c53b9d61fef40fe316b8c736770
---

# One meaning has one definition

Where two consumers need the same meaning (a parse, a path rule, an identity), a second implementation is where the next defect arises: the two agree on the inputs the author thought of and part on the rest. Take the meaning from the capability that owns it (an identity, for one, is Sealing e15f370ca679e69bdf5a4644d58138cc03d2d06f0eb1832628c4594e49dc335a's). Where that dependency is not yet acceptable, say in the Architecture that the meaning is held twice, and run both on every real input they will meet, so that the disagreement is found by a check and not by a Reviewer.

## Applies when

You are about to write a parser, a path rule or an identity that another capability already defines or consumes.

## Evidence

222ad5b8b57b3254135f6cfad0c4cdc0771b8d8479768381602ee385875aa655  retro-work.md
5f9d94f953822e3841d68c9cbdf5ef8ac9c5fbf5bf4994516a4dcb5ad7a2a301  retro-work.md
295a2e4fc7b3115ea48e93f0b04c4eb43c10e0f64c1f6e14118d5bc177e38848  retro-work.md
72ee2a6383c182d1d94f6d8b2577ed2d1c67e087afb721cd255cabf1533da79e  retro-work.md
````

## 5. Scratch prototype, second form (after review round 01)

Round 01 correctly found that the first prototype (below, retained) ran a *source copy* of Core's `nodes.ts`, which an installed Skill cannot do; that Core's `admit()` does not read a Node's body, so citation integrity was never shown; that a new draft cannot literally run the established-BRAIN checks; and that evidence resolution was optional where establishing needs it. The second prototype answers each, outside the repository's source tree.

**The host.** A scratch directory holding: a copy of the installed `.kaal` (Core, installed Skills, Node seals; no Changes); `skills/kaal-sealing` (the Sealing scripts as installed); `node_modules/kaal-core` built from `packages/kaal-core` (its public API only); a Record directory (`changes/` and `seals/changes/`, 24 real Changes); and `learning.mjs` (section 7). Nothing from `engineering/` and no `nodes.ts` is read. The three drafted Nodes were installed with Core's own public `registerSkill(".kaal", "kaal-learning", {...})`, which admitted them (`installedSkills()` then reports `Learning KAAL` among the six Skills).

**F1, the delivery path.** `learning.mjs` copies the Engine to a throwaway directory and calls `registerSkill()` with the installed `Learning KAAL` Node (to satisfy "a contribution carries a Node typed by Skill"; its bytes are the installed ones) and the prospective Learning plus its seal marker, in memory. Core's admission therefore decides Form, seal and type, by public API. Without a resolvable `kaal-core`, the script says "Core admission was not run" and refuses to call the BRAIN checked. The gap that remains is named in `03-architecture.md` (Verifying a BRAIN; Fork 7).

**F2, citations.** Core's admission does not read the body. Verified: the `absent` case below was not refused by Core (the only message is the Skill's). The Skill's own check requires `<name> <ID>` with the ID the ID of a *sealed* Node found in the Engine or the BRAINs given. Results, each from `establish` with the Records given:

| Case | Result |
|---|---|
| Cites candidate 3 as `<its exact name> <ID>` | established; candidate 3 now "cited by 1" |
| Cites an ID no Engine or BRAIN holds | refused: "cites abababababab, which no given Engine or BRAIN holds" |
| Cites a Learning present in the BRAIN but **unsealed** | refused: "cites <ID>, which is not sealed" |
| Cites a present, sealed Learning with a **different name** | refused: "without its name … beside it" |
| Cites a bare ID | refused, same reason |
| A Change ID written into the understanding instead of Evidence | refused as a citation of nothing |

**F3, a new draft.** `establish` on drafts in a directory outside the BRAIN, with the BRAIN not yet existing: candidates 3 and 4 were established (file written to a temporary name, renamed to `<ID>.md`, then sealed through Sealing's `seal.mjs`). Core's check ran with the seal supplied in memory only. Establishing candidate 3 again printed "already held … nothing written". `check` then reported both Learnings ok.

**F4, evidence.** `establish` without `--record` exits 2 before reading the draft. With Records:

| Case | Result |
|---|---|
| Evidence line naming the not-yet-admitted `08/03` Change (candidate 1 as drafted) | refused: "not a Change in the given Records (only closed Changes are supported evidence)" |
| Evidence of another kind (a hash in no Record) | refused, same |
| A closed Change, a file it does not hold | refused: "holds no file retro-nothing.md" |
| No evidence line | refused |
| Wrong type | refused by both the Skill and Core |

The sequence of nine refused cases and the unsealed-target case left the BRAIN's file hash identical to the one taken after the single acceptance (`sha256sum` over every file). `check` of an already established BRAIN without a Record reported "evidence unverified: no --record given" and exited 0; with a Record each line resolved. A byte appended to an established Learning was reported "not named by its ID; not sealed".

**What this shows:** the form passes Core's admission by its public API, outside the source tree; citations, structure and evidence are checked by the Skill and refused when wrong; establishing from an unsealed draft works and refuses without writing. **What it does not show:** the real Skill (scripts here are a prototype, not written to the packages' conventions or tests), a host without the `kaal-core` package, the install path, any control in a governed repository, deletion of a whole sealed Learning (still invisible from inside), or that an agent finds and uses a Learning unprompted.

### The first prototype, retained

Not committed, not part of any package. Core's `nodes.ts` (`admit`, `candidates`, `sha256`) run unchanged under `node --experimental-strip-types`, over a graph of the Engine's real `core/` Nodes and seals plus the three new Nodes sealed in a scratch Engine copy, and a scratch BRAIN of the four candidates (`<ID>.md` plus `seals/<ID>`, sealed with `seal.mjs write`). The script (below) checks naming, seal, admission, evidence form, and resolves each evidence line against this repository's real Changes by recomputing Change IDs.

**Accepted case.** Engine holds `Learning`. Four Learnings admitted. For each: its *Applies when*, and "cited by 0". Only issues: candidates 1 and 2 cite the not-yet-admitted `08/03`, as intended.

**Refusals**, each run against the scratch BRAIN:

| Case | Result |
|---|---|
| One byte appended to a sealed Learning, file name kept | File not named by its ID; not sealed; not admitted. Three Learnings admitted, the fourth refused |
| A Learning file renamed | "not named by its ID"; its seal "has no Node" |
| Engine without the `Learning` type | Engine reported without it; zero Learnings admitted; all four named as not admitted. The files remain readable |
| A seal deleted | Learning "not sealed", "not admitted" |
| A Learning and its seal both deleted | **No issue reported.** The BRAIN is whole and smaller. Nothing inside a directory can see this; the control is the one named in R24 and Architecture |
| An evidence line naming a file the Change lacks | "missing in <Change>", for each affected line |

**Growth by addition.** A fifth scratch Learning citing candidate 1 by its ID (and nothing else): five admitted, and candidate 1 reports "cited by 1". Candidate 1's bytes and seal are untouched. No relation vocabulary was needed.

What this shows: the form passes Core's admission as it is; tampering, renaming, a missing seal and a missing type are each refused by existing rules plus a name check; evidence is resolvable by identity from the Records that exist; relationships need only citation. What it does not show: the Skill's scripts (none exist), the install into a host, any control in a governed repository, or that an agent would find and use a Learning unprompted.


## 6. Reaching knowledge within a bounded context (Owner input on the PR)

Kai's comment: BRAIN is needed for 0.0.1 so an Agent can discover and navigate relevant knowledge in bounded context, from an unfamiliar question, without pre-known IDs or loading everything; Skills already carry Nodes, so BRAIN connects and does not duplicate; Learnings are established through Changes.

`discover.mjs` (section 7) is a prototype of the read side, in the scratch host of section 5, over the real installed Skill Nodes and their Agent Skill descriptions, the 25 real closed Changes, and a BRAIN of five Learnings (the four candidates with candidates 1 and 2 minus their pending-`08/03` line, plus a scratch refinement). Candidates 3 and 4 had been revised to cite `Changing KAAL` and `Sealing` by `<name> <ID>`. It scans files and prints cards only, at most `--limit` per kind.

**An unfamiliar question, in an Agent's own words, no IDs.** "My new Skill writes a state directory and the installer keeps flagging it as drift", searched as `find installer drift state directory --limit 2`:

```
Skills: 3 match of 6
  Collecting KAAL [d938e531] (1/4 terms)
    Collecting KAAL is the capability for bringing communication addressed to KAAL into KAAL from the KAAL clients it can reach. …
  Learning KAAL [06b23f91] (1/4 terms)
    Learning KAAL is the capability for establishing, in a BRAIN, understanding drawn from experience …
  (+1 more; narrow with more terms)
Learnings: 3 match of 5
  Run the capability where it will live before it is reviewed [542fcbf0] (3/4 terms)
    applies when: You are about to review or admit a capability that is installed, writes state, or is read by something other than its own tests.
    ~ A capability proven only by its own acceptance suite hides what it needs beside it and what it leaves behind. …
  Ask what the want serves before choosing the mechanism [9e10996f] (1/4 terms)
  (+1 more; narrow with more terms)
Changes: 17 match of 25
  genesis/26/10/07/09 [4e89104a] (4/4 terms)
    Enable KAAL to collect KAAL-addressed communication from KAAL clients it can reach.
    ~ A general understanding of instance-owned operational state within installation. Incident, Request and Collection each required the installer to reco…
  genesis/26/10/07/07 [5f9d94f9] (4/4 terms)
    Establish two optional KAAL Skills through which a KAAL client can deliberately communicate experien…
    ~ I also learned that the installer treats anything in the KAAL directory that no package delivers as drift. …
  (+15 more; narrow with more terms)
[output 2098 bytes; corpus read: 115375 bytes]
```

The relevant Learning and the two Changes that actually met this problem are on top; the Skill ranking is poor (one weak term each), and the card makes that visible at a glance. Two other questions printed 1.8 KB and 2.1 KB ("a reviewer keeps finding one more case every round" reached `State what is refused with what is accepted` with 4 of 4 terms; "may my own helper be the reviewer" reached Changing KAAL and the `07/08` Change on Reviewer authority, and found no Learning, which is true: that rule is owned by Changing KAAL).

**Navigation by references, no stored index.**

```
near <Sealing Skill Node>            364 bytes
  Learnings citing this Skill: 2     One meaning has one definition [4111e444] …
                                     Run the capability where it will live before it is reviewed [542fcbf0] …
near <that Learning>                 825 bytes
  later Learnings citing it: 1       Refines the host run [72562db3]
  Skills it cites: 2                 Changing KAAL [7b247073], Sealing [e15f370c]
  evidence Changes: 4                genesis/26/10/07/05, …/06, …/07 (+1 more), each with its Intent line
near <Change genesis/26/10/07/07>    440 bytes
  Learnings resting on this Change: 5
```

So from a Skill an Agent reaches the Learnings that qualify it, from a Learning the Skills it depends on and the Changes that taught it, and from a Change what was learned from it. A Learning restates none of the Skill's text; the join is the `<name> <ID>` citation and the Evidence line.

**Bounded.** 115,375 bytes were scanned; the example above is `--limit 2`, and the three questions at the default of 3 printed 1,798 to 2,749 bytes and the three `near` calls 364 to 825 bytes. Nothing was stored. These numbers are for this corpus. The claim is the shape (a cap and a statement of what was left out), not a figure.

**What it does not show.** That the `description` of the real Skill brings an Agent to `find` at the right moment; a corpus large enough to make the scan slow; that whole-word matching is enough for questions phrased with other words (it is not for synonyms; the Agent re-asks); the Changes-establish-Learnings link (shown in section 10 with a synthetic Change).

## 7. Prototype source

Each script is published once, exactly as run for sections 5, 6 and 10 (revised after rounds 01, 02 and 03); the earlier forms are superseded and not kept. Both are checked from this file by extracting the fenced blocks verbatim (see section 11).

`learning.mjs`. Run in the host described in section 5 as `node learning.mjs check|establish --engine .kaal --brain <dir> [--record <dir>]… [<draft>]`.

````javascript
#!/usr/bin/env node
// Prototype of what an installed kaal-learning Skill script could be. It uses only
// node builtins, the kaal-sealing scripts beside it, and kaal-core's PUBLIC API
// (registerSkill) resolved as a package. It does not import Core's source.
//   learning.mjs check     --engine <kaal-dir> --brain <dir>... [--record <kaal-dir>...]
//   learning.mjs establish --engine <kaal-dir> --brain <dir> --record <kaal-dir>... <draft>
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, lstatSync, realpathSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SEALING = join(HERE, "skills/kaal-sealing/scripts");
// The Form, as Core's nodes.ts states it (a copy: acceptance must compare it with Core on every real Node).
const FORM = /^---\nname: (.+)\n(?:type:\n {2}name: (.+)\n {2}id: ([0-9a-f]{64})\n)?---\n/;
const HEX = /(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])/g;
const sha = (b) => createHash("sha256").update(b).digest("hex");
/** Whether `id` is sealed in `dir`, decided by Sealing's own check (an empty regular file), never by existence. */
const isSealed = (dir, id) => { try { execFileSync("node", [join(SEALING, "seal.mjs"), "check", dir, id], { stdio: "ignore" }); return true; } catch { return false; } };
const sealing = (script, ...a) => execFileSync("node", [join(SEALING, script), ...a], { encoding: "utf8" }).trim();

function walk(dir) {
  const out = {};
  for (const p of readdirSync(dir, { recursive: true, encoding: "utf8" })) if (statSync(join(dir, p)).isFile()) out[p.split("\\").join("/")] = readFileSync(join(dir, p));
  return out;
}
/** id -> { name, sealed, path } for every Node-form file in a directory whose seals are in <dir>/seals. */
function index(dir, base = dir) {
  const files = walk(dir), idx = new Map();
  for (const [p, b] of Object.entries(files)) {
    if (p.startsWith("seals/") || p.startsWith("changes/")) continue;
    const m = FORM.exec(b.toString("utf8"));
    if (m) idx.set(sha(b), { name: m[1], type: m[3], sealed: isSealed(join(base, "seals"), sha(b)), path: p });
  }
  return idx;
}

function parseArgs(argv) {
  const o = { engine: undefined, brain: [], record: [], rest: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--engine") o.engine = argv[++i];
    else if (argv[i] === "--brain") o.brain.push(argv[++i]);
    else if (argv[i] === "--record") o.record.push(argv[++i]);
    else o.rest.push(argv[i]);
  }
  return o;
}

/** Core's admission by its public API: register into a throwaway copy of the Engine, in memory, with the prospective seal. */
async function coreAdmits(engine, eidx, bytes, id) {
  let core;
  try { core = await import("kaal-core"); } catch { return "kaal-core is not resolvable: Core admission was not run"; }
  const skill = [...eidx.entries()].find(([, n]) => n.name === "Learning KAAL" && n.sealed);
  if (!skill) return "the Engine does not hold Learning KAAL";
  const [skillId, s] = skill;
  const rel = s.path.replace(/^skills\/kaal-learning\//, "");
  const tmp = mkdtempSync(join(tmpdir(), "kaal-learning-"));
  try {
    cpSync(engine, tmp, { recursive: true });
    core.registerSkill(tmp, "kaal-learning", { [rel]: readFileSync(join(engine, s.path), "utf8"), [`seals/${skillId}`]: "", [`${id}.md`]: bytes.toString("utf8"), [`seals/${id}`]: "" });
    return undefined;
  } catch (e) { return `Core refuses: ${e.message}`; } finally { rmSync(tmp, { recursive: true, force: true }); }
}

function citations(text, graph, self) {
  const problems = [];
  const body = text.replace(FORM, "").split("\n## Evidence")[0];
  for (const m of body.matchAll(HEX)) {
    const id = m[0], target = graph.get(id);
    if (id === self) problems.push("a Learning cannot cite itself");
    else if (!target) problems.push(`cites ${id.slice(0, 12)}, which no given Engine or BRAIN holds`);
    else if (!target.sealed) problems.push(`cites ${id.slice(0, 12)}, which is not sealed`);
    else if (body.slice(Math.max(0, m.index - target.name.length - 1), m.index) !== `${target.name} `) problems.push(`cites ${id.slice(0, 12)} without its name "${target.name}" beside it`);
  }
  return problems;
}

function closedChanges(record) {
  const out = new Map();
  const root = join(record, "changes");
  if (!existsSync(root)) return out;
  for (const name of readdirSync(root)) for (const y of readdirSync(join(root, name))) for (const mo of readdirSync(join(root, name, y))) for (const d of readdirSync(join(root, name, y, mo))) for (const c of readdirSync(join(root, name, y, mo, d))) {
    const dir = join(root, name, y, mo, d, c);
    try { const id = sealing("artifact-id.mjs", "--domain", "KAAL Change v1", dir); out.set(id, { dir, closed: isSealed(join(record, "seals/changes"), id) }); } catch { /* not a Change */ }
  }
  return out;
}

/** A path names a regular file inside the Change's own tree: relative, no "..", no link out of the tree. */
function within(root, rel) {
  if (isAbsolute(rel) || rel.split(/[\\/]/).includes("..")) return false;
  const full = join(root, rel);
  try { return lstatSync(full).isFile() && realpathSync(full).startsWith(realpathSync(root) + sep); } catch { return false; }
}

function evidence(text, changes) {
  const section = text.split("\n## Evidence")[1];
  const lines = (section ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const problems = [], ok = [];
  if (!lines.length) problems.push("no evidence line");
  for (const l of lines) {
    const m = /^([0-9a-f]{64})  (\S+)$/.exec(l);
    if (!m) { problems.push(`evidence line is not "<ID>  <path>": ${l.slice(0, 40)}`); continue; }
    const c = changes?.get(m[1]);
    if (!changes) ok.push(`unverified ${m[1].slice(0, 8)}`);
    else if (!c) problems.push(`evidence ${m[1].slice(0, 8)} is not a Change in the given Records (only closed Changes are supported evidence)`);
    else if (!c.closed) problems.push(`evidence ${m[1].slice(0, 8)} is a Change that is not closed`);
    else if (!within(c.dir, m[2])) problems.push(`evidence ${m[1].slice(0, 8)} holds no regular file ${m[2]} inside that Change`);
  }
  return { problems, ok };
}

function structure(text) {
  const p = [];
  const m = FORM.exec(text);
  if (!m) return ["not a Node by Form"];
  const body = text.slice(m[0].length);
  if (!body.startsWith(`\n# ${m[1]}\n`)) p.push(`the body does not begin with "# ${m[1]}"`);
  const i = body.indexOf("\n## Applies when\n"), j = body.indexOf("\n## Evidence\n");
  if (i < 0 || j < i) p.push("sections `## Applies when` then `## Evidence` are required, in that order");
  else if (!body.slice(i + 17, j).trim()) p.push("Applies when is empty");
  return p;
}

const args = parseArgs(process.argv.slice(3));
const cmd = process.argv[2];
if (!["check", "establish"].includes(cmd) || !args.engine || !args.brain.length) { console.error("usage: see header"); process.exit(2); }
const engine = resolve(args.engine), eidx = index(engine);
const learningType = [...eidx.entries()].find(([, n]) => n.name === "Learning" && n.sealed)?.[0];
const brains = args.brain.map((b) => resolve(b));
const graph = new Map(eidx);
for (const b of brains) if (existsSync(b)) for (const [k, v] of index(b)) graph.set(k, v);
const changes = args.record.length ? new Map(args.record.flatMap((r) => [...closedChanges(resolve(r))])) : undefined;

async function problemsOf(bytes, id, sealedInBrain) {
  const text = bytes.toString("utf8"), p = [];
  const m = FORM.exec(text);
  if (!m || !m[3]) return ["not a typed Node by Form"];
  if (!learningType) p.push("the Engine does not hold the Learning type");
  else if (m[2] !== "Learning" || m[3] !== learningType) p.push("its type is not the Engine's Learning, by name and ID");
  if (!sealedInBrain) p.push("not sealed");
  const core = await coreAdmits(engine, eidx, bytes, id);
  if (core) p.push(core);
  p.push(...structure(text), ...citations(text, graph, id), ...evidence(text, changes).problems);
  return p;
}

if (cmd === "check") {
  let bad = 0;
  for (const b of brains) {
    const files = walk(b);
    for (const [p, bytes] of Object.entries(files)) {
      if (p.startsWith("seals/")) continue;
      const id = sha(bytes), probs = [];
      if (p !== `${id}.md`) probs.push(`file is not named by its ID ${id.slice(0, 12)}`);
      probs.push(...(await problemsOf(bytes, id, isSealed(join(b, "seals"), id))));
      console.log(`${id.slice(0, 12)} ${probs.length ? "REFUSED: " + probs.join("; ") : "ok"}`);
      if (probs.length) bad++;
    }
    if (existsSync(join(b, "seals"))) for (const n of readdirSync(join(b, "seals"))) {
      if (!isSealed(join(b, "seals"), n)) { console.log(`seals/${n.slice(0, 12)} is not a seal (an empty regular file named by an ID)`); bad++; }
      else if (!files[`${n}.md`]) { console.log(`seal ${n.slice(0, 12)} has no Learning`); bad++; }
    }
  }
  if (!changes) console.log("evidence unverified: no --record given");
  process.exit(bad ? 1 : 0);
}

// establish
const [draft, ...extra] = args.rest;
if (!draft || extra.length || brains.length !== 1 || !args.record.length) { console.error("establish needs exactly one --brain, at least one --record and one draft"); process.exit(2); }
const bytes = readFileSync(draft), id = sealing("artifact-id.mjs", draft);
const dest = join(brains[0], `${id}.md`), seal = join(brains[0], "seals", id);
if (existsSync(dest)) {
  if (!readFileSync(dest).equals(bytes)) { console.error("refused: the file exists with other bytes"); process.exit(1); }
  if (isSealed(join(brains[0], "seals"), id)) { console.log(`already held ${id.slice(0, 12)}; nothing written`); process.exit(0); }
}
const probs = await problemsOf(bytes, id, true); // the prospective seal is supplied in memory only
if (probs.length) { console.error(`refused, nothing written: ${probs.join("; ")}`); process.exit(1); }
const made = [];
try {
  mkdirSync(join(brains[0], "seals"), { recursive: true });
  if (!existsSync(dest)) { writeFileSync(`${dest}.tmp`, bytes); renameSync(`${dest}.tmp`, dest); made.push(dest); }
  sealing("seal.mjs", "write", join(brains[0], "seals"), id);
  if (!isSealed(join(brains[0], "seals"), id)) throw new Error("the marker at seals/<ID> is not a valid seal (Sealing refuses it)");
  console.log(`established ${id}`);
} catch (e) { for (const f of made) rmSync(f, { force: true }); console.error(`failed, rolled back: ${e.message}`); process.exit(1); }
````

`discover.mjs`, same host: `node discover.mjs find|near|show --engine .kaal --skills skills --record record --brain brain [--limit N] [--budget B] [--after K] [--from O] [--bytes N] <term…|id>`.

````javascript
#!/usr/bin/env node
// Prototype of bounded, derived discovery over three kinds: installed Skill Nodes, Changes in a Record, Learnings in a BRAIN.
// Reads files (a scan, nothing stored). Every command prints within an explicit byte budget and says what it left out.
//   discover.mjs find --engine E --skills S --record R... --brain B... [--limit N] [--budget B] [--after K] <term>...
//   discover.mjs near --engine E --record R... --brain B... [--limit N] [--budget B] <id>
//   discover.mjs show --engine E --record R... --brain B... [--from O] [--bytes N] <id>
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SEALING = join(HERE, "skills/kaal-sealing/scripts");
const FORM = /^---\nname: (.+)\n(?:type:\n {2}name: (.+)\n {2}id: ([0-9a-f]{64})\n)?---\n/;
const HEX = /(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])/g;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const isSealed = (dir, id) => { try { execFileSync("node", [join(SEALING, "seal.mjs"), "check", dir, id], { stdio: "ignore" }); return true; } catch { return false; } };
const changeId = (dir) => execFileSync("node", [join(SEALING, "artifact-id.mjs"), "--domain", "KAAL Change v1", dir], { encoding: "utf8" }).trim();
const files = (d) => Object.fromEntries(readdirSync(d, { recursive: true, encoding: "utf8" }).filter((p) => statSync(join(d, p)).isFile()).map((p) => [p.split("\\").join("/"), readFileSync(join(d, p), "utf8")]));
/** Every cited ID with the name written beside it ("<name> <ID>"), for IDs that are known. */
const citing = (text, known) => [...new Set([...text.matchAll(HEX)].filter((m) => known.has(m[0]) && text.slice(Math.max(0, m.index - known.get(m[0]).length - 1), m.index) === `${known.get(m[0])} `).map((m) => m[0]))];

const o = { engine: "", skills: "", record: [], brain: [], limit: 3, budget: 2000, after: 0, from: 0, bytes: 1500, rest: [] };
const argv = process.argv.slice(3);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--engine") o.engine = resolve(argv[++i]);
  else if (a === "--skills") o.skills = resolve(argv[++i]);
  else if (a === "--record") o.record.push(resolve(argv[++i]));
  else if (a === "--brain") o.brain.push(resolve(argv[++i]));
  else if (["--limit", "--budget", "--after", "--from", "--bytes"].includes(a)) o[a.slice(2)] = Number(argv[++i]);
  else o.rest.push(a);
}
o.bytes = Math.min(o.bytes, 4000);

// --- the three kinds, as cards ---
const eng = files(o.engine);
const typeId = (name) => Object.values(eng).map((t) => ({ t, id: sha(t) })).find((x) => new RegExp(`^---\\nname: ${name}\\n`).test(x.t) && isSealed(join(o.engine, "seals"), x.id))?.id;
const skillTypeId = typeId("Skill"), learningTypeId = typeId("Learning");
const skills = [];
for (const [p, t] of Object.entries(eng)) {
  const m = FORM.exec(t);
  if (!m || p.startsWith("seals/") || m[3] !== skillTypeId || !isSealed(join(o.engine, "seals"), sha(t))) continue;
  const cap = p.split("/")[1], sk = o.skills && existsSync(join(o.skills, cap, "SKILL.md")) ? readFileSync(join(o.skills, cap, "SKILL.md"), "utf8") : "";
  const desc = /^description: (.+)$/m.exec(sk)?.[1] ?? "";
  skills.push({ kind: "Skill", id: sha(t), name: m[1], card: t.slice(m[0].length).trim().split("\n").filter((l) => l && !l.startsWith("#"))[0] ?? "", text: `${t}\n${desc}`, cites: [] });
}
// Read-side admission: a Learning is a file named by its ID, typed by the Engine's own Learning (name and ID), with its own valid seal.
// Anything else in a BRAIN is a candidate that is not admitted; it is counted, never shown as a Learning.
const learnings = []; let notAdmitted = 0;
for (const b of o.brain) for (const [p, t] of Object.entries(files(b))) {
  if (p.startsWith("seals/")) continue;
  const m = FORM.exec(t), id = sha(t);
  if (!m || !learningTypeId || m[2] !== "Learning" || m[3] !== learningTypeId || p !== `${id}.md` || !isSealed(join(b, "seals"), id)) { notAdmitted++; continue; }
  const ap = (t.split("## Applies when")[1] ?? "").split("##")[0].trim();
  learnings.push({ kind: "Learning", id, name: m[1], card: ap, text: t, body: t.replace(FORM, "").split("\n## Evidence")[0],
    evidence: [...(t.split("## Evidence")[1] ?? "").matchAll(/^([0-9a-f]{64})  (\S+)$/gm)].map((e) => e[1]) });
}
const changes = [];
for (const r of o.record) {
  const root = join(r, "changes");
  for (const n of readdirSync(root)) for (const y of readdirSync(join(root, n))) for (const mo of readdirSync(join(root, n, y))) for (const d of readdirSync(join(root, n, y, mo))) for (const c of readdirSync(join(root, n, y, mo, d))) {
    const dir = join(root, n, y, mo, d, c), f = files(dir), intent = f["work/01-intent.md"] ?? "", id = changeId(dir);
    const title = (intent.split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("#") && l !== "Intent" && !/^Intent [—-]/.test(l)) ?? "").slice(0, 100);
    const text = ["work/01-intent.md", "retro-work.md", "retro-owner.md", "retro-review.md"].map((k) => f[k] ?? "").join("\n");
    const own = Object.entries(f).filter(([k]) => k.startsWith("work/") || k.startsWith("retro")).map(([, v]) => v).join("\n");
    changes.push({ kind: "Change", id, name: `${n}/${y}/${mo}/${d}/${c}`, card: title, text, own, closed: isSealed(join(r, "seals/changes"), id), order: `${y}${mo}${d}${c}`, files: f });
  }
}
// References: "<name> <ID>" in a Learning's body, or in a Change's own Work and retros. Evidence lines are a distinct relation.
const known = new Map([...skills, ...learnings].map((x) => [x.id, x.name]));
for (const x of learnings) x.cites = citing(x.body, known).filter((i) => i !== x.id);
for (const x of changes) x.cites = citing(x.own, known);
const byId = new Map([...skills, ...learnings, ...changes].map((x) => [x.id, x]));

// --- output under a byte budget: names are clipped, cards stop when the budget is spent, and the output says so ---
const lines = []; let used = 0, dropped = 0;
const clip = (s, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…(+${s.length - n + 1} chars)` : s);
const RESERVE = 400; // room kept for the lines that say what was left out and how to continue
const fits = (n) => used + n <= o.budget - RESERVE;
const say = (s) => { const b = Buffer.byteLength(s) + 1; if (!fits(b)) { dropped++; return false; } lines.push(s); used += b; return true; };
const note = (s) => { lines.push(s); used += Buffer.byteLength(s) + 1; }; // continuation notes are short and always printed
// The address is never clipped: only the name is. 12 hex digits; near/show refuse a prefix that matches more than one.
const label = (x) => `${clip(x.kind === "Change" ? x.name + (x.closed ? "" : " (open)") : x.name, 60)} [${x.id.slice(0, 12)}]`;
/** One whole card or none: returns whether it was printed. */
const card = (x, extra) => {
  const a = `  ${label(x)}${extra ?? ""}`, b = `    ${x.kind === "Learning" ? "applies when: " : ""}${clip(x.card, 110)}`;
  if (!fits(Buffer.byteLength(a) + Buffer.byteLength(b) + 2)) return false;
  say(a); say(b); return true;
};
const pick = (prefix) => { const m = [...byId.values()].filter((x) => x.id.startsWith(prefix ?? "\0")); if (m.length > 1) { console.error(`ambiguous: ${m.length} Nodes or Changes begin ${prefix}; give more digits`); process.exit(1); } return m[0]; };

const cmd = process.argv[2];
if (cmd === "find") {
  const terms = o.rest.map((t) => t.toLowerCase());
  for (const [lbl, set] of [["Skills", skills], ["Learnings", learnings], ["Changes", changes]]) {
    const hits = set.map((x) => ({ x, score: terms.filter((t) => new RegExp("\\b" + t).test(x.text.toLowerCase())).length }))
      .filter((h) => h.score > 0).sort((a, b) => b.score - a.score || String(b.x.order ?? "").localeCompare(String(a.x.order ?? "")));
    say(`${lbl}: ${hits.length} match of ${set.length}`);
    let n = 0;
    for (const h of hits.slice(o.after, o.after + o.limit)) { if (!card(h.x, ` (${h.score}/${terms.length} terms)`)) break; n++; }
    if (hits.length > o.after + n) note(`  (${hits.length - o.after - n} more; narrow with more terms or continue with --after ${o.after + n})`);
  }
  if (notAdmitted) say(`BRAIN files not admitted as Learnings: ${notAdmitted} (not shown; run learning check)`);
} else if (cmd === "near") {
  const full = pick(o.rest[0]);
  if (!full) { console.error("unknown id"); process.exit(1); }
  say(`${full.kind} ${label(full)}`);
  // --after applies to every list below; a list continues from where the limit or the budget stopped it.
  const show = (xs, l) => {
    say(`  ${l}: ${xs.length}`);
    let n = 0;
    for (const x of xs.slice(o.after, o.after + o.limit)) { if (!card(x)) break; n++; }
    if (xs.length > o.after + n) note(`    (${xs.length - o.after - n} more of "${l}"; continue with --after ${o.after + n})`);
  };
  const cited = (x) => x.cites.map((i) => byId.get(i)), citedBy = (x) => [...skills, ...learnings, ...changes].filter((y) => y.cites.includes(x.id));
  if (full.kind !== "Change") {
    show(citedBy(full).filter((y) => y.kind === "Learning"), "Learnings that cite it");
    show(citedBy(full).filter((y) => y.kind === "Change"), "Changes that cite it (applied or established it)");
  }
  if (full.kind === "Learning") {
    show(cited(full).filter((y) => y.kind === "Skill"), "Skills it cites");
    show(cited(full).filter((y) => y.kind === "Learning"), "earlier Learnings it cites");
    show(changes.filter((c) => full.evidence.includes(c.id)), "evidence Changes (what it rests on)");
  }
  if (full.kind === "Change") {
    show(cited(full).filter((y) => y.kind === "Skill"), "Skills it cites");
    show(cited(full).filter((y) => y.kind === "Learning"), "Learnings it cites");
    show(learnings.filter((l) => l.evidence.includes(full.id)), "Learnings resting on it as evidence");
  }
} else if (cmd === "show") {
  const full = pick(o.rest[0]);
  if (!full) { console.error("unknown id"); process.exit(1); }
  const buf = Buffer.from(full.kind === "Change" ? full.files["work/01-intent.md"] ?? "" : full.text), end = Math.min(buf.length, o.from + o.bytes);
  say(`${full.kind} ${label(full)}`);
  lines.push(buf.subarray(o.from, end).toString("utf8")); used += end - o.from;
  lines.push(end < buf.length ? `[bytes ${o.from}-${end} of ${buf.length}; continue with --from ${end}]` : `[bytes ${o.from}-${end} of ${buf.length}; end]`);
}
if (dropped) lines.push(`(output budget ${o.budget} bytes reached; ${dropped} lines not shown; narrow the question or raise --budget)`);
const out = lines.join("\n");
console.log(out);
console.error(`[output ${Buffer.byteLength(out)} bytes; budget ${cmd === "show" ? o.bytes : o.budget}; corpus scanned: ${[...skills, ...learnings, ...changes].reduce((a, x) => a + Buffer.byteLength(x.text), 0)} bytes]`);
````

The first prototype (`proto.mjs`, which imported a source copy of `nodes.ts`) was a 40-line script of the same kind and is superseded; its results are in section 5.

## 8. What the evidence does not establish

- That an agent, unprompted, finds and applies a Learning. That needs the Skill and use.
- That four Learnings are the right four. They are the ones that meet the criteria on the retrospectives of two days' Changes by a small set of actors; a different reader may weigh them differently, and the Owner's retrospectives are the Owner's judgement, not mine.
- That the Evidence form is enough for kinds of evidence other than a Change (a carrier, a collected Incident). Sealing defines a Change's identity; other kinds define their own, and `check --record` resolves only what it is given a way to.
- That `find` by plain text finds what a synonym describes.
- That a host with only Core's deployed artifacts, and no `kaal-core` package, can run the Core-admission step. The prototype says so and stops.

## 9. Disposition of review round 01

Round 01 (`review/01.md`) named four findings; each is resolved in `03-architecture.md` and demonstrated in section 5. F1: delivery path through the public `registerSkill()` as an oracle, with the remaining gap named (Fork 7). F2: Core's admission and the Skill's citation check are distinguished, the citation form is `<name> <ID>`, and absent / unsealed / wrongly named targets are refused. F3: establishing has its own pre-write validation with the seal supplied in memory, defined write, rollback and already-held behaviour. F4: establishing requires Records and accepts only closed Changes as evidence, refusing every other kind; reading is permissive and says it is unverified. Nothing in the Intent was changed.

The Owner's input on the PR (2026-10-09) added Requirements R30 to R35, the section on bounded discovery in the Architecture, the reordering of the transition so that the read side comes first, and closed Fork 5. The Intent is unchanged.

## 10. Disposition of review round 02

Round 02 (`review/02.md`) accepted the resolution of F1 to F4 and added F5 to F9: contradictions between the Architecture's contracts and the evidence. Each is now stated in the Architecture and Requirements (R6, R12, R30, R36, R37) and demonstrated below in a scratch copy (`p2`) of the host of section 5, with the revised prototypes of section 7. No file of the repository, no Node and no seal was written. The host has 47 Learnings after the bulk run (the 5 of section 6, one refinement, one with a 100,011-character name, 40 bulk probes) and 26 Changes (25 real plus a synthetic sealed one).

**F5, a seal is Sealing's check.** `index()`, the closed-Change test, the already-held branch and the BRAIN `check` now call `seal.mjs check` instead of testing existence. With the marker of an established Learning replaced by the bytes `nonempty`, and again by a directory: `check` printed `4111e444126c REFUSED: not sealed` for it and `seals/4111e444126c is not a seal (an empty regular file named by an ID)`, and exited 1 (the other four ok). `establish` of a Learning citing that target, with either bad marker, printed `refused, nothing written: cites 4111e444126c, which is not sealed` and exited 1; the BRAIN was unchanged. Restoring an empty marker returned `check` to exit 0. After writing a seal, `establish` verifies it with Sealing and fails if a marker at that path still does not pass.

**F6, evidence stays inside the Change.** With a correct Change ID: `../../../../../../../outside.md` printed `evidence 5f9d94f9 holds no regular file ../../../../../../../outside.md inside that Change` (the file existed outside, in the Record) and `/etc/hostname` the same; both exit 1, nothing written. A symlink placed in the sealed Change is not reachable as evidence: Sealing refuses to identify a Change that holds one (`link.md is not a regular file or directory`), so the Change is no longer a given Change. The path check is relative, no `..`, regular file by `lstat`, real path under the real Change directory.

**F7, the read side admits.** A file with a wrong type name and no marker was placed in the BRAIN. `find mismatch` printed `Learnings: 0 match of 47` and `BRAIN files not admitted as Learnings: 1 (not shown; run learning check)`; `near` of the evidence Change listed 47 Learnings resting on it and not the file; `check` named it `REFUSED: file is not named by its ID…; its type is not the Engine's Learning…; not sealed; Core refuses…`. Reading without Records is unchanged (evidence is reported unverified by `check`, not required by discovery), and `find` over a host with no BRAIN still returns Skill and Change cards.

**F8, a byte budget.** With one sealed, typed Learning whose name is 100,011 characters and 47 Learnings in all: `find boundprobe --limit 1` printed 319 bytes (the round-02 measurement of the unbounded version was 100,394). Round 03 found that this clipped the ID away with the name; the card is now `BBBB…(+99952 chars) [15ca81be8342]`, the name clipped and the address intact (section 11). `find bulkprobe --limit 20` (40 matches, longer cards) printed 1,909 bytes under the 2,000 budget and ended `output budget 2000 bytes reached; 12 lines not shown; narrow the question or raise --budget`; `--limit 3 --after 3` continued with the next three. `show --bytes 300` of the 210,277-byte Learning printed 457 bytes and `[bytes 0-300 of 210277; continue with --from 300]`; `--from 300` printed the next piece. `near` printed 112 to 661 bytes in every case. The corpus scanned grew from 115 KB to 353 KB; the output did not.

**F9, neighbours both ways.** A synthetic sealed Change (`genesis/26/10/09/01`) whose Work cites `Refines the dependency one 7ac26854…` (a refinement that cites `One meaning has one definition 4111e444…` and has Evidence naming Change `07/07`). `near cdb40157` (the Change) gave `Learnings it cites: 1 – Refines the dependency one`. `near 7ac26854` (the refinement) gave `Changes that cite it: 1 – genesis/26/10/09/01`, `earlier Learnings it cites: 1 – One meaning has one definition`, and `evidence Changes: 1 – genesis/26/10/07/07`, the last kept apart from citation. `near 4111e444` gave `Learnings that cite it: 1 – Refines the dependency one`, `Skills it cites: 1 – Sealing` and its four evidence Changes. A citation counts only with the known name beside the ID.

**What this still does not show.** The synthetic Change is a fixture, not a historical retrospective; no real Change cites a Learning yet. Speed: establishing 40 Learnings took minutes because each run starts Node, copies the Engine for Core's admission and spawns Sealing; that is a cost of the prototype, not of the architecture. The scan time of discovery was not measured.

## 11. Disposition of review round 03

Round 03 (`review/03.md`) accepted F5, F6, F7 and F9, kept F8 open in two parts, and added F10.

**F10, the scripts.** Section 7 published each script twice in one block (the revised source followed by the previous): a defect of how I regenerated the section, which the round correctly reports as unexecutable. Section 7 now holds each script once and says the earlier forms are not kept. Both blocks were then extracted from this file verbatim (the exact fenced contents, nothing removed), compared byte for byte with the files the cases were run from (identical), checked with `node --check` (both pass, Node 22.22.0 here; the Reviewer used 24.19.0), and the cases were run from the extracted copies in a scratch host with Sealing's scripts copied beside them (a symlinked `skills` makes `artifact-id.mjs` print nothing, which I first mistook for a defect of the scripts):

- F5: a non-empty marker and a directory at the marker of `4111e444…`: `check` exits 1 naming `seals/4111e444126c is not a seal…` and the refinement that cites it as `cites 4111e444126c, which is not sealed`; `establish` citing it printed `refused, nothing written`. Baseline `check` over the 47 Learnings exits 0.
- F6: `../../../../../../../outside.md` and `/etc/hostname` as evidence: refused, exit 1.
- F7: the unsealed wrongly typed file: `Learnings: 0 match of 47` and `BRAIN files not admitted as Learnings: 1`.

**F8, address.** `find boundprobe --limit 1` over the 100,011-character name printed 319 bytes and `[15ca81be8342]` after the clipped name; `show 15ca81be8342 --bytes 300` read it in pieces (`[bytes 0-300 of 210277; continue with --from 300]`). Cards now carry 12 digits; `near 4` printed `ambiguous: 7 Nodes or Changes begin 4; give more digits` and exited 1.

**F8, continuation of neighbours.** Fifteen Changes cite `Refines the dependency one 7ac26854…` (the one from section 10 and fourteen further synthetic sealed Changes). `near 7ac268547471 --limit 3` with `--after 0`, `--after 3` and `--after 12` printed 912, 569 and 480 bytes with different Changes each time (`…/09/01, 02, 03`; `04, 05, 06`; `13, 14, 15`), each ending `N more of "Changes that cite it…"; continue with --after K` where more remain. With `--limit 10 --budget 700` the output was 562 bytes: one card, then `14 more … continue with --after 1` for the list the budget cut, and the same note for the lists it never reached. `find` continues the same way (`--limit 20 bulkprobe` printed 1,548 bytes and `32 more … continue with --after 8`).

**What this does not show.** Continuation of `near` is a single `--after` for all lists of one call, which suits one large list at a time (the common case) and is clumsy for several. Learnings that cite a Learning were not run again at fifteen (the Changes list exercised the same code). The scripts are prototypes in a scratch host; nothing here is a package.
