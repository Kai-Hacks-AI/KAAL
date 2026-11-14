// Case review/T28 tests: review/G1
import assert from 'node:assert/strict';
import { each, direction } from './lib.mjs';
export const id = 'review/T28';
export const tests = ['review/G1'];
export const title = "gap review/G1 is closed: the record compares in both directions, and each finding names an item of the reference or of the actual it compares";
export function run() {
  each((app) => {
    const names = (line, items) => items.filter((i) => line.includes(i));
    const promised = direction(app, 'Promised, not delivered');
    const delivered = direction(app, 'Delivered, not promised');
    assert.ok(promised.length > 0, `${app.name}: nothing is said of what was promised and not delivered`);
    assert.ok(delivered.length > 0, `${app.name}: nothing is said of what was delivered and not promised`);
    for (const l of promised) assert.ok(names(l, app.subject.reference.items).length > 0, `${app.name}: a finding names no item of the reference: ${l.slice(0, 60)}`);
    for (const l of delivered) assert.ok(names(l, app.subject.actual.items).length > 0, `${app.name}: a finding names no item of the actual: ${l.slice(0, 60)}`);
    const all = [...promised, ...delivered].join('\n');
    assert.ok(names(all, app.subject.reference.items).length > 0 && names(all, app.subject.actual.items).length > 0, `${app.name}: the comparison does not touch both the reference and the actual`);
  });
}
