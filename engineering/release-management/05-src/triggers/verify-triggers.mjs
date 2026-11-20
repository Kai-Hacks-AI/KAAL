// verify Triggers: does a change add or raise a workflow that uses pull_request_target?
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

export function judge({ base, head }) {
  if (!base || !head || !Object.keys(base).length) return { verdict: 'UNKNOWN', reasons: ['the base or the head workflows could not be read'] };
  const n = (m) => Object.keys(m).filter((p) => uses(m[p])).length;
  const reasons = [];
  for (const p of Object.keys(head)) if (uses(head[p]) && !(p in base && uses(base[p]))) reasons.push(`${p} uses ${TARGET} and did not on the base`);
  if (n(head) > n(base)) reasons.push(`the count of workflows that use ${TARGET} rises from ${n(base)} to ${n(head)}`);
  return { verdict: reasons.length ? 'FAIL' : 'PASS', reasons, base: n(base), head: n(head) };
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
