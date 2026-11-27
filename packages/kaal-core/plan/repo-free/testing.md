# KAAL-Repo-Free Skill: Testing

The planned outer tests live in `packages/kaal-core/test/plan/repo-free.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN and adds them to Core's `npm test`.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T120: each repo rule finds its pattern with file and line, and product references and look-alike words are never findings | core/F112, core/F113, core/A57 | Requirements |
| core/T121: the check is pure: same files give the same findings, in file and line order, and quoting the repo in a code fence is still a finding | core/N30, core/A57 | Requirements |
| core/T122: `kaal skill check` lists repo findings as data, blocks with exit 1 only under `--lifecycle published`, and exits 2 on an unreadable directory | core/F114, core/A58 | Requirements |
| core/T127: a Skill that claims to be a Git or GitHub adapter (in its text, frontmatter or metadata) gets no allowance, and allowance comes only from the caller | core/F119, core/A62 | Requirements |
| core/T123: the standard exports `repoRules` with the ids of F112 and its Definition states the repo-and-product distinction | core/F115, core/A59 | Requirements |
| core/T124: Git and GitHub vocabulary is the `hosting` rule: a finding by default, never one when the caller allows `hosting`, and never a repo finding | core/F116, core/A57 | Requirements |

Whether a consumer can use a Skill without the development repository is Review's judgement, and Testing's hard verification is a different thing from this check. A clean verdict is not that proof. No Test Case judges it.

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/repo-free.test.mjs`, outside Core's `npm test` until the DO. At `core/C150` all six are RED, blocked before behavioural assertion: `kaal-core/skill` exports no `judgeRepoFree`.
