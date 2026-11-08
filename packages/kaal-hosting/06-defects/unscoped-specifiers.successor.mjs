// hosting/T140 to hosting/T142: shipped guidance names Hosting's exports by their scoped package name; a Defect
// record may quote the unscoped names as evidence.
//
// These Cases supersede hosting/T108 and hosting/T109 (unscoped-specifiers.red.mjs) under the Owner's ruling of
// 5 November 2026 (hosting/D7). The old file stays as it was; 00-changes/defect-corrections/d7-successor-record.md
// lists the old and the new wording side by side. hosting/F15 still holds: a specifier a reader would import is
// written `@kaihacksai/kaal-hosting/<subpath>`, and the unscoped name is the legacy identity.
//
// The Cases read the built package: they need `npm run build -w @kaihacksai/kaal-hosting` first, and run from the
// repository root:
//
//   node --test packages/kaal-hosting/06-defects/unscoped-specifiers.successor.mjs
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
// The legacy name is built, not written, so that no tracked file spells a specifier the repository scan forbids.
const LEGACY = ["kaal", "hosting"].join("-");
const subpaths = Object.keys(manifest.exports).filter((k) => k !== "." && !k.endsWith(".json")).map((k) => k.slice(2));

/** Every Markdown file under one shipped directory, relative to the package. */
function markdown(dir) {
  const out = [];
  for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...markdown(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

/** A Defect record is a Markdown file directly under the shipped docs/defects folder. */
const isDefectRecord = (f) => f.startsWith(join("dist", "docs", "defects") + sep);

/** The lines of one text that name an export subpath without the scope. */
function unscopedIn(text) {
  const hits = [];
  text.split("\n").forEach((line, i) => {
    for (const s of subpaths) if (new RegExp(`(?<![@\\w/-])${LEGACY}/${s}(?![\\w-])`).test(line)) hits.push(`${i + 1} ${LEGACY}/${s}`);
  });
  return hits;
}

/** Findings in shipped guidance: every shipped Markdown file except a Defect record. */
function guidanceFindings() {
  const files = [...markdown(join("dist", "skills")), ...markdown(join("dist", "docs")), "README.md"].filter((f) => !isDefectRecord(f));
  return files.flatMap((f) => unscopedIn(readFileSync(join(root, f), "utf8")).map((h) => `${f}:${h}`));
}

test("hosting/T140 control: the package declares the export subpaths these Cases check", () => {
  assert.deepEqual(subpaths.sort(), ["boundary", "conformance", "fixtures"]);
});

test("hosting/T141: shipped guidance, other than a Defect record, names no export subpath without the package scope", () => {
  assert.deepEqual(guidanceFindings(), []);
});

test("hosting/T142 control: the check is not vacuous, and a Defect record may quote the unscoped names", () => {
  assert.equal(unscopedIn(`import { x } from '${LEGACY}/boundary';`).length, 1, "an unscoped specifier in guidance is a finding");
  assert.equal(unscopedIn("import { x } from '@kaihacksai/kaal-hosting/boundary';").length, 0, "the scoped specifier is not");
  assert.equal(isDefectRecord(join("dist", "docs", "defects", "D7-unscoped-export-specifiers.md")), true);
  assert.equal(isDefectRecord(join("dist", "skills", "usage", "SKILL.md")), false);
  assert.equal(isDefectRecord("README.md"), false);
});
