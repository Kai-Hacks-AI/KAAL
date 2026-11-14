// Case pull/T47 tests: pull/F46
import assert from 'node:assert/strict';
import { declaration, deltas, NEW, entry, scopeOf, matches } from './lib.mjs';
export const id = 'pull/T47';
export const tests = ['pull/F46'];
export const title = 'each candidate collector is declared with a scope that fits its real delta and excludes the other candidates';

export async function run() {
  for (const name of NEW) {
    assert.ok(entry(name), `${name} is not declared`);
    const scope = scopeOf(name);
    assert.ok(scope.length, `${name} has no scope`);
    for (const path of deltas[name]) assert.ok(matches(scope, path), `${name}: ${path} is its own work but is outside its scope`);
    for (const other of NEW.filter((n) => n !== name))
      for (const path of deltas[other]) assert.ok(!matches(scope, path), `${name}: the scope reaches ${other}'s ${path}`);
  }
  // The existing entries are unchanged: each is still declared once, with the scope it has now.
  const existing = declaration.collectors.filter((c) => !NEW.includes(c.name));
  assert.equal(existing.length, 12, 'the existing entries were changed or removed');
  assert.equal(new Set(declaration.collectors.map((c) => c.name)).size, declaration.collectors.length, 'a collector is declared twice');
}
