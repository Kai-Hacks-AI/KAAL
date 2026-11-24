// verify Triggers: does a change add or raise a workflow that uses pull_request_target? It reports findings and hands the verdict to the shared ratchet (kaal-controls judge-mode).
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const TARGET = 'pull_request_target';

// A workflow uses the trigger only when its top-level `on:` names it. Comments and strings do not count.
export function uses(text) {
  const lines = text.split('\n').map((l) => l.replace(/\s+#.*$/, '').replace(/^#.*$/, ''));
  const at = lines.findIndex((l) => /^["']?on["']?\s*:/.test(l));
  if (at < 0) return false;
  const rest = lines[at].replace(/^["']?on["']?\s*:\s*/, '').trim();
  if (rest) return rest.replace(/[\[\]\s]/g, '').split(',').includes(TARGET);
  const block = [];
  for (const l of lines.slice(at + 1)) { if (l.trim() === '') continue; if (/^\S/.test(l)) break; block.push(l); }
  if (!block.length) return false;
  const indent = Math.min(...block.map((l) => l.match(/^ */)[0].length));
  return block.some((l) => l.match(/^ */)[0].length === indent && (new RegExp(`^ {${indent}}(-\\s*)?${TARGET}\\s*:?\\s*$`)).test(l));
}

// The ratchet rule is written once, in kaal-controls' judge-mode. This judge only reports findings and hands them over.
// If judge-mode is absent on the base, the answer is UNKNOWN, which never passes.
let judgeMode = null;
try { ({ judgeMode } = await import(new URL('../../../../packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs', import.meta.url).href)); } catch { judgeMode = null; }

// The findings of a tree: the sorted paths of the workflows that use the trigger.
export const findingsOf = (tree) => Object.keys(tree).filter((p) => uses(tree[p])).sort();

// previous: the findings of the base, read as Git data, never a file of the pull request. baseline: previous without what the head resolved, so an improvement leaves no stale allowance.
export function judge({ base, head }) {
  if (!base || !head || !Object.keys(base).length) return { verdict: 'UNKNOWN', reasons: ['the base or the head workflows could not be read'] };
  if (!judgeMode) return { verdict: 'UNKNOWN', reasons: ['judge-mode is absent on the base'] };
  const previous = findingsOf(base);
  const findings = findingsOf(head);
  const baseline = previous.filter((f) => findings.includes(f));
  const r = judgeMode({ mode: 'ratchet', findings, baseline, previous });
  if (r.verdict === 'UNKNOWN') return { verdict: 'UNKNOWN', reasons: [`the ratchet could not judge: ${r.reason}`] };
  const reasons = (r.new ?? []).map((p) => `${p} uses ${TARGET} and did not on the base`);
  return { verdict: r.verdict, reasons, base: previous.length, head: findings.length, findings, previous, ...(r.next ? { next: r.next } : {}) };
}

export function readTree(dir) {
  const out = {};
  for (const f of readdirSync(dir)) if (/\.ya?ml$/.test(f)) out[`.github/workflows/${f}`] = readFileSync(join(dir, f), 'utf8');
  return out;
}

export function read(root, ref) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' });
  git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`);
  const out = {};
  for (const p of git('ls-tree', '-r', '--name-only', ref, '--', '.github/workflows').split('\n').filter((x) => /\.ya?ml$/.test(x))) out[p] = git('show', `${ref}:${p}`);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try { r = judge({ base: read(arg('--root') || '.', arg('--base')), head: read(arg('--root') || '.', arg('--head')) }); } catch (e) { r = { verdict: 'UNKNOWN', reasons: [String(e.message)] }; }
  console.log(`${r.verdict}${r.reasons.length ? `: ${r.reasons.join('; ')}` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
