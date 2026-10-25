# Guarded File Reconciliation: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/reconciliation.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. hosting/T1–T11 come from `hosting/C1`, `hosting/C3` adds hosting/T12, and `hosting/C4` adds hosting/T13 in `test/plan/cleanup.test.mjs`. `hosting/C2` turns them GREEN, moves them into Hosting's `npm test` so they run in the Linux, Windows and macOS Hosting lanes, and may add Code tests of its own beside them.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T1: guarded writes and removals apply together, and the report names every outcome in path order | hosting/I1, hosting/F1, hosting/F2, hosting/F9 | Intent |
| hosting/T2: one failing precondition refuses the whole reconciliation with `STALE`, lists every failing path, and leaves the root byte for byte as it was | hosting/I1, hosting/F2, hosting/F3 | Intent |
| hosting/T3: a failure while applying restores the root exactly, and leaves nothing beside it | hosting/I2, hosting/F6 | Intent |
| hosting/T4: a write marked `executable` is executable where the host has the mode, a write without it is not, and the mode is no precondition | hosting/I3, hosting/F7 | Requirements |
| hosting/T5: non-portable, non-relative, colliding and repeated paths are refused before anything is touched | hosting/F4 | Requirements |
| hosting/T6: a link at a path or above it, and a file where a directory is needed, are refused, and nothing outside the root changes | hosting/F5 | Requirements |
| hosting/T7: a removal prunes the directories it empties, up to but never including the root, and keeps every other directory | hosting/F8 | Requirements |
| hosting/T8: bytes and mode already in place, and a removal of what is absent, report `unchanged` | hosting/F9 | Requirements |
| hosting/T9: two reconciliations of one root, made from the same plan at once, serialize: one applies and the other is refused with `STALE` | hosting/N2, hosting/F3 | Requirements |
| hosting/T10: a missing root, or a root that is a file, is refused with `MISSING` | hosting/F10 | Requirements |
| hosting/T11: the same root and reconciliation give equal reports | hosting/N3 | Requirements |
| hosting/T12: when the rollback fails too, the refusal is `UNRESTORED`, never the original failure, and the displaced original is kept with its bytes at its own path in the reported `.aside-*` location, while nothing staged remains | hosting/I2, hosting/F6, hosting/F11 | Intent |
| hosting/T13: when the host refuses to remove the staging and aside directories, the outcome stands and every leftover is reported. An applied reconciliation resolves with its report plus `leftovers`, a held rollback rejects with the original failure plus `leftovers`, and a failed rollback rejects with `UNRESTORED`, its `cause` and `kept` intact, plus `leftovers`. Each leftover names a directory still beside the root and the host's error | hosting/I2, hosting/F9, hosting/F11, hosting/F12 | Requirements |

hosting/T1, T8 and T11 compare whole reports. They stay as they are and stay valid, because `leftovers` is present only when the host refuses a removal, and none of them makes it refuse. hosting/N1 follows from these tests running in the three Hosting lanes, which `hosting/C2` adds them to. hosting/A1–A5 are placements, validated by review. The Limits in the Requirements are stated, not tested: no test asserts crash atomicity, isolation from readers, protection against writers that do not use Hosting, or any metadata beyond what F6 promises.

## RED evidence

At `hosting/C1`, all eleven tests were RED, and at `hosting/C3` all twelve are. Each is **blocked before behavioural assertion**, because `kaal-hosting` exports no `reconcile`. They are not in Hosting's `npm test`, so KAAL's lanes stay green. Run them with `npm run test:plan -w kaal-hosting`.

## Defects

| Defect | Proven RED by | Found |
| --- | --- | --- |
| hosting/D1: when removing the staging or aside directory fails after the outcome is settled, `reconcile` rejects with that removal error instead. An applied reconciliation then looks failed, and an `UNRESTORED` refusal and its `kept` location are lost. | hosting/T13 | Review of #398, at the `finally` in `src/index.ts` that removes staging and aside |

At `hosting/C4`, hosting/T13 is RED by behavioural assertion: with the removal refused, an applied reconciliation rejects with the removal's own error, `EBUSY`, instead of resolving with its report and `leftovers`. It is not in Hosting's `npm test`, so the lanes stay green. Run it with `npm run test:plan -w kaal-hosting`. `hosting/C5` fixes hosting/D1 and adds hosting/T13 to the lanes.
