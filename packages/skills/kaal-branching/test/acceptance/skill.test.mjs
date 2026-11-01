import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { before, it } from "node:test";
import { execute, initialize, kind, read, readFile, update } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";
import { checkSkill } from "kaal-engineer-skill";
import { embed, external, observation } from "../fixtures/transactions.mjs";
let host,skill,entry,moved;
before(async()=>{
  host=await install(["@kaihacksai/kaal-foundation","kaal-hosting","kaal-branching"],{offline:true});
  const installed=join(host,"node_modules","kaal-branching");
  const pkg=JSON.parse((await readFile(join(installed,"package.json"))).toString("utf8"));
  entry=join(installed,pkg.bin["kaal-branching"]);
  skill=join(installed,"skills","kaal-branching");
  moved=join(tmpdir(),"branching-skill-"+process.pid+"-"+Date.now(),"kaal-branching");
  await initialize(moved,await read(skill));
  for(const [name,c]of [["embed",embed],["external",external()]])
    await update(host,()=>({prefix:name,files:{"policy.json":Buffer.from(JSON.stringify(c)),"proposal.json":Buffer.from(JSON.stringify(observation(c)))}}));
});
const invoke=(path,mode,phase="inspect",extra=[])=>execute(process.execPath,[path,"--runtime",host,"--mode",mode,"--phase",phase,"--config",join(host,mode,"policy.json"),"--proposal",join(host,mode,"proposal.json"),...extra],{cwd:tmpdir()});
it("branching/T5: shipped Skill passes Engineer Skill; a broken internal script reference fails",async()=>{
  const files=await read(skill);
  const r=checkSkill("kaal-branching",files);
  assert.deepEqual(r.standard,[]);assert.deepEqual(r.kaal,[]);
  const broken={...files,"SKILL.md":Buffer.concat([files["SKILL.md"],Buffer.from("\nRun scripts/absent.mjs.\n")])};
  assert.ok(checkSkill("kaal-branching",broken).kaal.length);
});
it("branching/T8 (inspect): installed public entry inspects snapshots and reports its evidence boundary",async()=>{
  const r=await invoke(entry,"embed");
  assert.equal(r.status,0,r.stderr);
  const out=JSON.parse(r.stdout);
  assert.equal(out.classification.transaction.kind,"engineer");
  assert.equal(out.assurance.policyAuthority,"not-verified");
  assert.equal(out.assurance.boundary,"not-verified");
  assert.equal(out.execution,"unsupported");
});
it("branching/T9 (inspect): relocated Skill resolves its explicit installed runtime outside the package",async()=>{
  assert.equal(await kind(join(moved,"node_modules")),"missing");
  const r=await invoke(join(moved,"scripts","inspect.mjs"),"external");
  assert.equal(r.status,0,r.stderr);
  assert.equal(JSON.parse(r.stdout).classification.transaction.method,"squash");
});
it("branching/T6 (inspect): both modes classify the same contracts without target installation",async()=>{
  const results=[];
  for(const mode of ["embed","external"]) {
    const r=await invoke(entry,mode);assert.equal(r.status,0,r.stderr);
    const out=JSON.parse(r.stdout);
    assert.equal(out.mode,mode);
    results.push(out.classification.transaction.kind);
  }
  assert.deepEqual(results,["engineer","engineer"]);
  assert.equal(await kind(join(host,"external",".kaal")),"missing");
});
it("unsupported phases are explicit and do not change controller inputs",async()=>{
  const before=await read(join(host,"external"));
  for(const phase of ["prepare","execute","verify"]) {
    const r=await invoke(entry,"external",phase);
    assert.equal(r.status,5,r.stderr);
    assert.equal(JSON.parse(r.stdout).kind,"unsupported");
  }
  assert.deepEqual(await read(join(host,"external")),before);
});
it("duplicate or missing CLI context does not trigger an implicit operation",async()=>{
  const duplicate=await invoke(entry,"external","inspect",["--mode","embed"]);
  assert.equal(duplicate.status,2);
  const absent=await execute(process.execPath,[entry],{cwd:tmpdir()});
  assert.equal(absent.status,2);
});

