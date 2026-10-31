// foundation/C11 planned publisher cases: the consumer boundary (plan/boundary/*.md). Immutable to DO
// and CHECK; foundation/C12 moves this file unchanged to test/publisher/ and turns it GREEN. Each title
// names the contracts it checks. Fixtures live in a temporary directory; a fixture consumer's Foundation
// is a copy of this package's shipped files, so no npm and no network is needed. No platform is
// consulted and no shell is chosen (foundation/N7).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPOSITORY = join(PACKAGE, "..", "..");
const NAME = "@kaihacksai/kaal-foundation";
const BIN = join(PACKAGE, "bin", "kaal-foundation.mjs");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const MAIN_SHA256_MJS = "c504c09d231c8a58f2ae2dbf346edbdf4dd544bdbdba1161515875d051df5ee0";
const MAIN_SHA256_DTS = "e0b71d43eb02726e7ed9fa05cf1c60c4b88224f99a5120de56bb54b3da303a16";

const scratch = mkdtempSync(join(tmpdir(), "foundation-boundary-"));
after(() => rmSync(scratch, { recursive: true, force: true }));
let n = 0;
const fresh = () => { const d = join(scratch, String(n++)); mkdirSync(d, { recursive: true }); return d; };

/** Runs this package's command under this Node, without a shell; never throws. */
const foundation = (args, cwd, input) => {
  const r = spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8", input, env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
};
/** The JSON of the last stdout line that starts with `<prefix> `, or null. */
const last = (stdout, prefix) => {
  const line = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).at(-1) ?? "";
  if (!line.startsWith(`${prefix} `)) return null;
  try { return JSON.parse(line.slice(prefix.length + 1)); } catch { return null; }
};

/** A copy of this package's shipped files, as npm would install them. */
const installFoundation = (consumer) => {
  const to = join(consumer, "node_modules", ...NAME.split("/"));
  mkdirSync(to, { recursive: true });
  for (const f of ["package.json", "README.md", "LICENSE", ...pkg.files]) if (existsSync(join(PACKAGE, f))) cpSync(join(PACKAGE, f), join(to, f), { recursive: true });
  return to;
};
/** A fixture consumer; `depends` declares Foundation in dependencies. */
const consumer = ({ depends = true, install = depends, extra = {} } = {}) => {
  const d = fresh();
  writeFileSync(join(d, "package.json"), JSON.stringify({ name: "fixture-consumer", version: "1.2.3", type: "module", ...(depends ? { dependencies: { [NAME]: pkg.version } } : {}), ...extra }, null, 2));
  writeFileSync(join(d, "a.txt"), "alpha\n");
  writeFileSync(join(d, "b.bin"), new Uint8Array([0, 1, 2, 255]));
  const copy = install ? installFoundation(d) : null;
  return { d, copy };
};
const listFor = (dir, files) => files.map((f) => `${hash(readFileSync(join(dir, f)))}  ${f}`).join("\n") + "\n";

test("foundation/T35 [foundation/I8, foundation/F20]: a list that kaal-foundation sha256 printed is verified, and a file changed afterwards is failed with cause differs for that file only", () => {
  const { d } = consumer({ depends: false });
  const printed = foundation(["sha256", "a.txt", "b.bin"], d);
  assert.equal(printed.status, 0, printed.stderr);
  writeFileSync(join(d, "list"), printed.stdout);
  const ok = foundation(["check", "list"], d);
  const okJson = last(ok.stdout, "kaal-foundation-check");
  assert.ok(okJson, `no kaal-foundation-check line: ${ok.stdout}${ok.stderr}`);
  assert.deepEqual([ok.status, okJson.result, okJson.exit, okJson.checked], [0, "verified", 0, 2]);
  writeFileSync(join(d, "a.txt"), "changed\n");
  const bad = foundation(["check", "list"], d);
  const badJson = last(bad.stdout, "kaal-foundation-check");
  assert.deepEqual([bad.status, badJson?.result], [1, "failed"]);
  assert.deepEqual(badJson.causes, [{ file: "a.txt", cause: "differs" }]);
});

