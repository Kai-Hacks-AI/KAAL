---
id: research/RT1
format: 4L
reflects: [research/C1]
---
Account of: I am the builder agent who planned research/C1 (#2324), revised it after the CPO's change request, then built its DO (#2335), ran the first rehearsal RH1 and wrote this retro; Kai as CPO and the CRO review of controls C21 shaped the scope, and this is my own account.

## Liked
- subject: the worked example record shipped inside the Skill's references
  keeps: both arms of RH1 had it, and no record in either arm marked an effect claim as shown or a run as opened without an excerpt, so it carries most of the honesty that agents showed; without it the Skill would only be rules.
- subject: freezing the key and fixing the treatment, each with a recorded time, before the runs
  keeps: RH1 can state a key frozen before the treatment, which its own effect claim would need, instead of asserting it afterwards.
- subject: ordinary `.test.mjs` Cases written in the PLAN and GREEN in the DO
  keeps: the DO had five fixed targets (T1383 to T1387) that never changed id, so "done" was a run, not a judgement.

## Learned
- subject: a trial's claim is only as strong as its design: untreated arm, blinding, a key frozen before the treatment, and recorded exposure
  source: the CRO assessment of controls #2319, relayed by Kai in this project (secondhand); I did not consult the underlying experimental-design literature in this thread.

## Lacked
- subject: a rule that exposure `opened` needs a retained trace excerpt, not an agent's own report
  decision-point: classifying exposure for the three skill-arm runs of RH1 while writing the record.
  cost: I wrote `opened` on self-reports, the CPO blocked #2335, and a correction commit and a second review round followed.
  findable: yes
  address: Skill
- subject: a stated meaning of "well-formed" in a record's verdict
  decision-point: writing the first PLAN's verdict rules for the form judge in #2324.
  cost: the CPO requested changes because a well-formed record could read as credible or favourable; the claim scopes and `verdict-about` had to be designed and the PLAN re-reviewed.
  findable: no
  address: Skill
- subject: a clear role for the agent in the trial setup file
  decision-point: writing `setup.md` for the six trial runs.
  cost: five of six agents said they were unsure of their role, which blurs what the runs measured.
  findable: no
  address: script

## Longed For
- subject: a way to keep tool traces of sub-agent runs as evidence
  worked-anyway: RH1 was recorded with exposure `delivered` and the limitation named, and the inconclusive verdict did not depend on it.

Decisions: none made, the owner decides.
