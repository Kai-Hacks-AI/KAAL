import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
import { stripComments } from '../../05-src/plan-body/comments.mjs';
export const RM = join(repo, 'engineering/release-management');
export const REAL = join(RM, '05-src/wiring/templates/wire.md');
export const T281 = join(RM, '00-changes/C27-wire-delivery-operation/T281.test.mjs');
export const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
export const FIXED = ['Step', 'Who', 'Action', 'Status', 'Details'];
export const WHO = ['Predecessor', 'Worker', 'Owner', 'Reviewer', 'Dependency', 'Successor'];
export function draft() {
  const text = readFileSync(join(RM, '00-changes/C51-wire-template/interface.md'), 'utf8');
  return text.split(/^## Draft of wire\.md$/m)[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
}
export const chapters = (text) => stripComments(text).split('\n').filter((l) => /^## \S/.test(l)).map((l) => l.replace(/^## /, '').trim());
export function table(text) {
  const body = text.split(/^## HOW TO WORK$/m)[1] ?? '';
  const rows = stripComments(body).split('\n').filter((l) => l.trim().startsWith('|'));
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  return rows.map(cells);
}
