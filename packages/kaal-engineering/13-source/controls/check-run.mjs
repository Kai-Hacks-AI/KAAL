#!/usr/bin/env node
// Checks the controls of a directory, as check-controls.mjs did, with the files read through Hosting.
//   node check-run.mjs <directory> [--records <file.json|directory>]
import { checkControls } from '../../../kaal-controls/skills/kaal-controls/scripts/check-controls.mjs';
import { filesOf, recordsOf } from './hosting-files.mjs';

const a = process.argv.slice(2);
const i = a.indexOf('--records');
const dir = a.filter((x, j) => i < 0 || (j !== i && j !== i + 1))[0] ?? '.';
const r = checkControls(await filesOf(dir, ['md', 'mjs', 'json'], { except: ['package-lock.json'] }), i >= 0 ? await recordsOf(a[i + 1]) : null);
for (const c of r.controls) console.log(`${c.id} ${c.status ?? 'none'} ${c.valid ? 'valid' : 'invalid'} ${c.path}`);
for (const p of r.problems) console.error(`${p.path}: ${p.id}: ${p.reason}\n  ${p.recovery}`);
process.exit(r.ok ? 0 : 1);
