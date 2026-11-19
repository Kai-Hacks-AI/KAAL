// Case architecture/T23 tests: architecture/F14
import assert from 'node:assert/strict';
import { readRecord } from '../../lib/records.mjs';
export const id = 'architecture/T23';
export const tests = ['architecture/F14'];
export const title = 'an A-record is read by its form: id, title and a nonempty addresses list, and the number matches file and folder';
export function run() {
  const ok = readRecord('03-architecture/A5-x/A5.md', '---\nid: controls/A5\ntitle: x\naddresses: [controls/F10]\n---\n# x\n');
  assert.deepEqual(ok.addresses, ['controls/F10']);
  assert.equal(ok.id, 'controls/A5');
  assert.ok(readRecord('03-architecture/A6-x/A6.md', '---\nid: controls/A5\ntitle: x\naddresses: [controls/F10]\n---\n').problems.length > 0, 'number mismatch is a problem');
}
