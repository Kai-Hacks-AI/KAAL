# C26 change

## PLAN

1. Add F21, A46 and the gap G60 with C26 and its Cases T206 (the dispatcher, judged by running it), T207 (the legacy hook moved unchanged) and T208 (the directory of new hooks holds only installed sources).
2. The Cases are RED on `main`: there is no dispatcher, no `old/pre-push` and no `new/pre-push.d/`. T206 shows on known dispatchers that it can tell a good one from six bad ones, among them one that skips a missing or non-executable legacy hook and one that skips a new hook that is not executable.
3. The PLAN installs nothing, moves nothing and changes no behaviour.

## Ownership

The CPO decided to keep release/C26 for this first split. It is not renamed to an Engineering capability in this Change.

## DO

1. `.githooks` is in the danger zone, so the move travels alone in its own collector `kaal/release/wire-githooks-split`: `pre-push` becomes the dispatcher and today's script becomes `old/pre-push` without a changed byte. This Change's engineering files travel in `kaal/release/githooks-split`.
2. The hook is a managed asset of `kaal-guard` and its acceptance tests read `.githooks/pre-push` (`engineering/guard/acceptance`). The DO reconciles those expectations with the dispatcher in the same Change and does not weaken them.
3. The Cases are renamed from `.red.mjs` to `.test.mjs` once the move is verified at the exact head.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`.

## Not in this Change

Any new hook, the retirement of a legacy check, a change to what `kaal-guard run --hook` judges, and `core.hooksPath` of anyone's clone.
