// Case engineering/T1239 tests: engineering/F55
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
// The Kernel, the entry point and the nine Core Nodes: what the repository holds as its own Core.
const CORE = ['AGENTS.md', 'KAAL-KERNEL.md', ...['Agent-Realization', 'CASE', 'Installation-Contract', 'KAAL-Agent', 'KAAL-Capability', 'KAAL-Definition', 'KAAL-Extension', 'KAAL-Skill', 'Node'].map((n) => `core/${n}.md`)];
export const id = 'engineering/T1239';
export const tests = ['engineering/F55'];
export const title = 'the Kernel, the entry point and the nine Core Nodes are in engineering/core and no longer in .kaal';
export const run = () => {
  for (const f of CORE) assert.ok(existsSync(join(root, 'engineering/core', f)), `engineering/core/${f} is absent`);
  for (const f of CORE) assert.ok(!existsSync(join(root, '.kaal', f)), `.kaal/${f} is still there`);
};
if (process.argv[1] === fileURLToPath(import.meta.url)) run();
