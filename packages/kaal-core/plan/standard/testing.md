# Standards: Core's Definitions — Testing

The planned outer tests live in `packages/kaal-core/test/plan/standard.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C35` turns them GREEN.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T87: each of the five Definitions is in `payload/core/`, byte-identical to the text in this PLAN's Architecture | core/F81, core/F82, core/F83, core/N22, core/A40 | Requirements |
| core/T88: each is a Node typed by Core's `KAAL Definition` by name and id, its name is unique in the payload, and none declares Edges, so no scope contains or relates to another | core/F83, core/N21, core/A40 | Architecture |
| core/T89: with the payload, `evaluate` admits a fixture Node typed by `Standard` whose `Applies to` Edge group targets `KAAL Capability` and `KAAL Package`, and it still admits every payload Node with no rejection | core/F84, core/I25, core/A42 | Intent |
| core/T90: `installation.kaal.json` lists each of the five as an asset deployed to `.kaal/core/`, with a catalogue entry for its bytes | core/A41 | Architecture |

## RED evidence

On `kaal/core`, all four tests are RED on the behaviour itself, because the payload carries none of the five Definitions:
- **T87** names each missing file.
- **T88** names each Definition the payload does not carry.
- **T89** cannot type its fixture by a `Standard` the payload does not carry, and fails on that, not on a crash.
- **T90** names each missing asset.

**Discriminating.** A DO that ships any Definition with other bytes fails T87. One that types a Definition by anything but `KAAL Definition`, or adds an Edge, fails T88. One that makes Core refuse a typed Node with Edges fails T89. One that ships a file without its asset fails T90.

A throwaway reference turned all four GREEN: the five files written from the Architecture's text, and their assets and catalogue entries. It was then removed.

The meaning of each Definition is validated by the Owner's review of the Architecture's text, which T87 then holds fixed.
