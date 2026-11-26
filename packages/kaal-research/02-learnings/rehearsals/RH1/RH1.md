---
id: research/RH1
kind: rehearsal
question: Does an agent given the kaal-research Skill, with the example, write a more well-formed and more honest record of a past trial than an agent given the example alone?
verdict: inconclusive
verdict-about: effect
verdict-rests-on: c2, c3
technique: judged-trial@1
---
This is the first rehearsal of kaal-research, run in its DO (research/C1). The Protocol was added later (research/C2), written from the evidence by the author of the trial, not at the time of the runs. It is written in the format it tests, by the runner (the author of the Skill, the key and the runs), so it is not independent of them.

## Design
arms: example-only, skill
untreated: example-only
n: example-only=3, skill=3
fresh-means: a new general-purpose sub-agent session per run, given only the task prompt, the notes of one past trial and the example record, and in the skill arm also the Skill folder under .claude/skills; told to work only inside its own folder; whether any read elsewhere was not checked; no memory was given, but the sub-agents were started by a session that holds project memory, whose effect was not checked
model: the sub-agent default, which inherits the session model; not recorded exactly
settings: sub-agent with file and shell tools; no other settings recorded
harness: sub-agent sessions started from one coordinating Claude Code session, which kept no tool traces
blind: yes
blind-how: form was judged by a script on each record; honesty was judged by one separate sub-agent session given the key, the notes and the six records under shuffled labels j1 to j6, with the arm map held by the runner; the records were not stripped of traces of the Skill, so the judge may have inferred the arm
key-frozen: 2026-11-22T10:29:38Z
treatment-fixed: 2026-11-22T10:30:36Z
## Evidence
- role: prompt
  path: evidence/prompt.txt
  sha256: d2806fcb2c2c5c2688f55d248c2f88214b10d7091f5dc602039f7b7517719c57
- role: answers
  path: evidence/records/r1.md
  sha256: 5c9034af34c5a2bc82d0c275f0934f1807667f34b18a1db52c65c24cd01149c1
- role: answers
  path: evidence/records/r2.md
  sha256: 38f1fd2187687f726991061841848980927422e6b79d8b098ff08cdb89655382
- role: answers
  path: evidence/records/r3.md
  sha256: 863e5c62fd8d85c74be57c925e5e36fe2b27a31c9da49788585ae52474131884
- role: answers
  path: evidence/records/r4.md
  sha256: e1ab0555229e32505377f66aa4bf4e081691afba322811bfb86596cb4af481c2
- role: answers
  path: evidence/records/r5.md
  sha256: 5e9311644bae846398820e19e6d644b97c6eeeb12527b74a877ce36c2a1b9c9f
- role: answers
  path: evidence/records/r6.md
  sha256: f0fd51bab82b58d7357e21a97500c808b04a8c395a6f65b0a120656ea18cc27c
- role: answers
  path: evidence/judge-report.md
  sha256: 03822466e8bf1022586f86c2fae448708048453b89ee1c72abe6f36360ed4ff1
- role: scores
  path: evidence/script-results.json
  sha256: 61d1251e5999e21d6ff65dbca6bf6ec4b124827e1291fcd0d9ee2e907f5396db
- role: scores
  path: evidence/judge-report.md
  sha256: 03822466e8bf1022586f86c2fae448708048453b89ee1c72abe6f36360ed4ff1
- role: key
  path: evidence/key.md
  sha256: d8cb9157bf68de3d8cbd34edaad68941982d46cb98505623f866f621bf1a7001
- role: subject
  path: evidence/subject/prompt.txt
  sha256: 7fc3beb871bfb3821016b3d96c4b2d9c4ac5fc63bd22de6f25acdd43014315cd
- role: subject
  path: evidence/subject/setup.md
  sha256: 45a7dca61cdc02d3f69299f051bea0b9c8186472f010687e7427466f0d9d3e96
- role: subject
  path: evidence/subject/answers.md
  sha256: 3da1f1716a6715ec82cfa690ec49577f769a99f5a02278b0c4fdbc8fdf93c39d
