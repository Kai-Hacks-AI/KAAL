import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const RM = join(repo, 'engineering/release-management');
export const REAL = join(RM, '05-src/wiring/templates/default.md');
export const CURRENT = join(repo, '.github/pull_request_template.md');
export const FIXED = ['Step', 'Who', 'Action', 'Status', 'Details'];
export const WHO = ['Predecessor', 'Worker', 'Owner', 'Reviewer', 'Dependency', 'Successor'];
export function draft() {
  const text = readFileSync(join(RM, '00-changes/C47-default-template/interface.md'), 'utf8');
  return text.split(/^## Draft of default\.md$/m)[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
}
export const chapters = (text) => text.replace(/<!--[\s\S]*?-->/g, '').split('\n').filter((l) => /^## \S/.test(l)).map((l) => l.replace(/^## /, '').trim());
export function table(text) {
  const body = text.split(/^## HOW TO WORK$/m)[1] ?? '';
  const rows = body.replace(/<!--[\s\S]*?-->/g, '').split('\n').filter((l) => l.trim().startsWith('|'));
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  return rows.map(cells);
}
