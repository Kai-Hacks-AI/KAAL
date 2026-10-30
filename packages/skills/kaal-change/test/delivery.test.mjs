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

  it("decides delivery along a long chain of succession iteratively, deterministically, and propagates an unmet predecessor to its end", () => {
    const LENGTH = 20_000;
    const definitions = ["Change-Definition.md", "Succeeds.md"].map((f) => identify(readFileSync(join(PACKAGE, "capability", f))));
    const chain = [];
    for (let n = 1; n <= LENGTH; n++) {
      const name = `sample/C${n}`;
      const edges = n > 1 ? [{ type: SUCCEEDS, targets: [{ name: chain[n - 2].name, id: chain[n - 2].id }] }] : undefined;
      chain.push(identify(createNode({ name, type: CHANGE, ...(edges ? { edges } : {}), frontmatter: { requires: [`sample/T${n}`] }, body: `# ${name}\n` }).bytes));
    }
    const evidence = (failing) => ({
      by: "selector",
      evaluations: [{ run: "run-a", plan: "plan-a", result: failing ? "failed" : "passed", findings: [], cases: Object.fromEntries(chain.map((_, i) => [`sample/T${i + 1}`, failing === i + 1 ? "failed" : "passed"])) }],
    });
    const last = `sample/C${LENGTH}`;

    const passing = assess([...definitions, ...chain], { evidence: evidence(0) });
    assert.equal(passing.delivery(last).delivered, true, "every predecessor delivered, so the last Change is delivered");
    assert.equal(passing.succeeds(last, { transitive: true }).length, LENGTH - 1, "and its transitive view holds the whole chain");

    const blocked = assess([...definitions, ...chain], { evidence: evidence(1) });
    assert.deepEqual(blocked.delivery("sample/C1").unmet, [{ case: "sample/T1", result: "failed" }], "the first Change is unmet");
    for (const n of [2, LENGTH / 2, LENGTH]) {
      const d = blocked.delivery(`sample/C${n}`);
      assert.equal(d.satisfied, true, `sample/C${n} satisfies its own Case`);
      assert.equal(d.delivered, false, `and is not delivered, because the unmet predecessor propagates`);
      assert.deepEqual(d.awaiting, [`sample/C${n - 1}`], "awaiting its direct predecessor");
    }
    const reversed = assess([...chain].reverse().concat(definitions), { evidence: evidence(1) });
    assert.deepEqual(reversed.exchange(), blocked.exchange(), "the order of the Nodes never matters");
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
