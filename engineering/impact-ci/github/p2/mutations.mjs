// Source-copy mutation runner; no working source or live system is modified.
import { read,initialize,reconcile,execute } from 'kaal-hosting';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { fileURLToPath } from 'node:url';
const source=fileURLToPath(new URL('../../',import.meta.url)),files=await read(source);
const cases=[
 ['fact seal ignored','producer.mjs','!await sealer.verify(record.fact,record.seal)','false','producer.test.mjs','ingress/read refuses seal'],
 ['subject change ignored','producer.mjs','if(digest(scope(current))!==c.scopeDigest)','if(false)','producer.test.mjs','observed subject change permanently'],
 ['native audience ignored','../auth.mjs','claims.aud !== `${audience}/native/${expected.nonce}/${expected.proofDigest}`','false','producer.test.mjs','ingress/read refuses proof'],
 ['JTI reuse allowed','producer.mjs','if(live.jtis[authentication.claims.jti])','if(false)','producer.test.mjs','one issuer JTI'],
 ['same-App suite join removed','provider.mjs','check.check_suite?.id!==r.check_suite_id||','','provider.test.mjs','native provider refuses suite'],
 ['source repository ignored','source.mjs','proof.headRepositoryId!==context.headRepositoryId||','','source.test.mjs','source repository identity'],
 ['working source drift ignored','source.mjs','||digest(proof.after)!==digest(pinned.files)','','source.test.mjs','working bytes'],
 ['final source/context revalidation removed','producer.mjs','await registration(await state(),fact.registrationId);','','producer.test.mjs','subject changing during final'],
 ['CAS expected revision ignored','sqlite.mjs',"if ((row?.revision ?? 0) !== q.expected)", 'if (false)','storage.test.mjs','concurrent independent stores'],
 ['capacity check removed','sqlite.mjs','if (input.length > 24000)','if (false)','storage.test.mjs','local pilot storage capacity'],
];
const results=[];
for(let i=0;i<cases.length;i++){
 const [name,module,from,to,test,pattern]=cases[i],target=module.startsWith('../')?'github/'+module.slice(3):'github/p2/'+module;
 const text=files[target].toString();if(text.split(from).length!==2)throw new Error('nonunique mutation anchor: '+name);
 const changed={...files,[target]:Buffer.from(text.replace(from,to))};
 const copy=fileURLToPath(new URL(`../../../.ci-p2-mutation-${Date.now()}-${process.pid}-${i}/`,import.meta.url));
 await initialize(copy,changed);
 try{
  const run=await execute(process.execPath,['--test','--test-name-pattern',pattern,copy+'/github/p2/'+test],{cwd:source});
  const out=run.stdout+run.stderr;
  results.push({name,module,from,to,test,pattern,exitStatus:run.status,
   discriminatedByAssertion:run.status===1&&/ERR_ASSERTION/.test(out)&&!/SyntaxError|ERR_MODULE_NOT_FOUND/.test(out)});
 }finally{await reconcile(copy,{write:[],remove:Object.entries(changed).map(([path,bytes])=>({path,expect:sha256(bytes)}))});}
}
console.log(JSON.stringify({schema:'kaal.p2-mutation-discrimination/v1',results},null,2));
if(results.some(r=>!r.discriminatedByAssertion))process.exitCode=1;
