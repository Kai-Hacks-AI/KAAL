// Case coordination/T9 tests: F1, N1
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { scriptPath } from './fixtures.mjs';
export const id = 'coordination/T9';
export const tests = ['coordination/F1', 'coordination/N1'];
export const title = 'the Script exists, imports only built-ins, and calls no network, process or write API';
export function run() {
  assert.ok(existsSync(scriptPath), 'the Script is absent');
  const source = readFileSync(scriptPath, 'utf8');
  const imports = [...source.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g), ...source.matchAll(/require\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  for (const name of imports) assert.ok(name.startsWith('node:'), `the Script imports ${name}, which is not a built-in`);
  const forbidden = [/\bfetch\s*\(/, /node:(?:net|http|https|http2|dgram|dns|child_process|worker_threads|cluster)/, /\b(?:writeFile|appendFile|writeFileSync|appendFileSync|rmSync|unlinkSync|renameSync)\b/, /\bprocess\.(?:binding|dlopen)\b/];
  for (const pattern of forbidden) assert.ok(!pattern.test(source), `the Script uses ${pattern}`);
}