test("foundation/T36 [foundation/F20]: an empty list, a malformed line, a bad digest and a missing file are cannot verify; a differing line outranks them; the last line parses", () => {
  const { d } = consumer({ depends: false });
  const good = `${hash(readFileSync(join(d, "a.txt")))}  a.txt`;
  const cases = [
    ["", "empty"],
    [`${hash(Buffer.from("x"))} a.txt`, "malformed"],
    [`${hash(readFileSync(join(d, "a.txt"))).toUpperCase()}  a.txt`, "malformed"],
    [`${hash(readFileSync(join(d, "a.txt"))).slice(1)}  a.txt`, "malformed"],
    [`${hash(Buffer.from("x"))}  missing.txt`, "unreadable"],
  ];
  for (const [list, cause] of cases) {
    const r = foundation(["check"], d, list ? `${good}\n${list}\n` : "");
    const j = last(r.stdout, "kaal-foundation-check");
    assert.ok(j, `no kaal-foundation-check line for ${cause}: ${r.stdout}${r.stderr}`);
    assert.deepEqual([r.status, j.result, j.exit], [2, "cannot verify", 2], cause);
    if (list) assert.ok(j.causes.some((c) => c.cause === cause), `${cause}: ${JSON.stringify(j.causes)}`);
  }
  const mixed = foundation(["check"], d, `${hash(Buffer.from("x"))}  a.txt\n${hash(Buffer.from("x"))}  missing.txt\n`);
  assert.deepEqual([mixed.status, last(mixed.stdout, "kaal-foundation-check")?.result], [1, "failed"]);
});

test("foundation/T37 [foundation/I8, foundation/F21]: a consumer that declares Foundation and resolves a verifying copy is verified, and the JSON names consumer, resolved version and verification", () => {
  const { d } = consumer();
  const r = foundation(["boundary", d], fresh());
  const j = last(r.stdout, "kaal-foundation-boundary");
  assert.ok(j, `no kaal-foundation-boundary line: ${r.stdout}${r.stderr}`);
  assert.deepEqual([r.status, j.result, j.exit, j.verification], [0, "verified", 0, "verified"]);
  assert.deepEqual(j.consumer, { name: "fixture-consumer", version: "1.2.3" });
  assert.equal(j.resolved.version, pkg.version);
  assert.equal(j.check, null);
});

test("foundation/T38 [foundation/F21]: not a consumer, unresolved, a changed resolved copy, a wrong resolved library and a differing list each give their result", () => {
  const outside = fresh();
  const run = (d, ...lists) => { const r = foundation(["boundary", d, ...lists], outside); return { status: r.status, j: last(r.stdout, "kaal-foundation-boundary"), out: r.stdout + r.stderr }; };

  const none = run(consumer({ depends: false }).d);
  assert.deepEqual([none.status, none.j?.result], [2, "cannot verify"], none.out);
  assert.ok(none.j.causes.some((c) => /not a consumer/.test(JSON.stringify(c))));

  const missing = run(consumer({ install: false }).d);
  assert.deepEqual([missing.status, missing.j?.result], [2, "cannot verify"], missing.out);
  assert.ok(missing.j.causes.some((c) => /unresolved/.test(JSON.stringify(c))));

  const changed = consumer();
  writeFileSync(join(changed.copy, "README.md"), "changed\n");
  const c = run(changed.d);
  assert.deepEqual([c.status, c.j?.result, c.j?.verification], [2, "cannot verify", "cannot verify"], c.out);

  const wrong = consumer();
  const lib = join(wrong.copy, "lib", "sha256.mjs");
  writeFileSync(lib, 'export function sha256(b) { if (!(b instanceof Uint8Array)) throw new TypeError("bytes"); return "0".repeat(64); }\n');
  const manifest = join(wrong.copy, "test", "verify.json");
  const m = JSON.parse(readFileSync(manifest, "utf8"));
  m.files["lib/sha256.mjs"] = hash(readFileSync(lib));
  writeFileSync(manifest, JSON.stringify(m, null, 2) + "\n");
  const w = run(wrong.d);
  assert.deepEqual([w.status, w.j?.result, w.j?.verification], [1, "failed", "failed"], w.out);

  const listed = consumer();
  writeFileSync(join(listed.d, "list"), `${hash(Buffer.from("not alpha"))}  a.txt\n`);
  const l = run(listed.d, "list");
  assert.deepEqual([l.status, l.j?.result, l.j?.verification, l.j?.check?.result], [1, "failed", "verified", "failed"], l.out);
});

