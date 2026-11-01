import assert from "node:assert/strict";
import { it } from "node:test";
import { validateConfiguration } from "../../lib/branching.mjs";
import { embed } from "../fixtures/configuration.mjs";
it("long escaped-quote input retains token boundaries and reports the actual schema finding",()=>{
  const c=structuredClone(embed); c.unrecognized='"'+ '\\"'.repeat(20000);
  const r=validateConfiguration(JSON.stringify(c));
  assert.equal(r.kind,"fail");
  assert.ok(r.findings.some(f=>f.code==="unknown"&&f.path==="$.unrecognized"));
});
it("a branch name starting with a hyphen is refused, including a prefix stem",()=>{
  for(const [role,selector] of [[0,{exact:"-release"}],[1,{prefix:"-train/"}]]) {
    const c=structuredClone(embed); c.roles[role].selector=selector;
    const r=validateConfiguration(JSON.stringify(c));
    assert.equal(r.kind,"fail");
    assert.ok(r.findings.some(f=>f.code==="ref"));
  }
});
it("duplicate keys are scoped per object, not across roles",()=>{
  assert.equal(validateConfiguration(JSON.stringify(embed)).kind,"pass");
});
it("duplicate keys with escaped spelling are diagnosed rather than overwritten",()=>{
  const text=JSON.stringify(embed).replace('"path":"engineering/github/holds.json"','"path":"engineering/github/holds.json","pa\\u0074h":"other"');
  const r=validateConfiguration(text);
  assert.equal(r.kind,"fail");
  assert.ok(r.findings.some(f=>f.code==="duplicate-key"&&f.path==="$.governance.holds.path"));
});
it("contradictory source/path combinations are rejected without reading the filesystem",()=>{
  const c=structuredClone(embed); c.governance.holds.source="authorized-policy-interface";
  const r=validateConfiguration(JSON.stringify(c));
  assert.equal(r.kind,"fail");
  assert.ok(r.findings.some(f=>f.code==="contradiction"));
});

