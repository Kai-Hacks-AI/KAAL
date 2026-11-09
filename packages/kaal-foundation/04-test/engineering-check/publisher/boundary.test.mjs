// Foundation's Boundary Tests (foundation/F34 to foundation/F37): the shipped definition and its documents.
// Foundation ships a definition and no scanner (Owner ruling 2026-11-09; Engineering's PLAN engineering/boundary/PLAN.md).
// What the definition finds, and how the engine reports, is checked by Engineering's Cases (engineering/boundary/boundary-engine.test.mjs).
//
// moved: engineering/boundary/T6, T15 (foundation/T54: the three tests give a finding at the expected file and line, clean files none)
// moved: engineering/boundary/T7 (foundation/T55: ids, one finding per place, digest of the line, last line, exit 0 with findings)
// moved: engineering/boundary/T3 (foundation/T56: unread or empty target is unknown, exit 2, never compliant)
// moved: engineering/boundary/T2 (foundation/T57: no target is a usage error; a definition names no target)
// moved: engineering/boundary/T4 (foundation/T58: nearest owner, and an owned directory is skipped)
// moved: engineering/boundary/T5 (foundation/T59 and the imports half of foundation/T62: read only, no import beyond node:, yaml and sha256)
// Ids are never reused. Run `npm run build` in this package first; fixtures need no npm and no network (foundation/N7).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const REPOSITORY = join(PACKAGE, "..", "..");
const DIST = join(PACKAGE, "dist");
const SOURCE = join(PACKAGE, "05-src", "skills", "kaal-foundation");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const MAIN_SHA256_MJS = "c504c09d231c8a58f2ae2dbf346edbdf4dd544bdbdba1161515875d051df5ee0";
const MAIN_SHA256_DTS = "e0b71d43eb02726e7ed9fa05cf1c60c4b88224f99a5120de56bb54b3da303a16";

test("foundation/T60 [foundation/F34, foundation/F37, foundation/N22]: the shipped definition holds Foundation's three typed tests and the record declares the Boundary Check Applicable, with who runs it, the tests, both axes, limits, and where findings and decisions live; it names no role and no repository path", () => {
  const record = join(DIST, "test", "boundary-check", "boundary-check.md");
  assert.ok(existsSync(record), "dist/test/boundary-check/boundary-check.md is not delivered");
  const text = readFileSync(record, "utf8");
  const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  assert.match(front, /^provider: Foundation$/m);
  for (const [id, detector] of [["copy", "file-identity"], ["implementation", "token-sequence"], ["crypto", "call-with-literal"]]) assert.match(front, new RegExp(`- id: ${id}\\n    detector: ${detector}\\n`), `${id} is a ${detector} test`);
  assert.equal([...front.matchAll(/^  - id:/gm)].length, 3, "only the three tests");
  assert.equal([...front.matchAll(/^    tests: foundation\/I1$/gm)].length, 3, "each test has its tests edge");
  assert.equal([...front.matchAll(/^    ships: true$/gm)].length, 3, "each test has its ships flag");
  assert.doesNotMatch(front, /\b(pattern|regex|script|targets?|decider)\s*:/i, "the definition holds no regular expression, code, target or role");
  for (const needle of ["Applicable", "Boundary Engine", "engine.mjs --tests", "package <--> package", "package -> consumer", "audit", "no compliance"]) assert.ok(text.includes(needle), `the record never mentions ${needle}`);
  assert.doesNotMatch(text, /not applicable/i, "Foundation's Boundary Check is not declared not applicable");
  assert.doesNotMatch(text, /\b(CTO|CPO)\b|packages\//, "the record names no role and no repository path");
});

test("foundation/T61 [foundation/F37]: documents, skill and AGENTS.md name the definition by the scoped package path, say Engineering's Boundary Engine runs it and findings are audit and decisions the repository's; verify.json lists the definition and no scanner", () => {
  const scoped = /node engineering\/boundary\/engine\.mjs --tests node_modules\/@kaihacksai\/kaal-foundation\/dist\/test\/boundary-check\/boundary-check\.md --target\b/;
  const agents = readFileSync(join(REPOSITORY, "AGENTS.md"), "utf8");
  const section = agents.slice(agents.indexOf("## Foundation"), agents.indexOf("\n## ", agents.indexOf("## Foundation") + 1) >>> 0 || undefined);
  for (const [where, text] of [["references/operations.md", readFileSync(join(SOURCE, "references", "operations.md"), "utf8")], ["skill", readFileSync(join(SOURCE, "SKILL.md"), "utf8")], ["AGENTS.md", section]]) {
    assert.match(text, scoped, `${where} must name the definition by the scoped package path`);
    assert.match(text, /audit/i, `${where} must say findings are audit`);
    assert.doesNotMatch(text, /scan\.mjs/, `${where} must not name a Foundation scanner`);
  }
  const manifest = readFileSync(join(PACKAGE, "04-test", "package-check", "verify.json"), "utf8");
  assert.ok(manifest.includes("test/boundary-check/boundary-check.md"), "verify.json lists the definition");
  assert.ok(!manifest.includes("scan.mjs"), "verify.json lists no scanner");
});

test("foundation/T62 [foundation/N21]: Foundation ships no scanner and adds no dependency: the library is unchanged and the package declares no dependency", () => {
  assert.ok(!existsSync(join(DIST, "test", "boundary-check", "scan.mjs")), "no scanner is shipped");
  assert.ok(!existsSync(join(PACKAGE, "04-test", "boundary-check", "scan.mjs")), "no scanner is kept");
  assert.equal(hash(readFileSync(join(SOURCE, "scripts", "sha256.mjs"))), MAIN_SHA256_MJS);
  assert.equal(hash(readFileSync(join(SOURCE, "scripts", "sha256.d.ts"))), MAIN_SHA256_DTS);
  assert.equal(pkg.dependencies, undefined);
});
