import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execute } from 'kaal-hosting';
import { readCommittedFile, readCommitObject } from '../../git-input.mjs';
import { digest } from '../../policy-identity.mjs';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { createGitSourceVerifier } from './source.mjs';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
export async function gitSourceFixture(){
  const r=await execute('git',['rev-parse','HEAD'],{cwd:root});assert.equal(r.status,0);const rev=r.stdout.trim();
  const hash=s=>sha256(new TextEncoder().encode(s)),path='.github/workflows/lineage-synchronization.yml';
  const files=Object.fromEntries(await Promise.all(['engineering/github/lineage.ts','engineering/github/branching.sh','package-lock.json']
    .map(async p=>[p,hash(await readCommittedFile(root,rev,p))])));
  const tree=await readCommitObject(root,rev);
  const trust={driverRevision:rev,driverPath:'engineering/github/branching.sh',driverDigest:files['engineering/github/branching.sh'],
    workflowDigest:hash(await readCommittedFile(root,rev,path)),commandDigest:'4'.repeat(64),dependencyDigest:digest(files),files};
  const producer={workflowSha:rev,governanceSha:rev,testedSha:rev,testedTreeSha:tree.treeSha,runId:10,attempt:1,jobId:20,attestorCheckRunId:30,checkSuiteId:40};
  const context={repositoryId:1415996637,headRepositoryId:123,pr:900,headSha:rev,baseSha:rev,baseRef:'kaal/ci-gates'};
  const proof={...producer,checkRunId:30,...context,schema:'kaal.native-execution-proof/v1',driverRevision:rev,
    driverDigest:trust.driverDigest,commandDigest:trust.commandDigest,dependencyDigest:trust.dependencyDigest,before:files,after:files,exitStatus:1};
  return {trust,producer,context,proof,registration:{path,producer},reader:createGitSourceVerifier({root,trust})};
}
