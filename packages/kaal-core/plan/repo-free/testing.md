# KAAL-Repo-Free Skill: Testing

The planned outer tests live in `packages/kaal-core/test/plan/repo-free.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN and adds them to Core's `npm test`.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T120: each repo rule finds its pattern with file and line, and product references and look-alike words are never findings | core/F112, core/F113, core/A57 | Requirements |
| core/T121: the check is pure: same files give the same findings, in file and line order, and quoting the repo in a code fence is still a finding | core/N30, core/A57 | Requirements |
| core/T122: `kaal skill check` lists repo findings as data, blocks with exit 1 only under `--lifecycle published`, and exits 2 on an unreadable directory | core/F114, core/A58 | Requirements |
| core/T123: the standard exports `repoRules` with the ids of F112 and its Definition states the repo-and-product distinction | core/F115, core/A59 | Requirements |

Whether a Skill reads well without the repository is a review's judgement. No Test Case judges it.

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/repo-free.test.mjs`, outside Core's `npm test` until the DO. At `core/C150` all four are RED, blocked before behavioural assertion: `kaal-core/skill` exports no `judgeRepoFree`.
