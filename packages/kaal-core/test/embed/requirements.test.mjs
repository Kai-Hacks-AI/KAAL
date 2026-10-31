// Delivered Requirements loop (core/F70): Core's contracts, checked against the installed copy.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { readFile } from "kaal-hosting";
import { evaluate, foundation, payload } from "kaal-core";
import { validate } from "kaal-core/frontmatter";
import { installationConformance } from "kaal-core/conformance";
import { checkContract } from "kaal-core/installation";
import { assemble } from "kaal-core/registration";

const contract = async () => JSON.parse((await readFile(fileURLToPath(new URL("../../installation.kaal.json", import.meta.url)))).toString("utf8"));

describe("kaal-core Requirements loop", () => {
  it("admits every Node of the payload, rejects none, and keeps the foundational ids [core/F23, core/F32]", () => {
    const e = evaluate(payload());
    assert.deepEqual(e.rejected, []);
    const f = foundation();
    for (const ref of [f.node, f.definition, f.capability, f.agent, f.skill, f.extension]) {
      assert.ok(e.nodes.some((n) => n.id === ref.id && n.name === ref.name), `${ref.name} is admitted by its id`);
    }
  });

  it("validates frontmatter against a supplied schema, and the body never changes the result [core/F1, core/F5]", () => {
    const types = { "Acme/Note": { keys: { status: { value: "enum", values: ["open", "done"], required: true } } } };
    const doc = (status, body) => new TextEncoder().encode(`---\ntype: Acme/Note\nstatus: ${status}\n---\n\n${body}\n`);
    assert.equal(validate(doc("open", "any prose"), types).verdict, "valid");
    assert.equal(validate(doc("open", "status: nonsense"), types).verdict, "valid");
    assert.equal(validate(doc("later", "any prose"), types).verdict, "invalid");
  });

  it("ships an Installation Contract that conforms, and Core's conformance cases hold on it [core/F11, core/F19]", async () => {
    const c = await contract();
    assert.deepEqual(checkContract(c), []);
    for (const r of installationConformance(c)) assert.equal(r.holds, true, `${r.id}: ${r.failures.join("; ")}`);
  });

  it("finds what a registration gets wrong: unknown kinds with candidates, unresolved targets, traces the rule does not permit [core/F50, core/F52, core/F55]", () => {
    const r = assemble([
      { holder: "kaal-requirements", scope: "requirements", kinds: { F: { traces: [] } } },
      {
        holder: "acme",
        scope: "acme",
        instances: [
          { id: "x", kind: "F", traces: [] },
          { id: "y", kind: { scope: "requirements", kind: "F" }, traces: ["z", "w"] },
          { id: "w", kind: { scope: "requirements", kind: "F" }, traces: [] },
        ],
      },
    ]);
    const rules = r.findings.map((f) => f.rule);
    assert.ok(rules.includes("unknown kind"), "a bare name resolves only in its own scope");
    assert.deepEqual(r.findings.find((f) => f.rule === "unknown kind").candidates, [{ scope: "requirements", kind: "F", owner: "kaal-requirements" }]);
    assert.ok(rules.some((x) => x.startsWith("unresolved")), "a target that does not exist is a finding");
    assert.ok(rules.includes("not permitted by the rule"), "an empty rule permits nothing");
    assert.ok(r.findings.every((f) => f.verdict === "core"), "each finding is Core's global verdict");
  });
});
