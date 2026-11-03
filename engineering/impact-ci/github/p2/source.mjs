// Git proves committed sources/tree. Actual loaded-byte captures must come from
// the separately approved candidate-free native driver, bound by OIDC audience.
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { digest } from '../../policy-identity.mjs';
import { readCommittedFile, readCommitObject } from '../../git-input.mjs';
export function createGitSourceVerifier({root,trust}) {
  const pinned=structuredClone(trust),encode=new TextEncoder();
  if(!root||!/^[a-f0-9]{40}$/.test(pinned?.driverRevision)||typeof pinned.driverPath!=='string'||!/^[a-f0-9]{64}$/.test(pinned.driverDigest)||
    !['workflowDigest','commandDigest','dependencyDigest'].every(k=>/^[a-f0-9]{64}$/.test(pinned[k]))||
    !pinned.files||!['engineering/github/lineage.ts','engineering/github/branching.sh','package-lock.json'].every(p=>p in pinned.files)||
    Object.values(pinned.files).some(h=>!/^[a-f0-9]{64}$/.test(h)))throw new TypeError('approved complete native driver source inventory required');
  return Object.freeze({async verify(proof,registration,context){
    const p=registration.producer;
    if(proof?.schema!=='kaal.native-execution-proof/v1'||proof.driverRevision!==pinned.driverRevision||proof.driverDigest!==pinned.driverDigest||
      proof.commandDigest!==pinned.commandDigest||proof.dependencyDigest!==pinned.dependencyDigest||
      proof.workflowSha!==p.workflowSha||proof.governanceSha!==p.governanceSha||proof.testedSha!==p.testedSha||proof.testedTreeSha!==p.testedTreeSha||
      proof.runId!==p.runId||proof.attempt!==p.attempt||proof.jobId!==p.jobId||proof.checkRunId!==p.attestorCheckRunId||proof.checkSuiteId!==p.checkSuiteId||
      proof.repositoryId!==context.repositoryId||proof.headRepositoryId!==context.headRepositoryId||proof.pr!==context.pr||proof.headSha!==context.headSha||proof.baseSha!==context.baseSha||proof.baseRef!==context.baseRef||
      ![0,1,2,3].includes(proof.exitStatus)||digest(proof.before)!==digest(pinned.files)||digest(proof.after)!==digest(pinned.files))
      throw new Error('native loaded source/command/context proof mismatch');
    const workflow=await readCommittedFile(root,p.workflowSha,registration.path);
    if(sha256(encode.encode(workflow))!==pinned.workflowDigest)throw new Error('native workflow source changed');
    if(sha256(encode.encode(await readCommittedFile(root,pinned.driverRevision,pinned.driverPath)))!==pinned.driverDigest)
      throw new Error('receipt driver source changed');
    for(const [path,expected] of Object.entries(pinned.files)){
      if(sha256(encode.encode(await readCommittedFile(root,p.governanceSha,path)))!==expected)throw new Error(`checker/dependency source changed: ${path}`);
    }
    const tree=await readCommitObject(root,p.testedSha);
    if(tree.treeSha!==p.testedTreeSha)throw new Error('actual tested Git tree differs');
    return {proofDigest:digest(proof),driverDigest:pinned.driverDigest,sourceInventoryDigest:digest(pinned.files)};
  }});
}
