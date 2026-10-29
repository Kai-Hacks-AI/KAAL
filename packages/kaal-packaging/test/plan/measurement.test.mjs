// packaging/C1 planned tests (plan/measurement/testing.md), written at the start of packaging/C2.
// Each title names the contracts it checks. They use kaal-packaging's public interface only.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { describe, it } from "node:test";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** kaal-packaging's entry point, or the reason a test is blocked before any behavioural assertion. */
async function packaging() {
  try {
    return await import("kaal-packaging");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-packaging does not resolve (${e.code ?? e.message})`);
  }
}

/** One ustar header and body, padded to 512-byte blocks. */
function entry(path, body, flag = "0") {
  const header = Buffer.alloc(512);
  header.write(path, 0, 100, "utf8");
  header.write("0000644\0", 100);
  header.write("0000000\0", 108);
  header.write("0000000\0", 116);
  header.write(`${body.length.toString(8).padStart(11, "0")}\0`, 124);
  header.write("00000000000\0", 136);
  header.write("        ", 148);
  header.write(flag, 156);
  header.write("ustar\0", 257);
  header.write("00", 263);
  let sum = 0;
  for (const b of header) sum += b;
  header.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148);
  return Buffer.concat([header, body, Buffer.alloc((512 - (body.length % 512)) % 512)]);
}

/** A pax extended header naming a long path, as npm writes one. */
function paxPath(path) {
  let record = ` path=${path}\n`;
  let length = record.length;
  while (`${length}${record}`.length !== length) length = `${length}${record}`.length;
  return entry("PaxHeader", Buffer.from(`${length}${record}`), "x");
}

const LONG = `docs/${"a".repeat(120)}.md`;

/** An npm-shaped tarball, built byte by byte: every file under package/, a directory entry, a long
 *  path through a pax header, and files whose sizes are not multiples of 512. */
function tarball(files) {
  const parts = [entry("package/", Buffer.alloc(0), "5")];
  for (const [path, body] of Object.entries(files)) {
    if (path.length > 90) parts.push(paxPath(`package/${path}`), entry("package/long", Buffer.from(body)));
    else parts.push(entry(`package/${path}`, Buffer.from(body)));
  }
  parts.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(parts), { level: 9 });
}

const manifest = (version) => JSON.stringify({ name: "@kaal/fixture", version });
const BASE = {
  "package.json": manifest("1.0.0"),
  "lib/a.mjs": "export const a = 1;\n",
  "lib/b.mjs": "b".repeat(700),
  "docs/guide.md": "# Guide\n",
  [LONG]: "long\n",
  "test/t.mjs": "t".repeat(1500),
  README: "x",
};
const sizeOf = (files) => Object.fromEntries(Object.entries(files).map(([p, b]) => [p, Buffer.byteLength(b)]));
const total = (files) => Object.values(sizeOf(files)).reduce((s, n) => s + n, 0);

describe("Package size measurement (packaging/C1)", () => {
  it("packaging/T1 [packaging/F1, packaging/N1]: a fixture tarball built byte by byte in the test gives its known packed size, unpacked size and every path's size", async () => {
    const { measure } = await packaging();
    const artifact = tarball(BASE);
    const m = measure(artifact);
    assert.equal(m.packed, artifact.length);
    assert.equal(m.unpacked, total(BASE));
    assert.deepEqual(Object.fromEntries(m.files.map((f) => [f.path, f.size])), sizeOf(BASE));
    assert.deepEqual(measure(Buffer.from(artifact)), m, "the same bytes give the same measurement");
  });

  it("packaging/T2 [packaging/F2]: every byte of the fixture falls in exactly one group or unattributed, and the groups sum to the unpacked size", async () => {
    const { attribute, measure } = await packaging();
    const m = measure(tarball(BASE));
    const a = attribute(m, ["lib/", "docs/", "lib/b", "test/"]);
    const bytes = Object.fromEntries(a.groups.map((g) => [g.group, g.bytes]));
    assert.deepEqual(bytes, { "lib/": 20, "lib/b": 700, "docs/": 8 + 5, "test/": 1500 });
    assert.equal(a.unattributed.bytes, Buffer.byteLength(BASE["package.json"]) + 1);
    assert.equal(a.groups.reduce((s, g) => s + g.bytes, 0) + a.unattributed.bytes, m.unpacked);
    assert.equal(a.groups.reduce((s, g) => s + g.files, 0) + a.unattributed.files, m.files.length);
  });

  it("packaging/T3 [packaging/F3]: two fixtures that differ by one added, one removed and one grown file give exactly those deltas", async () => {
    const { compare, measure } = await packaging();
    const { "docs/guide.md": _removed, ...rest } = BASE;
    const after = { ...rest, "package.json": manifest("1.0.1"), "lib/b.mjs": "b".repeat(900), "lib/c.mjs": "c".repeat(42) };
    const before = measure(tarball(BASE));
    const now = measure(tarball(after));
    const c = compare(before, now, ["lib/", "docs/"]);
    assert.deepEqual(c.added, ["lib/c.mjs"]);
    assert.deepEqual(c.removed, ["docs/guide.md"]);
    assert.deepEqual(
      c.paths.map((p) => [p.path, p.delta]),
      [["docs/guide.md", -8], ["lib/b.mjs", 200], ["lib/c.mjs", 42]],
    );
    assert.equal(c.unpacked.delta, total(after) - total(BASE));
    assert.equal(c.packed.delta, now.packed - before.packed);
    assert.deepEqual(c.groups.map((g) => [g.group, g.delta]), [["lib/", 242], ["docs/", -8], [null, 0]]);
  });

  it("packaging/T4 [packaging/F4]: a record written and read back is equal, and names the tarball's SHA-256", async () => {
    const { measure, read, write } = await packaging();
    const artifact = tarball(BASE);
    const m = measure(artifact);
    const back = read(write(m));
    assert.deepEqual(back, m);
    assert.equal(back.package.sha256, createHash("sha256").update(artifact).digest("hex"));
    assert.deepEqual([back.package.name, back.package.version], ["@kaal/fixture", "1.0.0"]);
    assert.throws(() => read(JSON.stringify({ ...m, verdict: "ok" })), /not a Packaging measurement record/);
  });

  it("packaging/T5 [packaging/F5, packaging/N2]: no report, text or JSON, contains a budget, a threshold or the words pass or fail", async () => {
    const { compare, measure, report } = await packaging();
    const a = measure(tarball(BASE));
    const b = measure(tarball({ ...BASE, "lib/b.mjs": "b".repeat(5000) }));
    for (const subject of [a, compare(a, b, ["lib/"])]) {
      for (const format of ["text", "json"]) {
        const out = report(subject, { format });
        assert.ok(out.length > 0);
        assert.doesNotMatch(out, /\b(budget|threshold|limit|pass(ed|es)?|fail(ed|s|ure)?|ok|exceed(s|ed)?)\b/i, `${format}: ${out}`);
      }
    }
    assert.match(report(compare(a, b, ["lib/"])), /\+4300/);
  });

  it("packaging/T6 [packaging/N3, packaging/A1]: the package imports only kaal-hosting and kaal-foundation, and no node: module", () => {
    const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    for (const dep of Object.keys(pkg.dependencies ?? {})) assert.ok(["kaal-hosting", "@kaihacksai/kaal-foundation"].includes(dep), dep);
    const lib = join(PACKAGE, "lib");
    const files = readdirSync(lib, { recursive: true }).filter((f) => f.endsWith(".mjs"));
    assert.ok(files.length > 0);
    for (const file of files) {
      const source = readFileSync(join(lib, file), "utf8");
      const specifiers = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g)].map((m) => m[1]);
      for (const s of specifiers) {
        assert.ok(s.startsWith("./") || s.startsWith("../") || s === "kaal-hosting" || s.startsWith("@kaihacksai/kaal-foundation/"), `${file} imports ${s}`);
      }
      assert.doesNotMatch(source, /\brequire\s*\(|\bprocess\.|\bglobalThis\b/, file);
    }
  });

  it("packaging/T8 [packaging/F1, packaging/A5]: the measurement and record forms name no ecosystem; only the npm realization reads .tgz, and an artifact of a format no realization reads is refused, naming the format", async () => {
    const { measure, read, write } = await packaging();
    const ECOSYSTEM = /npm|tgz|tar|gzip|nuget|nupkg/i;
    const keys = (v) => (Array.isArray(v) ? v.flatMap(keys) : v && typeof v === "object" ? Object.entries(v).flatMap(([k, x]) => [k, ...keys(x)]) : []);
    const m = measure(tarball(BASE));
    for (const k of new Set([...keys(m), ...keys(read(write(m)))])) assert.doesNotMatch(k, ECOSYSTEM, k);
    assert.equal(m.package.ecosystem, "npm", "the ecosystem is data, not form");
    const lib = join(PACKAGE, "lib");
    for (const file of readdirSync(lib, { recursive: true }).filter((f) => f.endsWith(".mjs"))) {
      if (relative(lib, join(lib, file)).startsWith("npm/")) continue;
      assert.doesNotMatch(readFileSync(join(lib, file), "utf8"), /tgz|\btar\b|gzip|gunzip/i, `${file} reads an artifact format outside a realization`);
    }
    const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04, ...Buffer.alloc(40)]);
    assert.throws(() => measure(zip), /format is zip/);
    assert.throws(() => measure(Buffer.from("plain text, not an artifact")), /format is unknown/);
  });

  it("packaging/T7 [packaging/F1, packaging/I1]: Guard's 0.0.4 tarball, measured by Packaging, gives the packed and unpacked sizes guard/C117 recorded", async () => {
    const { attribute, measure } = await packaging();
    // The tarball `npm pack @kaihacksai/kaal-guard@0.0.4` fetched from the registry, whose shasum
    // for it is 1cdfe8045dc520aa78443d21e042d1b6ca05655d.
    const artifact = readFileSync(join(PACKAGE, "test", "fixtures", "kaal-guard-0.0.4.tgz"));
    assert.equal(createHash("sha1").update(artifact).digest("hex"), "1cdfe8045dc520aa78443d21e042d1b6ca05655d");
    const m = measure(artifact);
    assert.deepEqual([m.package.name, m.package.version], ["@kaihacksai/kaal-guard", "0.0.4"]);
    assert.equal(m.packed, 115661);
    assert.equal(m.unpacked, 479822);
    assert.equal(m.files.length, 35);
    const parts = attribute(m, ["lib/", "bin/", "templates/", "skills/", "docs/", "test/acceptance/", "test/unit/", "test/verify.mjs", "test/verify.json"]);
    assert.deepEqual(Object.fromEntries(parts.groups.map((g) => [g.group, g.bytes])), {
      "lib/": 71303,
      "bin/": 6278,
      "templates/": 4156,
      "skills/": 5241,
      "docs/": 82117,
      "test/acceptance/": 103425,
      "test/unit/": 46281,
      "test/verify.mjs": 22484,
      "test/verify.json": 107388,
    });
    assert.equal(parts.unattributed.bytes, 2036 + 753 + 27291 + 1069);
  });
});
