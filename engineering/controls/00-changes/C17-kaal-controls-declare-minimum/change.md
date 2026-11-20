# C17 change

## PLAN

1. Add the gap G94, the Intent I11, the Requirement F30 and the Architecture A16, with the draft in `interface.md`, and the Cases T1094 to T1096 as `T<n>.red.mjs`.
2. Observe the expected RED against `main` and the same Cases GREEN against a throwaway copy (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no control, no script and no workflow and touches only `engineering/controls/` documents and Cases.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. Add the `evidence` line of `interface.md` to each of the ten controls in `engineering/release-management/04-controls/`, and make the ten release Cases named in `baseline.md` strip that line, one replace each.
2. Add `engineering/controls/06-records/README.md` and the converter `05-src/report-to-records.mjs`, with its Case.
3. Make Engineering's control check pass the records to `check-controls.mjs`.
4. Rename the Cases to `T<n>.test.mjs` when green. The engineering Cases keep their result: the 16 failures that already exist on `main` are unchanged and no other Case fails.

## ACT

1. A 4L retrospective of the Change, delivered to `main`. It names the control owners' confirmation of the numbers.

## Left open

- The control files and Cases belong to release-management. The Change touches one line in each file and one replace in each Case; release reviews it, and a different number for a control is that control's own decision.
- No control runs yet against the minimums, so every control shows no records and `tested` remains unclaimed. The first records come from real runs, such as the hotfix exercises, in later Changes.
- The flag, the WIRE rule and the go-hot gate are stated in `interface.md` and left to the Changes of the capabilities that own them.
