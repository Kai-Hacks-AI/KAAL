---
id: core/RH1
kind: rehearsal
question: Does a Skill's boundary-precise description let an agent find the Skill that runs checks without that Skill being named?
verdict: favourable
verdict-about: description
verdict-rests-on: c1
technique: judged-trial@1
---
Illustrative: modelled on the exchange-by-description trial of 20 Nov 2026 (core). The evidence files and their digests below are placeholders, so that the example can be checked for form.

## Design
arms: defect-only, both, both-neutral-names
untreated: defect-only
n: defect-only=3, both=3, both-neutral-names=3
fresh-means: headless session in a sandbox project with the Skills deployed; session memory was not excluded and leaked KAAL rules into some answers
model: sonnet-5-5
settings: headless defaults
harness: headless command-line sessions, one sandbox project
blind: no
## Evidence
- role: prompt
  path: evidence/prompt.txt
  sha256: 1111111111111111111111111111111111111111111111111111111111111111
- role: answers
  path: evidence/answers.md
  sha256: 2222222222222222222222222222222222222222222222222222222222222222
- role: scores
  path: evidence/results-table.md
  sha256: 3333333333333333333333333333333333333333333333333333333333333333
- role: excerpt
  path: evidence/both-neutral-names-1.excerpt.txt
  sha256: 4444444444444444444444444444444444444444444444444444444444444444
## Runs
- run: d1
  arm: defect-only
  exposure: none
- run: d2
  arm: defect-only
  exposure: none
- run: d3
  arm: defect-only
  exposure: none
- run: b1
  arm: both
  exposure: delivered
- run: b2
  arm: both
  exposure: delivered
- run: b3
  arm: both
  exposure: delivered
- run: n1
  arm: both-neutral-names
  exposure: opened
  excerpt: evidence/both-neutral-names-1.excerpt.txt
- run: n2
  arm: both-neutral-names
  exposure: delivered
- run: n3
  arm: both-neutral-names
  exposure: delivered
## Claims
- id: c1
  claim: with neutral Skill names, all three agents that had both Skills found the checking Skill by its description and derived the statuses
  scope: description
  rests-on: n1, n2, n3
  demonstrated: yes
- id: c2
  claim: having the checking Skill changed what agents did compared with Defect alone
  scope: comparison
  rests-on: d1, d2, d3, b1, b2, b3
  demonstrated: partly
  not-shown: three of the misses happened before the Skill was reached (the agent never opened the Defect Skill), and the run was unblinded
- id: c3
  claim: the wording of the description, not the names, is what made the match
  scope: effect
  rests-on: d1, d2, d3, n1, n2, n3
  demonstrated: no
  not-shown: no untreated arm for the description wording, a distractor Skill that was never opened, no confusable peer tried
## Limits
n-shows: three runs per arm show that a difference is visible or not, never a rate
## Protocol
materials: evidence/prompt.txt, evidence/answers.md
run: start a fresh headless session per run in a sandbox with the register and the Skills of that group, give it the prompt, and keep the answer; three sessions per group
score: read each answer against the results table; the person who scores is named, and says whether the arm was visible
confirms: the same placements appear again in the same groups
refutes: the placements differ between the groups, or the answers do not match the table
