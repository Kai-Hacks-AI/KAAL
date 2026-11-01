// Guard PLAN-owned binding tests; explicit invocation only, not an admitted C129 suite.
import assert from "node:assert/strict";
import { it } from "node:test";
import { given, clone, withoutTiming, A, B } from "./fixtures.mjs";
async function candidate() {
  let m;
  try { m = await import("../../timing.mjs"); }
  catch(e) { assert.fail(`blocked before behavioural assertion: Guard timing projection is absent (${e.code ?? e.message})`); }
  assert.equal(typeof m.attachTiming,"function","blocked before behavioural assertion: no attachTiming export");
  return m.attachTiming;
}
async function project(f = given()) {
  const attach = await candidate(), before = clone(f);
  const r = await attach(f.record,f.evidence,f.authority);
  assert.deepEqual(f,before,"inputs, outcomes and independent authority are unchanged");
  assert.deepEqual(withoutTiming(r.record),f.record,"timing changes no outcome-record field, row, reason or suite status");
  return r;
}
const finding = (r, code) => assert.ok(r.findings.some((f) => f.code === code),`missing ${code}`);
const untimed = (r,i,code) => { assert.ok(!("timing" in r.record.cases[i])); finding(r,code); };
async function positive() {
  const r = await project();
  assert.equal(r.record.schema,"guard-run-timing/1");
  assert.equal(r.record.cases[0].timing.ms,0);
  assert.equal(r.record.cases[1].timing.ms,8);
  assert.deepEqual(r.findings,[]);
  return r;
}
it("guard/timing-producer/P01: one bound terminal Case event keeps exact ms, zero and stable loaded-file identity",async()=>{
  const r = await positive();
  assert.deepEqual(r.record.cases[0].timing,{ms:0,unit:"ms",scope:"case",event:"invocation-1/worker-1/1",occurrences:1,fileVersion:{before:A,executed:A,after:A}});
});
it("guard/timing-producer/P02: duration is required, finite and nonnegative, never filled from wall time",async()=>{
  await positive();
  for(const value of [undefined,-1,Infinity,NaN,"8"]){const f=given();f.evidence.events[1].ms=value;untimed(await project(f),1,"duration-unavailable");}
});
it("guard/timing-producer/P03: skip, todo, suite and missing events do not become Case timing",async()=>{
  await positive();
  for(const fault of ["skip","todo","suite","missing"]){const f=given();
    if(fault==="suite")f.evidence.events[1].kind="suite";
    else if(fault==="missing")f.evidence.events.pop();
    else {f.evidence.events[1].ended=fault;f.record.cases[1].outcome="not run";f.record.cases[1].reason=fault;f.record.suites[0].status="not run";}
    untimed(await project(f),1,"execution-unavailable");
  }
});
it("guard/timing-producer/P04: duplicate instances or ambiguous Case/event bindings are not aggregated",async()=>{
  await positive();
  for(const fault of ["two-events","same-event","two-cases"]){const f=given();
    if(fault==="two-events")f.evidence.bindings[0].events.push(f.evidence.events[1].ref);
    if(fault==="same-event")f.evidence.events.push(clone(f.evidence.events[0]));
    if(fault==="two-cases")f.evidence.bindings[1].events=[f.evidence.events[0].ref];
    untimed(await project(f),0,"event-ambiguous");
  }
});
it("guard/timing-producer/P05: declared parent/child overlap is refused without dropping either outcome",async()=>{
  await positive();const f=given();f.evidence.events[1].declaredAncestors=["invocation-1/worker-1/1"];
  const r=await project(f);untimed(r,0,"timing-overlap");untimed(r,1,"timing-overlap");assert.equal(r.record.cases.length,2);
});
it("guard/timing-producer/P06: loaded bytes must match before/after, including an A-to-B-to-A load",async()=>{
  await positive();for(const field of ["before","executed","after"]){const f=given();f.evidence.loads[0][field]=B;untimed(await project(f),0,"file-version-unavailable");}
});
it("guard/timing-producer/P07: equal read-back hashes or a self-claimed receipt establish no executed-byte proof",async()=>{
  await positive();for(const fault of ["receipt","readback","chain","consistency"]){const f=given();
    if(fault==="receipt"){f.authority.receipts={};f.evidence.verified=true;}
    if(fault==="readback")f.authority.receipts["receipt-1"].mechanism="file-read-after-test";
    if(fault==="chain")f.authority.receipts["receipt-1"].chain="unreviewed-transformer";
    if(fault==="consistency")f.authority.receipts["receipt-1"].sourceConsistency="unknown";
    untimed(await project(f),0,"load-binding-unestablished");
  }
});
it("guard/timing-producer/P08: receipt, worker, invocation, file and source candidate bindings must agree",async()=>{
  await positive();for(const fault of ["host","candidate","invocation","worker","file"]){const f=given();
    if(fault==="host")f.evidence.context.host="win32";
    if(fault==="candidate")f.evidence.context.candidate="d".repeat(40);
    if(fault==="invocation")f.evidence.context.invocation="other-invocation";
    if(fault==="worker")f.evidence.loads[0].worker="other-worker";
    if(fault==="file")f.authority.receipts["receipt-1"].file="other-file.mjs";
    untimed(await project(f),0,"binding-conflict");
  }
});
it("guard/timing-producer/P09: completed failure retains timing without becoming passed or changing its reason",async()=>{
  const f=given();f.record.cases[1].outcome="failed";f.record.cases[1].reason="fixture failure";f.record.suites[0].status="failed";f.evidence.events[1].ended="fail";
  const r=await project(f);assert.ok(r.record.cases[1].timing,"completed failure retains its observed duration");assert.equal(r.record.cases[1].timing.ms,8);assert.equal(r.record.cases[1].outcome,"failed");assert.equal(r.record.cases[1].reason,"fixture failure");
});
it("guard/timing-producer/P10: an inconsistent event/outcome is a producer finding, never a timing repair",async()=>{
  await positive();const f=given();f.evidence.events[1].ended="fail";untimed(await project(f),1,"outcome-conflict");
});
it("guard/timing-producer/P11: one file load supports multiple Cases, but repeated loads remain unestablished",async()=>{
  const r=await positive();assert.equal(r.record.cases[0].timing.fileVersion.executed,r.record.cases[1].timing.fileVersion.executed);
  const f=given();f.evidence.loads.push(clone(f.evidence.loads[0]));untimed(await project(f),0,"load-binding-unestablished");
});
it("guard/timing-producer/P12: an absent producer binding cannot be supplied by the record itself",async()=>{
  await positive();const f=given();delete f.authority.producer;f.record.producer={revision:f.evidence.producer};f.record.verified=true;
  // Preserve all existing input fields, including untrusted producer metadata.
  const attach=await candidate(),before=clone(f);const r=await attach(f.record,f.evidence,f.authority);assert.deepEqual(f,before);
  assert.equal(r.record.candidate,f.record.candidate);assert.equal(r.record.verified,true);untimed(r,0,"producer-unestablished");
});
