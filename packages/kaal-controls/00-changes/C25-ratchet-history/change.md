# C25 change

## PLAN

1. Add the gap G102, the Requirement F39 and the Cases T1120 and T1123 (plain `.test.mjs`, never renamed). Both are RED on main.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. After C24's DO and on the merge of this PLAN into its collector:

1. `ratchet.mjs`: `judgeProgress` as in F39.
2. `ratchet.mjs`: `judgeRetirement` as in F39 item 8.
3. `modes.md`: the history file and its line, and that the history stays after the ratchet ends, in the existing space.
4. The Cases T1120 and T1123 GREEN; the package suite GREEN; weakenings of `judgeProgress` kept as patches with a runner run on the DO's head, as in C22.

## ACT

A retro entry in the collector.

## Not here

The report that reads the history, the adoption in CTL20 and CTL36 (release), and how a judge reads the commit times (release's, as transport).

## DO record

`mutations/` keeps twelve weakenings of `judgeProgress` and `judgeRetirement` (P1 to P9, R1 to R3) as exact patches with a runner, as in C22. `mutations/run-at-do-head.txt` is the run on the DO: the baseline is GREEN on T1120 and T1123, and each weakening, loaded alone, is RED on the Case that guards it (P1 is caught with the reason `line-mismatch` where `baseline-grew` is wanted, since the line is wrong too). The record cannot name its own revision; re-run `sh mutations/run.sh <repo root>` at the DO's head and compare with it.
