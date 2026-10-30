# A Control has its Intents: Architecture

Each element names, in brackets, the Requirements it answers.

- **controls/A5** [controls/F10–controls/F13, controls/F15]: Payload.
  - `controls/C7` adds `payload/Has.md`, a `KAAL Definition` named `Has`. It states controls/F10–controls/F13 and refers to Intent's `Intent` Definition by name, as an optional complement.
  - `payload/Realized-by.md` is removed.
  - `payload/Control.md` is revised: a Control has one or more Intents through `Has`, carries no other outgoing Edge, and shows realization only through the chain.
  - The paragraph of `payload/Controls.md` on documenting a control is revised to match, so the ids of `Control` and `Controls` change. `ownership.kaal.json` follows `Controls`' new id.
- **controls/A6** [controls/F14, controls/N4, controls/N5]: The check.
  - The package exports `kaal-controls/conformance`, a pure function over an Engine, in a `lib/` beside the payload, as Testing ships its own.
  - It uses only Core's admission and Graph's Edge form, which every consumer already has, and imports nothing from Intent.
  - It finds Intent's authoritative Definition as decision 2 below settles, and returns one outcome per Control from controls/N5, with reasons.
- **controls/A7** [controls/F15]: `skills/kaal-controls/SKILL.md` and `README.md` are revised to controls/F15.

## Two authorities, kept apart

Controls owns the relationship: its source (`Control`), its name, its cardinality, the kind of Node it points to, and the rule that a Control points at nothing else. Intent owns its Node: what an Intent is, how one is captured, and that capturing one authorizes nothing. Controls refers to Intent's Definition and never restates it. Each later link of the chain belongs to the capability that owns its source.

## Backward compatibility, observed

Checked on every branch on 2026-10-30:

- **Controls itself.** Controls is not on `main` and has never been published. No Node outside `kaal-controls` is typed by `Control`, so changing the ids of `Control` and `Controls` and removing `Realized by` break nothing released.
- **Engineering #585.** This is the one consumer. Its engineering/C3 PLAN gives each of its seven Control Nodes "one `Realized by` Edge per realizing Node". Its A1 elements say "`Realized by` Branching" for two Controls. Its structural test has a "Realized by" row that resolves those Edges to Guard or Branching. All three contradict controls/F13, and are listed below for alignment.
- **Controls' own Test Cases.** controls/T1, controls/T3 and the `Realized by` cases in the package and acceptance tests are revised by `controls/C7`, as the testing PLAN lists.

## Cross-capability items returned for Owner alignment

Controls does not settle these. They are listed so that nothing contradictory is kept silently.

1. **Engineering #585, direct Edges.** Under controls/F13, Engineering's Control Nodes carry only `Has`. Their realization is shown through the chain, with their own architecture.md naming the realizing code and checks, as it already does with `code:`, `guard-check:` and `workflow:`. The structural test's "Realized by" row would become "each Control conforms by Controls' check". This is Engineering's revision to make.
2. **The chain's later links have no typed traces yet.** No branch defines a typed trace for Requirements → Intent, Architecture → Requirements, Test Case → Requirement, or Code → deployed realization. Test Case → Defect is planned in #583. Until each exists, a check that walks the chain can report those links only as unresolved. Which capability owns the last link, Code → deployed realization, is not settled.
3. **Intent's authoritative type.** Intent's `Intent` Definition exists only on `kaal/intent`. That package is still typed `KAAL Skill`, not `KAAL Capability`. It is not in the promotion queue. With controls/N4, Controls does not wait for it. Its cases with Intent present stay blocked, not counted, until a consumer can install it.

## Owner decisions

### 1. Name, cardinality and target: decided on #619

`Has`, read as *Control Has Intent*; one or more Intents per Control; Intent as an optional complement. This PLAN records these decisions and opens no option on them.

### 2. How the check recognizes Intent's authoritative Definition

| Option | Consequences | Compatibility |
| --- | --- | --- |
| **A. By identity, held in the check** (recommended) | `Has`'s text names `Intent` by name only. The check holds Intent's Definition id as data, and treats Intent as present when the Engine admits a Node with that id. Verification is exact and cannot be spoofed by another Node named `Intent`. If Intent changes its Definition, a Controls Change updates the data, and `Has`'s id and every Control's Edges stay valid. | No dependency. A stale id makes Intent look absent, which is reported as unresolved, not as a pass. |
| B. By name | Intent is present when exactly one admitted `KAAL Definition` is named `Intent`. Two such Nodes are unresolved. Nothing to update when Intent changes. | Any capability could define a Node named `Intent` and be taken for the authority. |
| C. By identity, in `Has`'s text | Like A, but the id is written into the Definition. | Every change to Intent's Definition changes `Has`'s id, which breaks every Control's Edges. |

### 3. Retiring `Realized by`

| Option | Consequences | Compatibility |
| --- | --- | --- |
| **A. Remove it** (recommended) | No Definition remains that offers the shortcut. controls/F13 makes any other outgoing Edge from a Control nonconforming. | Free now (see above). Engineering #585 must drop its `Realized by` Edges. |
| B. Keep it, deprecated | Existing text keeps resolving, but the Definition still invites the shortcut that controls/F13 forbids. | It defers the cost to after promotion, when it is no longer free. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `controls/C6` PLAN, this Change | Controls | none |
| `controls/C7` DO: controls/A5–controls/A7 | Controls | `controls/C6` merged with the Owner's alignment |
| engineering/C3 DO | Engineering | `controls/C7` on `main`, and Engineering's revision for item 1 |

`controls/C7` lands on `kaal/controls` and travels with Controls' promotion. Neither it nor the promotion waits for Intent.

## Contracts reused

- **Core**: `KAAL Definition` and admission.
- **Graph**: the Edge form, resolution and derived incoming views.
- **Controls**: `Control` and the limits of assurance in `Controls`.
- **Intent**, optional: its `Intent` Definition, referred to and never restated.
