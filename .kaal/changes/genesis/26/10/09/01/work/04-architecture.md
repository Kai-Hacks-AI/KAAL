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

## 2. What a Process is, justified from meaning

The type is decided from what the sealed Nodes mean, not from what costs least. (My first draft recommended a Skill-typed Node mainly because it needs no new type; the Owner's review rightly rejected that as a reason.)

**What Core says a Skill is.** `core/Skill.md`: a Skill "specifies the desired behaviour for one capability, so that an agent acts on that capability as KAAL intends"; it is found by Node type alone and "joins KAAL without becoming Core". `core/Agent.md` (BASS) says the Skill step is for "a particular capability or kind of work", which is looser; the tension is real and is read below. An Extension is "an additional capability".

**What a Process is.** A statement of how several capabilities are used *in relation to each other* for a purpose.

| | Skill | Process |
|---|---|---|
| About | one capability's Way of Working | relations among two or more capabilities |
| Meaning complete alone? | yes: `Intent` cites nothing and installs alone | no: its meaning is the Nodes it pins; with a participant absent it is partly unavailable (R6) |
| Acts on | its capability | no capability; it shapes how others are used |
| Relation to other Skills | independent of them | dependent on them, by exact `{name, id}` |
| Reuse | is reused by Processes | is the reuser |
| What listing "the Skills" should mean | independent capabilities | not part of that list |

Read from meaning, a Process is **not** a Skill. Typing it `Skill` would let a Skill be a composition of Skills, put dependent statements into the enumeration of independent capabilities (`installedSkills()`), and blur "one capability". The apparent counter-example is `Changing KAAL`, a Skill that is also process-like. It is a Skill because *managing Changes* is one capability (its own artifact, lifecycle operations and compass); the process-like part of it is exactly the composition wording (investigation §5), which is the part that is not that capability's own.

**Shape.** A KAAL Definition `Process` stating that a Node is a KAAL Process exactly when its type refers, by name and ID, to this Node: the same pattern Core uses for `Skill` and `Extension`. A Process Node states participants by `{name, id}`, relationships, flows, lenses and boundary; it states no Way of Working and no implementation. The Definition and the first Process are born in a Process package, not in Core: CASE is sealed and a new Core dimension is not needed to type a Node.

**What this costs, checked in a scratch run (evidence §5b):**

1. **Delivery.** Core admits a Process-typed Node with no change. But `registerSkill()` and `registerExtension()` refuse a contribution that carries no Node typed by `Skill` or `Extension` ("a contribution carries a Node typed by the admitted Skill Node"). So a Process cannot be delivered alone; it ships *with the capability that works it*, a Skill whose Way of Working is acting under that Process. That is natural, not forced: the Change Process ships with the capability for working the Change Process, and a pure statement with nobody to act on it has no use.
2. **Enumeration.** `installedSkills()` does not list a Process, and Core has no `installedProcesses()`. Finding Processes is a derived read of Nodes typed by the Process Definition (as #72 proposes for Learnings), or a later Core function. Neither is proposed here (Q9).
3. **CASE.** CASE has no Process dimension and is sealed. The Process Definition sits beside CASE, not inside it. If the Owner wants Processes to be a dimension of CASE, that is a Core Change of its own.

**The cheaper alternative, stated honestly:** type a Process `Skill`. It is enumerated and delivered with no new Definition. It is rejected on meaning, and it is the one that would have to be undone if Processes later need to be told apart from capabilities.

An illustration of a Process statement (**not a Node, not sealed, wording not proposed**; IDs are the current real ones, abbreviated):

```
name: Change Process
type: Process {<ID of the Process Definition, once born>}
---
Composes:   Changing KAAL 7b247073…96c2 · Intent 7317b19e…22cf · Review 7c3d4d8e…6d5f
Boundary:   within one Change. Nothing here applies to a result outside a Change.
Closure:    Changing KAAL's compass and ROWING decide when a Change is closed. This
            Process adds nothing to that and takes nothing from it.
Absent:     if Intent or Review is not installed the lens that needs it is unavailable;
            the Change proceeds as Changing KAAL says.

Lens "Intent adequacy" (internal)
  subject      an Intent, as it stands (by identity)
  standard     the Way of Working of Intent
  expectation  "Is the Intent correctly described?"
  discipline   Review
  applies      before the Intent is established; not owed unless the Owner asks.
               After establishment a finding informs the Owner and a future Intent.
  standing     information unless a Reviewer holds an assigned seat; never in review/

Lens "Intent fulfilment" (external)
  subject      a delivered result (by identity)
  standard     the established Intent (by identity)
  expectation  "Does the delivered result fulfil the Intent?"
  ...
```

The statement says *who relates to whom and what is asked*. It does not say how to describe an Intent (`kaal-intent`), how to write a round (`kaal-review`), who reviews (the Owner's assignment, `rowing.md`), or when a Change is closed (Changing KAAL).

A generic helper Skill that writes and checks Process statements, as `kaal-intent` does for an Intent (form, and that each pinned `{name, id}` resolves to an installed Node), is possible and not proposed now.

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
| Home | `review/NN.md` | any other place; never `review/` |
| Seat | assigned by the Owner, never the Worker | optional; an unassigned reviewer's output is information |
| Effect on the Change | decides convergence and unlocks the Work seal | none |
| Form | Review's round, `--of Work` | Review's round with the subject's name (`--of Intent`) when a record is wanted; otherwise any report |

This distinction needs **no new rule** in Changing KAAL. A scratch run (evidence §5) shows both halves of why: a lens round outside `review/` leaves the compass byte-identical, and a lens round placed *in* `review/` makes `change-state` report the Change's own `review/01.md` malformed (the compass reads `Work:` and the Work identity). The structure already keeps them apart; the Process only has to say which kind of review it is describing.

What the model does add is **provenance**: a round carries the subject's identity but not which lens or standard was used (investigation §2, point 3). If a Process wants it recorded, the finding text says it; Review's form is not extended, and nothing parses it.

## 6. Timing and standing

An established result is immutable; a finding about it cannot be resolved by editing it. So a Process states, per lens, *before* or *after* establishment (R12):

- **Before**: an internal lens such as Intent adequacy is useful while the Owner can still describe again. This is also where `kaal-intent` already puts Review (step 6, "Review is another capability"), and where it stops: Intent decides nothing about whether, when or by whom.
- **After**: the finding is information to the Owner and may inform a future Intent, a retrospective, or a Learning in BRAIN. It does not make the Change fail, because the Intent is the fixed target and no one inside the Change revises it.

Where findings are kept is the Process's decision (R16). The default proposed here is *not a new directory*: a finding worth keeping is carried into `work/` as evidence, named with the lens that produced it, so it is sealed with the Work and read by the retros; a lens round file is optional. Nothing is added to the Change record layout.

## 7. `kaal-changing`: supersession or separation?

The Owner asked for two genuine alternatives to be weighed against the sealed Node, the delivered Skill, the compass and the lifecycle operations. **A**: a successor (for example `kaal-process-change`) takes over the Change process responsibilities, preserving Change identity and history and defining the transition. **B**: `kaal-changing` keeps the governed Change artifact and its lifecycle operations; a distinct Process capability owns composition, flows, feedback and lenses; Changing's process-specific wording is later reduced or moved through a governed Change, never edited in place against sealed identity.

### 7.1 What `kaal-changing` actually holds

| # | Responsibility | Where it lives today | Nature |
|---|---|---|---|
| 1 | Change address and allocation (`changes/<name>/YY/MM/DD/CC/`, `next-change`) | Agent Skill, script | artifact |
| 2 | Identity and seal of a Change; "closed" means sealed | `kaal-sealing`, `engineering/change-seal`; Changing's wording | artifact |
| 3 | The order that defines "closed": work ⇄ review converged on the Work, seal work, three retros in order, seal Change | `change-state.mjs`, consulted by sealing, closing, admission and the `.github` controls (07/05: "the one definition of the order") | **closure-defining**, mandatory, enforced |
| 4 | Seats and authority (Owner, Worker, Reviewer; Worker and Reviewer never one; the turn, the seat, the capability; handoff) | Agent Skill, `rowing.md`; the compass's `next:` line | **closure-defining** governance |
| 5 | `RATIFICATION`, `ROWING`, `WORK` | sealed Definitions delivered with Changing's package, "owned by nothing" | vocabulary |
| 6 | Historical forms (`retro.md`, `retro-observe.md`) valid only for older Changes | compass | artifact validity |
| 7 | Intent as the fixed target of a Change; kept byte for byte when established with `kaal-intent` | Agent Skill wording | composition |
| 8 | Review as an optional capability whose round form is read "however written" | Agent Skill wording; the compass reads only `Work:` and `Result:` | composition (the form read is Review's) |
| 9 | Sealing as an installation prerequisite | `compatibility` field; installer refuses if unmet | dependency of the lifecycle operations |
| 10 | Targeted lenses, internal/external positions, feedback from Testing and Defects, the six vantages, timing relative to establishment | nowhere | **new composition** |

Rows 1, 2, 3, 4, 5, 6 and 9 define what a Change is and when it is closed; they are one thing, because the compass's order *is* the closure predicate (a Change is closed when its tree has gone through that order and is sealed). Rows 7, 8 and 10 say how other capabilities are used around it. The sealed Node says nothing of either: it is "the capability for managing changes to KAAL through KAAL's change process. Its scope is that alone. It is not the changes themselves, and it is not the tools". It names no Intent, no Review, no order. **The sealed meaning already supports a split without anyone editing it**, since it never contained the composition.

### 7.2 Alternative A: supersession

What it needs, none of which exists:

- **A supersession rule.** `registerSkill()` "never gives a registered path other bytes: changed bytes are another Node"; a referring Node still refers to the ID it was born against; `installedSkills()` lists every admitted Node typed `Skill` and relates none to another. Register a successor beside `Changing KAAL` and an Agent sees two Skills claiming one job, with nothing saying which governs. A rule that a Node "takes over" another is a new semantic, and the Owner's rule is that new semantic births extend CASE, not Core machinery.
- **A transition for the compass.** The compass is deliberately single (07/05). A successor either re-implements it (two definitions of the order, which the Owner closed in 07/05) or becomes its home, and then `engineering/change-seal`, the admission check and the `.github` controls (which travel alone, under the isolation rule) must be re-pointed.
- **Carrying everything.** The successor must carry or re-cite the historical forms, the three Definitions, the seat rules and the Sealing prerequisite, or the old Node remains the only place they live.
- **Handling the old Node.** It stays sealed and admitted forever. This repository's `.kaal` installs it; `check-kaal-install` names installed Skills no package delivers, so dropping the old package makes the check red, and removal of a Node or a seal is not built and must not be.

What it preserves: Change identity (path plus bytes, independent of any Skill) and all admitted history. What it buys: one new name and a clean restatement.

It would be right if the *sealed meaning* of Changing KAAL were wrong, or if "a Change" were itself changing meaning. Neither holds: the Node's meaning is unchanged by any of rows 7, 8 and 10, and A would move rows 1 to 6 and 9, which are not the problem, in order to move 7, 8 and 10, which are.

### 7.3 Alternative B: separation

The line is drawn at **closure-defining versus composing**, not at "process versus not". Changing KAAL keeps rows 1 to 6 and 9. A distinct Process capability (the Process Definition, the Change Process, and a Skill that works it) owns rows 7, 8 (as relationships) and 10.

- **ROWING stays authoritative, and has a place in the model.** The review by ROWING is structurally a lens: subject the Work, standard the Change as intended (Intent, Requirements, Architecture), discipline Review, a seat assigned by the Owner. It is the one lens that is *closure-bearing*, because the compass requires its convergence before the Work is sealed. Every other lens is optional and Process-owned. The Process may cite ROWING and Review; it may not weaken, replace or add to what closes a Change (R25).
- **Dependencies run one way.** The Process pins `Changing KAAL`, `Intent`, `Review` by exact `{name, id}` (it is born after them, so it can). Changing never names the Process. The one unavoidable dependency, a Change Process presupposing Changing, is on the Process, where it belongs; it is declared as an installation prerequisite in the working Skill's `compatibility` field, the mechanism that already carries `kaal-changing` needing `kaal-sealing`. A Process that is about something other than a Change has no such dependency.
- **The compass stays the one definition of order.** Nothing here duplicates or moves it. The Process says nothing the compass reads.
- **Skills stay independently reusable.** `Intent`, `Review`, `Retro` and `Sealing` are untouched and can be pinned by any number of Processes. The existing cross-Skill wording (`kaal-intent` step 6; `kaal-changing` steps 2, 3) is reduced or moved by a later governed Change that points it at the Process. That is the Agent Skill, which is unsealed and delivered, so this is a governed edit of delivered text, not an edit of a sealed Node. This Change does not do it.
- **Transition risk is nil.** The Process package is additive: no sealed Node changes, no Change is re-sealed, admission is unchanged, the compass and its consumers are unchanged. For a while the same relationship is stated twice (the old optional wording and the Process); the Process Skill says that Changing's wording governs closure until the later Change reduces it.

**What B cannot do, stated plainly:** make a lens *mandatory for closure*. That would require the compass to read the Process, which inverts the dependency (Changing depending on a Process). Under B a lens is advisory unless a host control reads the Process (the host's choice, outside KAAL) or the Owner deliberately extends closure through a Changing-governed Change. That is a limit worth having: a Process is read, not run.

### 7.4 Comparison

| Criterion | A: supersession | B: separation |
|---|---|---|
| Fits the sealed meaning of `Changing KAAL` | moves what the Node never said | unchanged and sufficient |
| Change identity and history | preserved by identity; validity of old forms must be carried | untouched |
| One definition of the order | at risk during transition, then re-homed | untouched |
| ROWING and Reviewer authority | restated in the successor | stay where the compass reads them |
| Dependency direction | successor replaces; consumers re-pointed | Process → Changing only |
| Skills reusable | yes | yes |
| New mechanism needed | a supersession rule (new semantic) | none beyond the Process Definition |
| Core change | none, but a rule that wants to be Core's | none |
| Can a lens be mandatory for closure? | yes, by moving the compass | no, by design |
| Transition | real: two Skills, consumers, `.github`, installed Node | none |

### 7.5 Recommendation (smallest coherent)

**B.** Changing KAAL keeps the governed Change, its compass, ROWING and the seats. A distinct Process capability, new and additive, owns composition and lenses. Nothing is superseded, renamed or edited.

On naming, which this answers: `kaal-process-change` is a good name, but for the *new* capability, whose responsibility is the Change Process, not for `kaal-changing`, whose responsibility is the governed Change. A name for the composing capability expresses its responsibility; the name `kaal-changing` still expresses its own. The name of a Skill and its package is chosen when born and is the Owner's call (Q8); it is placement, not identity.

What would change this recommendation: if the Owner wants lenses to be closure-bearing, B's limit above applies and either the compass is deliberately extended through a Changing-governed Change or A is reconsidered; if "a Change" is to change meaning, A is the honest path and wants its own supersession rule first.

## 8. How an Agent reaches a lens (R19, not yet shown)

```
Agent holds a subject (an Intent)
  → Core (AGENTS.md → core/): what Skills are installed, by {name, id}
  → the installed Process Nodes (few, short): which state a lens whose subject is an Intent
  → the Skills those lenses cite, only as needed
```

No prior capability names are needed, and nothing is loaded wholesale. Two routes exist and neither needs Core to change: read the installed Process statements directly (small N), or use the derived read surface #72 proposes (`find` by the Agent's words, `near` along references). **This route is a design, not a demonstration**; the Evidence shows the one case the Intent asks about and what it does not establish (evidence §3 to §4). A proposed way to test it is in evidence §6.

## 9. What is deliberately out

- No engine, scheduler, state, status, approval or enforcement. A Process is read.
- No mandatory sequence and no six-stage pipeline. The six Ds are vantages a Process may cite, not an order.
- No Core, Node Form, relationship model, package, script or Skill is created by this Change, and no supersession mechanism is proposed.
- No rename; no change to `kaal-changing`, `kaal-intent`, `kaal-review`, sealed Nodes, `.github`, `engineering`.
- No review governance: the Reviewer seat rule stands as 07/08 ruled it. A lens review confers no seat.
- No change to #72. Where lens discovery meets BRAIN's read surface is a question, not a plan.

## 10. Questions for the Owner

Numbered, recommendation first. None is answered by this Change.

1. **What is a Process, as a type?** *Recommend: a distinct type, a KAAL Definition `Process` born in a Process package (not Core), justified from meaning (§2): a Skill is one capability's Way of Working, a Process is dependent relations among several.* It ships with a Skill that works it, because registration requires one; Processes are found by a derived read. The cheaper alternative, typing a Process `Skill`, is rejected on meaning.
2. **Does a Process pin composed capabilities by exact `{name, id}`?** *Recommend: yes.* It is KAAL's reference rule and what makes the relation checkable. The cost is that superseding a composed Skill means re-birthing the Process; KAAL has no supersession rule, and this Change does not invent one.
3. **Do lens statements live in the Process Node (sealed, short) or only in its Agent Skill (unsealed)?** *Recommend: relationship, position, timing and question in the Node; procedure in the Agent Skill.*
4. **What standing does a lens review without an assigned seat have?** *Recommend: information only, never a round that counts and never in `review/`.* This states what 07/08 already implies for the Work seat; it adds no governance.
5. **Where is a useful lens finding kept?** *Recommend: carried into `work/` evidence with the lens named; no new directory.*
6. **Timing of internal Intent review.** *Recommend: before establishment, stated by the Process.* After establishment it informs a future Intent.
7. **The existing cross-Skill wording** (`kaal-intent` step 6; `kaal-changing` steps 2, 3). *Recommend: leave it now; a later governed Change points it at the Process.* Is that how you read "without embedding dependencies"?
8. **`kaal-changing`: supersession (A) or separation (B)?** *Recommend: B (§7).* Changing KAAL keeps the governed Change, compass, ROWING and seats; a new additive Process capability owns composition and lenses. `kaal-process-change` is a fitting name for that new capability, if you want it; `kaal-changing` keeps its name.
9. **Finding Processes, and #72.** Does the route in §8 ride on a derived read of Process-typed Nodes, on #72's `find`/`near` surface, or on a later Core function? *Recommend: derived read; decide after #72's direction is reviewed; do not couple the Changes now.*
10. **Test the discoverability claim before building anything.** *Recommend: yes.* The two-prompt trial in evidence §6; who runs it is yours to assign. A Worker-side run is a probe, not evidence of independence.
11. **Is the briefing an Intent?** This Change's `work/01-intent.md` keeps your wording (headings added) and has the same "Expected Work" section Codex flagged in #72. Is that the right place for an Owner's briefing to land, or should an Intent be separated from the briefing before work begins (what `kaal-intent` exists for)?
12. **May a lens ever be closure-bearing?** *Recommend: not now.* Under B that requires deliberately extending the compass through a Changing-governed Change, so it can never happen by stating a lens.
