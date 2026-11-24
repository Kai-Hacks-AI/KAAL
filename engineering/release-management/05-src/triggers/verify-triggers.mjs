// verify Triggers: does a change add or raise a workflow that uses pull_request_target? It reports findings and hands the verdict to the shared ratchet (kaal-controls judge-mode).
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const TARGET = 'pull_request_target';
// The accepted baseline of the ratchet is a file kept with the control (release/C131), a sorted JSON list of workflow paths. The judge reads it as Git data from the base (previous) and from the head (baseline).
export const BASELINE = 'engineering/release-management/04-controls/CTL20-gate-verify-triggers/baseline.json';

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
export const findingsOf = (tree) => Object.keys(tree).filter((p) => /\.ya?ml$/.test(p) && uses(tree[p])).sort();

const listOf = (text) => { try { const x = JSON.parse(text); return Array.isArray(x) ? x : null; } catch { return null; } };

// previous: the accepted baseline, the baseline file of the base, read as Git data, never a file of the pull request. baseline: the baseline file of the head. A pull request that resolves a use names it out of the file in the same change, or the allowance is stale (controls' ratchet says so).
export function judge({ base, head }) {
  if (!base || !head || !Object.keys(base).length) return { verdict: 'UNKNOWN', reasons: ['the base or the head workflows could not be read'] };
  if (!judgeMode) return { verdict: 'UNKNOWN', reasons: ['judge-mode is absent on the base'] };
  const previous = listOf(base[BASELINE]);
  if (!previous) return { verdict: 'UNKNOWN', reasons: ['the accepted baseline of the base could not be read'] };
  const baseline = listOf(head[BASELINE]);
  if (!baseline) return { verdict: 'UNKNOWN', reasons: ['the baseline of the head could not be read'] };
  const findings = findingsOf(head);
  const r = judgeMode({ mode: 'ratchet', findings, baseline, previous });
  if (r.verdict === 'UNKNOWN') return { verdict: 'UNKNOWN', reasons: [`the ratchet could not judge: ${r.reason}`] };
  const reasons = [
    ...(r.new ?? []).map((p) => `${p} uses ${TARGET} and did not on the base`),
    ...(r.grew ?? []).map((p) => `${p} is in the baseline of the head and not in the accepted baseline of the base`),
    ...(r.stale ?? []).map((p) => `${p} is in the baseline and no longer uses ${TARGET}: take it out of the baseline in the same change`),
  ];
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
  try { out[BASELINE] = git('show', `${ref}:${BASELINE}`); } catch { /* absent: the judge answers UNKNOWN */ }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try { r = judge({ base: read(arg('--root') || '.', arg('--base')), head: read(arg('--root') || '.', arg('--head')) }); } catch (e) { r = { verdict: 'UNKNOWN', reasons: [String(e.message)] }; }
  console.log(`${r.verdict}${r.reasons.length ? `: ${r.reasons.join('; ')}` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
