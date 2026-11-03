# Learning: BRAIN stays here, ACT persistence answered, honest BASS (PLAN)

Capability: Learning. Target: kaal/learning at `355588b`. Record number is
provisional until integration. Markdown only: no Node, Definition, Skill,
claim, package, workflow or policy changes, and no SYNC.

## 1. Owner decision recorded

BRAIN (#287) stays in `kaal-learning` for now. The Owner said on 3 Nov 2026:
"It stays for now on learning, we might want to give it its own capability
later." No `kaal-brain` branch, package or capability is created. There was none
before this decision: an inventory of all remote branches and open pull requests
found BRAIN only in `packages/skills/kaal-learning/payload/BRAIN.md`.

**Open note, not decided:** BRAIN may later become a capability of its own. This
PLAN neither proposes nor prepares that split. If it is ever raised, it needs its
own PLAN and an Owner decision, and must first show what a separate owner would
hold that Learning's BRAIN, CICERO and WORK do not already hold.

## 2. Within Learning: three Definitions, one concern

| Definition | Answers | Not |
|---|---|---|
| BRAIN | How knowledge is kept: in the context that owns it, improved beside what it improves, duplication and contradiction surfaced to owners. | A store, index or registry. Core's registry is untouched. |
| CICERO | How content is found again: an overview refers, never relocates. | Authoritative. Where overview and context disagree, the context holds. |
| WORK | How completed work feeds ACT: an optional retrospective yielding observations and candidate lessons. | Mandatory, a gate, or a Change. |

BRAIN and Learning are one concern in the existing text, so splitting them now
would create a second model of the same thing. Domain meaning stays with the
owning capability: identity and traversal are Graph's, evidence is Testing's,
review is Review's, the course of a Change is Change's.

## 3. Answer to Process on ACT persistence

Process #932 asks whether Learning should own persistence and retrieval of what
ACT produces. Learning's position, offered as a recommendation and not an
instruction to Process:

- ACT is learning that feeds the next PLAN. Learning accepts that framing and adds
  no second learning model.
- What Learning already offers is enough as a starting point: `kaal-retro` for an
  optional retrospective, an adopted lesson only once the owning capability
  accepts it through a Change, and a later PLAN citing the learning it actually
  uses, with its classification and provenance. This is guidance for whoever
  writes the PLAN, not a rule: it does not require citing every retro entry, it
  creates no mandatory ACT record or retrospective, and it is not a mandatory
  Process or Change rule. Any such rule would be Process's
  or Change's to decide, not Learning's.
- Learning prescribes **no mandatory ACT note** and no taxonomy of outcomes, and
  keeps no central store. Retention stays in the context that owns the knowledge.
- Retrieval is only as durable as its source. A retro in a pull request is
  retrievable while the Git host is available. A consumer that needs more declares
  its own record.
- Anything beyond this (a shared retrieval mechanism, an index) would be a new
  Change with its own justification, and is not proposed here.

## 3A. Owner direction on ACT and BRAIN, and how Learning would collect

The Owner said on 3 Nov 2026: "ACT might feed BRAIN, so learning owns it. PDCA
is a structured approach to make sure to persist it. Learning likely needs to
collect it." This PLAN reads it as follows.

- **Ownership.** Learning owns persisted learning, which is BRAIN. ACT is the
  PDCA step in which learning arises, and its output may feed BRAIN. This refines
  section 3: ACT is not Learning's, but what ACT produces and that persists is.
- **PDCA.** Process owns PDCA as the structured way to make sure learning is
  persisted. Process says when a cycle reaches ACT. Learning says how persisted
  learning is kept and found. Neither takes over the other's semantics.
- **Collect.** Learning needs a way to gather what ACT produced, so a later PLAN
  can use it. "Collect" is open, because BRAIN and Learning say Learning keeps no
  central store. Two readings:
  1. *By reference (recommended start).* Learning collects by discovering and
     referring: a CICERO overview names where ACT output lives (the realizing
     pull request, a record the repository declares, an adopted text) with
     classification and provenance. The content stays in its owning context.
     This needs no new store, and it matches what `kaal-retro` already does.
  2. *By holding.* Learning keeps the collected learning itself. This would change
     the "no central store" statement in `Learning.md` and `kaal-learning`, and
     it needs its own Change and Owner decision. It is not proposed here.
- **No obligation.** Collecting adds no mandatory ACT note, no mandatory
  retrospective, no second learning model and no gate. A cycle that produces
  nothing worth keeping persists nothing.

**For the Owner to confirm:** reading 1 as the first step, with reading 2 left
open. Until then, nothing changes in the Nodes or Skills.

## 4. BASS, stated honestly

| Layer | Delivered on `kaal/learning` | Missing |
|---|---|---|
| Bare | General reasoning works without KAAL. | n/a |
| Agent | Nodes (Learning, BRAIN, CICERO, WORK) are admitted and discoverable. | No Learning Agent definition. |
| Skill | `kaal-learning` and `kaal-retro`. | No Skill yet checks, for a later PLAN, that it cited what it used. |
| Script | None, by design. | Retrieval, duplicate or contradiction detection, indexing. None is proposed. |

BRAIN today is guidance, not a mechanism. Installing the package does not imply
more than the table shows. Nothing in `kaal/learning` is on `main` or npm, and
nothing here argues for promotion.

## 5. Next items, none started

1. Check Learning against the Package Independence guide: its dev dependencies are
   at 0.0.1 and it has no runtime dependency, so no release-critical dependency
   exists. A DO would only be needed if that changes.
2. If the Owner confirms reading 1 of section 3A, a small DO adds a `kaal-retro`
   or `kaal-learning` line on collecting ACT output by reference, with a RED test
   first. If Process decides on persistence in #932, a small DO amends `WORK.md` or
   `kaal-retro` wording to match, with a RED test first.
3. A Learning Agent definition is a BASS gap. It is not proposed until a consumer
   needs it.
4. Promotion of `kaal/learning` is an Owner call under the scarcity principle.

## Verified by

Read-only inventory of branches, pull requests and the package tree. Markdown
only; `npm test -w kaal-learning` is unaffected.

## Validated by

CPO review of the ownership and ACT-persistence positions.
