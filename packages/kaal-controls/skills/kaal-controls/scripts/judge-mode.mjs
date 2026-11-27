#!/usr/bin/env node
// DEPRECATED shim: the command line of judge-mode, kept at its old path for callers that have not moved to hosting yet (controls/C160).
// It is not published (package.json files). The library is lib/judge-mode.mjs. Delete this file when its callers read through hosting.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { judgeMode } from './lib/judge-mode.mjs';
export * from './lib/judge-mode.mjs';
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = Object.fromEntries(process.argv.slice(2).reduce((r, x, i, v) => (x.startsWith('--') ? [...r, [x.slice(2), v[i + 1]]] : r), []));
  const read = (p) => {
    if (!p) return undefined;
    let text;
    try { text = readFileSync(p, 'utf8'); } catch { throw Object.assign(new Error(p), { reason: 'unreadable-input' }); }
    try { return JSON.parse(text); } catch { throw Object.assign(new Error(p), { reason: 'malformed-input' }); }
  };
  let r;
  try { r = judgeMode({ mode: a.mode, findings: read(a.findings) ?? null, baseline: read(a.baseline), previous: read(a.previous) }); }
  catch (e) { r = { mode: a.mode, verdict: 'UNKNOWN', blocked: true, reason: e.reason ?? 'could-not-judge', file: e.message }; }
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.verdict === 'UNKNOWN' ? 2 : r.blocked ? 1 : 0);
}
