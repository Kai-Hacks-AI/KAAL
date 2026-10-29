# A Control has its Intent: Architecture

Each element names, in brackets, the Requirements it answers.

- **controls/A5** [controls/F10–controls/F12, controls/N4]: `controls/C7` adds `payload/Has.md`, a `KAAL Definition` beside `Realized-by.md` and written in its pattern. It states controls/F10–controls/F12 as the Owner decides them below.
- **controls/A6** [controls/F13]: `skills/kaal-controls/SKILL.md` and `README.md` gain the lines controls/F13 names. If decision 2 is B, `payload/Control.md` is revised as well.

## Two authorities, kept apart

Controls owns the relationship: its source (`Control`), its name, how many a Control carries, what kind of Node it points to, and what it says about the Control. Intent owns its Node: what an Intent is, how one is captured, and that capturing one authorizes nothing. Naming the target's kind is part of the relationship. Saying what that kind means is not, so `Has` refers to Intent's `Intent` Definition and never restates it. None of the options below moves any of Intent's semantics to Controls.

## Backward compatibility, observed

Checked on every branch of the repository on 2026-10-29:

- Controls is not on `main` and has never been published. `kaal-controls` exists only on `kaal/controls`.
- No Node outside `packages/skills/kaal-controls` is typed by `Control` or carries a `Realized by` Edge. The only consumer is engineering/C3, still a PLAN (#585).
- Intent's `Intent` Definition exists only on `kaal/intent`. It is not on `main`, not published, and not in the promotion queue.

So changing `Control`'s id now breaks nothing outside Controls. Its only cost is `controls/N1` and `controls/T3`, which pin the id and are Controls' own. After Controls' promotion, the same change would break every documented Control.

## Owner decisions

### 1. Name

| Option | Consequences | Compatibility |
| --- | --- | --- |
| **A. `Has`** (recommended) | It is the Owner's word, as in `Control —Has→ Intent`. Edge types resolve by name and id, so it collides with no other capability's Definition. A reader sees only "Has" in a listing of Definitions, and another capability could define its own `Has` with a different meaning, told apart only by id. | New Node, none affected. |
| B. `Has intent` | The name says its target, so a listing is unambiguous and no other `Has` can be confused with it. It departs from the Owner's wording. | New Node, none affected. |

### 2. Cardinality

| Option | Consequences | Compatibility |
| --- | --- | --- |
| A. At most one, in `Has` only | A Control can be documented without an Intent. That contradicts the Owner's definition of a Control as a concern *with* an Intent. Completeness is checked only where a consumer, such as engineering/C3, checks its own instances. | `Control` and every id unchanged. |
| **B. Exactly one, in `Control` and `Has`** (recommended) | `Control` is revised to the Owner's model: a bounded, enduring concern that has exactly one Intent, through exactly one `Has` Edge. A Control with none, or with two, does not conform. A concern with two Intents is two Controls. Graph's Edge form takes any number of targets in one group and Controls executes no checks (controls/N4), so conformance is checked by each consumer's own tests, as engineering/C3 already plans for its instances. | `Control`'s id changes. Nothing outside Controls uses it, as observed above. `controls/N1` and `controls/T3` are amended to the new id. This is the last point where the change is free. |

### 3. Target

| Option | Consequences | Compatibility |
| --- | --- | --- |
| A. Any Node that states the Intent | Controls depends on nothing, and a consumer can write instances before Intent is on `main`. A target cannot be found or verified by its type. Any Node can claim to be an Intent, so discoverability and verification rest on reading. | None. |
| **B. A Node typed by Intent's `Intent` Definition** (recommended) | Every Control's Intent can be found and verified by type, through Graph's derived views and by checking a type. `Has` refers to `Intent` by name and id, which is the relationship's authority, not Intent's. Intent's meaning stays Intent's. Controls' payload gains no package dependency, but `controls/C7`'s Test Cases need Intent's Definition to resolve a real target. | `Has` names `Intent`'s current id on `kaal/intent`. If Intent changes its Definition before promotion, `Has` must follow. engineering/C3's DO waits for Intent on `main` as well as for Controls. |

Taken together, B and B make a Control fully traceable by type, at the price of one sequence dependency: Intent's Definition reaches `main` before Controls' DO is promoted, or `Has` is promoted with the dependency stated and verified when Intent arrives. That sequencing is the Owner's, through the promotion queue. Controls does not decide it.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `controls/C6` PLAN, this Change | Controls | none |
| `controls/C7` DO: controls/A5, controls/A6 | Controls | `controls/C6` merged with the Owner's decisions. With decision 3 B, also Intent's Definition on `main` |
| engineering/C3 DO | Engineering | `controls/C7` on `main` (#585) |

`controls/C7` is not written until the Owner has decided. Once written, it lands on `kaal/controls` and travels with Controls' promotion.

## Contracts reused

- **Core**: `KAAL Definition` and admission.
- **Graph**: the Edge form, resolution and derived incoming views.
- **Controls**: `Control`, `Realized by`, and the limits of assurance in `Controls`.
- **Intent**, with decision 3 B only: the `Intent` Definition, referred to as the target kind and never restated.

Change, Requirements and Architecture are not dependencies. Nothing new is added to any capability.
