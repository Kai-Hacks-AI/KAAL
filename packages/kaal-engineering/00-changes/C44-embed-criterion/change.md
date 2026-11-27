# C44 change

Finding from the Owner (27 Nov), relayed by the coordinator; the Owner and CPO ruled that a Test Case tests the criterion, never a snapshot count. All three snapshots in one Change, and the tarball list kept as a drift guard after the Owner's second ruling.

## What changes in `engineering/acceptance/embed.test.mjs`

The Owner (27 Nov): a snapshot test protects that something stays in place, which has value against drift; the fault is not learning from it when it fails because we touched something. So each assertion is named as a criterion or a drift guard, with the reason.

| Assertion | Kind | Why |
| --- | --- | --- |
| `ok: N Nodes admitted`, seven places | **criterion** | N follows from the installed Core (its Definition files, plus the Nodes the Case registered). Every Definition Core ships is admitted, once. A literal count told nothing the payload does not already say, and the drift it would catch is caught once, below. |
| the Engine's files after `init`, two arrays | **criterion** | The Engine is the payload: the installed tree equals the packaged `payload/` listing. A second copy of the list guarded nothing the payload did not. |
| the tarball is exactly the declared files | **criterion** (new) | Every entry lies under a path of `files`, no excluded file appears, every declared path and `package.json`, `README.md`, `LICENSE` are present, and the payload in the tarball is the payload installed. |
| the published files, `EXPECTED_TARBALL` | **drift guard, kept** | What an npm consumer gets must not change without someone meaning it. A new or removed file is exactly the unintended drift a snapshot is for, and the criterion above would accept it if the file is declared. The guard now names `added` and `removed` and says to update the list in the same Change and to say in that Change's retro why the set moved, so a failure teaches. |

The drift is guarded once, in the file list, and not seven times in the count.

## Decisions

1. **The PLAN carries the edited Case, as in C39.** The Case is the whole change; there is no DO. It changes what the scenario pins, not what the package must do.
2. **Not vacuous.** With the edit the Acceptance lane passes (46 tests, 8 scenarios). With one expected count changed by 7 the Case fails with "ok: 17 ... Input: ok: 10", so the check bites.
3. **Release safety kept twice.** A file outside the declared set, an excluded file or a missing declared path fails the criterion Case, and any change of the published set fails the drift guard, which says what moved.
4. **Checked both ways.** Removing one entry from the snapshot makes the guard fail naming it; changing one expected count makes the criterion Case fail.

## Not in this Change

The Cases of kaal-core itself, and any WIRE or ruleset change.
