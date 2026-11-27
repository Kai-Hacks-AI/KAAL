---
id: research/RH2
kind: rehearsal
question: Does an agent given the updated kaal-research Skill write a Protocol that another agent, given only the record, can follow to rerun the trial?
verdict: inconclusive
verdict-about: description
verdict-rests-on: c2, c3
technique: judged-trial@1
---
This is the rehearsal of the Skill as changed by research/C2, run in its DO. There is no untreated arm and no comparison: it asks whether the thing can be done at all, in two writers and two readers. It was run and scored by the runner (the author of the Skill, the key and the runs), unblinded, so it is not independent of them.

## Design
arms: writer, reader
untreated: none
n: writer=2, reader=2
fresh-means: a new general-purpose sub-agent session per run, told to work only in its own folder; a writer got the notes of one past trial, the example record and the Skill folder under .claude/skills; a reader got only a writer's record and its evidence; whether any read elsewhere was not checked (w2 made an empty folder in /tmp); no memory was given by us, but each session had 3 queued messages from outside its task delivered into it (see not-shown of c1), so none of them was isolated
model: the sub-agent default, which inherits the session model; not recorded exactly
settings: sub-agent with file and shell tools; no other settings recorded
harness: sub-agent sessions started by one coordinating Claude Code session; only the tool calls were kept, extracted from the transcripts, not the transcripts
blind: no
## Evidence
- role: prompt
  path: evidence/prompt.txt
  sha256: d2806fcb2c2c5c2688f55d248c2f88214b10d7091f5dc602039f7b7517719c57
- role: reader-prompt
  path: evidence/reader-prompt.txt
  sha256: 71fd5f8e4673b5138b57f2a3ca5146c4d76aacc9b0de9ddd49460f07068a5b61
- role: answers
  path: evidence/records/w1.md
  sha256: 49b7c94e9932fe029325e07691f1456e70470fdf5626059f862e510f19b8a6d2
- role: answers
  path: evidence/records/w2.md
  sha256: 3496accd545c4ec4cc060f7611bd889c1fd2b1c3326962f692270868bd308cbf
- role: answers
  path: evidence/reports/rd1.md
  sha256: 85d9fc03296d4d65d32c9f17e8832674b74e5cc06531b0f4a76519f20273718b
- role: answers
  path: evidence/reports/rd2.md
  sha256: dbc6ff2291a4ace786cbce87fb8f44c3e4a5c824d108bb6c9fc3d0cf39f88a39
- role: scores
  path: evidence/scores.md
  sha256: e31a186eb0b81f5505fb74ce10962bb492eeacc79b1f393718bf3d62e3f4ac5c
- role: key
  path: evidence/key.md
  sha256: 69a28a042ae82a7d4ed50d937a5298a9c4faf84446656f9dba2a28051df58a12
- role: subject
  path: evidence/materials/prompt.txt
  sha256: 7fc3beb871bfb3821016b3d96c4b2d9c4ac5fc63bd22de6f25acdd43014315cd
- role: subject
  path: evidence/materials/setup.md
  sha256: 45a7dca61cdc02d3f69299f051bea0b9c8186472f010687e7427466f0d9d3e96
- role: subject
  path: evidence/materials/answers.md
  sha256: 3da1f1716a6715ec82cfa690ec49577f769a99f5a02278b0c4fdbc8fdf93c39d
- role: subject
  path: evidence/materials/scores.md
  sha256: b57a0e25ab78fef076cb8164dd83473ac4c72bf781b9161649c455947f3c7ee2
- role: subject
  path: evidence/example-rehearsal.md
  sha256: 3c70bcba63d0928a3c7474fb3e60395eed756d9e1efff51103a372cecebb165b
- role: treatment
  path: evidence/treatment.sha256
  sha256: 7b1c4aff37291c0a92e71a3d6f2f07a40928787c1d7229168f005a74076050d2
- role: excerpt
  path: evidence/trace/w1.tools.txt
  sha256: 5c7b26cfd8e21a4c1f6c9a979f18fbbb04248fa9f8610f63a3d6f07866c4ddb1
