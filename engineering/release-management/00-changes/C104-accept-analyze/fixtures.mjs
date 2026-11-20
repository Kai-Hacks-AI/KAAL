// Facts of a merge-queue run, shaped as the host answers them (a real run of 20 Nov 2026: PROMOTION #2092).
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const SRC = join(repo, 'engineering/release-management/05-src/vulnerability-analysis');
export const load = (name) => import(pathToFileURL(join(SRC, name)).href);
export const NOW = Date.parse('2026-11-21T10:00:00Z');
export const run = { id: 44716419310, url: 'https://github.com/Kai-Hacks-AI/KAAL/actions/runs/44716419310', event: 'merge_group', head_branch: 'gh-readonly-queue/main/pr-2092-116821234183d33b7c771a3e41aba6f0acdfe830', created_at: '2026-11-20T10:06:47Z' };
export const checks = [
  { name: 'analyze Vulnerabilities (Integrating)', conclusion: 'skipped', appId: 15368 },
  { name: 'analyze Vulnerabilities (Promoting)', conclusion: 'success', appId: 15368 },
];
export const hostRun = { id: run.id, html_url: run.url, event: run.event, head_branch: run.head_branch, head_sha: '3741577be6a6b5deff073bb834137701a6f38345', created_at: run.created_at };
export const hostChecks = checks.map((c) => ({ name: c.name, conclusion: c.conclusion, app: { id: c.appId } }));
