// hosting/C15 planned outer test: Hosting's package interface conforms to the
// contract its Architecture declares (hosting/F35, hosting/A15). Immutable to DO
// and CHECK. The permitted interface is read from plan/interface/architecture.md,
// never from the candidate's own package.json, so an undeclared entry cannot
// authorize itself, and an approved extension needs no edit here.
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { execute } from "../../dist/index.js";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CONTRACT = join(PACKAGE, "plan", "interface", "architecture.md");
const META = ["package/package.json", "package/README.md", "package/LICENSE"];

const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false" };
delete env.NODE_TEST_CONTEXT;

async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

/** hosting/A15's table: { export, bin, files } maps of entry → { target, status }. */
function contract() {
  const text = readFileSync(CONTRACT, "utf8");
  const start = text.indexOf("<!-- kaal-hosting:interface -->");
  const end = text.indexOf("<!-- /kaal-hosting:interface -->");
  assert.ok(start >= 0 && end > start, "hosting/A15 declares no interface");
  const declared = { export: new Map(), bin: new Map(), files: new Map() };
  for (const line of text.slice(start, end).split(/\r?\n/)) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim().replace(/^`|`$/g, ""));
    if (cells.length !== 4 || !(cells[0] in declared)) continue;
    const [kind, entry, target, status] = cells;
    declared[kind].set(entry, { target, delivered: status === "delivered" });
  }
  assert.ok(declared.export.size > 0 && declared.files.size > 0, "hosting/A15 declares no exports or files");
  return declared;
}

/** The names of the files in a .tgz, read from its bytes. */
function tarEntries(path) {
  const tar = gunzipSync(readFileSync(path));
  const names = [];
  for (let at = 0; at + 512 <= tar.length; ) {
    const header = tar.subarray(at, at + 512);
    if (header.every((b) => b === 0)) break;
    const field = (s, l) => header.subarray(s, s + l).toString("utf8").replace(/\0[\s\S]*$/, "");
    const prefix = field(345, 155);
    if (["0", ""].includes(field(156, 1))) names.push(prefix ? `${prefix}/${field(0, 100)}` : field(0, 100));
    at += 512 + Math.ceil(parseInt(field(124, 12).trim() || "0", 8) / 512) * 512;
  }
  return names;
}

const strip = (p) => `package/${p.replace(/^\.\//, "")}`;
const targets = (value) => (typeof value === "string" ? [value] : Object.values(value ?? {}).flatMap(targets));
const defaultTarget = (value) => (typeof value === "string" ? value : value?.default);

/** Every way the packed candidate in `dir` departs from the declared interface. */
async function violations(declared, dir) {
  const out = mkdtempSync(join(tmpdir(), "kaal-hosting-interface-pack-"));
  const [packed] = JSON.parse(await run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", out], dir));
  const tarball = join(out, packed.filename);
  const entries = new Set(tarEntries(tarball));
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const found = [];
  const have = { export: pkg.exports ?? {}, bin: typeof pkg.bin === "string" ? { [pkg.name]: pkg.bin } : (pkg.bin ?? {}), files: Object.fromEntries((pkg.files ?? []).map((f) => [f, ""])) };
  for (const kind of ["export", "bin", "files"]) {
    for (const entry of Object.keys(have[kind])) if (!declared[kind].has(entry)) found.push(`undeclared ${kind} ${entry}`);
    for (const [entry, { target, delivered }] of declared[kind]) {
      if (!(entry in have[kind])) {
        if (delivered) found.push(`missing ${kind} ${entry}`);
        continue;
      }
      if (kind === "files") continue;
      const value = have[kind][entry];
      const actual = kind === "export" ? defaultTarget(value) : value;
      if (actual !== target) found.push(`${kind} ${entry} points to ${actual}, declared ${target}`);
      for (const t of kind === "export" ? targets(value) : [value]) if (!entries.has(strip(t))) found.push(`${kind} ${entry} target ${t} is not shipped`);
    }
  }
  const shipped = (pkg.files ?? []).filter((f) => !f.startsWith("!") && declared.files.has(f));
  const excluded = (pkg.files ?? []).filter((f) => f.startsWith("!")).map((f) => strip(f.slice(1)));
  for (const e of entries) {
    if (META.includes(e)) continue;
    if (!shipped.some((f) => e === strip(f) || e.startsWith(`${strip(f)}/`)) || excluded.includes(e)) found.push(`${e} ships outside the declared files`);
  }
  // Installed alone in a fresh consumer, each present export loads and each command is linked.
  const consumer = mkdtempSync(join(tmpdir(), "kaal-hosting-interface-consumer-"));
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }));
  await run("npm", ["install", "--prefer-offline", "--no-package-lock", tarball], consumer);
  for (const entry of Object.keys(have.export).filter((e) => declared.export.has(e))) {
    const specifier = entry === "." ? pkg.name : `${pkg.name}${entry.slice(1)}`;
    const load = entry.endsWith(".json") ? `await import(${JSON.stringify(specifier)}, { with: { type: "json" } });` : `await import(${JSON.stringify(specifier)});`;
    const r = await execute(process.execPath, ["--input-type=module", "-e", load], { cwd: consumer, env });
    if (r.status !== 0) found.push(`export ${entry} does not load`);
  }
  for (const command of Object.keys(have.bin).filter((b) => declared.bin.has(b))) {
    const bin = join(consumer, "node_modules", ".bin", command);
    if (![bin, `${bin}.cmd`].some(existsSync)) found.push(`bin ${command} is not linked`);
  }
  return found.sort();
}

