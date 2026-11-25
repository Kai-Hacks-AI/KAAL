# C134 change

## PLAN

The Change adopts the history in the two ratchets and does nothing else. The approval of this pull request is the go for the DO. Kai's note on C25 says that no reporting and no WIRE is authorized, and none is part of this Change.

### Decisions

1. **One file each, beside the baseline.** `04-controls/CTL20-gate-verify-triggers/history.jsonl` and `04-controls/CTL36-verify-workflow-names/history.jsonl`, append only, with the adoption line each: `{"at":"<UTC to the minute>","change":"release/C134","from":null,"to":5,"removed":[]}`. `change` is this Change, the one that delivers the adoption; `at` is the author's declaration inside the window of the pull request, as C25 defines. The adoption line is the form `from: null` that C25 recommends.
2. **Both baselines are unchanged.** The adoption adds the history and lowers nothing, so no `removed` name and no `judgeProgress` reduction line are needed; both stay at 5.
3. **The declaration.** The control record names its history beside `baseline-source`, with the path of the file, so the finder of controls C24 and C25 finds it. The records change by that one line each. `strategy`, `owner` and `exit` are unchanged.
4. **No judgment is wired in this Change.** Calling `judgeProgress` needs the times of the base and head commits as input, which the installed workflows do not hand to the judges today, and a workflow change is a WIRE. So the judge scripts are not changed here. Until a later Change adds it, the history is a recorded fact the pull request that lowers a baseline appends by hand, and the control's record says so (a missing history reads UNKNOWN in controls' library; a present, well-formed one is sound).
5. **Every later reduction follows the standard.** The D15 to D17 gates of release C133 each remove their name from the CTL20 baseline and append one line (their Change id, `from: 5`, `to: 4`, the removed name) in the same pull request; likewise for CTL36. This is noted in the records, not built here.

### Cases (plain `.test.mjs`; they land with the DO, ids after the highest on main)

- each `history.jsonl` is a sound chain: whole lines, the adoption line first with `from: null`, `to` equal to the size of the baseline now, sorted `removed`.
- the adoption line's `change` is `release/C134` and its folder exists.
- the `judgeProgress` of the shared library says PASS for the adoption pair (base without a history file is read as an empty history, head with the one line), and FAIL when the line's `to` is wrong.
- the control record names the history file and still declares the same strategy, owner and exit.

### Not in this Change

No judge or workflow change, no WIRE, no report, no ruleset or flag. No change to the baselines. CTL20 and CTL36 stay preventive-with-a-ratchet as they are.
