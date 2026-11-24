import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findControls } from './find-controls.mjs';
import { judgeEvidence, readRecords } from './evidence.mjs';
export const DIRT = ['designed', 'implemented', 'running', 'tested'];
// Without records the check only reads declarations. With records, every control that claims `tested` must have its minimum met.
export function checkControls(files, records = null) {
  const { controls } = findControls(files);
  const problems = controls.flatMap((c) => c.problems.map((p) => ({ path: c.path, id: c.id, ...p })));
  for (const c of records ? controls.filter((x) => x.status === 'tested' && x.valid) : []) {
    const v = judgeEvidence(c, records);
    if (v.verdict !== 'PASS') problems.push({ path: c.path, id: c.id, field: 'status', reason: `tested is not shown: ${v.reason}`, recovery: 'Record the evidence the control declares as its minimum, or claim running until it is recorded. See references/judging-status.md.' });
  }
  return { ok: problems.length === 0, controls, problems };
}
const gather = (d, f = []) => { for (const n of readdirSync(d)) { if (n === 'node_modules' || n === '.git') continue; const p = join(d, n); if (statSync(p).isDirectory()) gather(p, f); else if (/\.(md|mjs|json)$/.test(n) && n !== 'package-lock.json') f.push({ path: p, text: readFileSync(p, 'utf8') }); } return f; };
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const i = a.indexOf('--records');
  const r = checkControls(gather(a.filter((x, j) => i < 0 || (j !== i && j !== i + 1))[0] ?? '.'), i >= 0 ? readRecords(a[i + 1]) : null);
  for (const c of r.controls) console.log(`${c.id} ${c.status ?? 'none'} ${c.valid ? 'valid' : 'invalid'} ${c.path}`);
  for (const p of r.problems) console.error(`${p.path}: ${p.id}: ${p.reason}\n  ${p.recovery}`);
  process.exit(r.ok ? 0 : 1);
}
