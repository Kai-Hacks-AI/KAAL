// change/C8 Code tests for kaal-change/delivery, beside the planned outer
// tests in test/plan/delivery.test.mjs: the shipped Definitions the runtime
// names, and how it loads its optional complement, Graph (change/A12).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { createNode, identify } from "kaal-graph";
import { assess } from "kaal-change/delivery";
import { CHANGE, DELIVERS, SUCCEEDS } from "../lib/definitions.mjs";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));

/** Runs `assess([])` from a copy of lib/ in a directory outside the workspace, with the given node_modules. */
function isolated(modules = {}) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-change-delivery-"));
  try {
    cpSync(join(PACKAGE, "lib"), join(dir, "lib"), { recursive: true });
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "isolated", private: true, type: "module" }));
    for (const [name, source] of Object.entries(modules)) {
      mkdirSync(join(dir, "node_modules", name), { recursive: true });
      writeFileSync(join(dir, "node_modules", name, "package.json"), JSON.stringify({ name, type: "module", exports: "./index.mjs" }));
      writeFileSync(join(dir, "node_modules", name, "index.mjs"), source);
    }
    const probe = `const { assess } = await import("./lib/delivery.mjs"); process.stdout.write(JSON.stringify(assess([])));`;
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", probe], { cwd: dir, encoding: "utf8", timeout: 60_000 });
    return { status: r.status, out: r.stdout, err: r.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("kaal-change/delivery (change/C8)", () => {
  it("names exactly the Definitions it ships", () => {
    for (const [ref, file] of [[CHANGE, "Change-Definition.md"], [SUCCEEDS, "Succeeds.md"], [DELIVERS, "Delivers.md"]]) {
      const node = identify(readFileSync(join(PACKAGE, "capability", file)));
      assert.deepEqual(ref, { name: node.name, id: node.id }, `${file} is the Definition the runtime names`);
    }
  });

  it("is provided by the Capability Node", () => {
    assert.match(readFileSync(join(PACKAGE, "capability", "Change.md"), "utf8"), /^It also provides the Succeeds and Delivers Definitions,/m);
  });

  it("cites in its basis every counted evaluation, including one that does not pass", () => {
    const definition = identify(readFileSync(join(PACKAGE, "capability", "Change-Definition.md")));
    const node = identify(createNode({ name: "sample/C1", type: CHANGE, frontmatter: { requires: ["sample/T1"] }, body: "# sample/C1\n" }).bytes);
    const evaluation = { run: "failed-run", plan: "plan-a", result: "failed", cases: { "sample/T1": "failed" }, findings: [] };
    const r = assess([definition, node], { evidence: { by: "selector", evaluations: [evaluation] } });
    assert.deepEqual(r.delivery("sample/C1"), { satisfied: false, delivered: false, unmet: [{ case: "sample/T1", result: "failed" }], awaiting: [], by: "selector", basis: ["failed-run"] });
  });

  it("does not walk a Change whose Edges are malformed, so it is never delivered on relationships Graph dropped", () => {
    const definition = identify(readFileSync(join(PACKAGE, "capability", "Change-Definition.md")));
    const first = identify(createNode({ name: "sample/C1", type: CHANGE, frontmatter: { requires: ["sample/T1"] }, body: "# sample/C1\n" }).bytes);
    const pin = `      - name: sample/C1\n        id: ${first.id}\n`;
    const second = identify(Buffer.from([
      "---", "name: sample/C2", "type:", `  name: ${CHANGE.name}`, `  id: ${CHANGE.id}`, "edges:", "  - type:", `      name: ${SUCCEEDS.name}`, `      id: ${SUCCEEDS.id}`, "    targets:",
    ].join("\n") + "\n" + pin + pin + "requires:\n  - sample/T2\n---\n\n# sample/C2\n"));
    const evaluation = { run: "run-a", plan: "plan-a", result: "passed", cases: { "sample/T2": "passed" }, findings: [] };
    const r = assess([definition, first, second], { evidence: { by: "selector", evaluations: [evaluation] } });
    assert.equal(r.has("sample/C2"), false, "it is not walked");
    assert.equal(r.delivery("sample/C2"), undefined, "and has no delivery result");
    const finding = r.findings.find((f) => f.change === "sample/C2");
    assert.equal(finding?.kind, "malformed");
    assert.equal(finding.reason, "malformed Edges");
    assert.ok(finding.problems.some((p) => /repeats target sample\/C1/.test(p)), JSON.stringify(finding));
  });

  it("without Graph, gives cannot-assess and no verdict, view or exchange", () => {
    const r = isolated();
    assert.equal(r.status, 0, r.err);
    assert.deepEqual(JSON.parse(r.out), {
      findings: [{ kind: "cannot-assess", peer: "kaal-graph", next: [{ action: "install", peer: "kaal-graph" }, { action: "analyze" }] }],
    });
  });

  it("propagates any other failure to load Graph, such as a missing dependency of Graph", () => {
    const r = isolated({ "kaal-graph": `import "kaal-graph-missing-dependency";\n` });
    assert.notEqual(r.status, 0, "it is not reported as cannot-assess");
    assert.match(r.err, /kaal-graph-missing-dependency/);
  });
});
