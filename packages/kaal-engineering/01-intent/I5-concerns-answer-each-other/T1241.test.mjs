// Case engineering/T1241 tests: engineering/I5
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
export const id = 'engineering/T1241';
export const tests = ['engineering/I5'];
export const title = 'the numbered concerns follow the order intent, requirements, architecture, source, operations, defects, and controls sit only in operations';
export async function run() {
  const t = template();
  const names = t.folders.map((f) => f.name).filter((n) => /^\d\d-/.test(n) && n >= '10');
  assert.deepEqual(names.map(roleOf), ['intent', 'requirements', 'architecture', 'source', 'operations', 'defects'], 'the concerns are not in the order');
  assert.deepEqual([...names].sort(), names, 'the numbers do not follow the order');
  assert.ok(!t.folders.some((f) => /controls/.test(f.name)), 'a folder of controls sits outside operations');
  const ops = t.folders.find((f) => roleOf(f.name) === 'operations');
  assert.ok(ops.children.includes('controls'), 'operations has no controls');
}
