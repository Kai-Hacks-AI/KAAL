// foundation/C3 planned outer tests: publication readiness to Guard's consumer bar, revised by
// foundation/C6 to run npm with no platform decision, and renamed by foundation/C8 as
// plan/capability/testing.md states (test/embed/, test:embedded, test:all, test/publisher/, and the
// manifest digest rewritten for each mutation). Immutable to DO and CHECK; foundation/C4 turns
// them GREEN. Each title names the contracts it checks
// (plan/publication/*.md). They read the package as it is packed and installed.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { collect, DIST_LOOPS } from "../../package-check/collect.mjs";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NAME = "@kaihacksai/kaal-foundation";
const manifest = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const MANIFEST = "dist/test/package-check/verify.json";
const LIB = "dist/skills/kaal-foundation/scripts";
/** The shipped documents, by name, as paths in the package (foundation/F7). */
const DOCS = {
  intent: ["dist/docs/intent/intent.md"],
  requirements: ["dist/docs/requirements/functional/requirements.md", "dist/docs/requirements/non-functional/requirements.md"],
  architecture: ["dist/docs/architecture/architecture.md"],
  limitations: ["dist/skills/kaal-foundation/references/limitations.md"],
  operations: ["dist/skills/kaal-foundation/references/operations.md"],
  testing: ["dist/test/package-check/testing.md"],
};
const ABC = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

/**
 * Runs a command, returning its status and output; never throws. npm runs as its own CLI script under
 * this Node, named by npm_execpath, which npm sets for the suite that runs these tests; any other
 * command is an executable path. No shell is chosen and no platform is consulted (foundation/C6, #668).
 * Run outside npm, there is no npm to run, and the result says so.
 */
const run = (cmd, args, cwd) => {
  const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false" };
  const cli = process.env.npm_execpath;
  if (cmd === "npm" && (!cli || !/\.[cm]?js$/.test(cli))) return { status: null, stdout: "", out: "npm_execpath names no npm CLI script: run these tests through npm" };
  const r = cmd === "npm" ? spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8", env }) : spawnSync(cmd, args, { cwd, encoding: "utf8", env });
  return { status: r.status, stdout: r.stdout ?? "", out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};
const last = (r) => r.stdout.trim().split(/\r?\n/).pop() ?? "";

/** Every file under a directory, as sorted relative POSIX paths. */
const listed = (root) => {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, e.name);
      if (e.isDirectory()) walk(path);
      else out.push(path.slice(root.length + 1).replaceAll("\\", "/"));
    }
  };
  walk(root);
  return out.sort();
};

/** The files the shipped operations document lists under "Shipped files". */
const documented = (operations) => {
  const section = /^## Shipped files\s*\n+```text\n([\s\S]*?)\n```/m.exec(operations);
  assert.ok(section, "the operations document has a Shipped files section with a text block");
  return section[1].split("\n").map((l) => l.trim()).filter(Boolean).sort();
};

