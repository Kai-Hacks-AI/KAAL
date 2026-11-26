# C16 DO

## Implement

- `lib/records.mjs`, pure and free of any file read: `readRecord(path, text)` reads an A-record by its form (F14), `checkAddresses(records, observed)` gives each reference inside the observation boundary one verdict, INVALID or UNKNOWN, and none when resolved (F15), and `nextId(namespace, ids)` suggests one more than the highest observed A-number (F16). The caller supplies the text of the files it can observe; reading them through Hosting is the caller's and is not decided here.
- The Cases T23 (F14), T24 (F15), T25 (F16) and T26 (N2), `.red.mjs` renamed `.test.mjs` and moved beside their Requirement in the Target.
- `package.json` ships `lib`. No dependency is added. A1 and its Case T17 are amended to say the package ships `lib` beside its Skill; nothing else of them changes.

## Refactor

None. No A-record in any package is read or changed, no Control or gate is added, nothing is resolved across packages, and no permanence of ids is promised.

## Result

See `evidence.md`.
