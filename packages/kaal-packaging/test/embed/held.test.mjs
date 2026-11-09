// Packaging's Embedded cases for the held-copy classifier (packaging/C28: F53 to F57, N13, A28).
// Each title names, in brackets, the identifiers it tests. They use the classifier through its
// public entry (`kaal-packaging/held`, lib/held.mjs) and read nothing of a host: the classifier is
// pure, so these cases build facts by hand.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, it } from "node:test";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { classifyHeld } = await import(pathToFileURL(join(PACKAGE, "lib", "held.mjs")).href);

const REGISTRY = "https://registry.example.test/pkg-a/-/pkg-a-1.0.0.tgz";
/** A neutral fact; each case overrides what it is about. */
const fact = (over = {}) => ({
  package: "pkg-a",
  at: "node_modules/consumer-x/node_modules/pkg-a",
  depth: 2,
  consumer: "consumer-x",
  held: "1.0.0",
  packed: "1.0.1",
  integrity: "sha512-held",
  packedIntegrity: "sha512-packed",
  resolved: REGISTRY,
  ...over,
});

describe("held-copy classifier (packaging/C28)", () => {
  it("packaging/T137 [packaging/F55, packaging/F57]: a nested, older, registry copy is a pin-behind, and the verdict names the package, consumer, held and packed version", () => {
    const r = classifyHeld(fact());
    assert.equal(r.verdict, "pin-behind");
    for (const word of ["pkg-a", "consumer-x", "1.0.0", "1.0.1"]) assert.ok(r.reason.includes(word), `${word} in ${r.reason}`);
  });

  it("packaging/T138 [packaging/F54]: a copy whose integrity equals the packed one is a match, at any depth and any version", () => {
    for (const over of [{ depth: 1, consumer: null, at: "node_modules/pkg-a" }, { held: "9.9.9" }, { held: "1.0.1" }, { resolved: undefined }]) {
      assert.equal(classifyHeld(fact({ integrity: "sha512-packed", ...over })).verdict, "match", JSON.stringify(over));
    }
  });

  it("packaging/T139 [packaging/F56]: a top-level copy with other bytes is a verified failure", () => {
    const r = classifyHeld(fact({ depth: 1, consumer: null, at: "node_modules/pkg-a" }));
    assert.equal(r.verdict, "verified failure");
    assert.match(r.reason, /top-level/);
  });

  it("packaging/T140 [packaging/F56]: a nested copy of the same version, and one of a newer version, are verified failures", () => {
    for (const held of ["1.0.1", "1.0.2", "2.0.0", "1.1.0"]) assert.equal(classifyHeld(fact({ held })).verdict, "verified failure", held);
  });

  it("packaging/T141 [packaging/F56]: an older nested copy whose origin is missing, a file path, a link or not a registry is a verified failure", () => {
    for (const resolved of [undefined, null, "", "file:../pkg-a", "file:///tmp/pkg-a-1.0.0.tgz", "/tmp/pkg-a-1.0.0.tgz", "git+https://example.test/pkg-a.git", "https://example.test/pkg-a-1.0.0.tgz"]) {
      assert.equal(classifyHeld(fact({ resolved })).verdict, "verified failure", String(resolved));
    }
  });

  it("packaging/T142 [packaging/F56]: a missing, non-plain or prerelease version on either side is a verified failure", () => {
    for (const over of [{ held: undefined }, { packed: undefined }, { held: "1.0" }, { held: "1.0.0-rc.1" }, { packed: "1.0.1-rc.1" }, { held: "1.0.0+build" }, { packed: "latest" }, { held: "^1.0.0" }]) {
      assert.equal(classifyHeld(fact(over)).verdict, "verified failure", JSON.stringify(over));
    }
  });

  it("packaging/T143 [packaging/N13, packaging/F57]: the verdict is the same for any package and consumer name, the classifier reads only the fact, and its source names no package, consumer or role", () => {
    const names = ["a", "kaal-foundation", "@scope/x", "Zed_9", "CTO"];
    const base = classifyHeld(fact()).verdict;
    for (const p of names) for (const c of names) assert.equal(classifyHeld(fact({ package: p, consumer: c })).verdict, base, `${p} under ${c}`);
    const frozen = Object.freeze(fact());
    assert.equal(classifyHeld(frozen).verdict, "pin-behind");
    assert.deepEqual(frozen, fact());
    const source = readFileSync(join(PACKAGE, "lib", "held.mjs"), "utf8");
    assert.doesNotMatch(source, /kaal-|@kaihacksai|\b(CTO|CPO|Kai)\b|\bprocess\b|\bDate\b|\bfetch\b/);
  });

  it("packaging/T144 [packaging/A28, packaging/N13]: kaal-packaging/held is exported, and importing it needs no host module", () => {
    const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.deepEqual(pkg.exports["./held"], { types: "./lib/held.d.ts", default: "./lib/held.mjs" });
    assert.equal(typeof classifyHeld, "function");
    const source = readFileSync(join(PACKAGE, "lib", "held.mjs"), "utf8");
    const specifiers = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g)].map((m) => m[1]);
    assert.deepEqual(specifiers.filter((x) => !x.startsWith("./")), [], "held.mjs imports only siblings in lib/");
  });
});
