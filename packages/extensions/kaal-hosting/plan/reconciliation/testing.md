# Guarded File Reconciliation: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/reconciliation.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. hosting/T1–T11 come from `hosting/C1`, and `hosting/C3` adds hosting/T12. `hosting/C2` turns them GREEN, moves them into Hosting's `npm test` so they run in the Linux, Windows and macOS Hosting lanes, and may add Code tests of its own beside them.

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

hosting/N1 follows from these tests running in the three Hosting lanes, which `hosting/C2` adds them to. hosting/A1–A5 are placements, validated by review. The Limits in the Requirements are stated, not tested: no test asserts crash atomicity, isolation from readers, protection against writers that do not use Hosting, or any metadata beyond what F6 promises.

## RED evidence

At `hosting/C1`, all eleven tests were RED, and at `hosting/C3` all twelve are. Each is **blocked before behavioural assertion**, because `kaal-hosting` exports no `reconcile`. They are not in Hosting's `npm test`, so KAAL's lanes stay green. Run them with `npm run test:plan -w kaal-hosting`.
