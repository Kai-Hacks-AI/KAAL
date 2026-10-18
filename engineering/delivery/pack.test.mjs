// Regression for the shared-build race: scenarios that each packed (and so
// rebuilt) the workspace packages raced on the shared dist/. Delivery now packs
// once before any scenario runs and checks afterwards that nothing shared
// changed. These runs use a fixture package outside the repository, so a
// mutation injected here touches nothing of KAAL's own.
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { initialize } from "kaal-hosting";
import { deliver } from "./pack.mjs";

const TESTING = import.meta.resolve("kaal-testing/acceptance");
const base = join(tmpdir(), `kaal-delivery-test-${Date.now()}-${process.pid}`);

/** A scenario that installs the fixture package and, after that, runs `then`. */
const scenario = (then = "") => `import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { it } from "node:test";
import { install } from ${JSON.stringify(TESTING)};
it("installs and loads the packed fixture", async () => {
  const host = await install(["fixture-pkg"], { offline: true });
  assert.equal((await import(join(host, "node_modules", "fixture-pkg", "dist", "index.js"))).value, 1);
  ${then}
});
`;

/** A root with one fixture workspace, whose built dist/ is checked in, and the given scenarios. */
async function fixture(name, scenarios) {
  const root = join(base, name);
  const location = join(root, "fixture-pkg");
  await initialize(location, {
    "package.json": Buffer.from(JSON.stringify({ name: "fixture-pkg", version: "1.0.0", type: "module", files: ["dist"] })),
    "dist/index.js": Buffer.from("export const value = 1;\n"),
  });
  const files = {};
  for (const [file, text] of Object.entries(scenarios)) files[file] = Buffer.from(text);
  await initialize(join(root, "scenarios"), files);
  return {
    root,
    location,
    workspaces: [{ name: "fixture-pkg", location }],
    scenarios: Object.keys(scenarios).map((f) => join(root, "scenarios", f)),
  };
}

async function run(name, scenarios) {
  const f = await fixture(name, scenarios);
  return { f, result: await deliver({ workspaces: f.workspaces, scenarios: f.scenarios, dir: join(f.root, "out"), cwd: f.root }) };
}

const failures = (result) => result.findings.filter((x) => x.kind === "verified failure").map((x) => x.evidence);

describe("delivery: pack once, then nothing shared changes", () => {
  it("a clean run passes: packed once, scenarios in parallel processes, each in its own host", async () => {
    const { result } = await run("clean", { "a.test.mjs": scenario(), "b.test.mjs": scenario() });
    assert.deepEqual(failures(result), []);
    assert.equal(result.passed, true);
    assert.deepEqual(Object.keys(result.manifest), ["fixture-pkg"]);
    assert.equal(result.records.length, 2);
    assert.equal(new Set(result.records.map((r) => r.pid)).size, 2);
    assert.equal(new Set(result.records.map((r) => r.host)).size, 2);
    // Containment stays unknown until Hosting has a portable contract for it.
    assert.ok(result.findings.some((x) => x.kind === "unknown" && x.subject === "installation hosts"));
  });

  it("injected: a scenario that rebuilds dist/ during the run fails it", async () => {
    const { result } = await run("rebuild", {
      "a.test.mjs": scenario(),
      "rebuild.test.mjs": scenario(`writeFileSync(${JSON.stringify(join(base, "rebuild", "fixture-pkg", "dist", "index.js"))}, "export const value = 2;\\n");`),
    });
    assert.equal(result.passed, false);
    assert.deepEqual(failures(result), ["dist/ changed during the run: index.js"]);
  });

  it("injected: a scenario that changes a packed tarball after installing fails the run", async () => {
    // One scenario only: a second one installing after the change would be refused by Testing, which is its own evidence.
    const { result } = await run("mutate", {
      "mutate.test.mjs": scenario(`const run = process.env.KAAL_ACCEPTANCE_RUN;
  const { tarball } = JSON.parse(readFileSync(join(run, "manifest.json"), "utf8"))["fixture-pkg"];
  writeFileSync(tarball, Buffer.concat([readFileSync(tarball), Buffer.from("x")]));`),
    });
    assert.equal(result.passed, false);
    assert.deepEqual(failures(result), ["the fixture-pkg tarball changed during the run"]);
  });
});
