// Case release/T444 tests: F23
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T444';
export const tests = ['release/F23'];
export const title = 'F23 is stated once and each type interface names the shared final chapter';

export function run() {
  const root = join(repo, 'engineering/release-management');
  const all = [];
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/^(interface|F\d+)\.md$/.test(e.name)) all.push(p);
  } };
  walk(join(root, "02-requirements"));
  walk(join(root, '00-changes'));
  const texts = all.map((p) => readFileSync(p, 'utf8'));
  assert.ok(texts.some((t) => /^#+ .*F23\b/m.test(t) && t.includes('HOW TO WORK')), 'F23 is not stated in the requirements');
  for (const f of ['F3', 'F10', 'F11', 'F14', 'F15', 'F16', 'F18', 'F22']) {
    const t = texts.find((x) => new RegExp(`^#+ .*\\b${f}\\b`, 'm').test(x));
    assert.ok(t, `${f} is not found`);
    assert.ok(/shared final chapter of F23/.test(t), `${f} does not name the shared final chapter of F23`);
  }
}
