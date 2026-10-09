# Architecture (draft, for Owner alignment)

## The model in one line

**The Process owns the relationships. The Skills own their Ways of Working. Review owns examination.** What follows shows that this already fits KAAL's sealed semantics, names the one small thing a Process needs that is not yet there, and says what is deliberately left out.

```
 Core        identity, {name, id} references, discovery of what is installed
   │
 Skill ─ Skill ─ Extension     each: its own Node + its own Way of Working; none names a Process
   ▲        ▲        ▲
   └────────┴────────┘
        Process        born after what it composes, cites each by {name, id}; states
                       relationships, feedback, lenses, boundary. Reads, never runs.
   │
 Review      examination of any result by identity; knows nothing of the lens
 BRAIN       what was learned about a Process or a lens; cites it, never defines it
 Agent       reads Core, then the Process, then the Skills it needs
```

## 1. Why the direction holds without anything new

A Node refers only to Nodes born before it. So a composition is *necessarily* downstream of its parts: `Intent`, `Review` and `Changing KAAL` are sealed and can never cite a later Process. The structural half of "without embedding dependencies on other Skills into the individual Ways of Working" is therefore free for every Node that has not yet been born. The other half is discipline, and today it is not quite met by wording (investigation §2: `kaal-intent` step 6; `kaal-changing` steps 2 and 3). That wording is optional and unsealed; it is a second statement of a relationship that the model would state once, in the Process. Moving it is a later Change.

## 2. What a Process is: a specialized Skill

**Owner direction (PR comment, 2026-10-09):** a Process is a specialized Skill using existing Core Node, type and reference semantics. Core gains no sealed Change Process content and no Process-specific dimension. This replaces an earlier draft of this section that argued for a distinct `Process` type; that draft's reasoning is kept as the cost list below so the choice is made with its costs visible.

**Why it is coherent.** `core/Agent.md` (BASS) puts the Skill step at "a particular capability *or kind of work*", and `core/Skill.md` ties a Skill to a capability. A Process is the Skill for a kind of work, whose capability is *working in that way*; it is a Skill whose Way of Working is to use other capabilities in stated relations. The installer already has the composition rule such a Skill needs: an Agent Skill declares in `compatibility` the sibling capabilities it needs, and the installer refuses an installation where one is unmet (it is how `kaal-changing` needs `kaal-sealing`). A Process's dependence on what it composes is therefore declared where the machinery already reads it, on the dependent.

**What it is not.** It is not a Skill that restates another Skill's Way of Working; it is not an engine; it needs no registration beyond `registerSkill()`; and it is not a CASE dimension.

**Costs of the choice, stated:**

1. **Enumeration mixes.** `installedSkills()` lists independent capabilities and Processes together. What marks a Skill as a Process is its text (it composes, pinned by `{name, id}`), not its type. An Agent can tell by reading the Node; Core cannot filter. If that ever matters, a vocabulary Definition `Process` born in a package (not Core) could name the idea without changing any registration; this Change does not propose it.
2. **"One capability".** The Skill Definition's wording is looser for a Process. Reading BASS's "kind of work" into it is an interpretation; the Owner has chosen it.
3. **Dependency lives in text.** Which Skills a Process composes is stated in its Node (pinned) and its `compatibility` field. Core cannot enumerate "what composes `Intent`"; that stays a derived read (§8).

Everything else in §3 to §6 is independent of the type.

An illustration of a Process statement (**not a Node, not sealed, wording not proposed**; IDs are the current real ones, abbreviated):

```
name: Change Process
type: Skill {2389ba68…}
---
Composes:   Changing KAAL 7b247073…96c2 · Review 7c3d4d8e…6d5f · Sealing …
            · Intent 7317b19e…22cf (optional) · Retro …
Boundary:   within one Change made under this Process.
Owns:       the order (work ⇄ review, seal work, retros, seal Change), the seats, ROWING,
            lenses, feedback. Does not own the Change as an artifact: its address, its
            identity, its seal and what "closed" means are Changing KAAL's.
Absent:     if Intent or Review is not installed the lens that needs it is unavailable.

Lens "Intent adequacy" (internal)
  subject      an Intent, as it stands (by identity)
  standard     the Way of Working of Intent
  expectation  "Is the Intent correctly described?"
  discipline   Review
  applies      before the Intent is established; not owed unless the Owner asks.
  standing     information unless a Reviewer holds an assigned seat; never in review/
...
```

