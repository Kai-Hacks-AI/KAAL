// Review-discovered ternary false branch; preceding frozen files remain unchanged.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import { portability } from "@kaihacksai/kaal-hosting/boundary";

it("hosting/T100 [hosting/F40, hosting/N6]: a multiline ternary retains both controlled alternatives without the next case", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "hosting-ternary-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "test"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "portable-fixture", type: "module" }));
  writeFileSync(join(root, "test/sample.test.mjs"), `import {it,test} from 'node:test';\nif(process.platform==='win32')\n test('first',()=>{})\n ? test('yes',()=>{})\n : test('no',()=>{})\ntest('after',()=>{});\n`);
  const result = await portability({ name: "portable-fixture", root, builtins: ["node:test"] });
  assert.deepEqual(result.challenged, ["first", "no", "yes"]);
  assert.equal(result.review, "requested");
});
