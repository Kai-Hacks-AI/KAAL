// Case release/T458 (release/C34): nothing of the old three is lost without a listed reason
import { test } from "node:test";
import assert from "node:assert/strict";
import { set1, controls, baseline, contexts } from "./helper.mjs";

const SUCCESSOR = { "old promotion": "promotion", "old integration": "integration", "old publishing": "publishing" };

test("release/T458 [release/C34]: every rule type, parameter and required context of each old ruleset is in its successor or is a listed changed row", () => {
  const s = set1(), table = controls();
  for (const old of baseline()) {
    const next = s[SUCCESSOR[old.name]];
    assert.ok(next, `${old.name} has a successor`);
    assert.deepEqual(next.conditions.ref_name.include.slice().sort(), old.name === "old promotion" ? ["~DEFAULT_BRANCH"] : old.conditions.ref_name.include.slice().sort(), `${old.name}: same target`);
    for (const r of old.rules) {
      const n = next.rules.find((x) => x.type === r.type);
      assert.ok(n, `${old.name}: rule ${r.type} kept`);
      for (const [k, v] of Object.entries(r.parameters ?? {})) {
        if (k === "required_status_checks") {
          for (const c of v) assert.ok(contexts(next).includes(c.context), `${old.name}: check ${c.context} kept`);
        } else if (JSON.stringify(n.parameters[k]) !== JSON.stringify(v)) {
          assert.match(table, new RegExp(`\\|\\s*${SUCCESSOR[old.name]}\\s*\\|\\s*${r.type}\\s*\\|\\s*${k}\\s*\\|[^\\n]*changed`, "i"), `${old.name}: ${r.type}.${k} differs and is not a listed changed row`);
        }
      }
    }
  }
});
