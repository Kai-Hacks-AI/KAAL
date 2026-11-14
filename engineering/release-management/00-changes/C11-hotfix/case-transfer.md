# C11 Hotfix Cases: transfer of activation to the HOTFIX delivery

Nine Cases of this Change are not retired. Their ownership and activation moved to the pending HOTFIX delivery, so each becomes an active Case together with the Hotfix template it checks. Until then they are not active on `main`, where the template is absent and CI now runs every active Case (pull/C6).

| Case | Tests | Original location (blob at `main` 929d4dd, commit 99e0669 of #1517) | Blob |
| --- | --- | --- | --- |
| release/T150 | I10 | `01-intent/I10-create-hotfix/T150.test.mjs` | b1ff109e |
| release/T151 | F16 | `02-requirements/F16-hotfix-interface/T151.test.mjs` | 7534056b |
| release/T152 | F16 | `02-requirements/F16-hotfix-interface/T152.test.mjs` | 7e1845c2 |
| release/T153 | F16 | `02-requirements/F16-hotfix-interface/T153.test.mjs` | 6cd18a6f |
| release/T154 | F16 | `02-requirements/F16-hotfix-interface/T154.test.mjs` | 44c279a3 |
| release/T155 | F16 | `02-requirements/F16-hotfix-interface/T155.test.mjs` | 1232a8c1 |
| release/T157 | A39 | `03-architecture/A36-create-hotfix/A39-github/T157.test.mjs` | 8bc1c706 |
| release/T159 | G42 | `00-changes/C11-hotfix/T159.test.mjs` | 47955913 |
| release/T160 | G43 | `00-changes/C11-hotfix/T160.test.mjs` | 0ac3cf9f |

- **Identities and definitions.** Unchanged: the ids, the requirements they test and the definitions are the files above, byte for byte, at `main` 929d4dd. Nothing is rewritten.
- **Destination.** The HOTFIX delivery of this Change, the one that adds `.github/PULL_REQUEST_TEMPLATE/hotfix.md` (collector `kaal/release/wire-hotfix-template`). It carries the nine files back at their original locations.
- **Why activation waits.** Each Case asserts that the Hotfix template exists or has a given shape. It was RED when it landed (see `evidence.md`) and stays RED until the template is on `main`. Now that CI runs every active engineering Case, an active RED Case would fail the `Engineering` check for every pull request.
- **Event that restores them.** The HOTFIX DO that adds the template. In that DO, restore the nine files with `git checkout 929d4dd -- <path>` and show them green in the same pull request.
- **RED evidence.** `evidence.md` of this Change keeps the RED observation of T150 to T160 against `main`; it is not edited. T156 and T158 stay active and green.

- **Reactivated (14 Nov).** The nine are active `.test.mjs` Cases in the engineering collector of release/C17, at their original locations, together with T181 and T201. Each runs green against the installed `hotfix.md`, whose sha256 equals that of the draft (`a3a14714357f1b2082449cfdfd5551f90df3782fff9510a03804a16f655909f3`).