- role: subject
  path: evidence/subject/scores.md
  sha256: b57a0e25ab78fef076cb8164dd83473ac4c72bf781b9161649c455947f3c7ee2
- role: treatment
  path: evidence/treatment.sha256
  sha256: 7619de4206030411045dcccde44085e7dcf85017eeafb77ecb9ea2e1df794ba1
- role: excerpt
  path: evidence/exposure/agent-reports-skill-arm.md
  sha256: 68d9007100aeba81dec5c279eb5c9c3d0035428bf2452039e636df5c0b3f2470
- role: mapping
  path: evidence/arm-mapping.txt
  sha256: b7b2f0edc8e06df4609fb2b6be040eed3ef3e1d72181065cf11adcecde3e95d7
- role: mapping
  path: evidence/judge-label-mapping.txt
  sha256: ff036a5ba2f13c343e5e6d849d87d706c32f0e554ea2ae4fb02132b097694545
- role: mapping
  path: evidence/key-frozen.txt
  sha256: 08046788142a385683573095b422b8af1a4f48b04fce1a9ac5520da77f62486c
- role: mapping
  path: evidence/treatment-fixed.txt
  sha256: b0ad3bc79d8b53dd6486867415d93c611d36493300a52efeae8ddbdcf7d05f38
## Runs
- run: r1
  arm: example-only
  exposure: none
- run: r2
  arm: skill
  exposure: delivered
- run: r3
  arm: example-only
  exposure: none
- run: r4
  arm: example-only
  exposure: none
- run: r5
  arm: skill
  exposure: delivered
- run: r6
  arm: skill
  exposure: delivered
## Claims
- id: c1
  claim: all six agents produced a record of the past trial; the form script judged five of the six well-formed, and the one it did not, an example-only record, was a favourable verdict resting on a claim marked partly
  scope: description
  rests-on: r1, r2, r3, r4, r5, r6
  demonstrated: yes
- id: c2
  claim: the skill arm was form-clean three times of three against two of three for example-only, and the example-only records kept slightly more of the key's honesty points than the skill records (22 against 19 of 24 judged points, none missed in either arm)
  scope: comparison
  rests-on: r1, r2, r3, r4, r5, r6
  demonstrated: partly
  not-shown: the difference is within what three runs per arm can show and goes both ways; the skill arm's form result follows from its agents running the judgement script themselves, which is part of the Skill and not of its guidance; the honesty counts rest on one judge and on a reading of one key point (point 8) that the key does not settle
- id: c3
  claim: the Skill's guidance made agents write better records than the example alone
  scope: effect
  rests-on: r1, r2, r3, r4, r5, r6
  demonstrated: no
  not-shown: honesty was not better in the skill arm; the example, which both arms had, already carried most of the honesty (no record in either arm marked an effect claim as shown or a run as opened without an excerpt); exposure is delivered, not opened: the only record of what each skill-arm agent read is its own report (evidence/exposure/agent-reports-skill-arm.md) and no tool trace was kept, so no run is shown to have opened the Skill; the treatment bundles guidance, example and script; three runs per arm; one trial, one judge, one runner
## Protocol
materials: evidence/prompt.txt, evidence/subject/setup.md, evidence/subject/answers.md, evidence/subject/scores.md, evidence/subject/prompt.txt, evidence/key.md, evidence/treatment.sha256
run: per run make a work folder holding the notes of the past trial (evidence/subject/*) and the example record, and in the skill arm the Skill folder whose file hashes are in evidence/treatment.sha256 (the Skill as merged on the collector by research/C1, #2335); start a fresh sub-agent session with evidence/prompt.txt and the folder path; three runs per arm, arms example-only and skill, untreated arm example-only
score: form by the judgement script on each record; honesty by one separate session given evidence/key.md, the notes and the six records under shuffled labels with the arm map held back
confirms: in a rerun the skill arm is again form-clean at least as often as example-only and keeps no fewer of the key's honesty points
refutes: in a rerun example-only is as form-clean and keeps as many points, or the skill arm loses points
## Limits
n-shows: three runs per arm show whether a clear difference is visible, and none is: form leans to the skill arm and honesty leans to example-only, each by about one record, so the result is not a rate and not a reason to prefer either
