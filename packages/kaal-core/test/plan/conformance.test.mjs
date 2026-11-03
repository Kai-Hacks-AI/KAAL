// core/C31 planned outer tests: Installation Contract Conformance Cases. Immutable
// to DO and CHECK; core/C31's DO turns them GREEN. Each title names the contracts it
// checks (plan/conformance/*.md). They use kaal-core's public interface only.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

/** A kaal-core subpath, or the reason the tests are blocked before any behavioural assertion. */
async function subpath(name) {
  try {
    return await import(`kaal-core/${name}`);
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./${name} (${e.code ?? e.message})`);
  }
}

const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const CASES = ["core/T10", "core/T11", "core/T12", "core/T13"];

/** Core's sample contract: the core/C3 fixture of test/plan/installation.test.mjs (core/A32). */
function sample(format) {
  return {
    format,
    capability: "sample",
    version: "0.0.2",
    assets: [
      { name: "hook", source: "assets/pre-push", target: ".githooks/pre-push", kind: "file", executable: true },
      { name: "skill", source: "skills/sample", target: ".agents/skills/sample", kind: "directory" },
    ],
    catalogue: { ".githooks/pre-push": [sha("hook 0.0.2")], ".agents/skills/sample/SKILL.md": [sha("skill 0.0.2")] },
    record: ".kaal/state/sample/installation.json",
    runtime: { node: 24 },
    provides: [{ skill: "sample" }],
  };
}

/** Another conforming instance, sharing nothing with the sample but the format. */
function other(format) {
  return {
    format,
    capability: "other",
    version: "1.4.0",
    assets: [{ name: "doc", source: "payload/guide.md", target: "docs/other/guide.md", kind: "file" }],
    catalogue: { "docs/other/guide.md": [sha("guide 1.4.0")] },
    record: ".kaal/state/other/installation.json",
    runtime: { node: 24 },
    provides: [],
  };
}

const byId = (results) => Object.fromEntries(results.map((r) => [r.id, r]));

describe("Installation Contract Conformance Cases (core/C31)", () => {
  it("core/T68 [core/F62, core/F65]: against Core's sample contract, the cases are core/T10–core/T13 in order, and each holds with no failures", async () => {
    const { installationConformance } = await subpath("conformance");
    const { installationFormat } = await subpath("installation");
    const results = installationConformance(sample(installationFormat()));
    assert.deepEqual(results.map((r) => r.id), CASES);
    for (const r of results) {
      assert.equal(r.holds, true, `${r.id}: ${JSON.stringify(r.failures)}`);
      assert.deepEqual(r.failures, [], r.id);
    }
  });

  it("core/T69 [core/F62, core/F63]: the cases judge the instance they are given: another conforming instance holds, a non-conforming one fails core/T10 by its member and core/T11–core/T13 because of it, and a check that refuses nothing fails core/T11–core/T13 naming each mutation", async () => {
    const { installationConformance } = await subpath("conformance");
    const { installationFormat } = await subpath("installation");
    const format = installationFormat();

    const kept = installationConformance(other(format));
    assert.deepEqual(kept.map((r) => [r.id, r.holds]), CASES.map((id) => [id, true]), JSON.stringify(kept));

    const broken = byId(installationConformance({ ...sample(format), version: 2 }));
    assert.equal(broken["core/T10"].holds, false);
    assert.ok(broken["core/T10"].failures.some((f) => f.includes("version")), JSON.stringify(broken["core/T10"]));
    for (const id of CASES.slice(1)) {
      assert.equal(broken[id].holds, false, id);
      assert.ok(broken[id].failures.some((f) => f.includes("core/T10")), `${id}: ${JSON.stringify(broken[id].failures)}`);
    }

    const lax = byId(installationConformance(sample(format), () => []));
    assert.equal(lax["core/T10"].holds, true, "a check that finds nothing passes core/T10");
    const named = (id, ...keys) => {
      assert.equal(lax[id].holds, false, id);
      for (const k of keys) assert.ok(lax[id].failures.some((f) => f.includes(k)), `${id} names ${k}: ${JSON.stringify(lax[id].failures)}`);
    };
    named("core/T11", "record", "version", "format", "assets.0.kind", "assets.0");
    named("core/T12", "assets.0.target", "catalogue");
    named("core/T13", "provides");
  });

  it("core/T70 [core/F64]: under a check that admits an instance with no assets, the asset mutations fail as cannot apply by their keys, never pass, and the other mutations are still judged", async () => {
    const { installationConformance } = await subpath("conformance");
    const { installationFormat, checkContract } = await subpath("installation");
    const bare = { ...other(installationFormat()), assets: [], catalogue: {} };
    const admitting = (c) => checkContract(c).filter((f) => !(f.key === "assets" && Array.isArray(c.assets) && c.assets.length === 0));
    assert.notDeepEqual(checkContract(bare), [], "Core's own check refuses an instance with no assets");
    assert.deepEqual(admitting(bare), [], "the weaker check admits it");
    const results = byId(installationConformance(bare, admitting));
    assert.equal(results["core/T10"].holds, true);
    const cannot = (id, key) => results[id].failures.some((f) => f.startsWith(key) && f.includes("cannot apply"));
    for (const [id, key] of [["core/T11", "assets.0.kind"], ["core/T12", "assets.0.target"]]) {
      assert.equal(results[id].holds, false, id);
      assert.ok(cannot(id, key), `${id} names ${key}: ${JSON.stringify(results[id].failures)}`);
    }
    for (const key of ["record", "version", "format"]) assert.ok(!results["core/T11"].failures.some((f) => f.startsWith(key)), `${key} applies and is refused`);
    assert.deepEqual(results["core/T13"], { id: "core/T13", holds: true, failures: [] });
  });

  it("core/T71 [core/N18, core/A31]: no runtime entry point of kaal-core reaches ./conformance through its imports, and ./conformance reaches no test harness", async () => {
    await subpath("conformance");
    const manifest = fileURLToPath(import.meta.resolve("kaal-core/package.json"));
    const root = dirname(manifest);
    const pkg = JSON.parse(readFileSync(manifest, "utf8"));
    const file = (target) => join(root, typeof target === "string" ? target : target.default);
    const imports = (path) => [...readFileSync(path, "utf8").matchAll(/(?:from\s*|import\s*\(\s*|import\s+)["']([^"']+)["']/g)].map((m) => m[1]);
    /** Every module a file reaches through relative imports, and every bare specifier on the way. */
    const reach = (start) => {
      const seen = new Set();
      const bare = new Set();
      const walk = (path) => {
        if (seen.has(path)) return;
        seen.add(path);
        for (const s of imports(path)) (s.startsWith(".") ? walk(join(dirname(path), s)) : bare.add(s));
      };
      walk(start);
      return { files: seen, bare };
    };
    const conformance = file(pkg.exports["./conformance"]);
    const entries = [
      ...Object.entries(pkg.exports).filter(([k]) => k !== "./conformance" && k !== "./package.json").map(([k, v]) => [k, file(v)]),
      ...Object.entries(typeof pkg.bin === "string" ? { kaal: pkg.bin } : pkg.bin ?? {}).map(([k, v]) => [`bin ${k}`, file(v)]),
    ];
    assert.ok(entries.some(([k]) => k === "."), "the main entry is checked");
    assert.ok(entries.some(([k]) => k.startsWith("bin ")), "the bin is checked");
    for (const [name, path] of entries) assert.ok(!reach(path).files.has(conformance), `${name} reaches ./conformance`);
    const own = reach(conformance);
    for (const harness of ["node:test", "test", "mocha", "vitest", "jest", "tap"]) assert.ok(!own.bare.has(harness), `./conformance imports ${harness}`);
  });
});
