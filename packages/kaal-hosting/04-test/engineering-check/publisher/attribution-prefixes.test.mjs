// Further independent-review D4 extent probes; the preceding frozen tests remain unchanged.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import { portability } from "@kaihacksai/kaal-hosting/boundary";

async function audit(t, code) {
  const root = mkdtempSync(join(tmpdir(), "hosting-extent-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "test"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "portable-fixture", type: "module" }));
  writeFileSync(join(root, "test/sample.test.mjs"), `import {it,test} from 'node:test';\n${code}\n`);
  return await portability({ name: "portable-fixture", root, builtins: ["node:test"] });
}

it("hosting/T94 [hosting/F40, hosting/N6]: awaited and unary semicolon-free registrations do not control the next case", async (t) => {
  for (const expression of ["await test('first',()=>{})", "void it('first',()=>{})", "(it('first',()=>{}))", "await (test('first',()=>{}))"]) {
    const result = await audit(t, `if(process.platform==='win32')\n ${expression}\ntest('after',()=>{});`);
    assert.deepEqual(result.challenged, ["first"], expression);
    assert.equal(result.review, "requested");
  }
});

it("hosting/T95 [hosting/F40, hosting/N6]: an awaited subtest challenges its enclosing parent and controlled child without an adjacent child", async (t) => {
  const result = await audit(t, `test('parent',async t=>{\n if(process.platform==='win32')\n  await t.test('first',()=>{})\n await t.test('after',()=>{});\n});`);
  assert.deepEqual(result.challenged, ["first", "parent"]);
  assert.equal(result.review, "requested");
});

it("hosting/T96 [hosting/F40, hosting/N6]: a registration expression continuation remains in the controlled statement", async (t) => {
  const result = await audit(t, `if(process.platform==='win32')\n test('first',()=>{})\n .then(()=>test('continued',()=>{}))\ntest('after',()=>{});`);
  assert.deepEqual(result.challenged, ["continued", "first"]);
  assert.equal(result.review, "requested");
});
