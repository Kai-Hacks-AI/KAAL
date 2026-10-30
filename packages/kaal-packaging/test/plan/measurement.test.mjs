// packaging/C1 planned tests, as packaging/C3 amended them (plan/measurement/testing.md), written
// at the start of packaging/C2. Each title names the contracts it checks. They use
// kaal-packaging's public interface only.
//
// packaging/T9, T10 and T13 run against a stand-in npm on a PATH the test controls, so they do not
// depend on how npm behaves. packaging/T1, T7, T11, T12 and T14 run the npm the lane installed.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { describe, it } from "node:test";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCRATCH = mkdtempSync(join(tmpdir(), "kaal-packaging-test-"));
let made = 0;

/** kaal-packaging's entry point, or the reason a test is blocked before any behavioural assertion. */
async function packaging() {
  try {
    return await import("kaal-packaging");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-packaging does not resolve (${e.code ?? e.message})`);
  }
}

/** A fresh, empty directory under the scratch directory. */
function fresh(name = "dir") {
  const dir = join(SCRATCH, `${name}-${++made}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** `bytes` saved as `name` in a fresh directory; its absolute location. */
function save(bytes, name = "artifact.tgz") {
  const path = join(fresh("artifact"), name);
  writeFileSync(path, bytes);
  return path;
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

/** An npm-shaped tarball, built byte by byte: every file under package/ and no directory entry, as
 *  npm packs one, a long path through a pax header, and files whose sizes are not multiples of 512. */
function tarball(files) {
  const parts = [];
  for (const [path, body] of Object.entries(files)) {
    if (path.length > 90) parts.push(paxPath(`package/${path}`), entry("package/long", Buffer.from(body)));
    else parts.push(entry(`package/${path}`, Buffer.from(body)));
  }
  parts.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(parts), { level: 9 });
}

/** A tarball of raw entries, `[tarPath, body]`, exactly as given. */
const raw = (entries) => gzipSync(Buffer.concat([...entries.map(([p, b]) => entry(p, Buffer.from(b))), Buffer.alloc(1024)]));

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

/** The measurement of `bytes`, saved as an artifact and described by the installed npm. */
async function measured(bytes) {
  const { measure } = await packaging();
  return measure(save(bytes), { work: fresh("work") });
}

/** What the installed npm reports for the artifact at `path`, run directly, or its error. */
function npmReport(path) {
  const work = fresh("work");
  const args = ["pack", "--dry-run", "--json", "--ignore-scripts", "--offline", "--cache", join(work, "cache"), "--logs-max=0", "--no-update-notifier", "--userconfig", join(work, "npmrc"), "--", path];
  return JSON.parse(execFileSync("npm", args, { cwd: work, encoding: "utf8", shell: process.platform === "win32" }))[0];
}

/** A stand-in npm in its own directory: it prints FAKE_NPM_VERSION for --version, and otherwise
 *  appends a byte to the artifact when FAKE_NPM_TOUCH is set, writes FAKE_NPM_REPORT, and exits
 *  FAKE_NPM_STATUS. Its directory holds both a POSIX launcher and a Windows .cmd one. */
function standIn() {
  const dir = fresh("stand-in");
  writeFileSync(
    join(dir, "fake-npm.mjs"),
    `import { appendFileSync, readFileSync } from "node:fs";
const args = process.argv.slice(2);
if (args[0] === "--version") { process.stdout.write(process.env.FAKE_NPM_VERSION + "\\n"); process.exit(0); }
if (process.env.FAKE_NPM_TOUCH) appendFileSync(args.at(-1), "x");
process.stdout.write(readFileSync(process.env.FAKE_NPM_REPORT, "utf8"));
process.exit(Number(process.env.FAKE_NPM_STATUS ?? 0));
`,
  );
  writeFileSync(join(dir, "npm"), `#!/bin/sh\nexec "${process.execPath}" "\${0%/*}/fake-npm.mjs" "$@"\n`);
  chmodSync(join(dir, "npm"), 0o755);
  writeFileSync(join(dir, "npm.cmd"), `@"${process.execPath}" "%~dp0fake-npm.mjs" %*\r\n`);
  return dir;
}

/** Run `fn` with the environment changed by `env`, restoring it after. */
async function withEnv(env, fn) {
  const saved = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]));
  Object.assign(process.env, env);
  try {
    return await fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

/** A report in npm's shape for the artifact `bytes`, with `files`, changed by `change`. */
function report(bytes, files, change = {}) {
  const listed = Object.entries(files).map(([path, size]) => ({ path, size, mode: 420 }));
  return {
    id: "@kaal/fixture@1.0.0",
    name: "@kaal/fixture",
    version: "1.0.0",
    size: bytes.length,
    unpackedSize: listed.reduce((s, f) => s + f.size, 0),
    shasum: createHash("sha1").update(bytes).digest("hex"),
    integrity: "sha512-x",
    filename: "kaal-fixture-1.0.0.tgz",
    files: listed,
    entryCount: listed.length,
    bundled: [],
    ...change,
  };
}

/** Measure `bytes` with the stand-in writing `output` and exiting `status`, at `version`. */
async function standInMeasure(bytes, output, { version = "11.21.1", status = 0, touch = false, limits, path } = {}) {
  const { measure } = await packaging();
  const reportFile = join(fresh("report"), "report.json");
  writeFileSync(reportFile, typeof output === "string" ? output : JSON.stringify([output]));
  const env = { PATH: standIn(), FAKE_NPM_VERSION: version, FAKE_NPM_REPORT: reportFile, FAKE_NPM_STATUS: String(status), FAKE_NPM_TOUCH: touch ? "1" : "" };
  return withEnv(env, () => measure(path ?? save(bytes), { work: fresh("work"), limits }));
}

/** A refusal: an Error, not a TypeError or RangeError escaping from inside, whose message matches. */
const refusal = (pattern) => (e) => e instanceof Error && pattern.test(e.message);

describe("Package size measurement (packaging/C1, amended by packaging/C3)", () => {
  it("packaging/T1 [packaging/F1, packaging/N1]: a fixture tarball built byte by byte in the test, described through npm, gives its known packed size, unpacked size and every path's size", async () => {
    const artifact = tarball(BASE);
    const m = await measured(artifact);
    assert.equal(m.packed, artifact.length);
    assert.equal(m.unpacked, total(BASE));
    assert.deepEqual(Object.fromEntries(m.files.map((f) => [f.path, f.size])), sizeOf(BASE));
    assert.equal(m.tool.name, "npm");
    assert.deepEqual(await measured(Buffer.from(artifact)), m, "the same bytes, described by the same npm, give the same measurement");
  });

  it("packaging/T2 [packaging/F2]: every byte of the fixture falls in exactly one group or unattributed, and the groups sum to the unpacked size", async () => {
    const { attribute } = await packaging();
    const m = await measured(tarball(BASE));
    const a = attribute(m, ["lib/", "docs/", "lib/b", "test/"]);
    const bytes = Object.fromEntries(a.groups.map((g) => [g.group, g.bytes]));
    assert.deepEqual(bytes, { "lib/": 20, "lib/b": 700, "docs/": 8 + 5, "test/": 1500 });
    assert.equal(a.unattributed.bytes, Buffer.byteLength(BASE["package.json"]) + 1);
    assert.equal(a.groups.reduce((s, g) => s + g.bytes, 0) + a.unattributed.bytes, m.unpacked);
    assert.equal(a.groups.reduce((s, g) => s + g.files, 0) + a.unattributed.files, m.files.length);
  });

  it("packaging/T3 [packaging/F3]: two fixtures that differ by one added, one removed and one grown file give exactly those deltas", async () => {
    const { compare } = await packaging();
    const { "docs/guide.md": _removed, ...rest } = BASE;
    const later = { ...rest, "package.json": manifest("1.0.1"), "lib/b.mjs": "b".repeat(900), "lib/c.mjs": "c".repeat(42) };
    const before = await measured(tarball(BASE));
    const now = await measured(tarball(later));
    const c = compare(before, now, ["lib/", "docs/"]);
    assert.deepEqual(c.added, ["lib/c.mjs"]);
    assert.deepEqual(c.removed, ["docs/guide.md"]);
    assert.deepEqual(
      c.paths.map((p) => [p.path, p.delta]),
      [["docs/guide.md", -8], ["lib/b.mjs", 200], ["lib/c.mjs", 42]],
    );
    assert.equal(c.unpacked.delta, total(later) - total(BASE));
    assert.equal(c.packed.delta, now.packed - before.packed);
    assert.deepEqual(c.groups.map((g) => [g.group, g.delta]), [["lib/", 242], ["docs/", -8], [null, 0]]);
  });

  it("packaging/T4 [packaging/F4]: a record written and read back is equal, and names the tarball's SHA-256 and the tool and version that described it", async () => {
    const { read, write } = await packaging();
    const artifact = tarball(BASE);
    const m = await measured(artifact);
    const back = read(write(m));
    assert.deepEqual(back, m);
    assert.equal(back.package.sha256, createHash("sha256").update(artifact).digest("hex"));
    assert.deepEqual([back.package.name, back.package.version], ["@kaal/fixture", "1.0.0"]);
    const printed = execFileSync("npm", ["--version"], { encoding: "utf8", shell: process.platform === "win32" }).trim();
    assert.deepEqual(back.tool, { name: "npm", version: printed });
    assert.throws(() => read(JSON.stringify({ ...m, verdict: "ok" })), /not a Packaging measurement record/);
    const { tool: _tool, ...untooled } = m;
    assert.throws(() => read(JSON.stringify(untooled)), /not a Packaging measurement record/);
  });

  it("packaging/T5 [packaging/F5, packaging/N2]: no report, text or JSON, contains a budget, a threshold or the words pass or fail", async () => {
    const { compare, report: render } = await packaging();
    const a = await measured(tarball(BASE));
    const b = await measured(tarball({ ...BASE, "lib/b.mjs": "b".repeat(5000) }));
    for (const subject of [a, compare(a, b, ["lib/"])]) {
      for (const format of ["text", "json"]) {
        const out = render(subject, { format });
        assert.ok(out.length > 0);
        assert.doesNotMatch(out, /\b(budget|threshold|limit|pass(ed|es)?|fail(ed|s|ure)?|ok|exceed(s|ed)?)\b/i, `${format}: ${out}`);
      }
    }
    assert.match(render(compare(a, b, ["lib/"])), /\+4300/);
  });

  it("packaging/T6 [packaging/N3, packaging/A1, packaging/A6]: the package imports only kaal-hosting and kaal-foundation, no node: module, and parses no archive or compression format", () => {
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
      assert.doesNotMatch(source, /\binflate|gunzip|\bzlib\b|crc-?32|ustar|DecompressionStream|512\s*\*|subarray\(/i, `${file} parses an archive or compression format`);
    }
  });

  it("packaging/T8 [packaging/F1, packaging/A5]: the measurement and record forms name no ecosystem; only the npm realization reads .tgz, and an artifact of a format no realization reads is refused, naming the format", async () => {
    const { measure, read, write } = await packaging();
    const ECOSYSTEM = /npm|tgz|tar|gzip|nuget|nupkg/i;
    const keys = (v) => (Array.isArray(v) ? v.flatMap(keys) : v && typeof v === "object" ? Object.entries(v).flatMap(([k, x]) => [k, ...keys(x)]) : []);
    const m = await measured(tarball(BASE));
    for (const k of new Set([...keys(m), ...keys(read(write(m)))])) assert.doesNotMatch(k, ECOSYSTEM, k);
    assert.equal(m.package.ecosystem, "npm", "the ecosystem is data, not form");
    const lib = join(PACKAGE, "lib");
    for (const file of readdirSync(lib, { recursive: true }).filter((f) => f.endsWith(".mjs"))) {
      if (relative(lib, join(lib, file)).startsWith("npm")) continue;
      assert.doesNotMatch(readFileSync(join(lib, file), "utf8"), /tgz|\btar\b|gzip|gunzip/i, `${file} reads an artifact format outside a realization`);
    }
    const work = fresh("work");
    await assert.rejects(measure(save(Buffer.from([0x50, 0x4b, 0x03, 0x04]), "a.zip"), { work }), refusal(/format is zip/));
    await assert.rejects(measure(save(Buffer.from("x"), "a.nupkg"), { work }), refusal(/format is nupkg/));
  });

  it("packaging/T7 [packaging/F1, packaging/I1]: Guard's 0.0.4 tarball, measured by Packaging, gives the packed and unpacked sizes guard/C117 recorded", async () => {
    const { attribute, measure } = await packaging();
    // The tarball `npm pack @kaihacksai/kaal-guard@0.0.4` fetched from the registry, whose shasum
    // for it is 1cdfe8045dc520aa78443d21e042d1b6ca05655d.
    const fixture = join(PACKAGE, "test", "fixtures", "kaal-guard-0.0.4.tgz");
    assert.equal(createHash("sha1").update(readFileSync(fixture)).digest("hex"), "1cdfe8045dc520aa78443d21e042d1b6ca05655d");
    const m = await measure(fixture, { work: fresh("work") });
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

  it("packaging/T9 [packaging/F6]: with the ecosystem tool missing, failing, or reporting something that is not a description, measure refuses and names the tool", async () => {
    const { measure } = await packaging();
    const bytes = tarball(BASE);
    await withEnv({ PATH: fresh("empty-path") }, () => assert.rejects(measure(save(bytes), { work: fresh("work") }), refusal(/npm could not be run/)));
    const error = JSON.stringify({ error: { code: "TAR_BAD_ARCHIVE", summary: "TAR_BAD_ARCHIVE: Unrecognized archive format", detail: "" } });
    await assert.rejects(standInMeasure(bytes, error, { status: 1 }), refusal(/npm 11\.21\.1 could not describe the artifact: it exited 1, TAR_BAD_ARCHIVE/));
    await assert.rejects(standInMeasure(bytes, "not json"), refusal(/npm 11\.21\.1 reported something that is not JSON/));
    await assert.rejects(standInMeasure(bytes, "{}"), refusal(/npm 11\.21\.1 reported something that is not a description/));
    await assert.rejects(standInMeasure(bytes, JSON.stringify([report(bytes, { a: 1 }), report(bytes, { a: 1 })])), refusal(/not a description of one package/));
  });

  it("packaging/T10 [packaging/N4]: a report that does not add up, holds an unsafe or repeated path, or exceeds a limit is refused, naming the cause; so is an artifact whose SHA-256 changes while the tool runs", async () => {
    const bytes = tarball(BASE);
    const ok = { "package.json": 10, "lib/a.mjs": 20 };
    const refuses = (change, pattern, options) => assert.rejects(standInMeasure(bytes, change, options), refusal(pattern));
    assert.equal((await standInMeasure(bytes, report(bytes, ok))).unpacked, 30, "the stand-in's well-formed report is accepted");
    await refuses(report(bytes, ok, { unpackedSize: 31 }), /unpacked size of 31 bytes, but its files add up to 30/);
    await refuses(report(bytes, ok, { entryCount: 3 }), /reported 3 entries but 2 files/);
    await refuses(report(bytes, ok, { size: bytes.length + 1 }), new RegExp(`packed size of ${bytes.length + 1} bytes, but the artifact holds ${bytes.length}`));
    for (const path of ["/etc/evil.txt", "../evil.txt", "./a.txt", "a//b.txt", "a/", "a\\b.txt", "a/../b"]) {
      await refuses(report(bytes, { ...ok, [path]: 1 }), /unsafe path/);
    }
    const twice = report(bytes, ok);
    twice.files.push({ path: "lib/a.mjs", size: 20, mode: 420 });
    twice.entryCount = 3;
    twice.unpackedSize = 50;
    await refuses(twice, /reported lib\/a\.mjs twice/);
    await refuses(report(bytes, ok), /more than the limit of 1 files/, { limits: { files: 1 } });
    await refuses(report(bytes, ok), /path longer than the limit of 9 bytes/, { limits: { path: 9 } });
    await refuses(report(bytes, ok), /more than the unpacked limit of 29 bytes/, { limits: { unpacked: 29 } });
    await refuses(report(bytes, ok), /more than the output limit of 100 characters/, { limits: { output: 100 } });
    await refuses(report(bytes, ok), /the artifact changed while npm described it/, { touch: true });
  });

  it("packaging/T11 [packaging/N4, packaging/A6]: real npm, given fixture tarballs with unsafe or repeated paths or a directory entry, reports each as npm.md records, and measure refuses each", async () => {
    const { measure } = await packaging();
    const pkg = ["package/package.json", manifest("1.0.0")];
    const cases = [
      ["package/../evil.txt", "../evil.txt"],
      ["/etc/evil.txt", "/etc/evil.txt"],
      ["package/./a.txt", "./a.txt"],
      ["package//b.txt", "/b.txt"],
      ["package/a\\b.txt", "a\\b.txt"],
    ];
    for (const [inTar, reported] of cases) {
      const path = save(raw([pkg, [inTar, "evil"]]));
      assert.ok(npmReport(path).files.some((f) => f.path === reported), `npm reports ${inTar} as ${reported}`);
      await assert.rejects(measure(path, { work: fresh("work") }), refusal(/unsafe path/), inTar);
    }
    const directory = save(gzipSync(Buffer.concat([entry("package/", Buffer.alloc(0), "5"), entry(pkg[0], Buffer.from(pkg[1])), Buffer.alloc(1024)])));
    assert.ok(npmReport(directory).files.some((f) => f.path === ""), "npm reports the directory entry package/ as an empty path");
    await assert.rejects(measure(directory, { work: fresh("work") }), refusal(/unsafe path: ""/));
    const path = save(raw([pkg, ["package/a.txt", "one"], ["package/a.txt", "two!"]]));
    assert.equal(npmReport(path).files.filter((f) => f.path === "a.txt").length, 2, "npm reports a.txt twice");
    await assert.rejects(measure(path, { work: fresh("work") }), refusal(/reported a\.txt twice/));
  });

  it("packaging/T12 [packaging/A6]: an artifact location that is relative, has no tarball extension, or begins with - is refused before any tool runs; an absolute .tgz whose name holds shell metacharacters and a leading - is measured as its contents", async () => {
    const { measure } = await packaging();
    const work = fresh("work");
    await withEnv({ PATH: fresh("empty-path") }, async () => {
      await assert.rejects(measure("artifact.tgz", { work }), /absolute location/);
      await assert.rejects(measure("-x.tgz", { work }), /absolute location/);
      await assert.rejects(measure(save(tarball(BASE), "noext"), { work }), refusal(/no realization reads this artifact/));
    });
    const bytes = tarball(BASE);
    const plain = await measure(save(bytes), { work: fresh("work") });
    const odd = await measure(save(bytes, "-a b&c;$(x).tgz"), { work: fresh("work") });
    assert.deepEqual(odd, plain);
  });

  it("packaging/T13 [packaging/N6, packaging/F4]: the tool version is recorded exactly as npm --version printed it; one that is not a semantic version, or is below 11.18.0, is refused, naming both versions", async () => {
    const bytes = tarball(BASE);
    const ok = report(bytes, { "package.json": 10 });
    assert.equal((await standInMeasure(bytes, ok, { version: "11.21.1" })).tool.version, "11.21.1");
    assert.equal((await standInMeasure(bytes, ok, { version: "12.0.0-rc.1" })).tool.version, "12.0.0-rc.1");
    await assert.rejects(standInMeasure(bytes, ok, { version: "11.17.0" }), refusal(/npm 11\.17\.0 is below 11\.18\.0/));
    await assert.rejects(standInMeasure(bytes, ok, { version: "10.9.9" }), refusal(/npm 10\.9\.9 is below 11\.18\.0/));
    await assert.rejects(standInMeasure(bytes, ok, { version: "11.18.0-pre" }), refusal(/npm 11\.18\.0-pre is below 11\.18\.0/));
    await assert.rejects(standInMeasure(bytes, ok, { version: "eleven" }), refusal(/"eleven", which is not a semantic version/));
  });

  it("packaging/T14 [packaging/A6]: after measure, nothing has been written outside the working directory, and a working directory whose configuration and scripts invite a real pack changes nothing", () => {
    const home = fresh("home");
    const work = fresh("work");
    writeFileSync(join(work, ".npmrc"), "dry-run=false\nignore-scripts=false\njson=false\n");
    writeFileSync(join(work, "package.json"), JSON.stringify({ name: "hostile", version: "1.0.0", scripts: { prepack: "node -e \"require('fs').writeFileSync('prepacked','')\"" } }));
    const artifactDir = fresh("artifact");
    const artifact = join(artifactDir, "artifact.tgz");
    writeFileSync(artifact, tarball(BASE));
    const entry = pathToFileURL(join(PACKAGE, "lib", "packaging.mjs")).href;
    const script = `const { measure } = await import(${JSON.stringify(entry)}); const m = await measure(${JSON.stringify(artifact)}, { work: ${JSON.stringify(work)} }); console.log(m.files.length);`;
    const env = { ...process.env, HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: join(home, ".config"), XDG_CACHE_HOME: join(home, ".cache"), APPDATA: join(home, "AppData"), LOCALAPPDATA: join(home, "LocalAppData") };
    for (const k of Object.keys(env)) if (/^npm_config_/i.test(k)) delete env[k];
    assert.equal(execFileSync(process.execPath, ["--input-type=module", "-e", script], { env, encoding: "utf8" }).trim(), String(Object.keys(BASE).length));
    assert.deepEqual(readdirSync(home), [], "nothing was written to the home directory");
    assert.deepEqual(readdirSync(artifactDir), ["artifact.tgz"], "nothing was written beside the artifact");
    assert.deepEqual(readdirSync(work).sort(), [".npmrc", "cache", "package.json"], "no pack, no prepack, only npm's cache in the working directory");
  });
});
