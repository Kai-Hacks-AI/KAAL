// Code tests for the type declarations (graph/C7): node.d.ts declares node.mjs's exports by
// itself, beside form.d.ts only, so a byte-for-byte copy of form.mjs and node.mjs can ship their
// declarations with them; edges.d.ts re-exports it and still declares every value edges.mjs exports.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPTS = fileURLToPath(new URL("../../skills/kaal-graph/scripts/", import.meta.url));
const text = (f) => readFileSync(`${SCRIPTS}${f}`, "utf8");

/** The values a declaration file exports: functions, classes and non-type names in export lists. */
function values(source) {
  const names = new Set();
  for (const [, n] of source.matchAll(/^export (?:declare )?(?:function|class|const) (\w+)/gm)) names.add(n);
  for (const [, list] of source.matchAll(/^export \{([^}]*)\}/gm)) for (const item of list.split(",").map((s) => s.trim()).filter(Boolean)) if (!item.startsWith("type ")) names.add(item.split(/\s+as\s+/).pop());
  return [...names].sort();
}

/** The types a declaration file exports. */
function types(source) {
  const names = new Set();
  for (const [, n] of source.matchAll(/^export (?:interface|type) (\w+)/gm)) names.add(n);
  for (const [, list] of source.matchAll(/^export \{([^}]*)\}/gm)) for (const item of list.split(",").map((s) => s.trim())) if (item.startsWith("type ")) names.add(item.slice(5));
  return [...names].sort();
}

/** What a declaration file imports from. */
const sources = (source) => [...source.matchAll(/from "([^"]+)"/g)].map((m) => m[1]);

describe("declarations", () => {
  it("node.d.ts declares exactly the values node.mjs exports, and imports only form.d.ts", async () => {
    const runtime = Object.keys(await import(`${SCRIPTS}node.mjs`)).sort();
    assert.deepEqual(values(text("node.d.ts")), runtime);
    assert.deepEqual([...new Set(sources(text("node.d.ts")))], ["./form.js"]);
    assert.deepEqual(types(text("node.d.ts")), ["Identity", "Ref"]);
  });

  it("edges.d.ts takes node.mjs's declarations from node.d.ts, defines none of them again, and declares every value edges.mjs exports", async () => {
    const edges = text("edges.d.ts");
    assert.match(edges, /^export \{ claimsForm, identify, identifyRoot, sha256, type Identity, type Ref \} from "\.\/node\.js";$/m);
    for (const own of ["interface Ref", "interface Identity", "function sha256", "function claimsForm", "function identify", "function identifyRoot"]) assert.doesNotMatch(edges, new RegExp(`^export ${own}\\b`, "m"), own);
    assert.deepEqual(values(edges), Object.keys(await import(`${SCRIPTS}edges.mjs`)).sort());
  });
});
