import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
export const lineage = () => import(`file://${root}/engineering/github/lineage.ts`);
export const base = { repo: 'o/r', defaultBranch: 'main', baseRef: 'main', headRepo: 'o/r' };
export const A = 'a'.repeat(40);
export const B = 'b'.repeat(40);
export const run = (over = {}) => ({ id: 1, name: 'Guard', status: 'completed', conclusion: 'success', appId: 15368, headSha: A, ...over });
export const required = [{ context: 'Guard', integrationId: 15368 }];
