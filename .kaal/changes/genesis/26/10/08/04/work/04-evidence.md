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

Text as proposed, so that the Owner and a Reviewer can judge the form and the content. **Provisional**: each ID is of the exact bytes below and changes with any edit, and each candidate Learning's type ID is the ID of the `Learning` draft. Candidates 1 and 2 cite the open `08/03` Change; that line does not resolve until it is admitted, and the check says so (section 5).

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

ID `7a4708bf46834ed43cda92c3343e3d1108c486365896a97b9f6fc50c5197faf7`

````markdown
---
name: Run the capability where it will live before it is reviewed
type:
  name: Learning
  id: 4b671080738a4dc127e47d8ee2254d7c14243c53b9d61fef40fe316b8c736770
---

# Run the capability where it will live before it is reviewed

A capability proven only by its own acceptance suite hides what it needs beside it and what it leaves behind. Installed into a host that is not its source, with real data, it showed a sibling Skill it needed but never declared, state it wrote that the installer read as drift, and a boundary in the checks around it. None was found by reasoning or by the suite. At Architecture time, list what the capability needs beside it, what it writes and where, and which other readers will meet those bytes, and probe each in such a host. A need that keeps being rediscovered is a decision waiting to be made, not understanding to repeat.

## Applies when

You are about to review or admit a capability that is installed, writes state, or is read by something other than its own tests.

## Evidence

222ad5b8b57b3254135f6cfad0c4cdc0771b8d8479768381602ee385875aa655  retro-work.md
ed5387f4bdc244c7212ca31c51c07fb9c0643e55e904bdcfc3bb022cf5a64c8a  retro-work.md
5f9d94f953822e3841d68c9cbdf5ef8ac9c5fbf5bf4994516a4dcb5ad7a2a301  retro-work.md
4e89104a4315380a600a5369235469480d9f1d0db99de5e110b2ffff37514a9e  retro-work.md
````

### Candidate 4

ID `ab815c8fa3557c0a1169a9521e78ab0a06dbff31999080c8136668358f37f033`

````markdown
---
name: One meaning has one definition
type:
  name: Learning
  id: 4b671080738a4dc127e47d8ee2254d7c14243c53b9d61fef40fe316b8c736770
---

# One meaning has one definition

Where two consumers need the same meaning (a parse, a path rule, an identity), a second implementation is where the next defect arises: the two agree on the inputs the author thought of and part on the rest. Take the meaning from the capability that owns it. Where that dependency is not yet acceptable, say in the Architecture that the meaning is held twice, and run both on every real input they will meet, so that the disagreement is found by a check and not by a Reviewer.

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
| Cites a Learning present in the BRAIN but **unsealed** | refused: "cites 878b7af533c3, which is not sealed" |
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


## 6. How future Work would find and use them

A Worker begins the Architecture of a Change whose Intent names a mechanism (a CLI, a registry, a directory move) together with an outcome. Today, nothing brings Candidate 1 to the Worker. With `kaal-learning` installed and a BRAIN named by the Owner or the host:

1. The Skill's description matches the moment ("before Requirements or Architecture are committed"), and the Worker runs `find --engine .kaal --brain <the Owner's BRAIN> architecture mechanism`.
2. It prints, for each hit, name, ID, BRAIN, *Applies when*, and later Learnings that cite it. In the prototype: `d1efdc8d3f4f Ask what the want serves before choosing the mechanism`, applies when "You are about to commit an Architecture to a mechanism, or to proceed on a default for a decision that is the Owner's", cited by 0.
3. The Worker reads that Learning, and in its own `03-architecture.md` writes, among the reasoning, "Applies Ask what the want serves before choosing the mechanism d1efdc8d3f4f5385bf25759461b016ff5e81ba731f2a93bd4189c08ce712f6a8: the Intent names a CLI and a registry; the outcome is composition from a source".
4. Later, `trace --record .kaal d1efdc8d...` lists the Changes that cite it. Nobody has been required to cite it; the Reviewer may ask whether it was considered, as it may ask about any Node.
5. If the Worker finds the Learning wrong, or narrower than it states, the correction is a new Learning that cites it. The first is not edited.

(*Inference:* the sibling Change `08/03` composition Intent was reshaped by its Owner from "a CLI and a registry" to the outcome. Candidate 1 states what that redirection taught. I do not claim the Worker would have avoided the draft had the Learning existed.)

## 7. Prototype source

The second prototype, `learning.mjs`. Run in the host described in section 5 as `node learning.mjs check|establish --engine .kaal --brain <dir> [--record <dir>]… [<draft>]`.

````javascript
#!/usr/bin/env node
// Prototype of what an installed kaal-learning Skill script could be. It uses only
// node builtins, the kaal-sealing scripts beside it, and kaal-core's PUBLIC API
// (registerSkill) resolved as a package. It does not import Core's source.
//   learning.mjs check     --engine <kaal-dir> --brain <dir>... [--record <kaal-dir>...]
//   learning.mjs establish --engine <kaal-dir> --brain <dir> --record <kaal-dir>... <draft>
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SEALING = join(HERE, "skills/kaal-sealing/scripts");
// The Form, as Core's nodes.ts states it (a copy: acceptance must compare it with Core on every real Node).
const FORM = /^---\nname: (.+)\n(?:type:\n {2}name: (.+)\n {2}id: ([0-9a-f]{64})\n)?---\n/;
const HEX = /(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])/g;
const sha = (b) => createHash("sha256").update(b).digest("hex");
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
    if (m) idx.set(sha(b), { name: m[1], type: m[3], sealed: existsSync(join(base, "seals", sha(b))), path: p });
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
    try { const id = sealing("artifact-id.mjs", "--domain", "KAAL Change v1", dir); out.set(id, { dir, closed: existsSync(join(record, "seals/changes", id)) }); } catch { /* not a Change */ }
  }
  return out;
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
    else if (!existsSync(join(c.dir, m[2])) || !statSync(join(c.dir, m[2])).isFile()) problems.push(`evidence ${m[1].slice(0, 8)} holds no file ${m[2]}`);
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
      if (p.startsWith("seals/")) { if (!files[`${p.slice(6)}.md`]) { console.log(`seal ${p.slice(6, 18)} has no Learning`); bad++; } continue; }
      const id = sha(bytes), probs = [];
      if (p !== `${id}.md`) probs.push(`file is not named by its ID ${id.slice(0, 12)}`);
      probs.push(...(await problemsOf(bytes, id, !!files[`seals/${id}`])));
      console.log(`${id.slice(0, 12)} ${probs.length ? "REFUSED: " + probs.join("; ") : "ok"}`);
      if (probs.length) bad++;
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
  if (existsSync(seal)) { console.log(`already held ${id.slice(0, 12)}; nothing written`); process.exit(0); }
}
const probs = await problemsOf(bytes, id, true); // the prospective seal is supplied in memory only
if (probs.length) { console.error(`refused, nothing written: ${probs.join("; ")}`); process.exit(1); }
const made = [];
try {
  mkdirSync(join(brains[0], "seals"), { recursive: true });
  if (!existsSync(dest)) { writeFileSync(`${dest}.tmp`, bytes); renameSync(`${dest}.tmp`, dest); made.push(dest); }
  sealing("seal.mjs", "write", join(brains[0], "seals"), id);
  console.log(`established ${id}`);
} catch (e) { for (const f of made) rmSync(f, { force: true }); console.error(`failed, rolled back: ${e.message}`); process.exit(1); }
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
