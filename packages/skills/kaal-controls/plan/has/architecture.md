# A Control has its Intents: Architecture

Each element names, in brackets, the Requirements it answers.

- **controls/A5** [controls/F10–controls/F13, controls/F15]: Payload.
  - `controls/C7` adds `payload/Has.md`, a `KAAL Definition` named `Has`. It states controls/F10–controls/F13 and refers to Intent's `Intent` Definition by name, as an optional complement.
  - `payload/Realized-by.md` is removed.
  - `payload/Control.md` is revised: a Control has one or more Intents through `Has`, carries no other outgoing Edge, and shows realization only through the chain.
  - The paragraph of `payload/Controls.md` on documenting a control is revised to match, so the ids of `Control` and `Controls` change. `ownership.kaal.json` follows `Controls`' new id.
- **controls/A6** [controls/F14, controls/F16, controls/F17, controls/N4–controls/N6]: The suite, in a `lib/` beside the payload, as Testing ships its own.
  - **`kaal-controls/conformance`** exports `assess(contexts)`, a pure function over controls/F17's plain-data contexts. It imports nothing from Core, Graph, Testing or Intent.
    - It holds, as data, the ids of `Control` and `Has`, and Intent's `Intent` Definition id (decision 2A). It treats Intent as present in a context only when that id resolves there.
    - It returns one outcome per Control with its reason and owner, one result per owner with its exit status, and states whether the Nodes were admitted or supplied.
  - **`kaal-controls/conformance/core`** is the adapter. It is used only where Core is installed, and Core is an optional peer, never a dependency.
    - Given the Engine and the owner contexts the caller names, it builds those contexts from Core's admitted Nodes and calls `assess`.
    - It decides no admission itself.
    - A Control that Core admitted but that falls in no named context is passed on as unattributed.
- **controls/A7** [controls/F15]: `skills/kaal-controls/SKILL.md` and `README.md` are revised to controls/F15.

## Distributed ownership

Controls owns the generic model, meaning `Control`, `Has`, the cardinality and the conformance rules, and the suite that checks them. The Controls themselves belong to whoever defines them: each KAAL capability for its own concerns, and each consumer repository for its own. Engineering's seven Controls (#585) are Engineering's. Each owner runs the suite over its own context and keeps its own results. Controls keeps no registry of Controls, and its report attributes every outcome to its owner and merges none.

## Two authorities, kept apart

Controls owns the relationship: its source (`Control`), its name, its cardinality, the kind of Node it points to, and the rule that a Control points at nothing else. Intent owns its Node: what an Intent is, how one is captured, and that capturing one authorizes nothing. Controls refers to Intent's Definition and never restates it. Each later link of the chain belongs to the capability that owns its source.

## Backward compatibility, observed

Checked on every branch on 2026-10-30:

- **Controls itself.** Controls is not on `main` and has never been published. No Node outside `kaal-controls` is typed by `Control`, so changing the ids of `Control` and `Controls` and removing `Realized by` break nothing released.
- **Engineering #585.** This is the one consumer. Its engineering/C3 PLAN gives each of its seven Control Nodes "one `Realized by` Edge per realizing Node". Its A1 elements say "`Realized by` Branching" for two Controls. Its structural test has a "Realized by" row that resolves those Edges to Guard or Branching. All three contradict controls/F13, and are listed below for alignment.
- **Controls' own Test Cases.** controls/T1, controls/T3 and the `Realized by` cases in the package and acceptance tests are revised by `controls/C7`, as the testing PLAN lists.

## Cross-capability items returned for Owner alignment

Controls does not settle these. They are listed so that nothing contradictory is kept silently.

1. **Engineering #585, direct Edges.** Engineering's Controls stay Engineering's, and Engineering runs Controls' suite over its own context. Under controls/F13, Engineering's Control Nodes carry only `Has`. Their realization is shown through the chain, with their own architecture.md naming the realizing code and checks, as it already does with `code:`, `guard-check:` and `workflow:`. The structural test's "Realized by" row would become "each Control conforms by Controls' check". This is Engineering's revision to make.
2. **The chain's later links have no typed traces yet.** No branch defines a typed trace for Requirements → Intent, Architecture → Requirements, Test Case → Requirement, or Code → deployed realization. Test Case → Defect is planned in #583. Until each exists, a check that walks the chain can report those links only as unresolved. Which capability owns the last link, Code → deployed realization, is not settled.
3. **Intent's authoritative type.** Intent's `Intent` Definition exists only on `kaal/intent`. That package is still typed `KAAL Skill`, not `KAAL Capability`. It is not in the promotion queue. With controls/N4, Controls does not wait for it. Its cases with Intent present stay blocked, not counted, until a consumer can install it.

## Owner decisions, settled on #619

- **Name, cardinality and target.** `Has`, read as *Control Has Intent*, with one or more Intents. Intent is an optional complement.
- **2A.** Intent's authoritative Definition id is held as data by the suite, with no runtime dependency on Intent. If Intent changes its Definition, a Controls Change updates the data, and `Has`'s id and every Control's Edges stay valid. A stale id makes Intent look absent, which is reported as unresolved, never as a pass.
- **3A.** `Realized by` is retired. The trace to realization proceeds through the independently owned chain.
- **Ownership is distributed, and Controls stands alone.** Core is preferred, but the suite runs without Core (controls/N6, controls/F16, controls/F17).

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `controls/C6` PLAN, this Change | Controls | none |
| `controls/C7` DO: controls/A5–controls/A7 | Controls | `controls/C6` merged with the Owner's alignment |
| engineering/C3 DO | Engineering | `controls/C7` on `main`, and Engineering's revision for item 1 |

`controls/C7` lands on `kaal/controls` and travels with Controls' promotion. Neither it nor the promotion waits for Intent.

## Contracts reused

- **Core**: `KAAL Definition`, for the payload's Nodes.
- **Graph**: the Edge form, whose shape controls/F17's input follows, and derived incoming views. The suite does not import Graph.
- **Controls**: `Control` and the limits of assurance in `Controls`.
- **Core**, optional: discovery, admission and composition through the adapter. The suite does not depend on it.
- **Testing**, optional: its result semantics (verified failure and unknown findings; failed, unknown and verified runs), followed and never redefined.
- **Intent**, optional: its `Intent` Definition, referred to and never restated.
