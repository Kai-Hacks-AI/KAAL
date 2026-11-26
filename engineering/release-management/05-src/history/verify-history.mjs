// verify History: was main only moved forward?
import { execFileSync } from 'node:child_process';

const ZERO = /^0+$/;

// before, after: commit ids ('' or all zero means no commit). forward: whether before is an ancestor of after, or undefined when it cannot be told.
export function judge({ before, after, forward }) {
  if (!after || ZERO.test(after)) return { verdict: 'UNKNOWN', reasons: ['there is no commit after the push; this check does not observe a deletion of main'] };
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
