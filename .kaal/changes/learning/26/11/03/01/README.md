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

## 3A. Owner direction on ACT, persistence and Learning

The Owner clarified on 3 Nov 2026 (superseding the earlier reading in this
section that Learning might hold what ACT produces):

- PDCA's ACT persists learning **in the context where it occurred**. The context
  owns the knowledge it persists.
- Learning **retrieves** that knowledge without creating a duplicate
  authoritative store.
- Analysis and decision-making are further learning activities. New learning is
  persisted in its appropriate owning context, and later PLANs can consume it.
- **Process owns PDCA semantics. Learning owns retrieval and learning practices.**
  The context owns its persisted knowledge.

What this PLAN takes from it:

- **Ownership.** BRAIN stays in Learning as the practice of keeping knowledge
  identifiable and connected in its owning context, and of retrieving it. It is
  not a store. Learning does not own the knowledge, only how it is retrieved and
  how learning is practised.
- **No holding.** The earlier reading in which Learning might "hold" collected
  learning is withdrawn. It would contradict the Owner's direction and the
  existing "no central store" statement in `Learning.md` and `kaal-learning`.
- **Collecting means retrieving.** A later PLAN finds ACT output through
  CICERO's overviews, which refer to where it lives (the realizing pull request,
  a record the repository declares, an adopted text) with classification and
  provenance. This is what `kaal-retro` and CICERO already do; nothing new is
  proposed.
- **No obligation.** No mandatory central ACT record, no duplicate storage, no
  new capability, no second learning model, no gate. A cycle that produces
  nothing worth keeping persists nothing.
- **Process plans.** #932 and the Process plans should state PDCA's ACT as
  persisting in the originating context, and leave retrieval to Learning. Whether
  to adjust them is Process's decision; this PLAN only states Learning's side.

Nothing changes in the Nodes or Skills, and nothing here authorizes
implementation.

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
2. If a clearer statement of retrieval would help, a small DO adds a `kaal-retro`
   or `kaal-learning` line on retrieving ACT output from its originating context,
   with a RED test first. If Process decides on persistence in #932, a small DO amends `WORK.md` or
   `kaal-retro` wording to match, with a RED test first.
3. A Learning Agent definition is a BASS gap. It is not proposed until a consumer
   needs it.
4. Promotion of `kaal/learning` is an Owner call under the scarcity principle.

## Verified by

Read-only inventory of branches, pull requests and the package tree. Markdown
only; `npm test -w kaal-learning` is unaffected.

## Validated by

CPO review of the ownership and ACT-persistence positions.
