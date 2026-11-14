# skills/C1 DO: the contract is executable

Authorized by the Owner and CPO after the approved PLAN (#1604, merged into `kaal/skills/contract`). Authorization is limited to DO. Nothing is installed, migrated, promoted or published.

## What this DO delivers

- `package.json` (private; no exports, main, bin, files or dependencies), `README.md`, `format.md`.
- `test/lib/conforms.mjs`: the common evaluator (`conforms`, `verdict`, `discover`), the prototype of `evidence/` made the real one. It is read only by the Cases. The prototype stays in `evidence/` as the PLAN's record.
- `test/integration.test.mjs`: runs the Cases under `npm test`.
- The eight planned Cases renamed from `T26n.red.mjs` to `T26n.test.mjs`. Their bytes are unchanged (the diff shows pure renames). `run-red.mjs`, which only existed to show RED, is removed.

## Cases at the reviewed head

Run: `node --test packages/kaal-skills/test/integration.test.mjs` on Node v22.23.4 (the repository declares Node 24; CI is the check on that), at `3cc2cac` plus this file.

```
ok skills/T260 (skills/F1)
ok skills/T261 (skills/F2)
ok skills/T262 (skills/F3)
ok skills/T263 (skills/F4)
ok skills/T264 (skills/F5)
ok skills/T265 (skills/F6)
ok skills/T266 (skills/N1)
ok skills/T267 (skills/F7)
tests 8, pass 8, fail 0
```

## Against the acceptance

- **Testing's mechanisms are accommodated, unchanged.** No Testing file changed. `duplicates`, `report` and `inventory` run from the draft declaration; `assess-claim` reads as a judgment mechanism. `accept` has no fixtures and needs Hosting built (Node 24), so it is UNKNOWN, not PASS (F2, F3, F4). `assess-claim` declares no activation, so F7 is UNKNOWN. T262 pins that Testing's `accept` is read by its findings, never by `passed`.
- **Architecture's remind mechanism is invocable on its own.** From the snapshot directory, with no evaluator: `node scripts/remind.mjs "A function is placed in the delivery tool."` prints `{"skill":"kaal-architecture","section":"The test","situation":"…","reminder":"Before you settle this design or place this function, read kaal-architecture, 'The test': would the statement still hold if the means were replaced? Report its parts, your finding (none, mixed, ambiguous) and the next move (keep, split, ask)."}`. T267 invokes it through its declaration only. The declaration holds no reminder text.
- **PASS, FAIL and UNKNOWN stay apart.** No fixture, a module that cannot load, no activation, and a package with no declaration are each UNKNOWN. T260, T262, T263 and T267 assert that UNKNOWN is neither PASS nor clear.
- **Capability-owned and independent.** T266: no export, command or dependency in `kaal-skills`; no package depends on or imports it; nothing in `.github`, `.githooks` or `.kaal/config` names it or requires a declaration.

## Not done, by the boundaries

- **The Cases are not yet in CI.** `kaal-skills` is not a workspace and `test:engineering` does not name its test file; adding either installs a check into existing CI, which the authorization excludes. Until a later Change wires it, Pull Promotion will not see `✔ skills/T26n` in a job log. Decision for the CPO: which Change wires it.
- **No declaration in any capability's package.** Testing's and Architecture's remain drafts under `evidence/`; their owners add the real files in their own Changes. Real fixtures for Testing's `accept` and a real `remind` for Architecture are those Changes' work.
- **No ownership claim for kaal-skills** (it needs a Core Node id this DO does not create).
- **Windows and macOS** were not run here. The evaluator uses `process.execPath`, argument lists and file URLs, never a shell.
