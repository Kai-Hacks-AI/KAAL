// Case release/T455 (release/C34): source and table agree
import { test } from "node:test";
import assert from "node:assert/strict";
import { NAMES, set1, controls } from "./helper.mjs";

// A row is `| <ruleset> | <rule type> | <parameter or context> | <value> | ...`.
const rows = (text) => text.split("\n").filter((l) => /^\| (promotion|integration|hotfixing|wiring|publishing) \|/.test(l)).map((l) => l.split("|").map((c) => c.trim()).slice(1, 5));

test("release/T455 [release/C34]: every rule type, parameter and required context in the JSON is a row of controls.md, and every row is in the JSON", () => {
  const table = rows(controls());
  const fromJson = [];
  for (const n of NAMES) {
    for (const r of set1()[n].rules) {
      fromJson.push([n, r.type, "", ""]);
      for (const [k, v] of Object.entries(r.parameters ?? {})) {
        if (k === "required_status_checks") for (const c of v) fromJson.push([n, "required_status_checks", c.context, ""]);
        else fromJson.push([n, r.type, k, JSON.stringify(v)]);
      }
    }
  }
  const key = (x) => `${x[0]}|${x[1]}|${x[2]}`;
  const t = new Set(table.filter((x) => !/^open$/i.test(x[3])).map(key)), j = new Set(fromJson.map(key));
  for (const k of j) assert.ok(t.has(k) || t.has(k.replace(/\|[^|]*$/, "|")), `JSON setting without a row: ${k}`);
  for (const k of t) assert.ok(j.has(k) || j.has(k.replace(/\|[^|]*$/, "|")), `row without a JSON setting: ${k}`);
});