test("foundation/T39 [foundation/N11]: the boundary never imports, runs or judges the consumer: marker-writing main, postinstall and test scripts, and a consumer's own createHash, leave it verified and write no marker", () => {
  const marker = (name) => `require("node:fs").writeFileSync(${JSON.stringify(join(scratch, `marker-${name}`))}, "ran")`;
  const { d } = consumer({ extra: { main: "index.cjs", scripts: { postinstall: `node -e '${marker("postinstall")}'`, test: `node -e '${marker("test")}'` } } });
  writeFileSync(join(d, "index.cjs"), `${marker("main")};\nconst { createHash } = require("node:crypto");\nmodule.exports = (b) => createHash("sha256").update(b).digest("hex");\n`);
  writeFileSync(join(d, "list"), listFor(d, ["a.txt", "b.bin", "index.cjs"]));
  const r = foundation(["boundary", d, "list"], fresh());
  const j = last(r.stdout, "kaal-foundation-boundary");
  assert.deepEqual([r.status, j?.result, j?.check?.result], [0, "verified", "verified"], r.stdout + r.stderr);
  for (const name of ["main", "postinstall", "test"]) assert.equal(existsSync(join(scratch, `marker-${name}`)), false, `the boundary ran the consumer's ${name}`);
});

test("foundation/T40 [foundation/F22, foundation/N12]: documents, skill and AGENTS.md name check and boundary by the scoped bin; lib/boundary.mjs imports only node: and ./sha256.mjs; lib/sha256 unchanged; no dependency", () => {
  const scoped = /node node_modules\/@kaihacksai\/kaal-foundation\/bin\/kaal-foundation\.mjs (check|boundary)\b/g;
  const agents = readFileSync(join(REPOSITORY, "AGENTS.md"), "utf8");
  const section = agents.slice(agents.indexOf("## Foundation"), agents.indexOf("\n## ", agents.indexOf("## Foundation") + 1) >>> 0 || undefined);
  for (const [where, text] of [["docs/operations.md", readFileSync(join(PACKAGE, "docs", "operations.md"), "utf8")], ["skill", readFileSync(join(PACKAGE, "skills", "kaal-foundation", "SKILL.md"), "utf8")], ["AGENTS.md", section]]) {
    const named = new Set([...text.matchAll(scoped)].map((m) => m[1]));
    assert.deepEqual([...named].sort(), ["boundary", "check"], `${where} must name both commands by the scoped bin`);
    assert.doesNotMatch(text, /npx kaal-foundation/, where);
  }
  const boundary = readFileSync(join(PACKAGE, "lib", "boundary.mjs"), "utf8");
  for (const [, from] of boundary.matchAll(/(?:^|\n)\s*import[^"'`]*["'`]([^"'`]+)["'`]/g)) assert.ok(from.startsWith("node:") || from === "./sha256.mjs", `lib/boundary.mjs imports ${from}`);
  assert.doesNotMatch(boundary, /import\(/, "lib/boundary.mjs imports nothing dynamically");
  assert.equal(hash(readFileSync(join(PACKAGE, "lib", "sha256.mjs"))), MAIN_SHA256_MJS);
  assert.equal(hash(readFileSync(join(PACKAGE, "lib", "sha256.d.ts"))), MAIN_SHA256_DTS);
  assert.equal(pkg.dependencies, undefined);
});
