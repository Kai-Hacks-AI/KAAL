// core/C11 Code tests for typed artifacts and Type states, beside the planned outer tests in test/plan/.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { bootstrap, evaluate, foundation, payload, register, verify, type Files } from "kaal-core";
import { readdirSync } from "node:fs";

const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const ref = (r: { name: string; id: string }) => `\n  name: ${JSON.stringify(r.name)}\n  id: ${r.id}`;
const GUARD = `---\nname: Guard\ntype:${ref(foundation().capability)}\n---\n`;
const check = (capability: string) => `---\nname: Guard/Check\ntype:${ref(foundation().definition)}\ncapability: ${capability}\n---\n`;
const ARTIFACT = "---\ntype: Guard/Check\nruns: [hook]\n---\n";
const files = (extra: Record<string, string>): Files => ({ ...payload(), ...Object.fromEntries(Object.entries(extra).map(([p, t]) => [p, Buffer.from(t)])) });
const state = (extra: Record<string, string>) => evaluate(files({ "push.md": ARTIFACT, ...extra })).artifacts.find((a) => a.path === "push.md");

describe("kaal-core typed artifacts", () => {
  it("leaves an Engine with no typed artifacts as it was, with an empty list", () => {
    const e = evaluate(payload());
    assert.deepEqual(e.artifacts, []);
    assert.deepEqual(e.rejected, []);
  });

  it("says why a Type is unknown", () => {
    const owner = `{ name: Guard, id: "${sha(GUARD)}" }`;
    assert.match(state({ "Check.md": check(`{ name: Guard }`), "Guard.md": GUARD })!.findings[0].rule, /names no owning Capability/);
    assert.match(state({ "Check.md": check(`{ name: Guard, id: "${"0".repeat(64)}" }`) })!.findings[0].rule, /resolves to no admitted KAAL Capability/);
    const notADefinition = `---\nname: Guard/Check\ntype:${ref(foundation().skill)}\n---\n`;
    assert.match(state({ "Check.md": notADefinition })!.findings[0].rule, /not typed by KAAL Definition/);
    assert.equal(state({ "Check.md": check(owner), "Guard.md": GUARD })!.state, "registered");
  });

  it("verify fails on an invalid artifact only when Types are supplied, and never changes it", async () => {
    const root = mkdtempSync(join(tmpdir(), "kaal-c11-"));
    try {
      const dir = join(root, ".kaal");
      await bootstrap(dir);
      mkdirSync(join(dir, "config"));
      writeFileSync(join(dir, "config", "push.md"), ARTIFACT);
      const types = { "Guard/Check": { keys: { runs: { value: "enum" as const, list: true, values: ["ci"] } } } };
      const plain = await verify(dir);
      assert.equal(plain.ok, true, plain.problems.join("\n"));
      assert.equal(plain.engine.artifacts[0].state, "unregistered");
      const typed = await verify(dir, { types });
      assert.equal(typed.ok, false);
      assert.match(typed.problems.join("\n"), /config\/push\.md: Guard\/Check is invalid: runs \(value\)/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses a registration that would leave a typed artifact unknown, writing nothing", async () => {
    const root = mkdtempSync(join(tmpdir(), "kaal-c11-"));
    try {
      const dir = join(root, ".kaal");
      await bootstrap(dir);
      writeFileSync(join(dir, "push.md"), ARTIFACT);
      const before = readdirSync(dir).sort();
      await assert.rejects(register(dir, "capability", "guard", { "Guard.md": GUARD, "Check.md": check(`{ name: Guard }`) }), /would leave push\.md with an unknown Type.*nothing was written/);
      assert.deepEqual(readdirSync(dir).sort(), before);
      assert.equal((await verify(dir)).ok, true);
      const owner = `{ name: Guard, id: "${sha(GUARD)}" }`;
      await register(dir, "capability", "guard", { "Guard.md": GUARD, "Check.md": check(owner) });
      const after = await verify(dir);
      assert.equal(after.ok, true, after.problems.join("\n"));
      assert.equal(after.engine.artifacts[0].state, "registered");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
