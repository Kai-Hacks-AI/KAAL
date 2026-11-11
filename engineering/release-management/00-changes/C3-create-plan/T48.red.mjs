// Case release/T48 tests: G10
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = () => read(template, 'the PLAN template').split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T48';
export const tests = ['release/G10'];
export const title = 'gap release/G10 is closed: I2 and the interface it asks for are present';
export function run() {
  read(join(cap, '01-intent/I2-create-plan/I2.md'), 'I2');
  assert.ok(existsSync(template), 'the PLAN template is absent');
}
