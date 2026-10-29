// hosting/C10 planned outer tests: Hosting publishes as @kaihacksai/kaal-hosting
// (hosting/F15–F17). Immutable to DO and CHECK; hosting/C11 turns them GREEN.
// Each title names the contracts it checks. They pack and install through
// Hosting's own build (hosting/A8), never through its package name, so they
// need no edit when the name changes; the consumer reaches the installed
// package by its name alone.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { execute } from "../../dist/index.js";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPO = resolve(PACKAGE, "../../..");
const SELF = "packages/extensions/kaal-hosting/test/plan/release.test.mjs";
const NAME = "@kaihacksai/kaal-hosting";
// Spelled in parts so this file never names the old package itself.
const OLD = ["kaal", "hosting"].join("-");

const pkg = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false" };

async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

/** The names of the files in a .tgz, read from its bytes. */
function tarEntries(path) {
  const tar = gunzipSync(readFileSync(path));
  const names = [];
  for (let at = 0; at + 512 <= tar.length; ) {
    const header = tar.subarray(at, at + 512);
    if (header.every((b) => b === 0)) break;
    const field = (start, length) => header.subarray(start, start + length).toString("utf8").replace(/\0[\s\S]*$/, "");
    const prefix = field(345, 155);
    if (["0", ""].includes(field(156, 1))) names.push(prefix ? `${prefix}/${field(0, 100)}` : field(0, 100));
    at += 512 + Math.ceil(parseInt(field(124, 12).trim() || "0", 8) / 512) * 512;
  }
  return names;
}

/** Every file under `dir`, `/`-separated and relative to `base`. */
function files(dir, base) {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((p) => statSync(join(dir, p)).isFile())
    .map((p) => `${base}/${p.split("\\").join("/")}`);
}

/** Each reference to `name` in `text`, by the kinds hosting/F16 names. */
function references(text, name) {
  const quoted = name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const specifier = new RegExp(`(["'\`])${quoted}(/[\\w./-]+)?\\1`, "g");
  const selector = new RegExp(`(?:-w|--workspace)[ =]${quoted}(?![\\w/-])`, "g");
  return [...text.matchAll(specifier), ...text.matchAll(selector)].map((m) => m[0]);
}

