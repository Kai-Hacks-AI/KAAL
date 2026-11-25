# Skill Standard: Testing

The planned outer tests live in `packages/kaal-core/test/plan/skill-standard.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN and adds them to Core's `npm test`. No test reads the wording of a Definition or of a warning message: each checks the stated criterion.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T103: the size levels change exactly at 200, 400 and 600 words of the body, the frontmatter is not counted, and the count is the same with CRLF | core/F93, core/F98, core/A49 | Requirements |
| core/T104: a warning carries rule ids that exist (always size, router, detail and lane), the three remedies and never trimming, a required response that grows by stage, and only `hard` blocks | core/F94, core/A49, core/N26 | Requirements |
| core/T105: a Skill needs `SKILL.md` and nothing else, and nothing but `SKILL.md`, `references/`, `scripts/` and `assets/` sits at the top | core/F95, core/N27, core/A50 | Requirements |
| core/T106: `kaal skill check` exits 1 on `hard` or a layout finding, 0 on the other levels and 2 when it cannot judge, prints the verdict as data with `--json`, and judges the same files alike wherever they come from | core/F96, core/A51, core/N25 | Architecture |
| core/T107: the payload carries a `Skill Standard` Definition typed by `KAAL Definition`, and the foundational Nodes are unchanged | core/F92, core/A48 | Requirements |
| core/T108: against a baseline keyed by canonical name and owner, a hard Skill is known at its recorded words, grew above them, new without an entry and stale below them, with no baseline it blocks, and an unreadable or ownerless baseline is unknown | core/F97, core/A52, core/N26 | Requirements |
| core/T109: a deployed or Engineering copy is aligned when identical to its source and a `differs` finding naming the paths otherwise, a finding that exits 0 and exits 1 only with `--enforce alignment`; a variant is declared only when the owner's declaration lists it, `unauthorized` when another owner declared it and `undeclared` when its id is missing; an instance never declares itself; a missing option is unknown | core/F99, core/F100, core/F103, core/A53 | Requirements |
| core/T110: content under `.kaal/` is installed content: it is compared with the npmjs artifact of the given version and that artifact with its Git tag, each as aligned or differs with the paths and the version, a finding exiting 0 (1 with `--enforce alignment`); it cannot be judged without the artifact or its version or under another role | core/F101, core/A54 | Requirements |
| core/T111: Engineering's copy is compared with the current owning package and both sources and versions are named, never with a published version unless that is the source given | core/F102, core/A53 | Requirements |
| core/T112: conformance follows the lifecycle: the package and an Engineering copy are held to the ratchet (the package `stale` included), installed content and a deployment from `.kaal/` are reported as published and never block, and a shrinking allowance changes only the development verdict | core/F104, core/A54, core/I35 | Requirements |

The clarity and concision of a frontmatter, and the review of the DO against agentskills.io, are judgements. No Test Case judges them.

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/skill-standard.test.mjs`, outside Core's `npm test` until the DO. At `core/C52` all ten are RED, blocked before behavioural assertion: Core has no `kaal-core/skill` entry point, no `kaal skill` verb and no `Skill Standard` Node.
