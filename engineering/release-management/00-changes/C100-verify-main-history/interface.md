# C100 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of I54.md

`````
---
id: release/I54
title: main history is kept
---
# release/I54 main history is kept

Contract: the branch `main` is only ever moved forward, and it is never deleted. Every commit that was `main` stays reachable from `main`. A force-push or a deletion of `main` destroys the record that Changes, reviews and promotions rest on and cannot be undone from inside the repository. Reason: a delivery that can be erased cannot be audited. Owner: release management. The old promotion ruleset holds this today with its `non_fast_forward` and `deletion` rules; release/CTL22 reveals it, so the old rules can later be replaced by a control that proves itself.
`````

## Draft of F77.md

`````
---
id: release/F77
title: verify-history
kind: functional
serves: [release/I54]
---
# release/F77 verify-history

A check on every push to `main` compares the commit `main` pointed at before the push with the commit it points at after, both read as Git data. It says FAIL when `main` no longer exists after the push (it was deleted), or when the commit before is not an ancestor of the commit after (history was rewritten, which is what a force-push does). It says PASS when the commit before is the commit after, is an ancestor of it, or when `main` is new (nothing existed before). It says UNKNOWN when either commit cannot be read, which never passes. The check runs on `push` to `main` with a read-only token and no secret. It reads the commits as Git data and runs a judge from the checkout of the commit after the push.
`````

## Draft of A68.md

`````
---
id: release/A68
title: verify-history
addresses: [release/F77]
---
# release/A68 verify-history

One module `05-src/history/verify-history.mjs` with a pure judge over three facts (`judge({ before, after, forward })`: the two commit ids and whether `before` is an ancestor of `after`), a reader that derives the facts from Git (`facts(root, before, after)`, using `git cat-file` and `git merge-base --is-ancestor`) and a command line (`--root`, `--before`, `--after`; exit 0 PASS, 1 FAIL, 2 UNKNOWN), and one workflow source `05-src/wiring/workflows/verify-history.yml` (on `push` to `main`, `permissions` read only, no secret, one job `verify History`). The job checks out the commit after the push with full history and no stored credential, fetches the commit before it by its id, and judges `--before $BEFORE --after $AFTER`. The module is the judge release/CTL22 declares. Its registration in a station is a later WIRE, and replacing the old ruleset rules is the Owner's later decision.
`````

## Draft of CTL22.md

`````
---
id: release/CTL22
title: verify History
description: It reveals whether main was rewritten or deleted by a push.
type: detective
status: designed
evidence: [fixture:2, real:1, provoked:2:fail]
has: [release/I54]
---
# release/CTL22 verify History

A detective control. `verify History` compares the commit `main` pointed at before a push with the commit it points at after, and says FAIL when `main` is gone or when the commit before is not an ancestor of the commit after. It says PASS when `main` only moved forward or is new, and UNKNOWN when a commit could not be read, which never passes. PASS is not an approval and not a merge decision.

It reveals; it does not prevent. A force-push or a deletion has already happened when it runs. Preventing is the old promotion ruleset's `non_fast_forward` and `deletion` rules today; a preventive control with the same judge is a different control with its own Owner decision, made only after this one is Tested.

It declares its own minimum evidence in the kinds controls/F30 asks of every control: two runs against a fixture (a scratch repository where `main` moves forward), one run on a real push to `main` of this repository, and two provoked failures (a rewritten `main` and a deleted `main`), where a failure counts only when the Case is RED on a `main` without the control's mechanism and GREEN with it. Its own Cases create these histories in scratch repositories.

It has one Intent, release/I54.
`````

## Draft of verify-history.mjs

`````
// verify History: was main only moved forward?
import { execFileSync } from 'node:child_process';

const ZERO = /^0+$/;

// before, after: commit ids ('' or all zero means no commit). forward: whether before is an ancestor of after, or undefined when it cannot be told.
export function judge({ before, after, forward }) {
  if (!after || ZERO.test(after)) return { verdict: 'FAIL', reasons: ['main does not exist after the push (it was deleted)'] };
  if (!before || ZERO.test(before)) return { verdict: 'PASS', reasons: [] };
  if (before === after) return { verdict: 'PASS', reasons: [] };
  if (forward === true) return { verdict: 'PASS', reasons: [] };
  if (forward === false) return { verdict: 'FAIL', reasons: [`${before} is not an ancestor of ${after} (history was rewritten)`] };
  return { verdict: 'UNKNOWN', reasons: ['whether main only moved forward could not be told'] };
}

export function facts(root, before, after) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const has = (c) => { try { git('cat-file', '-e', `${c}^{commit}`); return true; } catch { return false; } };
  if (!after || ZERO.test(after)) return { before, after, forward: undefined };
  if (!has(after)) throw new Error(`the commit ${after} cannot be read`);
  if (!before || ZERO.test(before) || before === after) return { before, after, forward: undefined };
  if (!has(before)) return { before, after, forward: undefined };
  try { git('merge-base', '--is-ancestor', before, after); return { before, after, forward: true }; } catch (e) { return { before, after, forward: e.status === 1 ? false : undefined }; }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try { r = judge(facts(arg('--root') || '.', arg('--before'), arg('--after'))); } catch (e) { r = { verdict: 'UNKNOWN', reasons: [String(e.message)] }; }
  console.log(`${r.verdict}${r.reasons.length ? `: ${r.reasons.join('; ')}` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````

## Draft of verify-history.yml

`````
name: verify History
# release/CTL22. A detective check on a push to main: no token beyond read, no secret, no pull_request_target.
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  verify-history:
    name: verify History
    runs-on: ubuntu-latest
    env:
      BEFORE: ${{ github.event.before }}
      AFTER: ${{ github.event.after }}
    steps:
      - name: Check out main after the push
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          ref: ${{ github.event.after }}
          fetch-depth: 0
          persist-credentials: false
      - name: Fetch the commit main had before the push
        run: |
          git fetch --no-tags origin "$BEFORE" || echo "the commit before the push could not be fetched"
      - name: Judge
        run: |
          J=engineering/release-management/05-src/history/verify-history.mjs
          test -f "$J" || { echo "UNKNOWN: the judge is absent"; exit 2; }
          node "$J" --before "$BEFORE" --after "$AFTER"
`````
