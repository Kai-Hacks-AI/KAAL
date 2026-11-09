# Mnemonic management: Intent (draft, Intent only)

Owner: Engineering (core intent against main). Capability homes are decided later. Status: draft promotion envelope, reverse-planning trial. This Change record holds the Intent and its evidence only. No design, no implementation.

## Intent
KAAL's mnemonics (BASS, KNIFE, ROWING, LOVE, CASE, PLAN, HITMAN and the rest) should be findable and retrievable KAAL-wide, from the capability that is guided by them and from outside it. An Agent or person working in a capability can learn which mnemonics guide it, what each expands to and who owns it, without searching prose.

## Outcome to notice
- Every mnemonic has one authoritative definition, in the context that owns it, with a stable identity.
- A capability can state which mnemonics guide it, in a form a program can read.
- Duplicates and conflicting expansions are visible and decided by their owner.
- Mnemonics stay guides, never capability names.

## Evidence
`mnemonic-inventory.md` (beside this file): about 34 mnemonics, mostly KAAL Definition Nodes, some prose only, none linked from capability YAML; conflicts (`WE`, `FAR`, `CAN`, `PLAN`); owner gaps (HITMAN, CLAUSE, Review-hosted loops).

## Open, not decided here
Whether a mnemonic is a parent Node or a Definition Node, and the direction of the edge between a capability and its mnemonics. 7P (management forces) is a separate topic and only one entry in the inventory.
