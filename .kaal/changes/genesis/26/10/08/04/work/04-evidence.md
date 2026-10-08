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


## 5. Scratch prototype with Core's own admission

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

````javascript
import { admit, sha256 } from "./nodes.mts";
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
const walk=(d,base=d,o={})=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p,base,o);else o[path.relative(base,p)]=fs.readFileSync(p);}return o;};
const engine=walk(process.argv[2]); const brainDir=process.argv[3]; const recordDir=process.argv[4];
const brain=walk(brainDir);
// graph = engine + brain, one graph (as registerSkill admits installed KAAL + contribution)
const files={...engine}; for(const [p,b] of Object.entries(brain)) files[p.startsWith("seals/")?p:"brain/"+p]=b;
const adm=admit(files);
const learning=adm.find(n=>n.name==="Learning"&&n.type?.name==="KAAL Definition");
console.log("engine holds Learning type:", learning?learning.id.slice(0,12):"NO");
const L=adm.filter(n=>learning&&n.type?.id===learning.id);
const issues=[];
for(const [p,b] of Object.entries(brain)){ if(p.startsWith("seals/")) continue; const id=sha256(b);
  if(p!==id+".md") issues.push(`file ${p} is not named by its ID ${id.slice(0,12)}`);
  if(!brain["seals/"+id]) issues.push(`${p.slice(0,12)} is not sealed`); if(!L.some(n=>n.id===id)) issues.push(`${p.slice(0,12)} is not an admitted Learning`);}
for(const p of Object.keys(brain)) if(p.startsWith("seals/")&&!brain[p.slice(6)+".md"]) issues.push(`seal ${p.slice(6,18)} has no Node`);
// record: change ids
const changes={}; if(recordDir){ for(const y of walkDirs(recordDir)) { try{ const id=execFileSync("node",["/home/user/KAAL/skills/kaal-sealing/scripts/artifact-id.mjs","--domain","KAAL Change v1",y]).toString().trim(); changes[id]=y;}catch{} } }
function walkDirs(r){const out=[];(function rec(d,depth){ if(depth===4){out.push(d);return;} for(const e of fs.readdirSync(d,{withFileTypes:true})) if(e.isDirectory()) rec(path.join(d,e.name),depth+1);})(path.join(r,"changes/genesis"),0);return out;}
for(const n of L){ const ev=n.markdown.split("## Evidence")[1]||""; for(const line of ev.trim().split("\n")){ const m=/^([0-9a-f]{64})  (\S+)$/.exec(line); if(!m){issues.push(`${n.name}: bad evidence line ${line}`);continue;} const dir=changes[m[1]]; if(!dir) issues.push(`${n.id.slice(0,8)} evidence: Change ${m[1].slice(0,8)} not in Record`); else if(!fs.existsSync(path.join(dir,m[2]))) issues.push(`${n.id.slice(0,8)} evidence: ${m[2]} missing in ${m[1].slice(0,8)}`);}}
console.log(`admitted Learnings: ${L.length}`); for(const n of L){ const cited=L.filter(o=>o!==n&&o.markdown.includes(n.id)).length; const ap=(n.markdown.split("## Applies when")[1]||"").split("##")[0].trim(); console.log(`- ${n.id.slice(0,12)} ${n.name}\n    applies when: ${ap}\n    cited by ${cited} later Learning(s)`);}
console.log(issues.length?"ISSUES:\n  "+issues.join("\n  "):"no issues");
````

Run as `node --experimental-strip-types proto.mjs <engine-dir> <brain-dir> <kaal-dir-with-changes>`, with `nodes.mts` a copy of `packages/kaal-core/src/nodes.ts`.

## 8. What the evidence does not establish

- That an agent, unprompted, finds and applies a Learning. That needs the Skill and use.
- That four Learnings are the right four. They are the ones that meet the criteria on the retrospectives of two days' Changes by a small set of actors; a different reader may weigh them differently, and the Owner's retrospectives are the Owner's judgement, not mine.
- That the Evidence form is enough for kinds of evidence other than a Change (a carrier, a collected Incident). Sealing defines a Change's identity; other kinds define their own, and `check --record` resolves only what it is given a way to.
- That `find` by plain text finds what a synonym describes.
