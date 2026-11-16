// Shared fixtures for the C41 Cases. Not a Case.
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const envelopePath = join(repo, 'engineering/release-management/05-src/plan-body/envelope.mjs');
export const load = async () => import(pathToFileURL(envelopePath).href);

export const HEADER = '| Step | Who | Action | Status | Details |\n| --- | --- | --- | --- | --- |';
export const row = (step, who, action = 'does something', status = 'open', details = '—') => `| ${step} | ${who} | ${action} | ${status} | ${details} |`;
export const GOOD = [row(0, 'Predecessor', 'PLAN approved and merged', 'merged', '#101'), row(1, 'Worker'), row(2, 'Dependency', 'SYNC of main', 'pending', '#118'), row(3, 'Reviewer'), row(4, 'Successor', 'ACT, starts on merge', '—', '#131')];
export const body = (rows, extra = '') => `## Change\n\nrelease/C1 x: y\n\n## HOW TO WORK\n\n${extra}${HEADER}\n${rows.join('\n')}\n`;
export const withRows = (rows) => body(rows);
