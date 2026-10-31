// Guard outer acceptance, Engineering part: one authority per identifier (guard/N14, guard/A20). The
// product's identifiers are defined only in the package's docs/, Engineering's only in engineering/guard/,
// and each exactly once. Planned in guard/C102; written in guard/C103.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const PRODUCT = join(ROOT, "packages/kaal-guard");
const ENGINEERING = join(ROOT, "engineering/guard");
// External's Test Plan is its own (guard/C129), and its definitions are Engineering-side, never the product's.
const EXTERNAL = join(ENGINEERING, "external");

const ID = /guard\/[IFNATD]\d+/;

// A missing directory has no definitions, so every identifier it should hold is found undefined.
const documents = (dir) =>
  (existsSync(dir) ? readdirSync(dir) : [])
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ where: relative(ROOT, join(dir, f)).split("\\").join("/"), text: readFileSync(join(dir, f), "utf8") }));

/** "guard/T33–guard/T35" names three Test Cases. */
function range(from, to) {
  if (!to) return [from];
  const [a, b] = [from, to].map((id) => Number(id.slice("guard/T".length)));
  return Array.from({ length: b - a + 1 }, (_, i) => `guard/T${a + i}`);
}

/**
 * The canonical definitions in one document, and every other line that has the shape of a definition.
 * Canonical (guard/A20):
 * - guard/I, F, N and A open their line in bold, at the top level: "**guard/F1 …" or "- **guard/A1 …";
 * - a product Test Case is a row of the package's trace, between its markers: "| guard/T61 | …";
 * - an Engineering Test Case is a row of Engineering's plan that gives its title: "| guard/T1: …", or
 *   "| guard/T33–guard/T35: …" for several;
 * - a Defect that reached a published version is a row of the package's Limitations: "| guard/D1 | …";
 *   Engineering's register cites it as "| guard/D1 (product) | …";
 * - any other Defect is a row of Engineering's register: "| guard/D1 | …".
 * Shaped like a definition, and refused: an identifier in bold or underscores anywhere else, a heading
 * that opens with one, and a table row that opens with one in any other form. A code span quotes a form and
 * is neither. Engineering's evidence rows,
 * "| guard/T36 | GREEN |", "| guard/T36, guard/T42 | …" or "| guard/T65–guard/T68 | …", cite.
 */
