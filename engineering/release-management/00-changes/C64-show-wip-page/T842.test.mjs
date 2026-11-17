// Case release/T842 tests: release/C64
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BUILD, GENERATED, THEME } from './fixtures.mjs';
export const id = 'release/T842';
export const tests = ['release/C64'];
export const title = 'the build command writes the page from the text files, and when an input is missing, empty or malformed it names it, exits 2 and writes nothing';
export async function run() {
  assert.ok(existsSync(BUILD), 'build-page.mjs is absent from 05-src/show-wip');
  const dir = mkdtempSync(join(tmpdir(), 'c64-'));
  const a = join(dir, 'a.txt'), b = join(dir, 'b.txt'), empty = join(dir, 'e.txt'), out = join(dir, 'index.html');
  writeFileSync(a, 'overview text'); writeFileSync(b, 'settled <text>'); writeFileSync(empty, '  \n');
  const build = (...args) => spawnSync('node', [BUILD, ...args], { encoding: 'utf8' });
  const ok = build(THEME, out, GENERATED, `Overview=${a}`, `Settled=${b}`);
  assert.equal(ok.status, 0, ok.stderr);
  const html = readFileSync(out, 'utf8');
  assert.ok(html.includes('overview text') && html.includes('settled &lt;text&gt;') && html.includes('<h2>Settled</h2>'), 'the page lacks its sections');
  for (const [label, args, mention] of [
    ['a missing input', [THEME, join(dir, 'x.html'), GENERATED, `Overview=${a}`, `Settled=${join(dir, 'gone.txt')}`], 'gone.txt'],
    ['an empty input', [THEME, join(dir, 'y.html'), GENERATED, `Overview=${empty}`], 'e.txt'],
    ['a part without a title', [THEME, join(dir, 'z.html'), GENERATED, a], a],
    ['a time that is not one', [THEME, join(dir, 'w.html'), 'yesterday', `Overview=${a}`], 'yesterday'],
    ['no part', [THEME, join(dir, 'v.html'), GENERATED], 'expected'],
  ]) {
    const r = build(...args);
    assert.equal(r.status, 2, `${label} did not exit 2`);
    assert.ok(r.stderr.includes(mention), `${label} is not named: ${r.stderr}`);
    assert.ok(!existsSync(args[1]), `${label} wrote a page`);
  }
}
