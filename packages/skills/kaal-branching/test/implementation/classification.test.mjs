import assert from "node:assert/strict";
import { it } from "node:test";
import { classify } from "../../lib/branching.mjs";
import { embed,observation,SHA } from "../fixtures/transactions.mjs";
const run=(o,c=embed)=>classify(JSON.stringify(c),JSON.stringify(o));
it("one repository observation cannot mix Git object ID formats",()=>{
  const o=observation();o.commits.push({sha:"f".repeat(64),parents:[]});
  assert.equal(run(o).kind,"cannot-judge");
});
it("a merge of an already incorporated promoted state is Engineer",()=>{
  const o=observation();const tip="7".repeat(40);
  o.base.tip=SHA.S;o.head.tip=tip;o.commits.push({sha:tip,parents:[SHA.S,SHA.M]});
  const r=run(o);assert.equal(r.kind,"pass");assert.equal(r.transaction.kind,"engineer");
});
it("a synchronization remains an intermediate candidate when promoted state advances",()=>{
  const o=observation(embed,"synchronize"),tip="7".repeat(40);
  o.promoted[0].tip=tip;o.commits.push({sha:tip,parents:[SHA.M]});
  const r=run(o);assert.equal(r.kind,"pass");assert.equal(r.transaction.kind,"synchronize");assert.equal(r.binding.incorporates,SHA.M);
});
it("a source on a promoted side-parent cannot count as an admitted first-parent state",()=>{
  const o=observation(embed,"synchronize"),side="7".repeat(40),tip="8".repeat(40);
  o.promoted[0].tip=tip;
  o.commits.push({sha:side,parents:[SHA.A]},{sha:tip,parents:[SHA.M,side]});
  o.commits.find(c=>c.sha===SHA.S).parents=[SHA.B,side];
  const r=run(o);assert.equal(r.kind,"fail");assert.equal(r.findings[0].code,"synchronization-source");
});
it("promotion classification keeps actual freshness as a pending obligation",()=>{
  const o=observation(embed,"promote");o.head.tip=SHA.C;
  const r=run(o);assert.equal(r.kind,"pass");assert.equal(r.transaction.kind,"promote");assert.ok(r.pendingObligations.includes("contains-target-tip"));
});
it("an unmatched source ref has no implicit working role without a configured remainder",()=>{
  const c=structuredClone(embed);c.roles.find(r=>r.category==="working").selector={exact:"task/allowed"};
  const r=run(observation(c),c);assert.equal(r.kind,"fail");assert.equal(r.findings[0].code,"prohibited");
});

