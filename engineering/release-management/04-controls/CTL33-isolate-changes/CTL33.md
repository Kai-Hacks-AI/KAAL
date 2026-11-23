---
id: release/CTL33
title: isolate Changes
description: It reveals which paths of a pull request are the collector's own and which main already holds, or that it cannot tell.
type: detective
status: designed
has: [release/I67]
evidence: [fixture:9, real:1, provoked:1:fail]
---
# release/CTL33 isolate Changes

A detective control that other controls consume. For each path a pull request changes it says `own` (the collector's contribution, a conflict-resolution edit included), `inherited` (the same bytes as main holds in the merge result) or, when a folder of its evidence is absent or unreadable, nothing: UNKNOWN naming the folder, never a guess and never a pass. The reference is main as the merge result contains it, not today's main, so a later advance of main changes nothing. The unit is the path. It reads three folders of files (the collector before the pull request, the merge result, and main as the result contains it) and no Git: Git only brings the folders. It decides nothing about what an ACT may write, whether work is finished or whether a retro reflects it; the four judges of the ACT (release/CTL24, CTL29, CTL30, CTL31) judge the paths it calls own.

It reports on its own: the check `isolate Changes` of the workflow `controls ACT` prints `PASS: isolate Changes: <n> own, <m> inherited; own: <paths>` or `UNKNOWN: isolate Changes: no attribution without <folders>`, in the job summary too. It rolls out as the others do: (1) detective, the verdict only reported (the flag is absent); (2) advisory behind the feature flag `KAAL_RELEASE_ISOLATE_CHANGES` (exactly `on`: an UNKNOWN makes the job red, the check still required by no ruleset); (3) preventive only after the evidence and the Owner's explicit authorization. **The bar before advisory (release/C127):** ten pull requests into collectors, distinct, each with complete attribution, open a quality review; any pull request into a collector counts, a SYNC and a DO included, because this control sorts paths and does not judge an ACT. The review must have seen at least one SYNC, one pull request that mixes own and inherited paths, and one conflict-resolution edit (real or provoked), and a person checks each run's attribution against the diff: one wrong attribution is a Defect and restarts the count. The outcome (READY, NOT READY or MORE EVIDENCE NEEDED) is the reviewer's, and advisory is the Owner's go. It is verified by its own Cases (release/T1352 to T1356, T1359), which test it directly and not through a judge.
