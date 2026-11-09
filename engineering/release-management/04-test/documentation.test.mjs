// release-management/T15 (Delivery): the root documents describe the target B only. They carry no current state, no gap, no interim,
// no migration step and no pull request number: those are Change's (../00-changes, release-management/T16 to T21).
// Read with the Markdown parser by heading, list item, table cell and word, never by a regex over the raw file.
import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import { existsSync } from "node:fs";
import { AREA, ROOT_DOCUMENTS, nodes, parseFile, tableRows, textOf } from "./records.mjs";

const HEADINGS = [/evidence status/i, /^path to /i, /conditions before/i, /^retiring /i, /build order/i, /migration/i, /^gaps?\b/i, /open for the owner/i, /interim/i, /^later:/i];
const LABELS = [/^exists:/i, /^gaps?:/i, /^target \(set by/i, /^interim\b/i, /^verified against/i];
const COLUMNS = [/^today/i, /^retires$/i];
const WORDS = [/^today('s)?$/i, /^currently$/i, /^interim$/i, /^shims?$/i, /^pending$/i, /^release\.yml$/, /^g\d+$/i, /^#\d{3,}$/];

const words = (text) => text.split(/[^\w#.'-]+/).map((w) => w.replace(/^[.'-]+|[.'-]+$/g, "")).filter(Boolean);

describe("release-management/T15 the root documents describe the target only", () => {
  for (const file of ROOT_DOCUMENTS) {
    describe(file, () => {
      const root = parseFile(file);
      it("has no heading about the route, the evidence, a gap or an interim", () => {
        const found = nodes(root, "heading").map(textOf).filter((h) => HEADINGS.some((r) => r.test(h)));
        assert.deepEqual(found, [], `${file}: these headings belong to Change (00-changes): ${found.join("; ")}`);
      });
      it("has no list item or paragraph that opens with a current-state label", () => {
        const found = nodes(root, "item", "paragraph").map(textOf).filter((t) => LABELS.some((r) => r.test(t)));
        assert.deepEqual(found.map((t) => t.slice(0, 60)), [], `${file}: current-state statements belong to Change`);
      });
      it("has no table column about today's code or retirement", () => {
        const found = tableRows(root).slice(0, 400).filter((cells, i, all) => i === 0 || all[i - 1] === undefined).flat().filter((c) => COLUMNS.some((r) => r.test(c)));
        const heads = tableRows(root).flat().filter((c) => COLUMNS.some((r) => r.test(c.replace(/\s*\(.*\)$/, ""))));
        assert.deepEqual([...new Set([...found, ...heads])], [], `${file}: columns about the current state belong to Change`);
      });
      it("names no current file, gap id, shim, pull request or moment in time", () => {
        const text = nodes(root, "text", "code", "code_block").map((n) => n.literal).join(" ");
        const found = [...new Set(words(text).filter((w) => WORDS.some((r) => r.test(w))))];
        assert.deepEqual(found, [], `${file}: ${found.join(", ")} describe A or A to B, which belongs to Change`);
      });
    });
  }
});

// Semantic guard (CPO, 9 Nov): the target does not name the present implementation either. The present artifacts are read from the Change
// documents: every file the present state, the gaps or the transformation name in code is an artifact of A. A file the target legitimately
// names (the publish workflow, the release record, FAR's record, a manifest, a component's own Case file) is listed and nothing else.
const TARGET_FILES = new Set(["publish.yml", "release.json", "far.json", "package.json", "release.test.mjs"]);
const WORKFLOW_FUNCTIONS = new Set(["always()", "success()", "failure()", "cancelled()"]); // GitHub expression functions of the gate specification, not functions of the code
const OLD_CHECKS = [/\bBranching( audit)?\b/, /\bChange Isolation\b/, /\bPromotion Source\b/, /\bDependency Review\b/];
const artifactsOfA = () => {
  const out = new Set();
  for (const f of ["00-changes/current-state.md", "00-changes/transformation.md", "00-changes/gaps.md"]) {
    if (!existsSync(join(AREA, f))) continue;
    for (const n of nodes(parseFile(f), "code")) for (const t of n.literal.split(/\s+/)) if (/\.(sh|ts|mjs|yml|json)$/.test(t) && !TARGET_FILES.has(t.split("/").pop())) out.add(t.split("/").pop());
  }
  return out;
};

describe("release-management/T15 the target names no present artifact and makes no claim about the present implementation", () => {
  const old = artifactsOfA();
  it("the Change documents name the present artifacts (so that this guard is not empty)", () => {
    assert.ok(old.size >= 8, `only ${old.size} present artifacts found in 00-changes; current-state.md must list them`);
  });
  for (const file of ROOT_DOCUMENTS) {
    it(`${file} names none of them, no check of the present, and no function of the code`, () => {
      const root = parseFile(file);
      const codes = nodes(root, "code", "code_block").flatMap((n) => n.literal.split(/\s+/));
      const text = nodes(root, "text").map((n) => n.literal).join(" ");
      const files = [...new Set(codes.map((t) => t.split("/").pop()).filter((t) => old.has(t)))];
      const calls = [...new Set(codes.filter((t) => /^\w+\(\)$/.test(t) && !WORKFLOW_FUNCTIONS.has(t)))];
      const checks = OLD_CHECKS.filter((r) => r.test(text) || r.test(codes.join(" "))).map(String);
      assert.deepEqual({ files, calls, checks }, { files: [], calls: [], checks: [] }, `${file}: these describe how the present implementation is called; B states what must hold, and A is Change's`);
    });
  }
});
