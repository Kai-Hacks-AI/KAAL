import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, renameSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "node:test";

const REPO = join(import.meta.dirname, "../..");
const DRIVER = join(import.meta.dirname, "measure.mjs");
const PKG = "packages/skills/kaal-testing";
const MAPPING = `${PKG}/evidence.kaal.json`;
const SOURCE = `${PKG}/README.md`;
const TEST = `${PKG}/test/boundary.test.mjs`;
const OUTSIDE = (p) => `${p} leads outside the repository (Hosting: not within); not read`;
const VANISHED = (p) => `${p} disappeared before Hosting could check it lies within the repository (Hosting: MISSING); not read`;

/** A repository holding Testing's mapping and every file it pins, copied from this tree, with each
 *  path in `away` moved outside it and left as a link, and each in `aside` moved elsewhere inside it. */
function tree({ away = [], aside = [] } = {}) {
  const base = mkdtempSync(join(tmpdir(), "contracts-"));
  const root = join(base, "repo");
  const pinned = JSON.parse(spawnSync("git", ["show", `HEAD:${MAPPING}`], { cwd: REPO, encoding: "utf8" }).stdout);
  const paths = [MAPPING, `${PKG}/ownership.kaal.json`, ...pinned.statements.flatMap((s) => [s.source, ...s.evidence.map((e) => e.file)])];
  for (const p of new Set(paths)) {
    mkdirSync(dirname(join(root, p)), { recursive: true });
    cpSync(join(REPO, p), join(root, p));
  }
  const move = (p, to) => {
    mkdirSync(dirname(to), { recursive: true });
    renameSync(join(root, p), to);
    symlinkSync(relative(dirname(join(root, p)), to), join(root, p));
  };
  for (const p of away) move(p, join(base, "elsewhere", p));
  for (const p of aside) move(p, join(root, "aside", p));
  const g = (...args) => spawnSync("git", args, { cwd: root, encoding: "utf8" });
  g("init", "-q");
  g("add", "-A");
  return root;
}

/** How the driver is run so that Hosting, between kind() and within(), removes the file at `vanish`
 *  (the race a concurrent writer causes) or refuses the pinned test file with the HostingError code `fail`. */
const RACE = pathToFileURL(join(import.meta.dirname, "race/register.mjs")).href;
const race = ({ vanish = "", fail = "" }) => ({ options: ["--import", RACE], env: { RACE_VANISH: vanish, RACE_PATH: TEST, RACE_FAIL: fail } });

function run(root, { options = [], env = {} } = {}) {
  return spawnSync(process.execPath, [...options, DRIVER, "--json"], { cwd: root, encoding: "utf8", env: { ...process.env, ...env } });
}

function measure(root, how) {
  const r = run(root, how);
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout).mappings;
}
const evidence = (mappings, file) => mappings[0].statements.flatMap((s) => s.evidence).filter((e) => e.file === file);

describe("contract evidence asks Hosting before it reads", () => {
  const plain = measure(tree());

  it("reads a pinned file inside the repository, a link to one inside it included", () => {
    assert.ok(evidence(plain, TEST).length > 0);
    for (const e of evidence(plain, TEST)) assert.match(e.reason, /^no per-test result is accepted/);
    assert.deepEqual(measure(tree({ aside: [TEST] })), plain);
  });

  it("never reads a pinned test file that leads outside, and says so instead of calling it missing", () => {
    const found = evidence(measure(tree({ away: [TEST] })), TEST);
    assert.ok(found.length > 0);
    for (const e of found) assert.deepEqual([e.class, e.reason], ["unknown", OUTSIDE(TEST)]);
  });

  it("never reads a statement's source that leads outside, and says so instead of calling it stale", () => {
    const statements = measure(tree({ away: [SOURCE] }))[0].statements.filter((s) => s.source === SOURCE);
    assert.ok(statements.length > 0);
    for (const s of statements) assert.deepEqual([s.class, s.reason], ["unknown", OUTSIDE(SOURCE)]);
  });

  it("reads no mapping that leads outside, and reports it as the mapping's problem", () => {
    assert.deepEqual(measure(tree({ away: [MAPPING] })), [{ mapping: MAPPING, problems: [OUTSIDE(MAPPING)] }]);
  });

  it("reports a pinned file that disappears between kind() and within() as unknown, and measures the rest", () => {
    const found = measure(tree(), race({ vanish: TEST }));
    for (const e of evidence(found, TEST)) assert.deepEqual([e.class, e.reason], ["unknown", VANISHED(TEST)]);
    assert.ok(evidence(found, TEST).length > 0);
    const rest = (m) => m[0].statements.flatMap((s) => s.evidence).filter((e) => e.file !== TEST);
    assert.deepEqual(rest(found), rest(plain));
  });

  it("reports a mapping or ownership claim that disappears between kind() and within() as the mapping's problem", () => {
    assert.deepEqual(measure(tree(), race({ vanish: MAPPING })), [{ mapping: MAPPING, problems: [VANISHED(MAPPING)] }]);
    const CLAIM = `${PKG}/ownership.kaal.json`;
    assert.deepEqual(measure(tree(), race({ vanish: CLAIM })), [{ mapping: MAPPING, problems: [VANISHED(CLAIM)] }]);
  });

  it("ends the measurement as an error on any other Hosting failure", () => {
    const r = run(tree(), race({ fail: "UNFAITHFUL" }));
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /HostingError: refused/);
  });
});
