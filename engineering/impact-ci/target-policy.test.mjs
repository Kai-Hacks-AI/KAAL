import { test } from 'node:test';
import { strictEqual } from 'node:assert';
import { assuranceForTarget } from './target-policy.mjs';
for (const [name, input, expected] of [
  ['capability PR', { event: 'pull_request', baseRef: 'kaal/hosting' }, 'impact-aware'],
  ['engineering PR', { event: 'pull_request', baseRef: 'kaal/engineering' }, 'impact-aware'],
  ['main promotion from capability', { event: 'pull_request', baseRef: 'main', headRef: 'kaal/hosting' }, 'full-assurance'],
  ['main PR from arbitrary source', { event: 'pull_request', baseRef: 'main', headRef: 'feature/x' }, 'full-assurance'],
  ['main push', { event: 'push', baseRef: 'main' }, 'full-assurance'],
  ['unknown target', { event: 'pull_request', baseRef: 'feature/x' }, 'unresolved'],
  ['unknown event', { event: 'workflow_dispatch', baseRef: 'kaal/hosting' }, 'unresolved'],
  ['missing target', { event: 'pull_request' }, 'unresolved'],
]) test(name, () => strictEqual(assuranceForTarget(input), expected));
