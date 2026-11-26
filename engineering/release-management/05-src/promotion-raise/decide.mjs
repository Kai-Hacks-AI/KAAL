// Decides, from facts about one collector, whether its PROMOTION is to be raised (release/I39). A pure function.
const COLLECTOR = /^kaal\/[a-z0-9-]+\/[a-z0-9-]+$/;
export function decideRaise(facts) {
  const { collector, aheadOfMain, merged = [], open = [] } = facts;
  const skip = (reason, detail = '') => ({ action: 'skip', reason, detail });
  if (!COLLECTOR.test(String(collector))) return skip('not-a-collector', String(collector));
  const promo = open.find((p) => p.base === 'main' && p.head === collector);
  if (promo) return skip('already-open', `#${promo.number}`);
  if (!(aheadOfMain > 0)) return skip('nothing-to-promote');
  const last = merged.find((p) => !/^SYNC:/.test(p.title));
  if (!last || !/^ACT:/.test(last.title)) return skip('not-ready', last ? `the newest merge is #${last.number}, not an ACT` : 'nothing merged');
  const change = /^## Change\n\n([^\n]+)/m.exec(last.body || '');
  if (!change) return skip('no-change-id', `#${last.number}`);
  return {
    action: 'raise', head: collector, base: 'main',
    title: `PROMOTION: ${last.title.replace(/^ACT:\s*/, '')}`,
    body: `## Change\n\n${change[1]}\n\n## Reason\n\nthe ACT #${last.number} of this collector merged, and the collector is ahead of main by ${aheadOfMain} commit(s).\n`,
  };
}
