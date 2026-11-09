// release-management/T15 (Delivery): the root documents describe the target B only. They carry no current state, no gap, no interim,
// no migration step and no pull request number: those are Change's (../00-changes, release-management/T16 to T21).
// Read with the Markdown parser by heading, list item, table cell and word, never by a regex over the raw file.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ROOT_DOCUMENTS, nodes, parseFile, tableRows, textOf } from "./records.mjs";

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
