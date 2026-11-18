# C92 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of I51.md

`````
---
id: release/I51
title: the Dispatcher tells the truth about every collector
---
# release/I51 the Dispatcher tells the truth about every collector

Contract: for every collector the Dispatcher gives one verdict that names the collector and says whether its work is ready to be raised, judged from test evidence and from nothing else. A collector is ready when everything except the evidence of its ACT is GREEN, ACT is allowed only then, and the work is done when ACT is GREEN too. The verdict never depends on whether the seat is free, on how old the work is, on how far behind `main` it is or on an earlier closed pull request: those are facts shown beside it. The seat is a separate line. The order of the list is labelled, and is not a priority.

Owner: release management.
`````

## Draft of F69.md

`````
---
id: release/F69
title: honest-verdict
kind: functional
serves: [release/I51]
---
# release/F69 honest-verdict

Every decision of the Dispatcher names its collector. The verdict is one of `raisable`, `not-ready`, `unknown`, `already-open`, `nothing-to-promote` or `not-a-collector`, and a `not-ready` or `unknown` verdict says why. `raisable` means only that the collector qualifies; whether the seat is free is the separate line `seat` (`free` or `taken`) and never replaces or hides the verdict. Readiness follows the rule of the Intent: GREEN everywhere except ACT before ACT, ACT GREEN after. A collector with a RED Case is not ready; an ACT present while a Case is RED is reported as `act-before-green`; evidence that cannot be read completely is `unknown`, and UNKNOWN never passes. The behind-main count, the age of the newest commit and the earlier pull requests of the collector (number and state) are facts beside the verdict, not filters. The list is ordered by collector name, each decision carries its position and the label of the order, and the same facts give the same list.
`````

## Draft of A64.md

`````
---
id: release/A64
title: verdict-from-evidence
addresses: [release/F69]
---
# release/A64 verdict-from-evidence

A pure module `05-src/promotion-raise/verdict.mjs` holds `readiness`, `verdict`, `seated` and `ordered`; the module `gather.mjs` gains `gatherEvidence`. The decide job runs from `main`: the collector is read only as Git data, through GET requests for the files that differ from `main` (a list of 300 or more is incomplete and gives UNKNOWN), its tip and its earlier pull requests, and nothing of the collector is imported or run. Readiness counts, among the files that differ from `main` and are not removed, the Cases still named `.red.mjs` (RED) and the Change folders with an `act.md` (ACT present). The counts have the shape `{red, green, unknown}` of the ratchet of release-management's Testing (kaal-change), so that judge replaces the file count when it is on `main`; no second counter is kept. Seat and order are applied after the verdicts: `seated` marks `free` or `taken` by capacity and open pull requests into `main`, and only a `raisable` collector with a free seat keeps `action: raise`, with a title and body derived from its Change folders. `dispatch.mjs decide` uses these in place of `decideRaise` and `oneAtATime`; `raise.mjs` and the workflow are unchanged.
`````

## Draft of verdict.mjs

