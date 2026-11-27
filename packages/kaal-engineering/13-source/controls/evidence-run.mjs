#!/usr/bin/env node
// Judges the evidence of the controls that claim `tested`, as evidence.mjs did, with the files read through Hosting.
//   node evidence-run.mjs <directory> [--records <file.json|directory>] [--json]
import { judgeEvidence, stateLine } from '../../../kaal-controls/skills/kaal-controls/scripts/evidence.mjs';
import { findControls } from '../../../kaal-controls/skills/kaal-controls/scripts/find-controls.mjs';
import { filesOf, recordsOf } from './hosting-files.mjs';

const a = process.argv.slice(2);
const i = a.indexOf('--records');
const records = i >= 0 ? await recordsOf(a[i + 1]) : [];
const dir = a.filter((x, j) => x !== '--json' && (i < 0 || (j !== i && j !== i + 1)))[0] ?? '.';
const found = findControls(await filesOf(dir, ['md', 'mjs'])).controls.filter((c) => c.evidence?.length);
const out = found.map((c) => ({ control: c, verdict: judgeEvidence(c, records) }));
if (a.includes('--json')) console.log(JSON.stringify(out.map((o) => o.verdict), null, 2));
else for (const o of out) console.log(stateLine(o.control, o.verdict));
process.exit(out.every((o) => o.control.status !== 'tested' || o.verdict.verdict === 'PASS') ? 0 : 1);
