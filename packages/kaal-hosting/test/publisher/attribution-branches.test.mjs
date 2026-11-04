// Additional D4 regressions discovered by independent review; no existing test changes.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import { portability } from "@kaihacksai/kaal-hosting/boundary";

async function audit(t, code) {
  const root = mkdtempSync(join(tmpdir(), "hosting-attribution-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "test"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "portable-fixture", type: "module" }));
  writeFileSync(join(root, "test/sample.test.mjs"), `import {it,test} from 'node:test';\nconst flag=true;\n${code}\n`);
  return await portability({ name: "portable-fixture", root, builtins: ["node:test"] });
}

it("hosting/T90 [hosting/F40, hosting/N6]: either conditional registration alternative challenges its literal case only", async (t) => {
  for (const callee of ["process.platform==='win32' ? it : ()=>{}", "process.platform==='win32' ? ()=>{} : it", "process.platform==='win32' ? test : ()=>{}"] ) {
    const result = await audit(t, `(${callee})('conditional',()=>{});\nit('after',()=>{});`);
    assert.deepEqual(result.challenged, ["conditional"], callee);
    assert.equal(result.review, "requested");
  }
});

it("hosting/T91 [hosting/F40, hosting/N6]: an else-if chain challenges every controlled case without the following registration", async (t) => {
  const result = await audit(t, `it('before',()=>{});\nif(process.platform==='win32'){\n it('first',()=>{});\n}else if(flag){\n it('otherwise-if',()=>{});\n}else{\n it('otherwise',()=>{});\n}\nit('after',()=>{});`);
  assert.deepEqual(result.challenged, ["first", "otherwise", "otherwise-if"]);
  assert.equal(result.review, "requested");
});

it("hosting/T92 [hosting/F40, hosting/N6]: a semicolon-free registration statement does not borrow the next case", async (t) => {
  const result = await audit(t, `if(process.platform==='win32')\n it('first',()=>{})\nit('after',()=>{});`);
  assert.deepEqual(result.challenged, ["first"]);
  assert.equal(result.review, "requested");
});

it("hosting/T93 [hosting/F40, hosting/N6]: nested unbraced else-if and multiline registration arguments retain their exact extent", async (t) => {
  const result = await audit(t, `if(process.platform==='win32')\n it(\n 'first',\n ()=>{}\n )\nelse if(flag)\n test('otherwise-if',()=>{})\nelse\n it('otherwise',()=>{})\nit('after',()=>{});`);
  assert.deepEqual(result.challenged, ["first", "otherwise", "otherwise-if"]);
  assert.equal(result.review, "requested");
});

it("hosting/T111 [hosting/F29, hosting/F40]: a return in the platform branch itself challenges the case, and a return inside a nested function, method, accessor or string does not", async (t) => {
  const W = "if(process.platform==='win32')";
  const challenged = async (branch) => (await audit(t, `it('c1',()=>{\n${W}${branch}\nassertSomething();\n});`)).challenged;
  assert.deepEqual(await challenged("{cleanup();return;}"), ["c1"]);
  assert.deepEqual(await challenged("return;"), ["c1"]);
  assert.deepEqual(await challenged("{if(x){return;}}"), ["c1"]);
  assert.deepEqual(await challenged("{const f=()=>{return 1;};f();}"), []);
  assert.deepEqual(await challenged("{const o={value(){return 1;}};o.value();}"), []);
  assert.deepEqual(await challenged("{const o={get v(){return 1;}};o.v;}"), []);
  assert.deepEqual(await challenged("{log('return');}"), []);
  assert.deepEqual(await challenged("{const f=()=>{log('}');return 1;};f();}"), []);
  assert.deepEqual(await challenged("{const f=()=>{log('{');return 1;};f();return;}"), ["c1"]);
  assert.deepEqual(await challenged("{const o={return:1};use(o);}"), []);
  assert.deepEqual(await challenged("{const keyword=/return/;use(keyword);}"), []);
  assert.deepEqual(await challenged("{const k=/[/]return/g;use(k);}"), []);
  assert.deepEqual(await challenged("{const f=()=>{log('\u{1F600}');return 1;};f();}"), []);
  assert.deepEqual(await challenged("{const g=function* (){return 1;};g();}"), []);
  assert.deepEqual(await challenged("{const g=function*(){return 1;};const h=async function (){return 2;};g();h();}"), []);
  assert.deepEqual(await challenged("{const o={*gen(){return 1;}};o.gen();}"), []);
  assert.deepEqual(await challenged("{const half=a/2;return;}"), ["c1"]);
  assert.deepEqual(await challenged("cleanup(); return checkResult();"), []);
  assert.deepEqual(await challenged("cleanup();\nreturn checkResult();"), []);
  assert.deepEqual(await challenged("return; cleanup();"), ["c1"]);
  assert.deepEqual(await challenged("cleanup(); else return;"), ["c1"]);
  assert.deepEqual(await challenged("{const q=x / 2 / 3;use(q);return;}"), ["c1"]);
});

it("hosting/T112 [hosting/F29, hosting/F40]: a return inside a TypeScript function, method or accessor with a return type is not a return from the test", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "hosting-attribution-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "test"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "portable-fixture", type: "module" }));
  const challenged = async (branch) => {
    writeFileSync(join(root, "test/sample.test.mts"), `import {it} from 'node:test';\nit('c1',()=>{\nif(process.platform==='win32')${branch}\nassertSomething();\n});\n`);
    return (await portability({ name: "portable-fixture", root, builtins: ["node:test"] })).challenged;
  };
  assert.deepEqual(await challenged("{function helper(): number {return 1;} helper();}"), []);
  assert.deepEqual(await challenged("{function identity<T>(value: T): T {return value;} identity(1);}"), []);
  assert.deepEqual(await challenged("{const o={pick<K extends string>(k: K): K {return k;}};o.pick('a');}"), []);
  assert.deepEqual(await challenged("{function identity<T>(value: T): T {return value;} identity(1); return;}"), ["c1"]);
  assert.deepEqual(await challenged("{const o={value(): number {return 1;}};o.value();}"), []);
  assert.deepEqual(await challenged("{const o={get v(): number {return 1;}};o.v;}"), []);
  assert.deepEqual(await challenged("{function helper(): Array<string> | undefined {return undefined;} helper(); return;}"), ["c1"]);
  assert.deepEqual(await challenged("{switch(x){case (1): {return;}}}"), ["c1"]);
});
