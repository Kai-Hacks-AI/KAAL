// The Case files of the Changes a collector carries (release/C135): the files Testing's `run` is asked to run on a pull request into a collector.
//   node list-carried-cases.mjs --main <default branch folder> --pr <merge result folder>
// Prints one path per line, relative to the merge result, sorted, and nothing else. It reads files only: it runs no Case and imports nothing of Testing.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capabilityRoots, carriedFolders } from './lib/tree-facts.mjs';
import { applicableCases } from './lib/collector.mjs';

// Pure over the folders: the Cases that apply to every carried Change, each as a path from the root of the merge result. Several Changes may share a Case: it is listed once.
export function carriedCaseFiles(main, collector) {
  const roots = capabilityRoots(collector);
  const files = carriedFolders(main, collector, roots).flatMap((c) => applicableCases(join(collector, c.root), c.dir).map((k) => join(c.root, k.path)));
  return [...new Set(files)].sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  const main = arg('--main'), pr = arg('--pr');
  if (!main || !pr) { console.error('usage: list-carried-cases.mjs --main <folder> --pr <folder>'); process.exit(2); }
  for (const f of carriedCaseFiles(main, pr)) console.log(f);
}
