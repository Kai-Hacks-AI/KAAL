// Case release/T1314 tests: release/A77
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const LIB = join(RM, '05-src/phase/lib');
const use = (name) => { const f = join(LIB, name); assert.ok(existsSync(f), `lib/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'release/T1314';
export const tests = ['release/A77'];
export const title = 'the layers stay one-way: the library imports no judge and no layer above it, and no judge imports another judge';
const LAYERS = ['tree', 'collector', 'cases-green', 'write-map', 'result', 'tree-facts', 'attribute-changes'];
const BELOW = { tree: [], collector: ['tree'], 'cases-green': [], 'write-map': [], result: [], 'tree-facts': ['tree', 'collector'], 'attribute-changes': [] };
// The static imports of a module as written: import ... from '<spec>' and export ... from '<spec>'.
const importsOf = (file) => [...readFileSync(file, 'utf8').matchAll(/^\s*(?:import|export)\b[^;'"]*?\bfrom\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export async function run() {
  assert.ok(existsSync(LIB), 'lib/ is absent');
  const modules = readdirSync(LIB).filter((f) => f.endsWith('.mjs')).map((f) => f.replace(/\.mjs$/, ''));
  assert.deepEqual(modules.sort(), [...LAYERS].sort(), 'the library holds exactly the layers');
  for (const m of modules) for (const spec of importsOf(join(LIB, `${m}.mjs`))) {
    if (spec.startsWith('node:')) { assert.ok(spec !== 'node:child_process', `${m} must not start processes (Git is not read)`); continue; }
    const target = spec.replace(/^\.\//, '').replace(/\.mjs$/, '');
    assert.ok(BELOW[m].includes(target), `lib/${m}.mjs imports ${spec}, which is not a layer below it`);
  }
  const PHASE = join(RM, '05-src/phase');
  const judges = readdirSync(PHASE).filter((f) => /^judge-.*\.mjs$/.test(f));
  assert.ok(judges.length >= 2, 'the judges are absent');
  for (const j of judges) for (const spec of importsOf(join(PHASE, j))) {
    assert.ok(spec.startsWith('node:') || /^\.\/lib\/[\w-]+\.mjs$/.test(spec), `${j} imports ${spec}: a judge imports Node and the library, nothing else`);
  }
}
