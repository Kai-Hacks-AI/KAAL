// Case coordination/T11 tests: N2
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scriptPath } from './fixtures.mjs';
export const id = 'coordination/T11';
export const tests = ['coordination/N2'];
export const title = 'the Script and its fixtures hold no KAAL-specific identity and no host term, while generic release words stay allowed';
// INTERIM: the forbidden identities are listed here until release/T5 reads them from the Delivery target (see 00-changes.md).
const FORBIDDEN = [/kaal\//i, /\bverify (?:Plan|Envelope)\b/, /\bapprove (?:Change|Publishing|Promotion)\b/, /\bcheck PR (?:Body|Envelope)\b/, /\bguard \(Integration\)/i];
// Host terms (Git, GitHub) stay in the gatherer; the contract says piece, into, from, at, fit, LAND and CHECK.
const HOST = [/\bpull requests?\b/i, /\bmerg(?:e|es|ed|ing)\b/i, /\bPRs?\b/, /\bgit(?:hub)?\b/i, /\bbranch(?:es)?\b/i, /\bcommits?\b/i];
const scan = (text) => [...FORBIDDEN, ...HOST].filter((pattern) => pattern.test(text)).map(String);
export function run() {
  assert.deepEqual(scan('a person approves the promotion; a gate may block the sync of a collector'), [], 'generic release words are forbidden');
  assert.ok(scan('the branch kaal/release/x is promoted').length > 0, 'a KAAL branch lineage is not forbidden');
  assert.ok(scan('verify Plan runs first').length > 0, 'a KAAL control name is not forbidden');
  assert.ok(scan('the pull request is merged on a branch').length > 0, 'a host term is not forbidden');
  assert.deepEqual(scan('a piece lands when its CHECK passes and a person approves it'), [], 'the neutral words are forbidden');
  assert.ok(existsSync(scriptPath), 'the Script is absent');
  const dir = fileURLToPath(new URL('.', import.meta.url));
  for (const file of [scriptPath, join(dir, 'fixtures.mjs')]) {
    const hits = scan(readFileSync(file, 'utf8'));
    assert.deepEqual(hits, [], `${file} holds a KAAL-specific identity: ${hits.join(', ')}`);
  }
}