describe("hosting/C10: Hosting publishes as @kaihacksai/kaal-hosting", () => {
  it("hosting/T21 [hosting/F15]: the package is @kaihacksai/kaal-hosting 0.0.1, public, with its repository directory, its interface unchanged, and a README that names it and how to install it", () => {
    const p = pkg();
    assert.equal(p.name, NAME);
    assert.equal(p.version, "0.0.1");
    assert.deepEqual(p.publishConfig, { access: "public" });
    assert.deepEqual(p.repository, { type: "git", url: "git+https://github.com/Kai-Hacks-AI/KAAL.git", directory: "packages/extensions/kaal-hosting" });
    assert.deepEqual(Object.keys(p.exports), [".", "./conformance", "./package.json"]);
    assert.deepEqual(p.files, ["dist", "!dist/.tsbuildinfo", "payload"]);
    assert.deepEqual(p.engines, { node: ">=24" });
    assert.equal(p.license, "MIT");
    assert.deepEqual(Object.keys(p.dependencies).sort(), ["cross-spawn", "es-module-lexer", "graceful-fs", "proper-lockfile"]);
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    assert.equal(readme.split("\n")[0], `# ${NAME}`);
    assert.match(readme, new RegExp(`npm install ${NAME}`));
  });

  it("hosting/T22 [hosting/F16]: no module specifier, dependency entry or workspace selector in the repository names the old package, and each names @kaihacksai/kaal-hosting", async () => {
    const tracked = (await run("git", ["ls-files", "-z"], REPO)).split("\0").filter(Boolean);
    const found = [];
    let renamed = 0;
    for (const path of tracked) {
      if (path === SELF || path.endsWith("package-lock.json")) continue;
      if (!/\.(c?m?js|ts|json|ya?ml)$/.test(path)) continue;
      const at = join(REPO, path);
      if (!existsSync(at)) continue;
      const text = readFileSync(at, "utf8");
      for (const ref of references(text, OLD)) found.push(`${path}: ${ref}`);
      renamed += references(text, NAME).length;
    }
    assert.deepEqual(found, []);
    assert.ok(renamed > 0, `no reference names ${NAME}`);
  });

  it("hosting/T23 [hosting/F16]: the lockfile links node_modules/@kaihacksai/kaal-hosting to the workspace and has no entry for the old package", () => {
    const lock = JSON.parse(readFileSync(join(REPO, "package-lock.json"), "utf8"));
    assert.deepEqual(lock.packages[`node_modules/${NAME}`], { resolved: "packages/extensions/kaal-hosting", link: true });
    assert.equal(lock.packages[`node_modules/${OLD}`], undefined);
    assert.equal(lock.packages["packages/extensions/kaal-hosting"]?.name, NAME);
    for (const [where, entry] of Object.entries(lock.packages)) {
      for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
        assert.equal(entry[field]?.[OLD], undefined, `${where} ${field} names the old package`);
      }
    }
  });

  describe("hosting/T24 [hosting/I5, hosting/F17]: packed and installed alone into a fresh consumer", () => {
    let tarball;
    let consumer;

    before(async () => {
      const out = mkdtempSync(join(tmpdir(), "kaal-hosting-pack-"));
      const packed = JSON.parse(await run("npm", ["pack", "--json", "--pack-destination", out], PACKAGE));
      tarball = join(out, packed[0].filename);
      consumer = mkdtempSync(join(tmpdir(), "kaal-hosting-consumer-"));
      writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }));
      // Hosting's runtime dependencies come from the registry; the cache is preferred but not required.
      await run("npm", ["install", "--prefer-offline", "--no-package-lock", tarball], consumer);
    });

    it("holds exactly package.json, README.md, LICENSE, dist without .tsbuildinfo, and payload", () => {
      const expected = ["package/package.json", "package/README.md", "package/LICENSE", ...files(join(PACKAGE, "dist"), "package/dist"), ...files(join(PACKAGE, "payload"), "package/payload")]
        .filter((p) => !p.endsWith(".tsbuildinfo"))
        .sort();
      assert.deepEqual(tarEntries(tarball).sort(), expected);
    });

    it("installs as node_modules/@kaihacksai/kaal-hosting, and the consumer uses it by that name alone", async () => {
      const installed = join(consumer, "node_modules", ...NAME.split("/"));
      assert.ok(existsSync(join(installed, "package.json")), `${NAME} is not installed in the consumer`);
      assert.equal(JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).name, NAME);
      mkdirSync(join(consumer, "root"));
      writeFileSync(
        join(consumer, "use.mjs"),
        [
          `import { execute, reconcile, within } from "${NAME}";`,
          `import { EXCLUSIONS } from "${NAME}/conformance";`,
          `import { fileURLToPath } from "node:url";`,
          `const root = fileURLToPath(new URL("./root", import.meta.url));`,
          `const report = await reconcile(root, { write: [{ path: "a.md", expect: "absent", bytes: Buffer.from("a") }], remove: [] });`,
          `const ran = await execute(process.execPath, ["-e", "process.stdout.write('ran')"], { cwd: root });`,
          `process.stdout.write(JSON.stringify({ within: await within(root, root), outcomes: report.outcomes, ran: ran.stdout, exclusions: Array.isArray(EXCLUSIONS) }));`,
        ].join("\n"),
      );
      const used = JSON.parse(await run(process.execPath, ["use.mjs"], consumer));
      assert.deepEqual(used, { within: true, outcomes: [{ path: "a.md", outcome: "written" }], ran: "ran", exclusions: true });
      assert.equal(readFileSync(join(consumer, "root", "a.md"), "utf8"), "a");
    });
  });
});
