// Guard outer acceptance, Engineering part: one authority per identifier (guard/N14, guard/A20). The
// product's identifiers are defined only in the package's docs/, Engineering's only in engineering/guard/,
// and each exactly once. Planned in guard/C102; written in guard/C103.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const PRODUCT = join(ROOT, "packages/kaal-guard");
const ENGINEERING = join(ROOT, "engineering/guard");

const markdown = (dir) => readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => join(dir, f));

/**
 * The identifiers a document defines, with where. A definition opens its line in bold, as
 * "**guard/F1 Check list.**" or "- **guard/A1 …**". A Test Case is defined by a row of the product's
 * trace, "| guard/T61 | …", or by a row of Engineering's plan that gives its title, "| guard/T1: … |";
 * a Defect by a row of Engineering's register, "| guard/D1 | …". A mention anywhere else, an evidence
 * row included, is a citation.
 */
function definitions(file, product) {
  const text = readFileSync(file, "utf8");
  const where = relative(ROOT, file).split("\\").join("/");
  const rows = product ? /^\| (guard\/T\d+) \|/gm : /^\| (guard\/T\d+):|^\| (guard\/D\d+) \|/gm;
  const ids = [
    ...[...text.matchAll(/^(?:- )?\*\*(guard\/[IFNA]\d+)\b/gm)].map((m) => m[1]),
    ...[...text.matchAll(rows)].map((m) => m[1] ?? m[2]),
  ];
  return ids.map((id) => ({ id, where }));
}

/** The identifiers the titles of the delivered cases cite. */
function cited() {
  const dir = join(PRODUCT, "test/acceptance");
  const ids = new Set();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".test.mjs"))) {
    for (const m of readFileSync(join(dir, file), "utf8").matchAll(/\b(?:describe|it|test)\(\s*"([^"]*)"/g)) {
      for (const id of m[1].match(/guard\/[IFNAT]\d+/g) ?? []) ids.add(id);
    }
  }
  return ids;
}

describe("guard/N14 [guard/I9] one authority", () => {
  it("guard/T111 [guard/N14, guard/A20]: every Guard identifier is defined exactly once, every identifier a delivered case cites only in packages/kaal-guard/docs/, and every one of them is defined", () => {
    const product = markdown(join(PRODUCT, "docs")).flatMap((f) => definitions(f, true));
    const engineering = markdown(ENGINEERING).flatMap((f) => definitions(f, false));
    const all = [...product, ...engineering];
    const twice = [...new Set(all.map((d) => d.id))]
      .filter((id) => all.filter((d) => d.id === id).length > 1)
      .map((id) => `${id}: ${all.filter((d) => d.id === id).map((d) => d.where).join(", ")}`);
    assert.deepEqual(twice, [], "identifiers defined more than once");
    const inProduct = new Set(product.map((d) => d.id));
    const inEngineering = new Set(engineering.map((d) => d.id));
    const ids = [...cited()].sort();
    assert.ok(ids.length > 0, "no delivered case cites an identifier");
    assert.deepEqual(ids.filter((id) => inEngineering.has(id)), [], "identifiers delivered cases cite are defined in engineering/guard/, not in the package");
    assert.deepEqual(ids.filter((id) => !inProduct.has(id)), [], "identifiers delivered cases cite are not defined in packages/kaal-guard/docs/");
  });
});
