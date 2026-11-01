import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { it } from "node:test";
import { inspect } from "kaal-hosting/conformance";
const paths=["scripts/inspect.mjs","scripts/modules/runtime.mjs"];
const declaration={builtins:["node:module","node:path","node:url"]};
const VALIDATED=[{
  file:"scripts/modules/runtime.mjs",
  construct:"import(pathToFileURL(require.resolve(name)).href)",
  judgment:"Explicit operator-selected module-linker context loads the three literal public module names. This is a reviewed bootstrap dependency, not authenticated policy or full module-graph trust. Hosting owns input file reads."
}];
async function files(){
  return Object.fromEntries(await Promise.all(paths.map(async p=>[p,await readFile(new URL("../../skills/kaal-branching/"+p,import.meta.url))])));
}
const judged=r=>r.validation.map(({file,construct})=>({file,construct}));
it("inspection architecture: permitted bootstrap imports and exact judged dynamic lookup",async()=>{
  const r=await inspect(await files(),declaration);
  assert.deepEqual(r.inspected,paths);
  assert.deepEqual(r.violations,[]);
  assert.deepEqual(r.outside,[]);
  assert.deepEqual(judged(r),VALIDATED.map(({file,construct})=>({file,construct})));
  assert.ok(VALIDATED.every(v=>v.judgment.length>0));
  assert.ok(r.exclusions.some(x=>x.includes("CommonJS")),"module resolution remains a stated validation boundary");
});
it("inspection architecture: a filesystem import bypassing Hosting is prohibited",async()=>{
  const f=await files();f[paths[0]]=Buffer.concat([Buffer.from('import fs from "node:fs";\n'),f[paths[0]]]);
  const r=await inspect(f,declaration);
  assert.ok(r.violations.some(v=>v.file===paths[0]&&v.builtin==="node:fs"&&v.line===1));
});
it("inspection architecture: an extra dynamic host access remains unjudged",async()=>{
  const f=await files();f[paths[0]]=Buffer.concat([f[paths[0]],Buffer.from('\nprocess.getBuiltinModule("fs");\n')]);
  const r=await inspect(f,declaration);
  assert.deepEqual(r.violations,[]);
  assert.notDeepEqual(judged(r),VALIDATED.map(({file,construct})=>({file,construct})));
  assert.ok(r.validation.some(v=>v.file===paths[0]&&v.construct==="process.getBuiltinModule"));
});

