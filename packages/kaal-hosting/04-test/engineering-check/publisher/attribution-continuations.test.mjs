// Independent-review continuations; preceding frozen regression files remain unchanged.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import { portability } from "@kaihacksai/kaal-hosting/boundary";

async function audit(t, expression) {
  const root = mkdtempSync(join(tmpdir(), "hosting-continuation-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "test"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "portable-fixture", type: "module" }));
  writeFileSync(join(root, "test/sample.test.mjs"), `import {it,test} from 'node:test';\nconst flag=true;\nif(process.platform==='win32')\n ${expression}\ntest('after',()=>{});\n`);
  return await portability({ name: "portable-fixture", root, builtins: ["node:test"] });
}

it("hosting/T97 [hosting/F40, hosting/N6]: logical registration continuations end before an adjacent case", async (t) => {
  for (const operator of ["&&", "||", "??"]) {
    const result = await audit(t, `test('first',()=>{}) ${operator} test('continued',()=>{})`);
    assert.deepEqual(result.challenged, ["continued", "first"], operator);
    assert.equal(result.review, "requested");
  }
});

it("hosting/T98 [hosting/F40, hosting/N6]: a newline comma continuation retains every controlled registration only", async (t) => {
  const result = await audit(t, `test('first',()=>{})\n , test('continued',()=>{})`);
  assert.deepEqual(result.challenged, ["continued", "first"]);
  assert.equal(result.review, "requested");
});

it("hosting/T99 [hosting/F40, hosting/N6]: terminal identifiers and literals end the controlled expression without borrowing the next case", async (t) => {
  for (const operand of ["flag", "true", "1", "'literal'", "`literal`", "({})"]) {
    const result = await audit(t, `test('first',()=>{}) && ${operand}`);
    assert.deepEqual(result.challenged, ["first"], operand);
    assert.equal(result.review, "requested");
  }
});
