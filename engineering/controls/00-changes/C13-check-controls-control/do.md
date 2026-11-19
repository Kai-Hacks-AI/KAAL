# C13 DO

The DO follows the PLAN of #1999, approved by the CPO, which was the go.

1. `04-controls/CTL1-check-controls/CTL1.md` is the draft of `interface.md`, copied unchanged. It has `status: running` and the Intent `controls/I7`.
2. T780, T781, T782 and T783 are renamed from `.red.mjs` to `.test.mjs`. They are green: `node --test` over the `.test.mjs` files of `engineering/controls` gives 6 pass, 0 fail (T778 and T779 with them).
3. `check-controls` over the repository exits 0 and lists `controls/CTL1` as valid, detective, running.
4. The ground for `running`, the Engineering check running T778 on a pull request, is in `evidence.md` below.

Nothing is added to a hook, workflow or ruleset.
