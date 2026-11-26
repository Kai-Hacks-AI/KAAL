---
id: research/RT2
format: 4L
reflects: [research/C2]
---
Account of: I am the builder agent who planned research/C2 (#2467), built its DO (#2475), ran the rehearsal RH2 with four sub-agent sessions and wrote this retro; Kai as CPO set the direction and the CPO reviews shaped the scope, and this is my own account.

## Liked
- subject: extracting only the tool calls from the sub-agent transcripts as the kept excerpts
  keeps: RH2 could mark the writers `opened` on evidence that shows the Skill files read, without keeping message text or the context that the transcripts carry.
- subject: independent readers who get only a record and are asked what they would have to guess
  keeps: both readers found the gap the writers left unstated (no sandbox, no Skill texts, no settings), which neither the writers nor the form script flagged.
- subject: the first rehearsal's discipline of a key and a treatment hash fixed before the runs
  keeps: RH2 could say which Skill text the writers held, so the later one-line change to the Skill is visibly outside what was tried.

## Learned
- subject: running sub-agent sessions receive messages queued to the coordinating session
  source: the transcripts of the four RH2 sessions, read as JSONL: each holds three `queued_command` attachments from outside its task, and one writer quoted a message that is in none of its files; the harness documentation was not consulted.

## Lacked
- subject: a way to keep a fresh sub-agent session isolated from messages queued to its parent
  decision-point: designing the fresh sessions of RH2, and before that RH1.
  cost: all four RH2 sessions had outside messages delivered into them, so "fresh" was weaker than the design said, c4 had to carry it as not-shown, and RH1's runs probably had the same.
  findable: no
  address: Skill
- subject: a rule to keep what a rerun needs (the sandbox, the register, the texts of the Skills used, the settings) with a trial's notes
  decision-point: writing the Protocol of RH1 and of the "exchange by description" record from its notes.
  cost: both writers' Protocols could not supply those pieces and did not say so, and both readers could not start the first run; that trial cannot be rerun.
  findable: no
  address: Skill

## Longed For
- subject: a retest of the Skill line that says what a rerun lacks
  worked-anyway: the line shipped in the DO marked as untested, and the record hashes the Skill as it was tried.
- subject: Kai's automated parallel runs across several agent harnesses as a second technique
  worked-anyway: C2 shipped with `judged-trial` only, as the PLAN scoped, and nothing was blocked.

Decisions: none made, the owner decides.
