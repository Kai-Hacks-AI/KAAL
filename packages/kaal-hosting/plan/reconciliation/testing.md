# Guarded File Reconciliation: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/reconciliation.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. hosting/T1–T11 come from `hosting/C1`, `hosting/C3` adds hosting/T12, `hosting/C4` adds hosting/T13 in `test/plan/cleanup.test.mjs`, `hosting/C6` adds hosting/T14–T17 in `test/plan/kinds.test.mjs`, and `hosting/C8` adds hosting/T18–T20 in `test/plan/expectations.test.mjs`. Each generation is incorporated by its own DO Change, which turns its tests GREEN and moves them into Hosting's `npm test` so they run in the required Linux, Windows and macOS Hosting lanes: `hosting/C2` did so for hosting/T1–T12 and may add Code tests of its own beside them, `hosting/C5` for hosting/T13, `hosting/C7` for hosting/T14–T17, and `hosting/C9` will for hosting/T18–T20.

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
| hosting/T14: a file becomes a directory of the same name, and a directory a file, each in one reconciliation, and the report names every outcome and the pruned directory | hosting/I1, hosting/F13 | Intent |
| hosting/T15: a directory that holds anything the reconciliation does not remove is not turned into a file: the refusal is `STALE`, found `"not a file"`, and nothing changes | hosting/F3, hosting/F13 | Requirements |
| hosting/T16: a failure while applying a kind change restores the root exactly, and leaves nothing beside it | hosting/I2, hosting/F6, hosting/F13 | Intent |
| hosting/T17: any nesting other than the two shapes is refused with `INVALID_PATH` before anything is touched | hosting/F13 | Requirements |
| hosting/T18: expectations that hold let the writes and removals apply, and every expected file stays the same file, with the same bytes and executable mark, and no outcome; a reconciliation of expectations alone applies nothing | hosting/I4, hosting/F14 | Intent |
| hosting/T19: a file the caller relied on and left alone changes after the caller read it, by new bytes, by removal, or by appearing where the caller found nothing: the refusal is `STALE`, it lists that file with every other failing path, and nothing changes | hosting/I4, hosting/F3, hosting/F14 | Intent |
| hosting/T20: an expected path that is repeated, also written or removed, nested with another path of the reconciliation, not portable, or reached through a link is refused before anything is touched | hosting/F4, hosting/F5, hosting/F14 | Requirements |

hosting/T1, T8 and T11 compare whole reports. They stay as they are and stay valid, because `leftovers` is present only when the host refuses a removal, and none of them makes it refuse. hosting/N1 follows from these tests running in the three Hosting lanes, which `hosting/C2` adds them to. hosting/A1–A5 are placements, validated by review. The Limits in the Requirements are stated, not tested: no test asserts crash atomicity, isolation from readers, protection against writers that do not use Hosting, or any metadata beyond what F6 promises.

## RED evidence

At `hosting/C1`, all eleven tests were RED, and at `hosting/C3` all twelve are. Each is **blocked before behavioural assertion**, because `kaal-hosting` exports no `reconcile`. They are not in Hosting's `npm test`, so KAAL's lanes stay green. Run them with `npm run test:plan -w kaal-hosting`.

## Defects

| Defect | Proven RED by | Found |
| --- | --- | --- |
| hosting/D1: when removing the staging or aside directory fails after the outcome is settled, `reconcile` rejects with that removal error instead. An applied reconciliation then looks failed, and an `UNRESTORED` refusal and its `kept` location are lost. | hosting/T13 | Review of #398, at the `finally` in `src/index.ts` that removes staging and aside |

At `hosting/C4`, hosting/T13 is RED by behavioural assertion: with the removal refused, an applied reconciliation rejects with the removal's own error, `EBUSY`, instead of resolving with its report and `leftovers`. It is not in Hosting's `npm test`, so the lanes stay green. Run it with `npm run test:plan -w kaal-hosting`. `hosting/C5` fixes hosting/D1 and adds hosting/T13 to the lanes.

At `hosting/C6`, hosting/T14, T15 and T16 are RED by behavioural assertion: `reconcile` refuses every nesting with `INVALID_PATH`, so neither kind change applies and the directory with content that would stay is refused for its nesting instead of as STALE. hosting/T17 is GREEN already, because that blanket refusal covers its cases, and it guards that hosting/C7 opens only the two shapes. They are not in Hosting's `npm test`. Run them with `npm run test:plan -w kaal-hosting`. `hosting/C7` turns them GREEN and adds them to the lanes.

At `hosting/C8`, hosting/T19 and T20 are RED by behavioural assertion: `reconcile` ignores `expect`, so a changed file the caller relied on does not stop the writes, and an invalid expected path is not refused. hosting/T18 is GREEN already, because nothing touches a file that is not written or removed, and it guards that `hosting/C9` only reads expected files. hosting/T19 is the regression evidence the Owner asked for on #472. They are not in Hosting's `npm test`. Run them with `npm run test:plan -w kaal-hosting`. `hosting/C9` turns them GREEN and adds them to the lanes.
