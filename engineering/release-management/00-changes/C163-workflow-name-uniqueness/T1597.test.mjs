// Case release/T1597 tests: release/C163. The workflow-name uniqueness of a source Case (release/T1581) is among OTHER workflows: the delivered copy of the source, installed by its WIRE under the same file name, is not another workflow. A different file that takes the same name still fails it.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SRC = 'engineering/release-management/05-src/wiring/workflows/change-isolation-plain.yml';
const CASE = 'engineering/release-management/00-changes/C160-adapt-change-isolation-plain/T1581.test.mjs';
export const id = 'release/T1597';
export const tests = ['release/C163'];
export const title = 'the name uniqueness of a source Case ignores its own delivered copy and still fails for another workflow of the same name';
export async function run() {
  const root = mkdtempSync(join(tmpdir(), 'uniq-'));
  try {
    for (const f of [SRC, CASE]) { mkdirSync(join(root, f, '..'), { recursive: true }); cpSync(join(repo, f), join(root, f)); }
    mkdirSync(join(root, '.github/workflows'), { recursive: true });
    // The case as the scratch repository holds it, so it reads that repository, not this one.
    const t1581 = await import(pathToFileURL(join(root, CASE)).href + '?s=' + Date.now());
    // 1. The source is not delivered: it passes (the baseline, so a failing case is not vacuous).
    await t1581.run();
    // 2. Its WIRE installed the same file under the same name: it must still pass.
    cpSync(join(root, SRC), join(root, '.github/workflows/change-isolation-plain.yml'));
    await t1581.run();
    // 3. Another workflow takes the same name: it must fail, and say it is not unique.
    writeFileSync(join(root, '.github/workflows/other.yml'), readFileSync(join(root, SRC), 'utf8'));
    await assert.rejects(() => t1581.run(), /not unique/);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
