import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
import { stripComments } from '../../05-src/plan-body/comments.mjs';
export const RM = join(repo, 'engineering/release-management');
export const REAL = join(RM, '05-src/wiring/templates/sync.md');
export const FIXED = ['Step', 'Who', 'Action', 'Status', 'Details'];
export function table(text) {
  const body = text.split(/^## HOW TO WORK$/m)[1] ?? '';
  const rows = stripComments(body).split('\n').filter((l) => l.trim().startsWith('|'));
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  return rows.map(cells);
}
export const rows = () => table(readFileSync(REAL, 'utf8')).slice(2);