function scan({ where, text }, product) {
  const defined = [];
  const refused = [];
  let trace = false;
  text.split(/\r?\n/).forEach((line, i) => {
    const at = `${where}:${i + 1}`;
    if (product && line.startsWith("<!-- trace:")) trace = true;
    if (product && line.startsWith("<!-- end of trace")) trace = false;
    // A code span quotes a form; it neither defines nor is refused.
    const bold = [...line.replace(/`[^`]*`/g, "").matchAll(/(?:\*\*|__)(guard\/[IFNATD]\d+)/g)];
    let m;
    if ((m = /^(?:- )?\*\*(guard\/[IFNA]\d+)\b/.exec(line))) {
      defined.push({ id: m[1], at });
      if (bold.length > 1) refused.push({ at, line });
    } else if (bold.length > 0) {
      refused.push({ at, line });
    } else if (/^#{1,6}\s+\W*guard\/[IFNATD]\d/.test(line)) {
      refused.push({ at, line });
    } else if (/^\|\s*\W*guard\/[IFNATD]\d/.test(line)) {
      if (product && trace && (m = /^\| (guard\/T\d+) \|/.exec(line))) defined.push({ id: m[1], at });
      else if (product && !trace && where.endsWith("/docs/limitations.md") && (m = /^\| (guard\/D\d+) \|/.exec(line))) defined.push({ id: m[1], at });
      else if (!product && (m = /^\| (guard\/T\d+)(?:–(guard\/T\d+))?:/.exec(line))) {
        for (const id of range(m[1], m[2])) defined.push({ id, at });
      } else if (!product && (m = /^\| (guard\/D\d+) \|/.exec(line))) defined.push({ id: m[1], at });
      else if (!product && /^\| guard\/D\d+ \(product\) \|/.test(line)) {
        // a Defect the package defines, which Engineering's register cites
      }
      else if (!product && /^\| guard\/T\d+(?:(?:, |–)guard\/T\d+)* \|/.test(line)) {
        // an evidence row: it cites
      } else refused.push({ at, line });
    }
  });
  return { defined, refused };
}

/**
 * guard/N14's definitions rule over a set of documents: what is defined twice, which identifiers the
 * delivered cases cite are defined in Engineering or not in the product, and what is shaped like a
 * definition but is not canonical.
 */
function audit({ product, engineering, cited }) {
  const p = product.map((d) => scan(d, true));
  const e = engineering.map((d) => scan(d, false));
  const inProduct = p.flatMap((s) => s.defined);
  const inEngineering = e.flatMap((s) => s.defined);
  const all = [...inProduct, ...inEngineering];
  const ids = [...cited].sort();
  return {
    twice: [...new Set(all.map((d) => d.id))]
      .filter((id) => all.filter((d) => d.id === id).length > 1)
      .map((id) => `${id}: ${all.filter((d) => d.id === id).map((d) => d.at).join(", ")}`),
    retained: ids.filter((id) => inEngineering.some((d) => d.id === id)),
    undefined: ids.filter((id) => !inProduct.some((d) => d.id === id)),
    refused: [...p, ...e].flatMap((s) => s.refused).map((r) => `${r.at}: ${r.line.trim()}`),
  };
}

/** The identifiers the titles of the delivered cases cite. */
function cited() {
  const dir = join(PRODUCT, "test/acceptance");
  const ids = new Set();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".test.mjs"))) {
    for (const m of readFileSync(join(dir, file), "utf8").matchAll(/\b(?:describe|it|test)\(\s*"([^"]*)"/g)) {
      for (const id of m[1].match(new RegExp(ID.source, "g")) ?? []) ids.add(id);
    }
  }
  return ids;
}

const NONE = { twice: [], retained: [], undefined: [], refused: [] };
const doc = (where, ...lines) => ({ where, text: lines.join("\n") });
const product = (...lines) => doc("packages/kaal-guard/docs/fixture.md", ...lines);
const engineering = (...lines) => doc("engineering/guard/fixture.md", ...lines);
const CLEAN = {
  product: [
    product(
      "**guard/F1 Check list.** Text.",
      "- **guard/A1 Runner** [guard/F1].",
      "<!-- trace: written by the publisher from the cases' titles -->",
      "| guard/T1 | Requirements | guard/F1, guard/A1 | title |",
      "<!-- end of trace -->",
      "A citation of guard/F1 and guard/T1.",
    ),
  ],
  engineering: [
    engineering(
      "- **guard/N5** [guard/I4] Text citing guard/F1.",
      "| guard/T101: the documented command | guard/F31 | Engineering |",
      "| guard/T33–guard/T35: KAAL's jobs | guard/A11 |",
      "| guard/D1 | guard/T38 | what happened |",
      "| guard/T1 | GREEN | an evidence row cites |",
      "| guard/T36, guard/T42 | GREEN | |",
      "| guard/T65–guard/T68 | GREEN | |",
    ),
  ],
  cited: new Set(["guard/F1", "guard/A1", "guard/T1"]),
};
const With = (change) => audit({ ...CLEAN, ...change });

describe("guard/N14 [guard/I9] one authority", () => {
  it("guard/T111 [guard/N14, guard/A20]: every Guard identifier is defined exactly once, every identifier a delivered case cites only in packages/kaal-guard/docs/, and every one of them is defined", async (t) => {
    // The checker first discriminates: each defect below is found, and the clean contract gives none.
    await t.test("a clean contract gives no finding", () => {
      assert.deepEqual(audit(CLEAN), NONE);
    });
    await t.test("a product identifier defined twice in the package is found, in one file and across files", () => {
      const once = CLEAN.product[0];
      assert.deepEqual(With({ product: [doc(once.where, once.text, "**guard/F1 Again.**")] }).twice, [
        "guard/F1: packages/kaal-guard/docs/fixture.md:1, packages/kaal-guard/docs/fixture.md:7",
      ]);
      assert.deepEqual(With({ product: [once, doc("packages/kaal-guard/docs/other.md", "- **guard/F1 Again.**")] }).twice, [
        "guard/F1: packages/kaal-guard/docs/fixture.md:1, packages/kaal-guard/docs/other.md:1",
      ]);
    });
    await t.test("a product identifier retained in engineering/guard/ is found, as an obligation and as a planned Test Case", () => {
      const kept = With({ engineering: [CLEAN.engineering[0], engineering("**guard/F1 Check list.** Text.", "| guard/T1: title | guard/F1 |")] });
      assert.deepEqual(kept.retained, ["guard/F1", "guard/T1"]);
      assert.deepEqual(kept.twice.map((s) => s.split(":")[0]), ["guard/F1", "guard/T1"]);
      const moved = With({ product: [product("<!-- trace: x -->", "| guard/T1 | Requirements | guard/F1 | title |", "<!-- end of trace -->", "- **guard/A1 Runner**.")], engineering: [engineering("**guard/F1 Check list.** Text.")] });
      assert.deepEqual(moved.retained, ["guard/F1"]);
      assert.deepEqual(moved.undefined, ["guard/F1"]);
    });
    await t.test("an identifier a delivered case cites is found undefined when nothing defines it, or only Engineering cites it", () => {
      const cites = new Set([...CLEAN.cited, "guard/F99", "guard/T36"]);
      assert.deepEqual(With({ cited: cites, engineering: [engineering("| guard/T36 | GREEN |", "guard/F99 is cited here.")] }).undefined, ["guard/F99", "guard/T36"]);
    });
    await t.test("every other form shaped like a definition is refused, not ignored", () => {
      const inEngineering = [
        "## guard/F2 Title",
        "### guard/D1 and guard/D2 after guard/C25",
        "* **guard/F2 Title.** Text.",
        "+ **guard/F2 Title.** Text.",
        "1. **guard/F2 Title.** Text.",
        "  - **guard/F2 Title.** Text.",
        "> **guard/F2 Title.** Text.",
        "__guard/F2 Title.__ Text.",
        "**guard/T5 title.** Text.",
        "- **guard/D1** Text.",
        "Text **guard/F2** text.",
        "**guard/F2 Title.** Text **guard/F3**.",
        "| **guard/F2** | Text |",
        "| guard/F2 | Text |",
        "| guard/D1: Text |",
      ];
      for (const line of inEngineering) {
        assert.equal(With({ engineering: [engineering(line)] }).refused.length, 1, line);
      }
      assert.deepEqual(With({ engineering: [engineering("    - a quoted form, `**guard/F1 …` or `- **guard/A1 …`, is a citation")] }).refused, []);
      const inProduct = ["| guard/T5: title |", "| guard/T5 | Requirements | guard/F1 | title |", "| guard/D1 | Text |"];
      for (const line of inProduct) {
        assert.equal(With({ product: [...CLEAN.product, doc("packages/kaal-guard/docs/other.md", line)] }).refused.length, 1, line);
      }
    });
    await t.test("canonical forms are recognised with CRLF line endings, and a planned range defines each Test Case in it", () => {
      const crlf = (d) => ({ ...d, text: d.text.split("\n").join("\r\n") });
      assert.deepEqual(audit({ ...CLEAN, product: CLEAN.product.map(crlf), engineering: CLEAN.engineering.map(crlf) }), NONE);
      const limitations = doc("packages/kaal-guard/docs/limitations.md", "| guard/D5 | must not | delivered: guard/T1 | RED in `0.0.1` |");
      assert.deepEqual(With({ product: [...CLEAN.product, limitations], engineering: [engineering("| guard/D5 (product) | guard/T81 | gap | established |")] }), NONE);
      assert.deepEqual(With({ product: [...CLEAN.product, limitations], engineering: [engineering("| guard/D5 | guard/T81 | gap | established |")] }).twice, [
        "guard/D5: packages/kaal-guard/docs/limitations.md:1, engineering/guard/fixture.md:1",
      ]);
      assert.deepEqual(With({ engineering: [CLEAN.engineering[0], engineering("| guard/T34: again |")] }).twice, [
        "guard/T34: engineering/guard/fixture.md:3, engineering/guard/fixture.md:1",
      ]);
    });

    const found = audit({ product: documents(join(PRODUCT, "docs")), engineering: [...documents(ENGINEERING), ...documents(EXTERNAL)], cited: cited() });
    assert.ok(cited().size > 0, "no delivered case cites an identifier");
    assert.deepEqual(found.refused, [], "lines shaped like a definition that are not canonical");
    assert.deepEqual(found.twice, [], "identifiers defined more than once");
    assert.deepEqual(found.retained, [], "identifiers delivered cases cite are defined in engineering/guard/, not in the package");
    assert.deepEqual(found.undefined, [], "identifiers delivered cases cite are not defined in packages/kaal-guard/docs/");
    // A publisher case's title may cite a Defect (guard/C123); the Defect it cites is defined too.
    const definedIds = new Set([...documents(join(PRODUCT, "docs")).map((d) => scan(d, true)), ...[...documents(ENGINEERING), ...documents(EXTERNAL)].map((d) => scan(d, false))].flatMap((s) => s.defined.map((d) => d.id)));
    const publisher = [];
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) walk(join(dir, e.name));
        else if (e.name.endsWith(".test.mjs")) {
          for (const m of readFileSync(join(dir, e.name), "utf8").matchAll(/\b(?:describe|it|test)\(\s*"([^"]*)"/g)) publisher.push(...(m[1].match(/guard\/D\d+/g) ?? []));
        }
      }
    };
    walk(join(ENGINEERING, "acceptance"));
    assert.ok(publisher.length > 0, "no publisher case cites a Defect");
    assert.deepEqual([...new Set(publisher)].filter((id) => !definedIds.has(id)).sort(), [], "Defects publisher cases cite are not defined");
  });
});
