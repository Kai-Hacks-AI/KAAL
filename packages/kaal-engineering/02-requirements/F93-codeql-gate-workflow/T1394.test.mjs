// Case engineering/T1394 tests: engineering/F93
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src } from './fixture.mjs';
export const id = 'engineering/T1394';
export const tests = ['engineering/F93'];
export const title = 'the declared expected configurations and the matrix of analyze name the same configurations';
export async function run() {
  const text = readFileSync(src, 'utf8');
  const declared = text.match(/CODEQL_EXPECTED:\s*["']?([^"'\n]+)["']?/)?.[1];
  assert.ok(declared, 'CODEQL_EXPECTED is not declared as one quoted string (F93 pins the format)');
  const matrix = text.match(/language:\s*\[([^\]]+)\]/)?.[1];
  assert.ok(matrix, 'the matrix is not the one-line list `language: [a, b]` (F93 pins the format)');
  const fromDeclared = declared.split(/[\s,]+/).filter(Boolean).sort();
  const fromMatrix = matrix.split(',').map((l) => `/language:${l.trim()}`).sort();
  assert.deepEqual(fromDeclared, fromMatrix, 'the declaration and the matrix differ');
}
