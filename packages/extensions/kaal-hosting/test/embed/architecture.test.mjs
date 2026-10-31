// The Architecture loop: each case checks that an element keeps its placement, its boundaries and its
// dependencies in the installed package, reached by its name (docs/architecture.md).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { manifest, NAME, node, PACKAGE, sha, table, tree } from "./harness.mjs";

/** The specifiers an entry resolves while it loads, in a process of its own. */
async function loads(specifier) {
  const script = `import { registerHooks } from "node:module";
const seen = [];
registerHooks({ resolve(s, c, next) { seen.push(s); return next(s, c); } });
await import(process.argv[1]);
console.log(JSON.stringify(seen));`;
  const r = await node(["--input-type=module", "-e", script, specifier]);
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.trim().split(/\r?\n/).at(-1));
}

describe("Architecture", () => {
  it("hosting/T60 [hosting/I9, hosting/F35, hosting/A15]: the installed package exposes exactly the interface its Architecture declares, and every declared target ships", async () => {
    const rows = table(readFileSync(join(PACKAGE, "docs", "architecture.md"), "utf8"), "kaal-hosting:interface");
    assert.ok(rows.length > 0, "the Architecture declares no interface");
    for (const [kind, entry, , status] of rows) assert.equal(status, "delivered", `${kind} ${entry} is ${status}, not delivered`);
    const of = (kind) => rows.filter((r) => r[0] === kind);
    const pkg = manifest();
    assert.deepEqual(Object.keys(pkg.exports).sort(), of("export").map((r) => r[1]).sort());
    assert.deepEqual(Object.keys(pkg.bin ?? {}).sort(), of("bin").map((r) => r[1]).sort());
    assert.deepEqual([...pkg.files].sort(), of("files").map((r) => r[1]).sort());
    for (const [, entry, target] of of("export")) {
      const declared = pkg.exports[entry];
      assert.equal(typeof declared === "string" ? declared : declared.default, target, `${entry} points elsewhere`);
      for (const path of typeof declared === "string" ? [declared] : Object.values(declared)) assert.ok(existsSync(join(PACKAGE, path)), `${entry}: ${path} does not ship`);
    }
    for (const [, entry, target] of of("bin")) {
      assert.equal(pkg.bin[entry], target);
      assert.ok(existsSync(join(PACKAGE, target)), `${entry}: ${target} does not ship`);
    }
  });

  it("hosting/T61 [hosting/A1, hosting/A6]: reconcile sits beside update in the main entry, and its refusals are HostingErrors that carry what failed: STALE with each finding, and an expectation checked with the rest", async () => {
    const { reconcile, update, HostingError } = await import(NAME);
    assert.equal(typeof update, "function");
    const root = tree({ "a.md": "a\n", "b.md": "b\n" });
    const e = await reconcile(root, { write: [{ path: "a.md", expect: "absent", bytes: Buffer.from("x") }], remove: [], expect: [{ path: "b.md", expect: "absent" }] }).catch((x) => x);
    assert.ok(e instanceof HostingError, String(e));
    assert.equal(e.code, "STALE");
    assert.deepEqual(e.findings.map((f) => [f.path, f.expected]), [["a.md", "absent"], ["b.md", "absent"]]);
  });

  it("hosting/T62 [hosting/A4]: what a refusal reports as found is the standard SHA-256 of the bytes there, the digest any other implementation computes for them", async () => {
    const { reconcile } = await import(NAME);
    const bytes = "the same bytes on every host\n";
    const root = tree({ "f.md": bytes });
    const e = await reconcile(root, { write: [], remove: [{ path: "f.md", expect: "0".repeat(64) }] }).catch((x) => x);
    assert.equal(e.code, "STALE");
    assert.equal(e.findings[0].found, sha(bytes));
    assert.equal(sha(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("hosting/T63 [hosting/A12, hosting/A13, hosting/A17]: only the boundary entry loads node:test: the main entry, the conformance entry and the fixtures load without it", async () => {
    const test = (seen) => seen.some((s) => s === "node:test" || s === "test");
    for (const entry of [NAME, `${NAME}/conformance`, `${NAME}/fixtures`]) assert.ok(!test(await loads(entry)), `${entry} loads node:test`);
    assert.ok(test(await loads(`${NAME}/boundary`)), `${NAME}/boundary does not load node:test`);
    assert.ok(!(await loads(NAME)).includes("es-module-lexer"), "the main entry loads the conformance parser");
  });

  it("hosting/T64 [hosting/A16, hosting/F36]: the operating-system boundary is Hosting, declared in its code: a package claiming it in its own manifest is not", async () => {
    const { OS_BOUNDARY, osBoundary } = await import(`${NAME}/conformance`);
    assert.deepEqual([...OS_BOUNDARY], [NAME]);
    assert.ok(Object.isFrozen(OS_BOUNDARY));
    assert.equal(osBoundary(NAME), true);
    assert.equal(osBoundary("claims-to-be"), false);
    assert.throws(() => osBoundary({ name: NAME, osBoundary: true }), TypeError);
  });

  it("hosting/T65 [hosting/N4, hosting/A10]: the verification entry imports only Node built-ins and nothing from dist/, so a broken runtime cannot mask itself", async () => {
    const source = readFileSync(join(PACKAGE, "test", "verify.mjs"), "utf8");
    const specifiers = [...source.matchAll(/^\s*import\s[^"']*["']([^"']+)["']/gm), ...source.matchAll(/\bimport\(\s*["']([^"']+)["']/g)].map((m) => m[1]);
    assert.ok(specifiers.length > 0, "no import found");
    assert.deepEqual(specifiers.filter((s) => !s.startsWith("node:")), []);
  });

  it("hosting/T66 [hosting/A19, hosting/F41]: the shipped host guide agrees with this host: what it says of each host fact here is what facts() establishes", async () => {
    const { facts } = await import(`${NAME}/fixtures`);
    const rows = table(readFileSync(join(PACKAGE, "skills", "kaal-hosting-boundary", "HOSTS.md"), "utf8"), "kaal-hosting:hosts");
    const established = await facts();
    for (const fact of Object.keys(established)) {
      const row = rows.find((r) => r[0] === fact && r[1] === process.platform);
      assert.ok(row, `the guide has no row for ${fact} on ${process.platform}`);
      assert.equal(row[2], established[fact].holds ? "yes" : "no", `${fact} on ${process.platform}`);
      assert.match(row[3], /^https:\/\//);
    }
  });
});
