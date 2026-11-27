#!/usr/bin/env node
// The controls of a station at a revision, as registry.mjs did, with the revision read through Hosting.
//   node registry-run.mjs --repo <directory> --base <ref> --station <name>
import { registryAt } from '../../../kaal-controls/skills/kaal-controls/scripts/registry.mjs';
import { entriesAt } from './hosting-files.mjs';

const a = Object.fromEntries(process.argv.slice(2).reduce((r, x, i, v) => (x.startsWith('--') ? [...r, [x.slice(2), v[i + 1]]] : r), []));
console.log(JSON.stringify(registryAt(await entriesAt(a.repo, a.base), a.station), null, 2));
