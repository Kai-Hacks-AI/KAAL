import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findControls } from './find-controls.mjs';
export const DIRT = ['designed', 'implemented', 'running', 'tested'];
export function checkControls(files) {
  const { controls } = findControls(files);
  const problems = controls.flatMap((c) => c.problems.map((p) => ({ path: c.path, id: c.id, ...p })));
  return { ok: problems.length === 0, controls, problems };
}
const gather = (d, f = []) => { for (const n of readdirSync(d)) { if (n === 'node_modules' || n === '.git') continue; const p = join(d, n); if (statSync(p).isDirectory()) gather(p, f); else if (/\.(md|mjs)$/.test(n)) f.push({ path: p, text: readFileSync(p, 'utf8') }); } return f; };
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = checkControls(gather(process.argv[2] ?? '.'));
  for (const c of r.controls) console.log(`${c.id} ${c.status ?? 'none'} ${c.valid ? 'valid' : 'invalid'} ${c.path}`);
  for (const p of r.problems) console.error(`${p.path}: ${p.id}: ${p.reason}\n  ${p.recovery}`);
  process.exit(r.ok ? 0 : 1);
}