describe("Foundation publication readiness (foundation/C3)", () => {
  it("foundation/T9 [foundation/F4, foundation/N2, foundation/N6]: the package is publishable, keeps its name and version, and declares no dependencies", () => {
    const m = manifest();
    assert.notEqual(m.private, true, "the package is private, so it cannot be published");
    assert.equal(m.name, NAME);
    assert.equal(m.version, "0.0.2");
    for (const kind of ["dependencies", "peerDependencies", "optionalDependencies", "bundleDependencies", "bundledDependencies"])
      assert.equal(Object.keys(m[kind] ?? {}).length, 0, `the package declares no ${kind}`);
  });

  it("foundation/T10 [foundation/F5, foundation/F8, foundation/I4, foundation/I6]: packed and installed into a clean directory, the installed files are exactly the documented ones, the subpath hashes abc, and the installed npm test is verified; a wrong digest, a wrong FIPS answer, an accepted string, a broken module, a failing test, an empty test file and missing tests are never verified", { timeout: 600_000 }, () => {
    assert.equal(manifest().scripts?.test, "node dist/test/package-check/verify.mjs", "blocked before release acceptance: npm test is not the delivered verification");
    const work = mkdtempSync(join(tmpdir(), "kaal-foundation-release-"));
    try {
      const pack = run("npm", ["pack", "--json", "--pack-destination", work], PACKAGE);
      assert.equal(pack.status, 0, pack.out);
      const tarball = join(work, JSON.parse(pack.stdout.slice(pack.stdout.indexOf("[")))[0].filename);
      const app = join(work, "consumer");
      mkdirSync(app);
      writeFileSync(join(app, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true, type: "module" }));
      const install = run("npm", ["install", tarball], app);
      assert.equal(install.status, 0, install.out);
      const installed = join(app, "node_modules", "@kaihacksai", "kaal-foundation");
      assert.deepEqual(listed(installed), documented(readFileSync(join(installed, DOCS.operations[0]), "utf8")), "the installed files are exactly the documented ones");
      const use = run(process.execPath, ["--input-type=module", "-e", `import { sha256 } from "${NAME}/sha256"; console.log(sha256(new TextEncoder().encode("abc")));`], app);
      assert.equal(use.status, 0, use.out);
      assert.equal(use.stdout.trim(), ABC);

      const verify = () => run("npm", ["test"], installed);
      const ok = verify();
      assert.equal(ok.status, 0, ok.out);
      assert.match(last(ok), /\bverified\b/, ok.out);
      assert.doesNotMatch(ok.out, /test:publisher/, "the installed npm test never starts the publisher suite");

      // Each mutation rewrites the manifest digest of the file it changes, so the verification judges
      // behaviour, not tampering (foundation/C8); tampering is foundation/T17's.
      const manifestFile = join(installed, MANIFEST);
      const originalManifest = readFileSync(manifestFile);
      const resync = (...paths) => {
        const v = JSON.parse(readFileSync(manifestFile, "utf8"));
        for (const p of paths) v.files[p] = createHash("sha256").update(readFileSync(join(installed, p))).digest("hex");
        writeFileSync(manifestFile, JSON.stringify(v, null, 2) + "\n");
      };
      const lib = join(installed, LIB, "sha256.mjs");
      const original = readFileSync(lib);
      const swap = (source, expect, why) => {
        writeFileSync(lib, source);
        resync(`${LIB}/sha256.mjs`);
        const r = verify();
        writeFileSync(lib, original);
        writeFileSync(manifestFile, originalManifest);
        assert.equal(r.status, expect, `${why}: ${r.out}`);
        assert.doesNotMatch(last(r), /^\W*verified\b/, `${why} is never verified`);
      };
      swap('export function sha256(bytes) { if (!(bytes instanceof Uint8Array)) throw new TypeError("bytes"); return "0".repeat(64); }\n', 1, "a module with wrong digests fails the known-answer vectors");
      renameSync(lib, join(installed, LIB, "real.mjs"));
      try {
        swap('import { sha256 as real } from "./real.mjs";\nexport function sha256(bytes) { return real(typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes); }\n', 1, "a module that accepts a string fails the refusals");
        swap('import { sha256 as real } from "./real.mjs";\nexport function sha256(bytes) { const d = real(bytes); return bytes.length === 0 || bytes.length === 112 ? "0".repeat(64) : d; }\n', 1, "a module wrong only on the FIPS empty and 896-bit messages fails the known-answer vectors");
      } finally {
        renameSync(join(installed, LIB, "real.mjs"), lib);
      }
      writeFileSync(lib, "throw new Error('corrupted');\n");
      resync(`${LIB}/sha256.mjs`);
      const broken = verify();
      writeFileSync(lib, original);
      writeFileSync(manifestFile, originalManifest);
      assert.notEqual(broken.status, 0, `a module that cannot be imported does not pass: ${broken.out}`);
      assert.doesNotMatch(last(broken), /^\W*verified\b/);

      const names = collect(join(installed, "dist"), DIST_LOOPS);
      assert.ok(names.length > 0, "at least one delivered test file ships");
      const delivered = names.map((f) => join(installed, "dist", f));
      const kept = delivered.map((path) => [path, readFileSync(path)]);
      // A failing delivered case: one expected digest inside a declared case changes (foundation/C8).
      const known = kept.findIndex(([, bytes]) => bytes.toString("utf8").includes(ABC));
      assert.ok(known >= 0, "a delivered case checks the abc digest");
      writeFileSync(delivered[known], kept[known][1].toString("utf8").replace(ABC, "0".repeat(64)));
      resync(`dist/${names[known]}`);
      const failing = verify();
      writeFileSync(manifestFile, originalManifest);
      for (const [path] of kept) writeFileSync(path, 'import "node:test";\n');
      resync(...names.map((f) => `dist/${f}`));
      const empty = verify();
      writeFileSync(manifestFile, originalManifest);
      for (const [path, bytes] of kept) writeFileSync(path, bytes);
      assert.equal(failing.status, 1, `a failing delivered test gives failed: ${failing.out}`);
      assert.match(last(failing), /\bfailed\b/);
      assert.equal(empty.status, 2, `delivered files that declare no test give cannot verify: ${empty.out}`);
      assert.match(last(empty), /cannot verify/);
      for (const path of delivered) rmSync(path);
      const none = verify();
      assert.equal(none.status, 2, `missing delivered tests give cannot verify: ${none.out}`);
      assert.match(last(none), /cannot verify/);
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });

  it("foundation/T11 [foundation/F6]: the README gives the install command, links each delivered document, does not call the package private or unpublished, and keeps the provisional ownership statement", () => {
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    assert.ok(readme.includes(`npm install ${NAME}`), "the README gives the install command");
    for (const [d, [path]] of Object.entries(DOCS)) assert.ok(readme.includes(path), `the README links the ${d} document, ${path}`);
    assert.doesNotMatch(readme, /\bnot published\b|\bis private\b|\bunpublished\b/i, "the README does not call the package private or unpublished");
    assert.match(readme, /provisional/i, "the README keeps the provisional ownership statement (foundation/N4)");
  });

  it("foundation/T12 [foundation/F7]: the six documents ship, link only shipped files and no plan, and the limitations and testing documents say what they must", () => {
    const r = run("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], PACKAGE);
    assert.equal(r.status, 0, r.out);
    const shipped = JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].files.map((f) => f.path);
    for (const [d, paths] of Object.entries(DOCS)) for (const path of paths) assert.ok(shipped.includes(path), `the ${d} document ${path} ships`);
    for (const [d, paths] of Object.entries(DOCS)) {
      for (const path of paths) {
        const text = readFileSync(join(PACKAGE, path), "utf8");
        assert.doesNotMatch(text, /(?<!test\/)\bplan\//, `${path} names no repository plan path`);
        for (const [, target] of text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
          if (/^[a-z]+:/i.test(target)) continue;
          assert.ok(shipped.includes(posix.normalize(posix.join(posix.dirname(path), target))), `${path} links ${target}, which does not ship`);
        }
      }
    }
    const limitations = readFileSync(join(PACKAGE, DOCS.limitations[0]), "utf8");
    for (const [what, pattern] of [["text must be encoded as UTF-8 first", /UTF-8/], ["only SHA-256 is held", /SHA-256/], ["it is slower than the native hash", /slower|native/i], ["ownership is provisional", /provisional/i]])
      assert.match(limitations, pattern, `the limitations document says ${what}`);
    const testing = readFileSync(join(PACKAGE, DOCS.testing[0]), "utf8");
    for (const f of collect(join(PACKAGE, "dist"), DIST_LOOPS)) assert.ok(shipped.includes(`dist/${f}`), `${f} ships`);
    assert.ok(testing.includes("04-test/engineering-check/publisher/"), "the testing document names the publisher's tests");
    assert.match(testing, /not (delivered|shipped)|do(es)? not ship/i, "and says they are not delivered");
  });

  it("foundation/T13 [foundation/F9]: npm test is the delivered verification (built first in source), there is no runner, and files ships dist/ alone", () => {
    const { scripts = {}, files = [] } = manifest();
    assert.equal(scripts.test, "node dist/test/package-check/verify.mjs", "npm test is the delivered verification");
    assert.equal(scripts["test:all"], undefined, "there is no runner");
    assert.ok(/04-test\/engineering-check\/collect\.mjs/.test(scripts["test:publisher"] ?? ""), "test:publisher runs the collector of the publisher's tests");
    assert.deepEqual(files, ["dist"], "files ships dist/ alone: no plan and no publisher test");
    assert.equal(existsSync(join(PACKAGE, "test", "run.mjs")), false, "the runner is retired (foundation/C20)");
  });
});