- role: excerpt
  path: evidence/trace/w2.tools.txt
  sha256: 1eb1d92b1e475ac4420a48e1c2042b0822b7f547f1179d5371df1b1c359b4314
- role: trace
  path: evidence/trace/rd1.tools.txt
  sha256: 0eac30cfd977ed05072c12c137cbffdbebf2ea93f2a1b35429ffe38d235082e7
- role: trace
  path: evidence/trace/rd2.tools.txt
  sha256: 19ed985eba8876ee5d891b03db506bc05c6b4a04bc2e10278d3fe70ca00813e1
- role: mapping
  path: evidence/key-frozen.txt
  sha256: df6a768639b04d4ad237102f408c1020cb109056d1a1afccf09dc64827c14807
- role: mapping
  path: evidence/treatment-fixed.txt
  sha256: df6a768639b04d4ad237102f408c1020cb109056d1a1afccf09dc64827c14807
## Runs
- run: w1
  arm: writer
  exposure: opened
  excerpt: evidence/trace/w1.tools.txt
- run: w2
  arm: writer
  exposure: opened
  excerpt: evidence/trace/w2.tools.txt
- run: rd1
  arm: reader
  exposure: delivered
- run: rd2
  arm: reader
  exposure: delivered
## Claims
- id: c1
  claim: both writers produced a record of the past trial that the form script judged well-formed, with a harness, the technique and a Protocol of five stated lines, unaided
  scope: description
  rests-on: w1, w2
  demonstrated: yes
- id: c2
  claim: neither writer's Protocol says that a rerun cannot be exact because the sandbox, its register and the Skill texts were not kept in the notes; each kept the other six points of the key
  scope: description
  rests-on: w1, w2
  demonstrated: yes
- id: c3
  claim: both readers, given only the record, listed the steps in order, named the missing sandbox, Skill texts, stub runner and harness settings as things they would have to supply or guess, and both said they could not start the first run
  scope: description
  rests-on: rd1, rd2
  demonstrated: yes
- id: c4
  claim: the Skill's guidance made the writers write Protocols that a reader can follow
  scope: effect
  rests-on: w1, w2, rd1, rd2
  demonstrated: no
  not-shown: no untreated writer arm, so what the writers would have done without the Skill is unknown; the notes lacked the sandbox and the Skill texts, so the readers' "could not start" may be about the notes and not the protocol; unblinded and scored by the runner; one past trial; two writers and two readers; each session had 3 queued messages from outside its task delivered into it, and w2 said it set its verdict "based on your 'I think so' comment", which is in none of its files, so sessions were not isolated as the design assumes; the tool calls were kept but not the transcripts
## Protocol
materials: evidence/prompt.txt, evidence/reader-prompt.txt, evidence/key.md, evidence/materials/prompt.txt, evidence/materials/setup.md, evidence/materials/answers.md, evidence/materials/scores.md, evidence/example-rehearsal.md, evidence/treatment.sha256
run: per writer make a folder with the four notes (evidence/materials/*) as materials, the example record (evidence/example-rehearsal.md) as example, and the Skill folder whose file hashes are in evidence/treatment.sha256 (the kaal-research Skill as changed by research/C2) under .claude/skills; start a fresh sub-agent session with evidence/prompt.txt and the folder path; keep the record it writes and its tool calls; two writers. Per reader make a folder holding one writer's record and its evidence copies, start a fresh sub-agent session with evidence/reader-prompt.txt and the folder path, and keep its report; two readers, one per writer record
score: score each writer record against points K1 to K7 of evidence/key.md and each reader report against F1 to F3, one point each; run the judgement script on each writer record; the original scoring was by the runner, with the arm visible, and a rerun should have a separate session score with the labels shuffled
confirms: writers again state a harness and a full Protocol, and readers again name the same missing pieces and say they cannot start
refutes: readers say they can start the first run from the record alone, or the writers do state what a rerun lacks
## Limits
n-shows: two writers and two readers show whether a Protocol can be written and read once, and where it fell short, never how often