/** A copy of the built package whose package.json `change` rewrites, with `extra` files added. */
function candidate(change, extra = {}) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-hosting-interface-candidate-"));
  for (const part of ["package.json", "README.md", "LICENSE", "dist", "payload"]) cpSync(join(PACKAGE, part), join(dir, part), { recursive: true });
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  change(pkg);
  writeFileSync(join(dir, "package.json"), JSON.stringify(pkg, null, 2));
  for (const [path, text] of Object.entries(extra)) writeFileSync(join(dir, path), text);
  return dir;
}

describe("hosting/T41 [hosting/F35, hosting/A15]: the packed package exposes exactly the interface its Architecture declares, and each entry ships and loads", () => {
  let declared;
  before(() => {
    declared = contract();
  });

  it("the candidate conforms to the declared interface", async () => {
    assert.deepEqual(await violations(declared, PACKAGE), []);
  });

  it("an undeclared export is RED (no false GREEN: an entry cannot authorize itself)", async () => {
    const dir = candidate((p) => (p.exports["./extra"] = { default: "./dist/index.js" }));
    assert.deepEqual(await violations(declared, dir), ["undeclared export ./extra"]);
  });

  it("an undeclared files entry, and what it ships, is RED", async () => {
    const dir = candidate((p) => p.files.push("extra.txt"), { "extra.txt": "x" });
    assert.deepEqual(await violations(declared, dir), ["package/extra.txt ships outside the declared files", "undeclared files extra.txt"]);
  });

  it("a delivered export removed is RED", async () => {
    const dir = candidate((p) => delete p.exports["./conformance"]);
    assert.deepEqual(await violations(declared, dir), ["missing export ./conformance"]);
  });

  it("an export pointing at an absent target is RED, as not shipped and not loading", async () => {
    const dir = candidate((p) => (p.exports["./conformance"] = { types: "./dist/conformance.d.ts", default: "./dist/absent.js" }));
    assert.deepEqual(await violations(declared, dir), [
      "export ./conformance does not load",
      "export ./conformance points to ./dist/absent.js, declared ./dist/conformance.js",
      "export ./conformance target ./dist/absent.js is not shipped",
    ]);
  });

  it("a declared export whose target ships but cannot load is RED", async () => {
    const dir = candidate(() => {});
    writeFileSync(join(dir, "dist", "conformance.js"), "export const broken = ;\n");
    assert.deepEqual(await violations(declared, dir), ["export ./conformance does not load"]);
  });

  it("an extension the Architecture authorizes, ./boundary, is GREEN with no edit to this Test Case (no false RED)", async () => {
    const dir = candidate((p) => (p.exports["./boundary"] = { default: "./dist/boundary.js" }));
    writeFileSync(join(dir, "dist", "boundary.js"), "export const boundary = () => {};\n");
    assert.deepEqual(await violations(declared, dir), []);
  });
});
