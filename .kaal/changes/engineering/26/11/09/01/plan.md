# PLAN: Owner mnemonics as typed Nodes and typed Edges

Status: proposed for the Owner. Markdown only. Ids provisional.

## 1. What the Owner asked
- No inventory. One KAAL Node states what the Owner's mnemonics are.
- Every mnemonic definition traces back to it through a well-defined Edge (the proposed word is `traces`).
- It is part of the semantic model: typed Node kinds and typed Edges, not a list.
- Known mnemonics to be covered: BASS, KNIFE, ROWING, LOVE, CASE and the other Definitions on main, 7P (management forces, not yet written down anywhere in the repo), TOMBSTONES (`engineering/TOMBSTONES.md`, #1298) and ARTIST (#1305).

## 2. The existing model this plugs into (checked on main 251e814)
- A Node is immutable content; its identity is its exact bytes (Graph.md).
- A relationship is an Edge embedded in the Node it goes out from. Edges are grouped by type; a type is itself a Node that defines what the relationship means; each target is a name plus a SHA-256 id (`packages/kaal-graph/skills/kaal-graph/references/edges.md`).
- A target needs no reference back. Incoming relationships and any index are derived and never replace the Nodes.
- Node kinds today: KAAL Definition (37 Nodes), Skill, Capability, Extension, Agent. Every mnemonic on main is a KAAL Definition.

## 3. The model proposed

### Node kinds
| Kind | What it is | Form |
|---|---|---|
| **Mnemonics** (the root, one Node) | States what an Owner mnemonic is, the rules every one obeys, and what the `traces` Edge means. | KAAL Definition |
| **Mnemonic** (many) | One Owner mnemonic: its name, expansion and meaning. Examples: BASS, TOMBSTONES, ARTIST, 7P. | KAAL Definition carrying a `traces` Edge to the root |
| **Capability** (existing) | Owns a Mnemonic Node's content when it holds it; may be guided by Mnemonics. | unchanged |

Kind of a Mnemonic: **derived from its Edge**, not a new Core Node type. Reason: a new type touches Core's registration (CASE) and pins every Mnemonic to the root's exact bytes a second time. Option B, if the Owner wants kind-checked Nodes: the Mnemonic's `type` points at the root. That needs Core to confirm a Definition can serve as a type. Recommended: A now, B only if wanted.

What the root says (draft of its content, about 10 lines): a mnemonic is a short, memorable letter sequence coined by the Owner that names a principle, ladder, loop or trace; it is a guide, never a capability name and never a pipeline (KNIFE: "the order of the letters is a mnemonic, not a pipeline"); each Mnemonic is defined once, by the capability that owns what it guides (CICERO: content keeps its authority in its context); the root holds no member list.

### Edge types
| Edge | From → to | Cardinality | Meaning | When |
|---|---|---|---|---|
| **`traces`** | Mnemonic → Mnemonics root | exactly one target, required | This Node is one of the Owner's mnemonics, stated under the root and bound by its rules. Provenance, not ownership and not dependency. | first Change |
| **`guided-by`** | Capability (or any Node) → Mnemonic | many, optional | This Node is guided by the mnemonic. | only when a consumer pulls it |
| **`improves`** | Mnemonic → earlier Mnemonic | one, optional | New wording stated beside the old and referring to it (BRAIN). Resolves conflicts such as WE or FAR without silent rewrites. | only if needed |

The Edge type Nodes (`traces`, later `guided-by`, `improves`) are KAAL Definitions that say what the relationship means, as Graph requires.

### Why the Edge runs Mnemonic → root
Edges are embedded in the outgoing Node and pin the target's exact id. If the root listed its members, every new Mnemonic would change the root's bytes and its id, and break every `traces` Edge. Members are therefore never listed: they are **derived** as the incoming `traces` Edges of the root. The same holds for `guided-by`: capability → Mnemonic pins the small stable Mnemonic, not the large changing capability.

### Retrieval (derived, nothing stored)
- All Owner mnemonics: incoming `traces` of the root.
- Mnemonics guiding a Capability: its outgoing `guided-by`.
- Capabilities a Mnemonic guides: incoming `guided-by`.
- Capabilities with no mnemonic, and Definitions that look like a mnemonic but carry no `traces`: a coverage-gap observation in the style of ARTIST R9 (reported, gates nothing).

## 4. Placement of the root and the Edge types
| Option | For | Against |
|---|---|---|
| **A. Core** (`packages/kaal-core/payload/core/`, beside CASE and LOVE) | KAAL-wide Definitions already live here; on main; every capability already depends on Core; Core owns the Definition kind. | Core stays minimal on purpose; mnemonics are a learning practice, not infrastructure. |
| B. Learning (`kaal-learning`, with BRAIN and CICERO) | Owns retrieval and learning practice. | Collector only, not on main; BRAIN/CICERO are unpromoted; slower. |
| C. Engineering (`engineering/`, beside TOMBSTONES, RATS!, GLUE) | Engineering owns several mnemonics today and records them as Definitions here. | Not a capability package; Engineering does not own the mnemonic concept. |

Recommendation: **A, Core**, for the root and the `traces` type, as one small Change. Learning keeps the practice (retrieval, BRAIN, CICERO) and the later `guided-by` and report. If the home changes, TOMBSTONES applies: the old place leaves one `moved:` line and Edges still resolve.

## 5. Cost to existing Mnemonics (to verify before step 4)
A Mnemonic that gains a `traces` Edge gets new bytes and so a new id. Any Edge or Case that already pins its old id goes stale (Graph reports, never repairs). Before migrating, list incoming Edges per mnemonic id on main. Expected to be few, since Edges are new; verify, do not assume. In-place addition vs improvement-by-new-Node (`improves`) is decided per Mnemonic by that list.

## 6. Order (backwards from the Intent, pull-driven)
0. **Pull:** Roadmap entry and Product PLAN item launch the increment (Owner direction). Targets `kaal/roadmap`, `kaal/product`.
1. **Root and `traces` type**, one Change, target the chosen home (recommended `kaal/core`): two small Definition Nodes, no code.
2. **Migration, one Change per owning collector:** add `traces` to each existing Mnemonic Definition (on main today: BASS, KNIFE, ROWING, HOW ARE WE DOING?, TOGETHER WE CAN GO FAR, LOVE, CASE, RATS!, PROSE, GLUE, FANATIC, BACCHUS; on collectors: BRAIN, CICERO, WORK, VARISC, HAPTIC, IDEA, I WON, CCCC, URBAN, ORDER, PREACH, NEW, PDCA, PLAN, CHAOS). New ones (TOMBSTONES #1298, ARTIST #1305, 7P) are born with it.
3. **Missing Nodes** for prose-only mnemonics (HITMAN, CLAUSE, FAR, REAL, TAKE CORE, ESSA candidate), each born with `traces`.
4. **Conflicts** by their owners, using `improves` where wording changes (WE, FAR, CAN, PLAN).
5. **`guided-by`** and the coverage report, only when a consumer pulls them.

## 7. Open questions for the Owner
1. Placement: Core (recommended), Learning or Engineering?
2. Edge name `traces`: keep? It sits near ARTIST's traceability vocabulary (answered by, traced to, tests). Its Definition Node scopes it as provenance, distinct from those. Alternative: `stated-under`.
3. Kind: derived from the Edge (A) or `type` pointing at the root (B)?
4. Is 7P one Mnemonic Node whose seven forces are prose, or does each force that maps to a capability get its own `guided-by` Edge later?
5. Should the root also name the Owner as the coining authority, or only the rules?
