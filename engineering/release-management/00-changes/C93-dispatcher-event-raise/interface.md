# C93 interface

Drafts as they are added in the DO. The element Cases read the element's own file; the behaviour Cases read the file the DO adds, and are RED until it exists.

## Draft of I52.md

`````
---
id: release/I52
title: the final step of work raises its PROMOTION as a draft
---
# release/I52 the final step of work raises its PROMOTION as a draft

Contract: when the final step of work merges into an integration branch (an ACT into a collector, a fix into a hotfix branch, a copy into a wire branch), the Dispatcher raises the PROMOTION of that branch to the default branch, once, as a draft. A draft is a proposal in a queue and carries no authority: the Dispatcher never marks it ready, approves, merges, enables auto-merge, syncs or edits a branch. The event that tells it is the merge itself, read as data; no code of the merged branch runs. At most one PROMOTION of a branch is open, a PROMOTION that was closed by hand for a revision is not raised again for that revision, and raising is idempotent per branch and revision. What reviews and merges a PROMOTION is unchanged.

Owner: release management.
`````

## Draft of F70.md

`````
---
id: release/F70
title: raise-on-final-step
kind: functional
serves: [release/I52]
---
# release/F70 raise-on-final-step

A pull request that merged into `kaal/<capability>/<concern>`, `hotfix/<name>` or `wire/<name>` is a final step only when its class says so: an ACT into a collector, recognised by the chapters of the ACT template (`Change` and `Records`, nothing else); a HOTFIX into a hotfix branch, recognised by its `Defect` chapter; any pull request into a wire branch that is not a PLAN, a DO or a SYNC. A PLAN, a DO, a SYNC, a pull request that did not merge, a merge into any other branch, and a merge without a merge commit are not final steps, and each is reported with its reason. The raise is a draft pull request from the branch to the default branch, titled `PROMOTION:` with the Change line of the merged pull request, with the two chapters of the PROMOTION template and nothing taken from anywhere but the event. It is made only when the variable `KAAL_DISPATCH_RAISE` is `on`; otherwise it is a dry run that says what it would raise. A branch that already has an open PROMOTION gets no second one. The tip of the branch read just before the write must be the merge commit of the event, or nothing is raised.
`````

## Draft of A65.md

