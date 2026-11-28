#!/usr/bin/env node
// DEPRECATED shim: the command line of the finder, kept at its old path for callers that have not moved to hosting yet.
// It is not published (package.json files). The library is lib/find-controls.mjs. Delete this file when its callers read through hosting.
//
//   node find-controls.mjs [directory]     prints { controls, refused } as JSON
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findControls } from './lib/find-controls.mjs';
export { findControls };

function gather(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) gather(path, found);
    else if (/\.(md|mjs|json)$/.test(name) && name !== 'package-lock.json') found.push({ path, text: readFileSync(path, 'utf8').replace(/\r\n/g, '\n') });
  }
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const at = process.argv.indexOf('--stations');
  const stations = at < 0 ? [] : process.argv[at + 1].split(',').map((n) => n.trim()).filter(Boolean);
  console.log(JSON.stringify(findControls(gather(process.argv.slice(2).filter((x, j, v) => x !== '--stations' && v[j - 1] !== '--stations')[0] ?? '.'), { stations }), null, 2));
}