`````
// The verdict of the Dispatcher for one collector (release/C92). Pure: facts in, a decision out.
const COLLECTOR = /^kaal\/([a-z0-9-]+)\/[a-z0-9-]+$/;
const CHANGE_FILE = /(?:^|\/)00-changes\/(C\d+)[^/]*\/([^/]+)$/;
export const ORDER_LABEL = 'collector name (not a priority)';
export function readiness({ files, complete } = {}) {
  if (complete !== true || !Array.isArray(files)) return { state: 'unknown', red: null, changes: [], reason: 'the files that differ from main are not completely listed' };
  const red = files.filter((f) => /\.red\.mjs$/.test(f)).length;
  const acts = new Map();
  for (const f of files) { const m = CHANGE_FILE.exec(f); if (m) acts.set(m[1], acts.get(m[1]) === true || m[2] === 'act.md'); }
  const changes = [...acts.keys()].sort();
  const pending = changes.filter((c) => !acts.get(c));
  if (!changes.length) return { state: 'not-ready', red, changes, reason: 'no Change folder differs from main' };
  if (red > 0 && pending.length < changes.length) return { state: 'not-ready', red, changes, reason: 'act-before-green' };
  if (red > 0) return { state: 'not-ready', red, changes, reason: `${red} Case(s) still RED` };
  if (pending.length) return { state: 'not-ready', red, changes, reason: `act pending for ${pending.join(', ')}` };
  return { state: 'ready', red, changes, reason: 'all Cases GREEN and every Change has its ACT' };
}
export function verdict(facts, now = Date.now()) {
  const { collector, aheadOfMain, behindMain = null, tipDate = null, closedPromotions = [], open = [], tip } = facts;
  const out = (v, reason, extra = {}) => ({
    collector: String(collector), verdict: v, reason, action: 'none',
    facts: { ahead: aheadOfMain ?? null, behind: behindMain, tipAgeDays: tipDate ? Math.floor((now - Date.parse(tipDate)) / 864e5) : null, earlierPromotions: closedPromotions.map((p) => ({ number: p.number, state: p.state })) },
    ...extra,
  });
  const m = COLLECTOR.exec(String(collector));
  if (!m) return out('not-a-collector', String(collector));
  const promo = open.find((p) => p.base === 'main' && p.head === collector);
  if (promo) return out('already-open', `#${promo.number}`);
  if (!(aheadOfMain > 0)) return out('nothing-to-promote', 'the collector holds nothing main lacks');
  const r = readiness({ files: facts.files, complete: facts.filesComplete });
  if (r.state === 'unknown') return out('unknown', r.reason, { readiness: r });
  if (r.state === 'not-ready') return out('not-ready', r.reason, { readiness: r });
  const ids = r.changes.map((c) => `${m[1]}/${c}`);
  return out('raisable', r.reason, {
    readiness: r, revision: tip, head: collector, base: 'main',
    title: `PROMOTION: ${ids.join(', ')} (${collector})`,
    body: `## Change\n\n${ids.join(', ')}\n\n## Reason\n\nevery Case of the collector is GREEN and every Change has its ACT; the collector is ahead of main by ${aheadOfMain} commit(s).\n`,
  });
}
export function seated(decisions, { openPromotions = [], capacity = 1 } = {}) {
  let room = capacity - openPromotions.length;
  return decisions.map((d) => {
    if (d.verdict !== 'raisable') return { ...d, seat: 'n/a' };
    if (room > 0) { room -= 1; return { ...d, seat: 'free', action: 'raise' }; }
    return { ...d, seat: 'taken', action: 'none' };
  });
}
export function ordered(decisions) {
  return [...decisions].sort((a, b) => (a.collector < b.collector ? -1 : a.collector > b.collector ? 1 : 0)).map((d, i) => ({ ...d, order: i + 1, orderedBy: ORDER_LABEL }));
}
`````

## Draft of gather-evidence.mjs

`````
// Added to gather.mjs (release/C92). GET only; the collector is read as data and never run.
export async function gatherEvidence(api, repo, collector) {
  const owner = repo.split('/')[0];
  const cmp = await api('GET', `repos/${repo}/compare/main...${collector}`);
  const ref = await api('GET', `repos/${repo}/git/ref/heads/${collector}`);
  const all = await api('GET', `repos/${repo}/pulls?state=all&head=${owner}:${collector}&base=main&per_page=30`);
  const files = cmp.files || [];
  return {
    collector, aheadOfMain: cmp.ahead_by, behindMain: cmp.behind_by, tip: ref.object.sha,
    tipDate: (cmp.commits || []).at(-1)?.commit?.committer?.date ?? null,
    files: files.filter((f) => f.status !== 'removed').map((f) => f.filename), filesComplete: files.length < 300,
    closedPromotions: all.filter((p) => p.state === 'closed').map((p) => ({ number: p.number, state: p.merged_at ? 'merged' : 'closed' })),
    open: all.filter((p) => p.state === 'open').map((p) => ({ number: p.number, title: p.title, base: p.base.ref, head: p.head.ref })),
  };
}
`````
