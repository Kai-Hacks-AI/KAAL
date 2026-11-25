# Skill Standard: Testing

The planned outer tests live in `packages/kaal-core/test/plan/skill-standard.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN and adds them to Core's `npm test`. No test reads the wording of a Definition or of a warning message: each checks the stated criterion.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T103: the size levels change exactly at 200, 400 and 600 words, and the count is the same with CRLF | core/F93, core/A49 | Requirements |
| core/T104: a warning carries rule ids that exist, always the three remedies and never trimming, and only `hard` blocks | core/F94, core/A49, core/N26 | Requirements |
| core/T105: a Skill needs one top-level entry, and nothing but `SKILL.md`, `references/`, `scripts/` and `assets/` sits at the top | core/F95, core/A50 | Requirements |
| core/T106: `kaal skill check` exits 1 on `hard` or a layout finding and 0 on the other levels, and judges the same files alike wherever they come from | core/F96, core/A51, core/N25 | Architecture |
| core/T107: the payload carries a `Skill Standard` Definition typed by `KAAL Definition`, and the foundational Nodes are unchanged | core/F92, core/A48 | Requirements |

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/skill-standard.test.mjs`, outside Core's `npm test` until the DO. At `core/C52` all five are RED, blocked before behavioural assertion: Core has no `kaal-core/skill` entry point, no `kaal skill` verb and no `Skill Standard` Node.
