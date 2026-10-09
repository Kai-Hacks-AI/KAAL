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

## 2. What a Process is, smallest form

Four options, in order of weight. The Intent asks not to assume a new type; the table shows what each costs.

| | Form | Costs | Leaves open |
|---|---|---|---|
| 0 | Status quo: relationships in a Skill's unsealed Agent Skill wording. | Nothing. | G1 to G3, G7: nothing a Node-reading Agent can see or pin. |
| **1** | **A Process is a Skill (a Node typed by `Skill`, registered and found by Core's existing calls) whose text states participants by `{name, id}`, relationships, lenses and boundary. Procedure stays in its Agent Skill.** | One new Node per Process. No Core change, no new type. | Process-ness is a reading of the text, not a typed fact. |
| 2 | As 1, plus a vocabulary Node `Process` (KAAL Definition) that Process Nodes cite for what the word means. | One extra Definition (the RATIFICATION pattern: vocabulary, not machinery). | Nothing new; it only names the idea once. |
| 3 | A new Node type `Process` with its own registration and a CASE dimension. | A Core change. | — |

**Recommendation: Option 1 for the first Process; birth the Option 2 Definition only when a second Process shows the word earns a Node.** A concept with one instance (Changing KAAL) is not yet a concept; and the Definition can be born later without touching anything already sealed, because later Nodes may cite it. Option 3 would expand Core to give a type a registration it does not need, which is against the posture that new semantic births extend CASE rather than Core. Not recommended.

An illustration of a Process statement (**not a Node, not sealed, wording not proposed**; the IDs are the real, current ones and shown abbreviated):

```
name: Change Lenses
type: Skill {2389ba68…}
---
Composes:   Intent 7317b19e…22cf · Review 7c3d4d8e…6d5f · Changing KAAL 7b247073…96c2
Boundary:   within one Change. Nothing here applies to a result outside a Change.
Absent:     if Intent or Review is not installed the lens below that needs it is
            unavailable; the Change proceeds as Changing KAAL says.

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

The statement says *who relates to whom and what is asked*. It does not say how to describe an Intent (that is `kaal-intent`), how to write a round (that is `kaal-review`), or who reviews (that is the Owner's assignment, `rowing.md`).

An optional helper Skill that writes and checks such statements (as `kaal-intent` does for an Intent: form check, and that each pinned `{name, id}` resolves to an installed Node) is possible and **not proposed now**; a hand-written statement is enough until stale pins prove otherwise.

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

## 7. Is `kaal-changing` an instance? What is its name?

- **Yes, the strictest instance** (investigation §5), with three jobs bundled: record keeping, a compass that fixes an order, and composition. The Process concept is the third only; the second is a *prescriptive property* that one Process chose.
- **In the model it is a participant as well.** A "Change" Process would cite `Changing KAAL` as the record-keeping capability, `Intent` and `Review` as composed capabilities, and state the lenses. `Changing KAAL` keeps its Node, its package, its order. The relationship is a new Node citing it; nothing renames.
- **Name.** No rename is proposed. `kaal-changing` names a capability by what it is for, like every sibling; the kind (a Process) is a fact for the type or the text, found by reading, not by a name that Core does not read. `kaal-process-change` would put a classification in a delivery name, which can drift from what the Node says, and the old name would remain in every sealed Node and seal anyway. If a Process Node is born for the change process, *its* name can say what it composes. The Skill and package names are a separate decision from the concept (Q8).

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
- No Core, Node Form, relationship model, package, script or Skill is created by this Change.
- No rename; no change to `kaal-changing`, `kaal-intent`, `kaal-review`, sealed Nodes, `.github`, `engineering`.
- No review governance: the Reviewer seat rule stands as 07/08 ruled it. A lens review confers no seat.
- No change to #72. Where lens discovery meets BRAIN's read surface is a question, not a plan.

## 10. Questions for the Owner

Numbered, recommendation first. None is answered by this Change; each is one word, with the reason in the line.

1. **What is a Process, in the smallest form?** *Recommend: a Skill-typed Node that states composition (Option 1); the `Process` Definition only when a second Process exists.* Alternatives: Option 2 now; Option 3 (a Core dimension), not recommended.
2. **Does a Process pin composed capabilities by exact `{name, id}`?** *Recommend: yes.* It is KAAL's reference rule and what makes the relation checkable. The cost is that superseding a composed Skill means re-birthing the Process; KAAL has no supersession rule, and this question should not invent one.
3. **Do lens statements live in the Process Node (sealed, short) or only in its Agent Skill (unsealed)?** *Recommend: relationship, position, timing and question in the Node; procedure in the Agent Skill.* Otherwise G1 stays.
4. **What standing does a lens review without an assigned seat have?** *Recommend: information only, never a round that counts and never in `review/`; the lens statement can name a case where the Owner assigns a seat for it.* This adds no governance; it states what 07/08 already implies for the Work seat.
5. **Where is a useful lens finding kept?** *Recommend: carried into `work/` evidence with the lens named; no new directory.* Alternative: a Process-defined directory beside `review/`, a Change-layout decision this Change cannot make.
6. **Timing of internal Intent review.** *Recommend: before establishment, when the Owner can still describe again; stated by the Process.* After establishment it informs a future Intent. Do you want this recorded for the Change process now, or only after a second Process exists?
7. **The existing wording** (`kaal-intent` step 6; `kaal-changing` steps 2 and 3) is the dependency the criterion wants out of Ways of Working. *Recommend: leave it, and plan a later Change that points it at the Process.* Is that how you read "without embedding dependencies"?
8. **Names.** *Recommend: no rename of `kaal-changing`; a future Process Node is named for what it composes.* Confirm.
9. **Lens discovery and #72.** Does the route in §8 ride on #72's `find`/`near` surface, or on reading the installed Process Nodes? *Recommend: decide after #72's direction is reviewed; do not couple the two Changes now.*
10. **Test the discoverability claim before building anything.** *Recommend: yes.* The two-prompt trial in evidence §6 shows whether an Agent given only "review this Intent" reaches the lens; the Codex finding does not. Who runs it is yours to assign; a Worker-side run is a probe, not evidence of independence.
11. **Is the briefing an Intent?** This Change's own `work/01-intent.md` keeps your briefing's wording (with markdown headings added) and has the same "Expected Work" section that Codex flagged in #72. Is that the right place for an Owner's briefing to land, or should an Intent be separated from the briefing before work begins (what `kaal-intent` exists for)?
