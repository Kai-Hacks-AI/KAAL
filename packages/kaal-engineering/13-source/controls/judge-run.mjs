#!/usr/bin/env node
// Applies a mode to the answer of a check, as judge-mode.mjs did, with the files read through Hosting.
//   node judge-run.mjs --mode <detective|preventive|ratchet> --findings <file> [--baseline <file>] [--previous <file>]
import { judgeMode } from '../../../kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs';
import { jsonOf } from './hosting-files.mjs';

const a = Object.fromEntries(process.argv.slice(2).reduce((r, x, i, v) => (x.startsWith('--') ? [...r, [x.slice(2), v[i + 1]]] : r), []));
let r;
try { r = judgeMode({ mode: a.mode, findings: (await jsonOf(a.findings)) ?? null, baseline: await jsonOf(a.baseline), previous: await jsonOf(a.previous) }); }
catch (e) { r = { mode: a.mode, verdict: 'UNKNOWN', blocked: true, reason: e.reason ?? 'could-not-judge', file: e.message }; }
console.log(JSON.stringify(r, null, 2));
process.exit(r.verdict === 'UNKNOWN' ? 2 : r.blocked ? 1 : 0);
