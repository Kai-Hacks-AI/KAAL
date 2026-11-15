// foundation/C22 planned Case (RED): Foundation's kaal-guard.json (foundation/F45, N25).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FILE = join(PACKAGE, "kaal-guard.json");
const REPOSITORY_PATH = "packages/kaal-foundation/";

test("foundation/T78 [foundation/F45]: the package root holds a kaal-guard.json in Guard's shape", () => {
  assert.ok(existsSync(FILE), "packages/kaal-foundation/kaal-guard.json is missing");
  const body = JSON.parse(readFileSync(FILE, "utf8"));
  assert.deepEqual(Object.keys(body), ["checks"]);
  assert.ok(Array.isArray(body.checks) && body.checks.length >= 2, "at least the build and collector checks");
  const ids = new Set();
  for (const c of body.checks) {
    assert.deepEqual(Object.keys(c).filter((k) => !["id", "run", "when"].includes(k)), [], "only id, run, when");
    assert.match(c.id, /^[^:\s]+$/);
    assert.ok(!ids.has(c.id), `id ${c.id} twice`);
    ids.add(c.id);
  }
});

test("foundation/T79 [foundation/F45]: every check runs a file of this package, from the repository root, without npx or a shell", () => {
  assert.ok(existsSync(FILE), "packages/kaal-foundation/kaal-guard.json is missing");
  for (const c of JSON.parse(readFileSync(FILE, "utf8")).checks) {
    assert.doesNotMatch(c.run, /\bnpx\b|npm exec|&&|\|\||[|;><`$]/, `${c.id}: no npx and no shell feature`);
    const file = c.run.split(/\s+/).find((w) => w.startsWith(REPOSITORY_PATH));
    assert.ok(file, `${c.id}: names a repository-relative file under ${REPOSITORY_PATH}`);
    assert.ok(existsSync(join(PACKAGE, "..", "..", file)) || file.includes("/dist/"), `${c.id}: ${file} exists`);
  }
});

test("foundation/T80 [foundation/N25]: the file ships nowhere", () => {
  const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  assert.deepEqual(pkg.files, ["dist"], "files stays the dist folder");
  assert.ok(existsSync(FILE), "packages/kaal-foundation/kaal-guard.json is missing");
  assert.ok(!existsSync(join(PACKAGE, "dist", "kaal-guard.json")), "not in dist");
});
