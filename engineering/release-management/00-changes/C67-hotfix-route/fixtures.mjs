import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const RM = join(repo, 'engineering/release-management');
export const F17 = join(RM, '02-requirements/F17-envelope-rules/F17.md');
export const registry = {
  PLAN: ['Change', 'From', 'To', 'Because'],
  HOTFIX: ['Change', 'Defect', 'Urgency', 'Approach'],
  PROMOTION: ['Change', 'Why now', 'HOW TO WORK'],
  SYNC: ['Change', 'Reason'],
};
export const verify = async (facts) => {
  const { verifyEnvelope } = await import(pathToFileURL(join(RM, '05-src/plan-body/envelope.mjs')).href);
  return verifyEnvelope(facts, registry);
};
const hotfixBody = '## Change\n\nrelease/C99 sample\n\n## Defect\n\nrelease/D9: it fails.\n\n## Urgency\n\nNow.\n\n## Approach\n\nFix it.\n';
export const hotfix = { title: 'HOTFIX: Restore a sample', body: hotfixBody, base: 'hotfix/restore-sample', head: 'claude/restore-sample' };
export const routeProblems = (r) => r.problems.filter((p) => /route|must be a/.test(p));
