// Guard outer acceptance, Engineering part: guard/T134 (guard/C129). Guard's tests are placed by the
// realization they verify, Engineering, Embedded or External, each with its own Test Plan, and every
// declared suite runs in some lane on every host it declares. A lane cannot be GREEN while a declared
// Guard case never ran. The negative fixtures are small repositories built in a scratch directory, each
// with one fault; the audit must name it.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { audit, PLATFORMS } from "../suites.mjs";

const scratch = [];
after(() => scratch.forEach((d) => rmSync(d, { recursive: true, force: true })));

const suites = (...rows) => ["<!-- suites -->", "| Suite | Owner | Files | Hosts | Why a host is left out |", "| --- | --- | --- | --- | --- |", ...rows, "<!-- end of suites -->"].join("\n");
// The hosts and the lanes are fixture text, in fixtures/suites.json, so this file names no platform itself (guard/T132).
const FIXTURE = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "fixtures", "suites.json"), "utf8"));
const ALL = PLATFORMS.join(", ");
const [, MAC, WIN] = PLATFORMS;

/** A repository holding one case per realization, every suite run on every host it declares. */
function base() {
  return {
    "packages/kaal-guard/package.json": JSON.stringify({ scripts: { test: "node test/verify.mjs" } }),
    "packages/kaal-guard/test/verify.json": JSON.stringify({ cases: ["test/unit/a.test.mjs > unit > guard/T1 [guard/F1]: one"] }),
    "packages/kaal-guard/test/unit/a.test.mjs": 'it("guard/T1 [guard/F1]: one", () => {});\n',
    "engineering/guard/testing.md": ["| guard/T2: two | guard/F1 |", suites(`| Engineering acceptance | Engineering | \`engineering/guard/acceptance/*.test.mjs\` | ${ALL} | |`)].join("\n"),
    "engineering/guard/acceptance/b.test.mjs": 'it("guard/T2 [guard/F1]: two", () => {});\n',
    "engineering/guard/external/testing.md": ["| guard/T3: three | guard/I6 |", suites("| External tooling | External | `engineering/guard/external/c.test.mjs` | linux | it runs where the root scripts run |")].join("\n"),
    "engineering/guard/external/c.test.mjs": 'it("guard/T3 [guard/I6]: three", () => {});\n',
    "package.json": JSON.stringify({ scripts: { "test:engineering": "node --test engineering/guard/external/c.test.mjs" } }),
    ".kaal/config/guard/Engineering.md": "---\ncommand: npm run test:engineering\nruns: [ci]\n---\n",
    ".github/workflows/ci.yml": FIXTURE.ci,
  };
}

/** The audit of a scratch repository holding `files`. */
function audited(files) {
  const root = mkdtempSync(join(tmpdir(), "kaal-t134-"));
  scratch.push(root);
  for (const [path, text] of Object.entries(files)) {
    if (text === undefined) continue;
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return audit(root);
}

describe("guard/I8 [guard/N14] Guard's tests placed by the realization they verify", () => {
  it("guard/T134 [guard/N14, guard/A20]: every Guard test file is in exactly one suite its owner's Test Plan declares; every case is defined in that owner's Test Plan; every declared suite runs in some lane on every host it declares; and the package's npm test runs only the package", (t) => {
    // The audit discriminates: the base fixture is clean, and each fault is named.
    assert.deepEqual(audited(base()), [], "the base fixture has a finding");
    const faults = {
      "a test file no suite holds": [{ "engineering/guard/external/orphan.test.mjs": 'it("guard/T3 x", () => {});\n' }, /orphan\.test\.mjs: no declared suite holds/],
      "a package test file its manifest does not ship": [{ "packages/kaal-guard/test/unit/extra.test.mjs": "\n" }, /extra\.test\.mjs: no declared suite holds/],
      "a lane glob that misses a subdirectory": [
        { "engineering/guard/testing.md": `${base()["engineering/guard/testing.md"]}\n`.replace("`engineering/guard/acceptance/*.test.mjs`", "`engineering/guard/acceptance/*.test.mjs`, `engineering/guard/acceptance/consumer/*.test.mjs`"), "engineering/guard/acceptance/consumer/d.test.mjs": 'it("guard/T2 [guard/F1]: two", () => {});\n' },
        /consumer\/d\.test\.mjs: suite Engineering acceptance declares linux, and no lane on linux runs it/,
      ],
      "a host lane that names files and omits one": [
        { ".github/workflows/ci.yml": base()[".github/workflows/ci.yml"].replace("node engineering/guard/suites.mjs", "node --test packages/kaal-guard/test/unit/a.test.mjs") },
        new RegExp(`b\\.test\\.mjs: suite Engineering acceptance declares ${WIN}, and no lane on ${WIN} runs it`),
      ],
      "a case in another owner's suite": [{ "engineering/guard/acceptance/b.test.mjs": 'it("guard/T3 [guard/I6]: three", () => {});\n' }, /guard\/T3 is in Engineering's suite Engineering acceptance, but External defines it/],
      "a case two Test Plans define": [{ "engineering/guard/testing.md": `| guard/T3: three |\n${base()["engineering/guard/testing.md"]}` }, /guard\/T3 is defined in more than one Test Plan/],
      "a case no Test Plan defines": [{ "engineering/guard/acceptance/b.test.mjs": 'it("guard/T9 [guard/F1]: nine", () => {});\n' }, /guard\/T9 is in Engineering's suite Engineering acceptance, but no Test Plan defines it/],
      "a host left out without a reason": [{ "engineering/guard/external/testing.md": base()["engineering/guard/external/testing.md"].replace("it runs where the root scripts run", "") }, new RegExp(`leaves out ${MAC}, ${WIN} without saying why`)],
      "a suite declared in another owner's plan": [{ "engineering/guard/external/testing.md": base()["engineering/guard/external/testing.md"].replace("| External tooling | External |", "| External tooling | Engineering |") }, /is owned by Engineering, not by this plan's owner, External/],
      "a suite that names no test file": [{ "engineering/guard/external/c.test.mjs": undefined }, /names engineering\/guard\/external\/c\.test\.mjs, which holds no test file/],
      "a package npm test that runs npm test": [{ "packages/kaal-guard/package.json": JSON.stringify({ scripts: { test: "npm test --prefix ../.." } }) }, /invokes npm test recursively/],
      "a package npm test that names an Engineering path": [{ "packages/kaal-guard/package.json": JSON.stringify({ scripts: { test: "node --test ../../engineering/guard/acceptance/b.test.mjs" } }) }, /names a path outside the package/],
    };
    for (const [what, [change, expected]] of Object.entries(faults)) {
      const found = audited({ ...base(), ...change });
      assert.ok(found.some((f) => expected.test(f)), `${what}: not found; the audit gave ${JSON.stringify(found)}`);
    }

    const found = audit();
    t.diagnostic(`observed on ${process.platform}: ${found.length} findings in this repository`);
    assert.deepEqual(found, [], "Guard's tests are misplaced, or a declared suite is not run where it declares");
  });
});
