---
id: engineering/RT1
format: 4L
reflects: [engineering/C26, engineering/C27]
---
Account of: I am the Engineering worker. I planned, built and raised the PLAN, DO and PROMOTION-side pull requests of C26 (Core moves from `.kaal/` to `engineering/core`) and C27 (the operations layout: `14-operations`, `15-defects`, `02-learnings/retros`), and I wrote the first, free-form version of this ACT that the CPO sent back. This is my account only: Kai's and the CPO's corrections shaped both Changes, and I have not asked either what they lacked.

## Liked
- subject: the layout as data, one template read by the check and by the Cases
  keeps: a rename of two concerns and a new steering folder came down to one template and a `closed` flag in the check; without it each rule would have been spelled in many places.
- subject: the order principle, each concern answering the one before
  keeps: the reviews had something to judge, and they improved the Change (the Owner kept `runs` optional and left record mechanisms out).

## Learned
- subject: Git's `-text` attribute switches off end-of-line conversion for a path, so a folder of byte-exact files must be named in `.gitattributes`
  source: the gitattributes manual (git-scm.com, man7.org, kernel.org copies), found by web search; I read the search summary, not the whole page, so it is secondhand.
- subject: when a pull request's head branch is merged and deleted, GitHub retargets the open pull requests that had it as their base to the merged pull request's base
  source: GitHub changelog "Pull Request Retargeting" (2020-05-19) and GitHub's pull-request documentation, found by web search and read as summaries, so secondhand.

## Lacked
- subject: a shared fixture for the layout Cases
  decision-point: renaming `14-defects` to `15-defects` and two concerns.
  cost: ten Cases and three requirements had to be amended for a change that moves no behaviour, and my sed pass wrongly rewrote two new Cases that assert the old name is gone.
  findable: no
  address: script
- subject: a way to claim a free Case or Change id
  decision-point: taking ids for the C27 PLAN while the C26 PLAN was open.
  cost: both PLANs claimed the same ids; mine was renumbered and force-pushed on my own branch, and the CPO had to be told.
  findable: no
  address: script
- subject: nothing said that a deleted collector retargets its open pull requests to `main`
  decision-point: the layout PLAN was open when its collector was promoted and its base branch deleted.
  cost: Promotion Source and Branching failed correctly, I toggled the PR to draft (which cleared auto-merge), and the Owner had to approve a fresh collector.
  findable: no
  address: AGENTS.md
- subject: nothing said which Branching failure is stale after an auto-merge toggle
  decision-point: reading a red Branching check on a new pull request.
  cost: I investigated and toggled auto-merge on four pull requests before recognising the first-run failure each time.
  findable: no
  address: Skill
- subject: nothing said that a Case on a folder needs a file of its own
  decision-point: amending T1232 after removing `14-operations/controls/`.
  cost: the Case failed because an empty folder is absent and not judged; I wrote a second assertion.
  findable: no
  address: Skill
- subject: nothing said that moving Node files needs `-text` in `.gitattributes`
  decision-point: moving the eleven Core files in C26.
  cost: Acceptance failed on Windows (Kernel not present, Nodes not in Form) and I pushed one more commit to fix it.
  findable: no
  address: Skill
- subject: the Retro contract was not on main when I wrote the ACT
  decision-point: writing the C27 ACT as a free-form retrospective.
  cost: the CPO sent the ACT back and I wrote it again as this retro.
  findable: no
  address: Skill

## Longed For
- subject: a ratchet over `packages/`, `engineering/` and `.kaal/` against this layout, with its baseline written once
  worked-anyway: the check ran on the layout as it stands and nothing was blocked.

Decisions: none made, the owner decides.