The statement says *who relates to whom and what is asked*. It does not say how to describe an Intent (`kaal-intent`), how to write a round (`kaal-review`), or what a Change is (`kaal-changing`).

A generic helper Skill that writes and checks such statements, as `kaal-intent` does for an Intent, is possible and not proposed now.

## 3. The lens

A lens is four parts stated together (R7). Direction and position are not parts; they are properties of the expectation.

```
 subject ─────────────┐
 standard ────────────┤ expectation, as a question ─▶ Review (examines, reports) ─▶ findings
 (Way of Working      │      defined by the Process       owns the form of a round
  or identified result)┘
```

- **Internal**: the standard is the Way of Working of the capability that produced the *kind* of subject. It asks of the subject "is it what this capability says such a thing should be?" Requires a capability with a Way of Working. Only `Intent` has one that fits (G4).
- **External**: the standard is another identified result. It asks "does the subject stand in the stated relation to that result?" Requires only an identity, so it is available for every pair of results today.
- **Direction.** *Forward*: a downstream subject examined against an upstream standard. *Feedback*: an upstream subject examined from a downstream vantage, or downstream evidence addressed to the upstream result. Both are the same four parts; the Process says which it wants. Relationship words ("against", "from the perspective of", "informs") live in the expectation as prose; **this model defines no relationship type system.**

### The eight examples

| Lens | Position | Subject | Standard | Expectation | Available today |
|---|---|---|---|---|---|
| Intent adequacy | internal | an Intent | Way of Working of `Intent` | Is the Intent correctly described? | yes, if `Intent` and `Review` installed |
| Intent fulfilment | external | delivered result | the established Intent | Does it fulfil the Intent? | yes |
| Requirements against Intent | external, forward | Requirements | Intent | Do they carry what is wanted and why, no more? | yes |
| Architecture against Requirements | external, forward | Architecture | Requirements | Does it meet them? | yes |
| Requirements from Architecture | external, feedback | Requirements | Architecture, as the vantage | Are they satisfiable and consistent given this design? | yes |
| Code against Architecture | external, forward | delivered Code | Architecture | Does it realise it? | yes |
| Operations against Requirements | external, forward | operational evidence (an incident carrier is one candidate) | Requirements | Do results meet them? | yes |
| Testing and Defects informing upstream | external, feedback | test result, defect | Requirements or Architecture | Does this show the upstream is wrong or incomplete? | yes |

Every row is available as a *statement* because external lenses need no Way of Working; none of them states an order. They are not stages: an Owner or a Process may use any, in any order, or none. Internal lenses for Requirements, Architecture, Code and Operations have no standard yet; a Way of Working for each would be its own capability, born when wanted, and a Process would then cite it.

## 4. Three axes that must stay separate

| Axis | Values | Answers | Where it lives |
|---|---|---|---|
| Position | internal · external | what the review is relative to its subject | the lens (Process) |
| Operating mode | Engineer · Embed · External | where Engine, Record and Subject are | the instance (08/03) |
| Independence | assigned seat · none | who may call the review a round that counts | the Owner's assignment (07/08) |

A lens statement mentions only the first. An internal review can be done in any mode and by an unassigned or an assigned reviewer; a review by an assigned independent Reviewer can be internal or external. Reusability across modes follows from R9 and R18: a lens names identities and relations, never locations.

## 5. Targeted review versus the authorized independent review

| | ROWING round (Changing KAAL) | Targeted lens review |
|---|---|---|
| Subject | the Change's `work/` | any result; the Work may be one |
| Home | `review/NN.md` | any other place; never `review/` (kept by Process discipline for the Work, by the compass for other subjects) |
| Seat | assigned by the Owner, never the Worker | optional; an unassigned reviewer's output is information |
| Effect on the Change | decides convergence and unlocks the Work seal | none |
| Form | Review's round, `--of Work` | Review's round with the subject's name (`--of Intent`) when a record is wanted; otherwise any report |

This distinction needs **no new rule** in Changing KAAL, but it is kept by two different things, and only one is structural:

