import { Graph } from 'kaal-graph';
import { isolate, type Proposal, type IsolationAssessment } from '@kaihacksai/kaal-change/isolation';
const reference = { name: 'shop/C1', id: 'a'.repeat(64) };
const proposal: Proposal = { ref: reference, alters: ['shop/I1'], scope: ['shop'] };
const result: IsolationAssessment = isolate(proposal, { change: reference, owners: ['shop'], sources: [], graph: new Graph() });
const status: 'isolated' | 'unknown' | 'violated' = result.assessment;
const authority: 'unestablished' = result.authority.status;
void status; void authority;
// @ts-expect-error a CI job list is not the owner model
isolate(proposal, { jobs: ['passed'] });
