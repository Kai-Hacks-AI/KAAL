// Scoped T1-T3 architecture evidence: the configuration engine, not the future whole Skill.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { it } from "node:test";
import { inspect } from "kaal-hosting/conformance";
const path = "lib/branching.mjs";
const source = () => readFile(new URL("../../lib/branching.mjs",import.meta.url));
it("branching/T1 (configuration slice): pure delivered validator has no host imports or unjudged constructs",async()=>{
  const r=await inspect({[path]:await source()},{builtins:[]});
  assert.deepEqual(r.violations,[]);
  assert.deepEqual(r.outside,[]);
  assert.deepEqual(r.validation,[]);
});
it("branching/T2 (configuration slice): injected filesystem import is prohibited with its location",async()=>{
  const r=await inspect({[path]:Buffer.concat([Buffer.from('import fs from "node:fs";\n'),await source()])},{builtins:[]});
  assert.ok(r.violations.some(v=>v.file===path&&v.builtin==="node:fs"&&v.line===1));
});
it("branching/T3 (configuration slice): dynamic host access remains an unjudged validation item",async()=>{
  const r=await inspect({[path]:Buffer.concat([await source(),Buffer.from('\nprocess.getBuiltinModule("fs");\n')])},{builtins:[]});
  assert.deepEqual(r.violations,[]);
  assert.ok(r.validation.some(v=>v.file===path&&v.construct==="process.getBuiltinModule"));
});