- **Structural, for other subjects.** A targeted round about a result other than the Work, placed outside `review/`, leaves the compass byte-identical; placed *in* `review/`, it makes `change-state` report the Change's own `review/01.md` malformed, because the compass reads a `Work:` line and a Work identity (evidence §5). That is detection of a subject mismatch, nothing more.
- **Not structural, for the Work.** A targeted review whose subject *is* the Work can be written as a round naming the Work's exact identity. Placed in `review/` it is indistinguishable to the compass from a ROWING round: a scratch round with outcome `converged` and an explicitly advisory, unassigned Reviewer statement produced `REVIEW CONVERGED` with no problems (evidence §5a). The compass reads the Work identity and the result; it reads neither the lens nor the Reviewer's authority. This is existing behaviour (the Reviewer statement is "something an owner can inspect and is not proof"), not something this Change proposes to enforce.

So the separation of a targeted Work review from the authorized independent review rests on **Process-controlled placement and authority discipline**: the Process puts targeted rounds outside `review/` and states that only a round written under an assigned seat belongs in it. Nothing in KAAL stops a mistaken placement; it is the Reviewer's statement and the Owner's inspection that do (R14).

What the model does add is **provenance**: a round carries the subject's identity but not which lens or standard was used (investigation §2, point 3). If a Process wants it recorded, the finding text says it; Review's form is not extended, and nothing parses it.

## 6. Timing and standing

An established result is immutable; a finding about it cannot be resolved by editing it. So a Process states, per lens, *before* or *after* establishment (R12):

- **Before**: an internal lens such as Intent adequacy is useful while the Owner can still describe again. This is also where `kaal-intent` already puts Review (step 6, "Review is another capability"), and where it stops: Intent decides nothing about whether, when or by whom.
- **After**: the finding is information to the Owner and may inform a future Intent, a retrospective, or a Learning in BRAIN. It does not make the Change fail, because the Intent is the fixed target and no one inside the Change revises it.

Where findings are kept is the Process's decision (R16). The default proposed here is *not a new directory*: a finding worth keeping is carried into `work/` as evidence, named with the lens that produced it, so it is sealed with the Work and read by the retros; a lens round file is optional. Nothing is added to the Change record layout.

## 7. `kaal-changing` and the Change Process

### 7.1 Decision and what it rests on

The Owner's direction settles which alternative: **separate artifact responsibility from Process responsibility, and they must not be required to travel together.** The comparison that led there is kept short, since it explains what the separation must not break.

- **Supersession (a successor takes over)** would need a rule that one Node takes over another, which KAAL does not have: `registerSkill()` never gives a registered path other bytes, `installedSkills()` lists every admitted `Skill` and relates none to another. It would also leave the old Node installed and enumerated beside the new, and either duplicate or re-home the single compass that 07/05 made one. It moves the parts that are not the problem in order to move the parts that are.
- **Separation** fits the sealed Node, which names no process content ("through KAAL's change process. Its scope is that alone. It is not the changes themselves, and it is not the tools"), keeps Change identity and history untouched, and puts the one new dependency (Process on Changing) in the right direction.

### 7.2 The responsibility map

