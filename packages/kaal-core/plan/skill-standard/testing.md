# Skill Standard: Testing

The planned outer tests live in `packages/kaal-core/test/plan/skill-standard.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN and adds them to Core's `npm test`. No test reads the wording of a Definition or of a warning message: each checks the stated criterion.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T103: the size levels change exactly at 200, 400 and 600 words of the body, the frontmatter is not counted, and the count is the same with CRLF | core/F93, core/F98, core/A49 | Requirements |
| core/T104: a warning carries rule ids that exist (always size, router, detail and lane), the three remedies and never trimming, a required response that grows by stage, and only `hard` blocks | core/F94, core/A49, core/N26 | Requirements |
| core/T105: a Skill needs `SKILL.md` and nothing else, and nothing but `SKILL.md`, `references/`, `scripts/` and `assets/` sits at the top | core/F95, core/N27, core/A50 | Requirements |
| core/T106: `kaal skill check` exits 1 on `hard` or a layout finding, 0 on the other levels and 2 when it cannot judge, prints the verdict as data with `--json`, and judges the same files alike wherever they come from | core/F96, core/A51, core/N25 | Architecture |
| core/T107: the payload carries a `Skill Standard` Definition typed by `KAAL Definition`, and the foundational Nodes are unchanged | core/F92, core/A48 | Requirements |
| core/T108: against a baseline keyed by name and owner, a hard Skill is known at its recorded words, grew above them, new without an entry and stale below them, with no baseline it blocks, an unreadable or ownerless baseline is unknown; a byte-identical copy (`--instance`) is held to the Skill's entry as a ceiling, never stale and never given an allowance of its own; a declared variant (`--variant`) has its own recorded words, grows above them even when below the Skill's, is stale below them and new without an entry | core/F97, core/A52, core/N26 | Requirements |
| core/T109: conformance follows the lifecycle: by default the package is held to the ratchet (`stale` included), a published lifecycle is reported (level, warning and layout) and never blocks, and a shrinking allowance changes only the development verdict | core/F99, core/A52, core/I31 | Requirements |

The clarity and concision of a frontmatter, and the review of the DO against agentskills.io, are judgements. No Test Case judges them.

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/skill-standard.test.mjs`, outside Core's `npm test` until the DO. At `core/C52` all seven are RED, blocked before behavioural assertion: Core has no `kaal-core/skill` entry point, no `kaal skill` verb and no `Skill Standard` Node.
