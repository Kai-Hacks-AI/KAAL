# C21 change

## PLAN

1. Add C21 with the gap Case T190, and the Cases T188 (the judge) and T189 (the command line). They are RED on the collector (`evidence.md`).
2. HOTFIX gets a route row: the head must start with `hotfix/`. The base is not judged for a HOTFIX, whatever it is, and every HOTFIX result says so under not judged.
3. Two results are kept apart. `ok` is local validation only: it says that no rule found a fault, and it never authorizes success, merge, admission or promotion. The verdict is the only result a consumer may rely on, and `ok: true` with the verdict UNKNOWN is the normal result for a valid HOTFIX. The result carries a verdict: FAIL when it has a finding, UNKNOWN when it has none and left something unjudged, PASS only when it judged everything. The command line prints the verdict first, lists the findings and the unjudged items, and exits 0 only for PASS, 1 for FAIL and 3 for UNKNOWN.

## DO

1. In `envelope.mjs`, add the HOTFIX route row and the verdict, and change the command line as in step 3.
2. Replace in F17 the sentence that gives HOTFIX no route row, and in A33 the description of the output.
3. The delivered Case T161 asserts that a HOTFIX from any head passes and that its route row is missing. It is changed in the same DO to follow the CPO decision, and the DO names that change. The other assertions stay.
4. Rename T188, T189 and T190 to `.test.mjs` when green.

## ACT

1. A 4L retrospective in `act.md`.

## Not in this Change

The Hotfix delivery path, its base or bases, its controls and its admission. Wiring, hooks, CI, merge blocking and promotion. The hold on promoting C12, C20 and C21 stands; the coordinator takes the promotion slot.