| Responsibility | Today | Owner after separation | Why there |
|---|---|---|---|
| Change address grammar, discovery (`changes()`), allocation (`next-change`) | `change-state.mjs`, `next-change.mjs` | **Changing** | any Change, with or without a Process |
| Which tree is a Change, which a named tree; seal locations | `change-state.mjs` | **Changing** | identity of the artifact |
| Closed = the Change tree's ID has a seal | `closedChanges()` | **Changing** | what admission and preservation read |
| Seal integrity (a seal matching no tree; damaged history) | `checkChanges()`, `stateOf()` | **Changing** | structural validity |
| Record structure as documented | `SKILL.md` "The change record", "Admission" | **Changing** | |
| Immutability of a closed Change; no reuse or renumber | `SKILL.md` rules | **Changing** | artifact rules |
| Sealing as the way identity and seals are established | `compatibility: kaal-sealing` | **Changing** (still needs Sealing) | |
| `work/` as the one recognized **named tree**: `WORK`, `currentWorkId()`, `namedTreeId()`, the tree-seal resolution that finds an orphan Work seal | `change-state.mjs` | **Changing** | `checkChanges()` needs it to give today's verdicts (Reviewer round 01, finding 1); it is a compatibility rule of the artifact, not a meaning of the order |
| Names `review/`, `retro-*` | `change-state.mjs` | **Process** | they exist because of the order |
| `rounds()` (reading `review/NN.md`) | `change-state.mjs` | **Process** | a reading of Review's form for ROWING |
| `derive()` stages, `next:`, whose act | `change-state.mjs` | **Process** | ROWING, convergence, Work seal, retro order, next actor |
| Historical-form warnings for *open* Changes | `derive()` | **Process** | meaningful only against the order |
| "Closed but `work/` not sealed" | `checkChanges()` | **Changing**, as part of the named-tree rule above; see 7.4 | admission relies on it; moving it would change admitted verdicts |
| Roles, seats, Worker ≠ Reviewer, handoff and continuation | `SKILL.md`, `rowing.md` | **Process** | |
| Retros, their order, Knowledge | `SKILL.md`, `retro.md` | **Process** (the form is Retro's) | |
| Intent as fixed target; Review as optional capability | `SKILL.md` wording | **Process** | composition |
| Lenses, feedback, positions, timing | nowhere | **Process** | new |
| The gate on writing steps (`sealWorkStep`, `closeStep`) | `engineering/change-seal` `process.ts` | engineering **consults the Process** | the one place the order is enforced |
| `ROWING`, `WORK`, `RATIFICATION` Definitions | delivered with Changing's package, "owned by nothing" | stay delivered where they are (Q) | Nodes are location-independent; the Process pins them by ID |

### 7.3 `change-state.mjs` is extracted by responsibility, not moved

Moving the script whole would carry the artifact's identity functions into the Process, and then Changing, which admission and preservation need alone, would depend on the Process. The rows above split it:

```
Changing  (kept):  changes(), present(), address grammar, SEALS/TREE_SEALS, changeId(), namedTreeId(),
                   WORK and currentWorkId() as the one recognized named tree (unchanged rule, no generalization),
                   sealedIds(), sealedTreeIds(), closedChanges(), checkChanges() with all three of its checks,
                   the damaged-history override.          answers: what is a Change, is it closed, is its history intact
Process   (new):   REVIEW and RETRO_* names, rounds(), derive() past the closed early return,
                   the open-Change historical-form warnings.      answers: where it is in the order, whose act is next
                   imports Changing's functions, including WORK and currentWorkId(). It never re-implements them.
```

**The line is not drawn through `checkChanges()`.** It resolves every seal under `seals/trees` against the current `work/` trees and rejects a closed Change whose `work/` is unsealed, so it needs `WORK` and `currentWorkId()`. If those moved to the Process, Changing would need Process-owned identification (a dependency the wrong way), a duplicate, or changed verdicts. A scratch probe in round 01 showed the verdict is specific: an arbitrary sealed named tree `other/` is reported as matching no `work/`, so replacing the existing resolution with generic named-tree scanning would change what is reported. **No generalization is proposed.** `work/` stays the one recognized named tree, with its compatibility rules exactly as they are, in the artifact layer, as the single place where the order's vocabulary appears in the artifact; the Process uses it and adds none.

The compass's two-argument shape (`compass({identity, markers})`) is already the seam: Changing keeps the part that needs only Sealing's identity and markers; the Process takes the rest and calls it. The order stays defined exactly once, in the Process.

### 7.4 Artifact validity versus fulfilment of a Process

The code already makes this distinction without naming it (investigation §9.3):

- **Artifact validity**: the tree is a Change at a valid address, its seal exists and matches, history is intact. Closure is this. Admission and preservation read only this, which is why history needs no re-validation and why historical retro forms stay valid.
- **Process fulfilment**: the Change went through work, converged review, Work seal and the retros in order. Only the writing steps enforce it, today.

The separation must **keep admission artifact-level, not weaken it by accident, and not strengthen it by accident**:

1. After extraction `admit()` must call only Changing's closure and Changing's seal-integrity checks, exactly as `stateOf()` returned `CHANGE CLOSED` plus `checkChanges()` before. A Change sealed without the Process is admitted before and after, which is today's behaviour (evidence §5c).
2. The process-flavoured check inside `checkChanges()` (closed Change with a `work/` that has no seal), the orphan tree-seal check and the `work/` resolution they share stay in Changing exactly as they are (§7.3). That keeps admission's verdicts identical with no Process installed. The alternative, admission asking the Process for fulfilment, would make a host command depend on the Process and is Q10. Dropping the check, or generalizing it to any named tree, would change admitted verdicts.
3. The gate on `seal-kaal-work` and `close-kaal-change` moves to the Process-owned order, called by the same engineering helper. If the Process is not installed, only the bare `seal` is available and nothing enforces the order, the same as hand-placing a seal today.
4. Whether a host control should additionally ask "was this Change's Process fulfilled?" is a separate, new control and a separate Change. It would be a strengthening, not a preservation.

### 7.5 Dependencies and independent use

```
 kaal-process-change ──needs──▶ kaal-changing ──needs──▶ kaal-sealing
        │ composes (pins by {name,id}), optional: kaal-intent · kaal-review · kaal-retro · other D Skills
```

- **Changing never depends on the Process.** A KAAL holding only Changing and Sealing can allocate a Change, seal it, preserve it and admit it. That is its independent use.
- **The Process depends on Changing** (and on Sealing through it) and declares it in `compatibility`. This is the one unavoidable dependency, in the right direction.
- **Review is composed, not owned.** The Process reads rounds (today a second parser of Review's form) and may later ask Review for convergence instead; changing that is a behaviour change and a separate Change (R35).
- **The same Skills are reusable.** `Intent`, `Review`, `Retro`, `Sealing` are untouched and may be pinned by any other Process; the Change Process may be absent without anything else breaking.

### 7.6 Transition (design only; each step is its own governed Change)

| Step | Change | Result | Controls |
|---|---|---|---|
| 0 | **This Change** | design only | none touched |
| 1 | Born: the Process package, additive. Its Skill, its Node, its script **wrapping** `change-state.mjs` (no second copy of the order) | `kaal-process-change` installable; Changing unchanged | all existing verdicts unchanged |
| 2 | Move: `rounds()`, `derive()` past the closed early return, the `review/` and `retro-*` names and the open-Change warnings into the Process script; Changing's script keeps the artifact functions, `work/` as the named tree and all of `checkChanges()`. **Bridge**: `engineering/change-seal` accepts the stage from either location for one Change, then drops it | one definition of the order, in the Process | scratch case in §5c and every existing Change give identical verdicts, before and after |
| 3 | Reduce: `kaal-changing/SKILL.md` to record structure, allocation, artifact rules, Sealing; the 8-step Process, roles, handoff move to the Process Skill | Changing independently useful; no sealed Node edited | none |
| 4 | Optional: ask Review for convergence in the Process; add a host control for fulfilment | strengthening, only if the Owner wants it | new, deliberate |

Properties of the transition: no Core change, no `.github` change in steps 1 to 3 (the controls call root npm commands and import nothing), no sealed Node edited, no Change re-sealed, and no check waived (each step lands with the previous one's checks green, using a bridge where a consumer must accept both forms).

**One thing that is not settled by editing the Agent Skill: the sealed meaning.** `Changing KAAL` says it manages changes "through KAAL's change process". After step 3 Changing's Skill no longer *contains* that process; the Node names it without defining it, and the Process now does. If the Owner reads the Node as still true (it never defined the process), nothing more is needed. If the Owner reads it as promising the process, then a narrower successor Node for Changing is the only honest route, and that wants the supersession rule KAAL lacks. This is Q9, and the recommendation is the first reading.

### 7.7 Naming

`kaal-process-change` names the specialized Skill that composes Changing, Review, Sealing and the D Skills and owns flows, feedback, lenses, roles and progression. `kaal-changing` keeps its name and its responsibility: the Change as an artifact. No existing Node, package or Skill is renamed.

## 8. How an Agent reaches a lens (R19)

The route uses only what exists, and does not depend on #72 or on any index.

```
1. The Agent holds a subject of some kind (an Intent) and has no capability names.
2. Core: installedSkills(kaal) -> a list of {name, id}. Core cannot say which compose others.
3. For each listed Skill, read its Node (found by its ID, as AGENTS.md directs: follow references,
   do not crawl). A Node is short; a Process Node leads with what it composes and for what (R38).
   Keep the Skills whose lead says they compose and whose subjects include this kind.
4. Read those Processes' lens statements; follow their pinned {name, id} to the standard
   (the Way of Working of Intent) and to Review, only as needed.
```

**Bounded, and by what.** Step 3 reads the Node of every installed Skill, not their Agent Skill bodies. The installed set is not the whole of KAAL: optional Skills are installed only by exact ID (investigation §2), so it is what the Owner chose. In this repository the five installed Skills' Nodes total about 4.9 KB (346 to 2,370 bytes each); a Process Node is longer but is read only once it matches. That is acceptable for a small installed set and **is not shown to scale**: with many installed Skills, reading each Node's lead is linear in their number.

**What is deferred.** A scalable route needs something that tells composing Skills from capability Skills without reading each: a marker the type carries (a vocabulary Definition `Process`, Q1), a derived index, or #72's `find`/`near` surface. None is assumed. R19 is therefore met as a complete route for a small installed set and **deferred for large ones**, for the Owner to align (Q14). BRAIN may later be one such derived surface; it is not a prerequisite of anything here.

**Not shown.** Nobody has run an Agent along this route (evidence §6 proposes the trial).

## 9. What is deliberately out

- No engine, scheduler, state, status, approval or enforcement. A Process is read.
- No mandatory sequence and no six-stage pipeline. The six Ds are vantages a Process may cite, not an order.
- No Core, Node Form, relationship model, package, script or Skill is created by this Change; no Process-specific Core dimension or sealed Change Process content in Core; no supersession mechanism is proposed.
- No rename; no change to `kaal-changing`, `kaal-intent`, `kaal-review`, sealed Nodes, `.github`, `engineering`. The extraction in §7 is a design for later governed Changes.
- No review governance: the Reviewer seat rule stands as 07/08 ruled it. A lens review confers no seat.
- No change to #72. Where lens discovery meets BRAIN's read surface is a question, not a plan.

## 10. Questions for the Owner

Numbered, recommendation first. None is answered by this Change.

1. **A Process is a specialized Skill (your direction).** Do you want a vocabulary Definition `Process` born in a package, to name the idea? *Recommend: not now; revisit when a second Process exists.* Cost of not having one: Core cannot filter Processes from capabilities (§2).
2. **Pin composed capabilities by exact `{name, id}`?** *Recommend: yes.* It is KAAL's reference rule. The cost is that superseding a composed Skill means re-birthing the Process; KAAL has no supersession rule and this Change does not invent one.
3. **Do lens statements live in the Process Node (sealed, short) or only in its Agent Skill?** *Recommend: relationship, position, timing and question in the Node; procedure in the Agent Skill.*
4. **Standing of a lens review with no assigned seat.** *Recommend: information only, never a round that counts and never in `review/`.*
5. **Where is a useful lens finding kept?** *Recommend: carried into `work/` evidence with the lens named; no new directory.*
6. **Timing of internal Intent review.** *Recommend: before establishment, stated by the Process.*
7. **The existing cross-Skill wording** in `kaal-intent` and `kaal-changing`. *Recommend: leave now; reduced by the governed Changes in §7.6 and a later one for `kaal-intent`.*
8. **Which extraction line for `change-state.mjs`?** *Recommend: the split in §7.3: Changing keeps what answers "is it a Change, is it closed, is its history intact"; the Process takes the order, the rounds and the next actor.* Is the line where you read the code?
9. **Is the sealed `Changing KAAL` still true after its Skill is reduced?** *Recommend: yes, since it names "KAAL's change process" and never defined it.* If you read it as promising the process, a narrower successor Node is the only route and needs a supersession rule first.
10. **`work/` as the one recognized named tree, and the "closed but `work/` is not sealed" check.** *Recommend: both stay in Changing unchanged, with no generalization to arbitrary named trees,* so admission's verdicts are identical with or without a Process. It is the one place the order's vocabulary appears in the artifact layer. Alternative: admission asks the Process for fulfilment, a new dependency of a host command on the Process.
11. **Should Process fulfilment ever be checked at admission?** *Recommend: not in this line of work.* Today admission is artifact-level; adding fulfilment is a deliberate strengthening and its own Change (step 4 of §7.6).
12. **Does the Process ask Review for convergence instead of re-reading rounds?** *Recommend: later, as its own Change.* It makes Review a prerequisite and has a stricter parser than the compass's two-line reading (R35).
13. **Where do `ROWING`, `WORK`, `RATIFICATION` ship?** *Recommend: unchanged for now* (Nodes are location-independent; the Process pins them by ID); relocating delivery to the Process package is optional and can wait.
14. **Finding composing Skills, and #72.** *Recommend: derived read now; decide after #72's direction is reviewed.*
15. **Run the discoverability trial before building anything?** *Recommend: yes,* by an actor you assign; a Worker-side run is a probe, not evidence of independence (evidence §6).
16. **Is the briefing an Intent?** This Change's `work/01-intent.md` keeps your wording (headings added) and has the same "Expected Work" section Codex flagged in #72.
17. **May a lens ever be closure-bearing?** *Recommend: not now.* It would require extending what closes a Change through a Changing-governed Change.
