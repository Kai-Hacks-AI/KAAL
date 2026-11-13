// Runs every Case of this package's Changes: each T<n>.test.mjs exports run(), and a failing assertion fails the test.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cases = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { if (name !== 'node_modules') walk(path); }
    else if (/^T\d+\.test\.mjs$/.test(name) && path.slice(root.length).split('/')[0] !== 'test') cases.push(path);
  }
};
walk(root);

describe('Cases', () => {
  for (const path of cases.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
    it(path.slice(root.length), async () => { const c = await import(pathToFileURL(path).href); await c.run(); });
  }
});
