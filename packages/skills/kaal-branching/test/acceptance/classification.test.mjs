import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { before, it } from "node:test";
import { initialize, update, execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";
import { embed, external, observation, SHA } from "../fixtures/transactions.mjs";
let host, classify;
before(async()=>{
  host=await install(["@kaihacksai/kaal-foundation","kaal-hosting","kaal-branching"],{offline:true});
  await update(host,()=>({prefix:"classification-consumer",files:{"public.mjs":Buffer.from('export {classify} from "kaal-branching";\n')}}));
  ({classify}=await import(pathToFileURL(join(host,"classification-consumer","public.mjs")).href));
});
const run=(c,o)=>classify(JSON.stringify(c),JSON.stringify(o));
it("branching/T12 (runtime): resolves configured roles and methods for all three transaction kinds",()=>{
  for(const c of [embed,external()]) for(const kind of ["engineer","synchronize","promote"]) {
    c.transactions.find(t=>t.kind===kind).id="configured-"+kind;
    const r=run(c,observation(c,kind));
    assert.equal(r.kind,"pass",JSON.stringify(r));
    assert.equal(r.scope,"classification");
    assert.equal(r.transaction.kind,kind);
    assert.equal(r.transaction.id,"configured-"+kind);
    assert.equal(r.transaction.method,c.transactions.find(t=>t.kind===kind).method);
  }
});
it("branching/T21 (classification): unincorporated promoted history and work after a synchronization cannot masquerade as Engineer",()=>{
  for(const tip of [SHA.M,SHA.N]) {
    const o=observation();o.head.tip=tip;
    const r=run(embed,o);
    assert.equal(r.kind,"fail");assert.ok(r.findings.some(f=>f.code==="mixed-history"));
  }
});
it("branching/T23 (classification): source shape and collector ancestry are required for Synchronize",()=>{
  const wrong=observation(embed,"synchronize");wrong.commits.find(c=>c.sha===SHA.S).parents=[SHA.A,SHA.M];
  assert.equal(run(embed,wrong).kind,"fail");
  const o=observation(embed,"synchronize");
  const r=run(embed,o);
  assert.equal(r.kind,"pass",JSON.stringify(r));
  assert.equal(r.transaction.kind,"synchronize");
  assert.equal(r.binding.incorporates,SHA.M);
});
it("branching/T27 (classification): missing, conflicting, cyclic and misbound snapshots cannot pass",()=>{
  const missing=observation();missing.commits=missing.commits.filter(c=>c.sha!==SHA.A);
  const duplicate=observation();duplicate.commits.push({...duplicate.commits[0],parents:[SHA.C]});
  const cycle=observation();cycle.commits.find(c=>c.sha===SHA.A).parents=[SHA.B];
  const promoted=observation();promoted.promoted=[];
  for(const o of [missing,duplicate,cycle,promoted]) assert.equal(run(embed,o).kind,"cannot-judge");
  const wrong=observation();wrong.repository.id="999";
  assert.equal(run(embed,wrong).kind,"fail");
  const fork=observation(embed,"promote");fork.head.repositoryId="999";
  assert.equal(run(embed,fork).kind,"fail");
  const injected=observation();injected.kind="synchronize";
  assert.equal(run(embed,injected).kind,"cannot-judge","caller kind flags are not graph evidence");
});
it("a well-shaped transaction forbidden by the consumer is refused",()=>{
  const c=structuredClone(embed);c.transactions=c.transactions.filter(t=>t.kind!=="engineer");
  const r=run(c,observation(c));
  assert.equal(r.kind,"fail");assert.ok(r.findings.some(f=>f.code==="prohibited"));
});
it("real Git topology is consumed through the installed classifier",async()=>{
  const repo=join(host,"git-fixture");
  await initialize(repo,{"initial.txt":Buffer.from("root\n")});
  const git=async(...args)=>{
    const r=await execute("git",args,{cwd:repo,env:{...process.env,GIT_CONFIG_NOSYSTEM:"1"}});
    assert.equal(r.status,0,r.stderr);return r.stdout.trim();
  };
  await git("init","-b","release");
  await git("config","user.name","Branching fixture");
  await git("config","user.email","fixture@example.invalid");
  await git("add","--all");await git("commit","-m","root");
  await git("switch","-c","train/topic");
  await update(repo,()=>({prefix:"collector-content",files:{"a.txt":Buffer.from("collector\n")}}));
  await git("add","--all");await git("commit","-m","collector");
  const collector=await git("rev-parse","HEAD");
  await git("switch","-c","task/engineer");
  await update(repo,()=>({prefix:"change-content",files:{"a.txt":Buffer.from("change\n")}}));
  await git("add","--all");await git("commit","-m","engineer");
  const engineer=await git("rev-parse","HEAD");
  await git("switch","release");
  await update(repo,()=>({prefix:"promoted-content",files:{"a.txt":Buffer.from("promoted\n")}}));
  await git("add","--all");await git("commit","-m","promoted");
  const promoted=await git("rev-parse","HEAD");
  await git("switch","-c","task/synchronize","train/topic");
  await git("merge","--no-ff","--no-edit","release");
  const sync=await git("rev-parse","HEAD");
  const graph=(await git("rev-list","--all","--parents")).split("\n").map(line=>{const [sha,...parents]=line.split(" ");return {sha,parents};});
  const c=external(),o=observation(c);
  o.base.tip=collector;o.promoted[0].tip=promoted;o.commits=graph;
  o.head.ref="task/engineer";o.head.tip=engineer;
  const e=run(c,o);assert.equal(e.kind,"pass",JSON.stringify(e));assert.equal(e.transaction.kind,"engineer");
  o.head.ref="task/synchronize";o.head.tip=sync;
  const s=run(c,o);assert.equal(s.kind,"pass",JSON.stringify(s));assert.equal(s.transaction.kind,"synchronize");
  const before=await git("for-each-ref","--format=%(refname) %(objectname)");
  run(c,o);
  assert.equal(await git("for-each-ref","--format=%(refname) %(objectname)"),before);
});

