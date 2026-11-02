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
