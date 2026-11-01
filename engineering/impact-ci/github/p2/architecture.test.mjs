import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'kaal-hosting';
import { inspect } from 'kaal-hosting/conformance';
import { fileURLToPath } from 'node:url';
const modules=['producer.mjs','provider.mjs','seal.mjs','source.mjs','sqlite.mjs'];
const sources=async()=>Object.fromEntries(await Promise.all(modules.map(async p=>[p,await readFile(fileURLToPath(new URL(p,import.meta.url)))])));
test('P2 architecture permitted: policy/completeness reused and host mechanics behind Hosting/Git ports',async()=>{
  const r=await inspect(await sources(),{builtins:[]});assert.deepEqual(r.violations,[]);assert.deepEqual(r.validation,[]);
  assert.deepEqual([...new Set(r.outside.map(x=>x.specifier))],['@kaihacksai/kaal-foundation/sha256']);
});
test('P2 architecture prohibited: direct native host access is located',async()=>{
  const f=await sources();f['producer.mjs']=Buffer.concat([Buffer.from("import fs from 'node:fs';\n"),f['producer.mjs']]);
  const r=await inspect(f,{builtins:[]});assert.deepEqual(r.violations.map(({file,line,builtin})=>({file,line,builtin})),[{file:'producer.mjs',line:1,builtin:'node:fs'}]);
});
test('P2 architecture undecidable: hidden host lookup remains a validation item',async()=>{
  const f=await sources();f['producer.mjs']=Buffer.concat([f['producer.mjs'],Buffer.from('\nprocess.getBuiltinModule("fs");\n')]);
  const r=await inspect(f,{builtins:[]});assert.deepEqual(r.violations,[]);
  assert.deepEqual(r.validation.map(({file,construct})=>({file,construct})),[{file:'producer.mjs',construct:'process.getBuiltinModule'}]);
});
