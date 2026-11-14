# Requirements (retro/C2)

R1 `capability/Retro.md` is a Node named Retro and typed by Core's KAAL Capability. It states Retro's responsibility, conducting a retrospective on any subject by a chosen method, and that Retro overlaps no other capability's responsibility. It makes no claim on what Learning does with what a retrospective yields.

R2 `payload/Retro.md` is a Node named Retro and typed by Core's KAAL Skill. It states what the Skill defines. The Skill file the agent installs does not refer to it.

R3 Both Nodes are admitted by Core and nothing else: on a fresh Engine, registering `capability/` as the capability `retro` and `payload/` as the skill `retro` succeeds, the catalogue lists the Capability Retro with the Node's id, and the Engine verifies.

R4 `ownership.kaal.json` names the owner by kind `capability`, name `Retro` and the exact id of `capability/Retro.md`, and claims `packages/kaal-retro/`. No claim of Learning remains.

R5 The collector `kaal/retro/skill` carries the Capability's name as its capability segment. Retro is the capability; `skill` is the concern.

R6 The installable Skill (`skills/kaal-retro/`) is unchanged and still passes retro/T1 to T10: it depends on neither Node, Core nor any other package.

Deliberately not required: wiring the package into workspaces, installing or publishing it, a ruleset or hook, and any change to what Learning owns.
