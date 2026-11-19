// Case testing/T369 tests: testing/N30, testing/N31. Boundary, determinism and Node 24.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { IMPL, PKG, fx, load, present, readJson, PARTS, SCHEMA } from './lib.mjs';
export const id = 'testing/T369';
export const tests = ['testing/N30', 'testing/N31'];
export const title = 'the runner adds one export, one bin and no dependency, writes nothing under the root, reports the same twice, and is accepted only on Node 24';
const snap = (dir) => {
  const out = {};
  const walk = (d) => { for (const n of readdirSync(d).sort()) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : (out[p.slice(dir.length)] = createHash('sha256').update(readFileSync(p)).digest('hex')); } };
  walk(dir);
  return out;
};
export async function run() {
  present();
  const pkg = readJson(join(IMPL, 'package.json'));
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['@kaihacksai/kaal-hosting', 'c8'], 'no dependency beyond Hosting is added');
  assert.deepEqual(Object.keys(pkg.exports).sort(), ['./acceptance', './attribution', './contracts', './coverage', './duplicates', './inventory', './package.json', './report', './run'], 'the exports gain only ./run');
  assert.equal(pkg.exports['./run'], './lib/run.mjs');
  assert.deepEqual(pkg.bin, { 'kaal-testing': './bin/kaal-testing.mjs' }, 'one bin');
  assert.ok(pkg.files.includes('bin'), 'the bin is published');
  assert.equal(pkg.engines.node, '>=24');
  for (const p of PARTS) assert.ok(existsSync(join(IMPL, p)), `${p} is delivered in the package`);
  const src = PARTS.map((p) => readFileSync(join(IMPL, p), 'utf8')).join('\n');
  const imports = [...src.matchAll(/from\s+'([^'.][^']*)'/g)].map((m) => m[1]).filter((m) => !m.startsWith('node:'));
  assert.deepEqual([...new Set(imports)], ['@kaihacksai/kaal-hosting'], 'the runner imports Hosting and nothing else outside Node');

  const { runCases } = await load();
  const root = mkdtempSync(join(tmpdir(), 'kaal-root-'));
  cpSync(join(PKG, 'test/plan/run-cases/fixtures'), join(root, 'test/plan/run-cases/fixtures'), { recursive: true });
  const before = snap(root);
  const a = await runCases({ files: [fx('mixed'), fx('nested')], root });
  const b = await runCases({ files: [fx('nested'), fx('mixed')], root });
  assert.deepEqual(snap(root), before, 'the runner writes nothing under root');
  assert.deepEqual(a, b, 'the same scheduling-independent files report the same, in any order of the input');
  assert.equal(a.schema, SCHEMA);

  assert.equal(a.execution.node, process.versions.node, 'the report records the exact Node version');
  assert.ok(Number(process.versions.node.split('.')[0]) >= 24, `acceptance needs Node 24 or later; this run is ${process.version}. Stays RED on any older Node by design`);
}
