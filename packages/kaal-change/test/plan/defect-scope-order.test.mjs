// Defect (Codex review on #938, valid, out of scope there): an isolation verdict must not depend on
// the order of the selected scope. This is a known-RED Defect Case. It is not part of any gating test
// script. It is run by hand until the fixing Change turns it GREEN and moves it into test/embed.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isolate } from "@kaihacksai/kaal-change/isolation";
import { example } from "../fixtures/model.mjs";

const assess = (scope) => {
  const { proposal, model } = example({ scope });
  const r = isolate(proposal, model);
  return { assessment: r.assessment, findings: r.findings.map((f) => `${f.kind}:${f.code}:${f.subject ?? f.target}`).sort() };
};

describe("Defect: isolation verdict depends on scope order", () => {
  it("gives one assessment and one set of findings for any permutation of a scope that names an unimpacted owner and a missing owner", () => {
    // `provider` is inventoried but not impacted by shop/I1; `missing` has no owner source.
    for (const [a, b] of [[["provider", "missing"], ["missing", "provider"]], [["shop", "provider", "missing"], ["shop", "missing", "provider"]]])
      assert.deepEqual(assess(a), assess(b), `order changed the result: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
  });
});