`````
---
id: release/A65
title: raise-from-the-event
addresses: [release/F70]
---
# release/A65 raise-from-the-event

A workflow source `05-src/wiring/workflows/dispatcher-raise.yml` runs on `pull_request` closed, for pull requests into `kaal/**`, `hotfix/**` and `wire/**`, only when the pull request merged. It never uses `pull_request_target`, never checks out the pull request or its branch, and passes the event to the script only through `env`, never inside a shell command. Its `classify Dispatch` job (`contents: read`) checks out the default branch and runs `dispatch.mjs final`, which calls the pure `decideFinal` of `05-src/promotion-raise/final-step.mjs` on the event and prints the decision as data. Its `raise Dispatch` job is the one of release/C73 (`permissions: {}`, the App token minted only when `KAAL_DISPATCH_RAISE` is `on`, `pull_request: write` only); `raise.mjs` creates the pull request with `draft: true` and keeps its look for an earlier PROMOTION of the revision and its re-read of the tip. The workflow definition read at the event is the one of the integration branch: it is the same as the default branch's when the branch is synchronized, and a branch without it raises nothing until a SYNC brings it. The scan of release/C73 no longer runs on a schedule: `dispatcher.yml` keeps only its manual start, until the PICK returns a schedule as a safety net.
`````

## Draft of final-step.mjs

`````
// The final step of work merged into an integration branch, read from the event alone (release/C93). Pure: no network, no branch code.
const CLASSES = [
  ['KAAL', /^kaal\/[a-z0-9-]+\/[a-z0-9-]+$/],
  ['HOTFIX', /^hotfix\/[a-z0-9-]+$/],
  ['WIRE', /^wire\/[a-z0-9-]+$/],
];
const chapters = (body) => [...String(body ?? '').matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);
export function stepOf(body) {
  const c = chapters(body);
  if (c.includes('From')) return 'PLAN';
  if (c.includes('Implement')) return 'DO';
  if (c.includes('Defect')) return 'HOTFIX';
  if (c.includes('Records') && c.length === 2 && c[0] === 'Change') return 'ACT';
  if (c.includes('Reason') && !c.includes('Records')) return 'SYNC';
  return 'unknown';
}
export function decideFinal(event) {
  const { merged, base, mergeSha, body } = event ?? {};
  const skip = (reason, detail = '') => ({ action: 'skip', reason, detail });
  if (merged !== true) return skip('not-merged');
  const cls = CLASSES.find(([, re]) => re.test(String(base)));
  if (!cls) return skip('not-an-integration-branch', String(base));
  if (!/^[0-9a-f]{40}$/.test(String(mergeSha))) return skip('no-revision');
  const step = stepOf(body);
  const final = cls[0] === 'KAAL' ? step === 'ACT' : cls[0] === 'HOTFIX' ? step === 'HOTFIX' : !['PLAN', 'DO', 'SYNC'].includes(step);
  if (!final) return skip('not-a-final-step', `${cls[0]}: ${step}`);
  const line = /^## Change[ \t]*\n+([^\n#][^\n]*)/m.exec(String(body))?.[1]?.trim();
  if (!line) return skip('no-change-line');
  return {
    action: 'raise', head: base, base: 'main', revision: mergeSha, class: cls[0], step,
    title: `PROMOTION: ${line}`,
    body: `## Change\n\n${line}: ${step}\n\n## Why now\n\nThe final step of this Change merged into ${base}. This draft was raised by the Dispatcher; it is picked when the seat is free.\n`,
  };
}
`````

## Draft of dispatcher-raise.yml

`````
# The event raise of the Dispatcher (release/C93, release/I52). When the final step of work merges into an integration branch, the PROMOTION of
# that branch is raised as a draft. It reads the event as data: no pull_request_target, no checkout of the pull request, and the event reaches
# the script only through env. Live only when the variable KAAL_DISPATCH_RAISE is exactly `on`; otherwise a dry run.
name: Dispatcher raise

on:
  pull_request:
    types: [closed]
    branches:
      - 'kaal/**'
      - 'hotfix/**'
      - 'wire/**'

permissions: {}

concurrency:
  group: dispatch-raise-${{ github.event.pull_request.base.ref }}
  cancel-in-progress: false

jobs:
  classify:
    name: classify Dispatch
    if: ${{ github.event.pull_request.merged == true }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      decisions: ${{ steps.final.outputs.decisions }}
    steps:
      - name: Check out the default branch
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ github.event.repository.default_branch }}
          persist-credentials: false

      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 24

      - name: Classify the merge
        id: final
        env:
          KAAL_REPO: ${{ github.repository }}
          KAAL_PR_MERGED: ${{ github.event.pull_request.merged }}
          KAAL_PR_BASE: ${{ github.event.pull_request.base.ref }}
          KAAL_PR_MERGE_SHA: ${{ github.event.pull_request.merge_commit_sha }}
          KAAL_PR_BODY: ${{ github.event.pull_request.body }}
        run: node engineering/release-management/05-src/promotion-raise/dispatch.mjs final

  raise:
    name: raise Dispatch
    needs: classify
    if: ${{ needs.classify.outputs.decisions != '' && needs.classify.outputs.decisions != '[]' }}
    runs-on: ubuntu-latest
    permissions: {}
    env:
      KAAL_REPO: ${{ github.repository }}
      KAAL_DECISIONS: ${{ needs.classify.outputs.decisions }}
      KAAL_DISPATCH_RAISE: ${{ vars.KAAL_DISPATCH_RAISE }}
    steps:
      - name: Check out the default branch
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ github.event.repository.default_branch }}
          persist-credentials: false

      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 24

      - name: Mint the Dispatcher token
        id: app
        if: ${{ vars.KAAL_DISPATCH_RAISE == 'on' }}
        uses: actions/create-github-app-token@f418cff399f7aef4c2f0ad47e25ca7a6abbdd6fc # v3.4.0
        with:
          app-id: ${{ vars.KAAL_DISPATCHER_APP_ID }}
          private-key: ${{ secrets.KAAL_DISPATCHER_KEY }}
          permission-pull-requests: write

      - name: Raise
        env:
          GH_TOKEN: ${{ steps.app.outputs.token }}
        run: node engineering/release-management/05-src/promotion-raise/dispatch.mjs raise
`````

## Draft of dispatch-final.mjs

`````
// Added to dispatch.mjs (release/C93): the command `final`, and one changed line in raise.mjs.
import { decideFinal } from './final-step.mjs';
// in main(cmd, env):
  if (cmd === 'final') {
    const d = decideFinal({ merged: env.KAAL_PR_MERGED === 'true', base: env.KAAL_PR_BASE, mergeSha: env.KAAL_PR_MERGE_SHA, body: env.KAAL_PR_BODY });
    console.log(JSON.stringify(d));
    const line = JSON.stringify(d.action === 'raise' ? [d] : []);
    if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `decisions=${line}\n`);
    return 0;
  }
// in raise.mjs the creation becomes: await api('POST', `repos/${repo}/pulls`, { title: v.title, head: v.head, base: v.base, body: v.body, draft: true });
`````

## Draft of dispatcher-trigger.yml

`````
on:
  workflow_dispatch:
`````
