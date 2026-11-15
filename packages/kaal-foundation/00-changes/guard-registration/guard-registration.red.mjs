// foundation/C22 planned Cases (RED): Foundation's kaal-guard.json and how Guard runs it (foundation/F45, F46, N25).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPOSITORY = join(PACKAGE, "..", "..");
const FILE = join(PACKAGE, "kaal-guard.json");
const PATH = "packages/kaal-foundation";
const RUN = `node ${PATH}/04-test/engineering-check/guard.mjs`;
const CHECK = `${PATH}/kaal-guard.json:foundation`;
const checks = () => {
  assert.ok(existsSync(FILE), `${PATH}/kaal-guard.json is missing`);
  return JSON.parse(readFileSync(FILE, "utf8")).checks;
};

test("foundation/T300 [foundation/F45]: the package root holds one check, foundation, in Guard's shape", () => {
  const list = checks();
  assert.equal(list.length, 1);
  assert.deepEqual(Object.keys(list[0]).filter((k) => !["id", "run", "when"].includes(k)), [], "only id, run, when");
  assert.equal(list[0].id, "foundation");
  assert.equal(list[0].run, RUN);
  assert.doesNotMatch(list[0].run, /\bnpx\b|npm exec|&&|\|\||[|;><`$]/, "no npx and no shell feature");
});

test("foundation/T301 [foundation/F45]: the check starts Node on a source file of the package, not on built output", () => {
  const words = checks()[0].run.split(/\s+/);
  assert.equal(words[0], "node");
  for (const w of words.slice(1).filter((x) => x.startsWith(PATH))) {
    assert.ok(!w.includes("/dist/"), `${w}: not built output`);
    assert.ok(existsSync(join(REPOSITORY, w)), `${w} exists as source`);
  }
});

test("foundation/T302 [foundation/N25]: the package ships neither the file nor the script", () => {
  const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  assert.deepEqual(pkg.files, ["dist"]);
  assert.ok(existsSync(FILE), `${PATH}/kaal-guard.json is missing`);
  assert.ok(!existsSync(join(PACKAGE, "dist", "kaal-guard.json")));
  assert.ok(!existsSync(join(PACKAGE, "dist", "04-test", "engineering-check", "guard.mjs")));
});

/** A temporary Git repository: the package without dist/, Guard with discovery, an empty Guard configuration. */
function fixture(t) {
  assert.ok(existsSync(join(REPOSITORY, "packages", "kaal-guard", "lib", "discovery.mjs")), "Guard with discovery (guard/F43) is not in this tree: SYNC from kaal/guard/registration first");
  const root = mkdtempSync(join(tmpdir(), "foundation-guard-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  cpSync(PACKAGE, join(root, PATH), { recursive: true, filter: (s) => !/[\\/](dist|node_modules)$/.test(s) });
  cpSync(join(REPOSITORY, "packages", "kaal-guard"), join(root, "packages", "kaal-guard"), { recursive: true, filter: (s) => !/[\\/]node_modules$/.test(s) });
  mkdirSync(join(root, ".kaal", "config", "guard"), { recursive: true });
  writeFileSync(join(root, "changed.txt"), `${PATH}/README.md\n`);
  const git = (...a) => spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...a], { cwd: root });
  git("init", "-q");
  git("add", "-A");
  git("commit", "-qm", "fixture");
  return root;
}
const guard = (root) => spawnSync(process.execPath, ["packages/kaal-guard/bin/kaal-guard.mjs", "run", "--ci", "--changed", "changed.txt"], { cwd: root, encoding: "utf8" });

test("foundation/T303 [foundation/F46]: Guard discovers the registration and the check builds, collects and verifies from a clean copy", (t) => {
  assert.ok(existsSync(FILE), `${PATH}/kaal-guard.json is missing`);
  const root = fixture(t);
  assert.ok(!existsSync(join(root, PATH, "dist")), "the fixture starts with no dist/");
  const r = guard(root);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(r.stdout.split("\n").some((l) => l.startsWith(`pass: ${CHECK}`)), r.stdout);
  assert.ok(existsSync(join(root, PATH, "dist")), "the check built dist/ itself");
});

test("foundation/T304 [foundation/F46]: a failing step is a fail that names the step", (t) => {
  assert.ok(existsSync(FILE), `${PATH}/kaal-guard.json is missing`);
  const root = fixture(t);
  rmSync(join(root, PATH, "04-test", "engineering-check", "cases.json"));
  const r = guard(root);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.ok(r.stdout.split("\n").some((l) => l.startsWith(`fail: ${CHECK}`)), r.stdout);
  assert.match(r.stderr, /build\.mjs|collect\.mjs|verify\.mjs/, "names the failing step");
});
