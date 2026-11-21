// Case engineering/T1242 tests: engineering/F56
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-engineering');
const script = join(pkg, 'skills/kaal-engineering/scripts/check-layout.mjs');
const templatePath = join(pkg, 'skills/kaal-engineering/references/package-layout.json');
const template = () => { assert.ok(existsSync(templatePath), 'the template references/package-layout.json is absent'); return JSON.parse(readFileSync(templatePath, 'utf8')); };
const roleOf = (n) => n.replace(/^\d\d-/, '');
export const id = 'engineering/T1242';
export const tests = ['engineering/F56'];
export const title = 'the template names 14-operations with controls and an optional runs, scopes the controls to the package, names 15-defects, and has no 02-controls or 14-defects';
export async function run() {
  const t = template();
  const names = t.folders.map((f) => f.name);
  assert.ok(!names.includes('02-controls'), '02-controls is still in the layout');
  assert.ok(!names.includes('14-defects'), '14-defects is still in the layout');
  const ops = t.folders.find((f) => f.name === '14-operations');
  assert.ok(ops, '14-operations is absent');
  assert.deepEqual([...ops.children].sort(), ['controls', 'runs']);
  assert.deepEqual(ops.optional, ['runs'], 'runs is not optional');
  assert.equal(ops.verifiedBy, 'controls', 'operations does not say what verifies it');
  assert.equal(ops.closed, true, 'operations holds more than it names');
  assert.equal(ops.controls.scope, 'package');
  assert.deepEqual([...ops.controls.covers].sort(), ['delivery', 'development', 'solution']);
  assert.ok(names.indexOf('13-source') < names.indexOf('14-operations') && names.indexOf('14-operations') < names.indexOf('15-defects'), 'operations is not between source and defects');
  const d = t.folders.find((f) => f.name === '15-defects');
  assert.ok(d && d.element === 'defect', '15-defects is absent');
}
