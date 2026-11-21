# C26 change

The Owner's rule: N lives in `.kaal/` only from a published tag or npmjs version, N+1 lives in `engineering/`, and delivery to an installed place is by WIRE. kaal-core has no tag, so `.kaal/` should hold no Core. The Owner said the copy should sit in `engineering/core` for now and gave the go to move it ("Ok, move core"). The Acceptance scenario "is what the root AGENTS.md points to" fails on the Core DO (#2139) because it compares `.kaal/AGENTS.md` byte for byte with the freshly packed Core, which is N against N+1. This Change removes the cause and does no more.

## What moves

The eleven files, with their content unchanged:

- `.kaal/AGENTS.md` and `.kaal/KAAL-KERNEL.md` to `engineering/core/`;
- `.kaal/core/` (Agent-Realization, CASE, Installation-Contract, KAAL-Agent, KAAL-Capability, KAAL-Definition, KAAL-Extension, KAAL-Skill, Node) to `engineering/core/core/`.

`engineering/core/` keeps the shape of an Engine directory, so the packaged `kaal verify --engine` still reads it.

## What does not move

`.kaal/config/guard/` and `.kaal/changes/` stay where they are. Who owns the guard configuration, and where Change Records live in the target, are open and belong to other capabilities.

## What the DO amends

- The root `AGENTS.md` names `engineering/core` and `engineering/core/AGENTS.md` as the Engine and its entry point.
- In `engineering/acceptance/embed.test.mjs`, the scenario "this repository's own Engine" reads the Engine from `engineering/core`, and the single assertion that compared its `AGENTS.md` with the packed Core is dropped. The routing assertions stay: the root names the Engine directory and its entry point, and repeats none of the Engine's notes. The scenarios that install the packed package into a fresh host stay as they are.

## Not weakened

Under the target, an untagged Core has no installed copy to compare, so the byte compare has nothing to protect. When a tag exists, the WIRE stamp says an installed copy is its source. A drift between `engineering/core` and the Core package until then is accepted: the copy is a source of the untagged state, to be replaced by delivery, not by a second check.

## Not in this Change

- Any other package that predates the N and N+1 rule, and `.kaal/config` and `.kaal/changes`.
- Migrating the Acceptance lane into a Control.
- The one-source-per-Skill control, the WIRE of Core, and the delivery-locations file, which still lists `.kaal/core` as a wirable location.

## PLAN

1. Add the Requirement F55, the gap G116 and the Cases T1239 and T1240 as `.red.mjs`.
2. Observe both RED on the collector and GREEN where the move is made (`evidence.md`).
3. The PLAN moves no file and edits nothing.

## Ids

Proposed from the collector tip `e3a096d4`: Change engineering/C26, Requirement engineering/F55, gap G116, Cases T1239 and T1240. They are the next free.

## DO

Not authorized by this PLAN. After the Owner's go, into the collector of this Change: move the eleven files, edit the root `AGENTS.md`, amend the scenario as above and rename T1239 and T1240 to `.test.mjs`.

## ACT

A 4L retrospective in `act.md`, with the body shape the Dispatcher reads.
