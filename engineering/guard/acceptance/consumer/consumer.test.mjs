// Guard outer acceptance, Engineering part: the consumer upgrade. T36–T44 check I5 for an existing
// consumer of the published package, with KAAL as that consumer (A12).
// Each test runs in a disposable clone of KAAL, or in a minimal repository beside it, never in KAAL's
// own tree (N8). It moves from the published 0.0.1 to a candidate: `packed` (the package at this
// commit, simulated) or `registry` (a published version), and says which (N9). No test claims that
// KAAL's real GitHub CI or branch protection enforces a published version.
// These tests need the network to reach the registry, so they sit outside the required Guard jobs'
// glob and run directly:
//   node --test engineering/guard/acceptance/consumer/*.test.mjs
// Planned in PLAN (K2a); DO (K2b) supplies the harness and does not change them.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const KAAL = resolve(HERE, "..", "..", "..", "..");
const HARNESS = resolve(KAAL, "engineering", "guard", "consumer", "harness.mjs");
const PUBLISHED = "@kaihacksai/kaal-guard@0.0.1";

/** The A12 harness, or a blocked RED naming what is missing. */
async function a12() {
  assert.ok(existsSync(HARNESS), "blocked before behavioural assertion: there is no A12 harness (engineering/guard/consumer/harness.mjs)");
  return import(HARNESS);
}

/** The candidate, reported with its source so no evidence is read as more than it is (N9). */
function announce(t, candidate) {
  t.diagnostic(`candidate: ${candidate.spec} (${candidate.source}${candidate.source === "packed" ? ", simulated" : ""})`);
}

const json = (text) => JSON.parse(text);
const changedFiles = (c) => c.git("status", "--porcelain").output.split("\n").filter(Boolean).map((l) => l.slice(3)).sort();

describe("guard/I5 a consumer moves between published versions safely", () => {
  it("guard/T36 [guard/I5, guard/F11, guard/N8, guard/N9, guard/A12]: a KAAL clone installs the published 0.0.1 from the registry and runs KAAL's checks through it", async (t) => {
    const h = await a12();
    const k = h.kaalClone();
    k.install(PUBLISHED);
    assert.equal(k.lockIntegrity(), h.registryIntegrity(PUBLISHED), "the lockfile does not hold the registry's integrity for 0.0.1");
    assert.equal(json(readFileSync(join(KAAL, "package.json"), "utf8")).devDependencies["@kaihacksai/kaal-guard"], "file:packages/kaal-guard", "N8: KAAL's own development dependency changed");
    const verify = k.guard("verify");
    assert.equal(verify.status, 0, verify.output);
    const facts = ["--head", "HEAD", "--base", "HEAD", "--base-ref", "main"];
    const published = k.guard("run", "--local", ...facts);
    const development = k.development("run", "--local", ...facts);
    assert.equal(published.status, development.status, `the published Guard's verdict differs from the development Guard's:\n${published.output}\n${development.output}`);
  });

  it("guard/T37 [guard/I5, guard/F11, guard/F12]: a dependency and lockfile change, then upgrade, moves unmodified assets and keeps everything the consumer owns", async (t) => {
    const h = await a12();
    const candidate = h.candidate();
    announce(t, candidate);
    const reference = h.minimalRepo();
    reference.install(candidate.spec);
    reference.guard("init");

    const m = h.minimalRepo();
    m.install(PUBLISHED);
    assert.equal(m.guard("init").status, 0);
    m.write(".githooks/pre-push", `${m.read(".githooks/pre-push")}# the consumer's own line\n`);
    m.write("README.md", "the consumer's own file\n");
    const hook = m.read(".githooks/pre-push");
    const checks = json(m.read("guard.json")).checks;

    m.install(candidate.spec);
    const up = m.guard("upgrade");
    assert.equal(up.status, 0, up.output);
    assert.equal(m.read(".githooks/pre-push"), hook, "upgrade changed a modified managed asset");
    assert.equal(m.read("README.md"), "the consumer's own file\n", "upgrade changed a file Guard did not write");
    assert.deepEqual(json(m.read("guard.json")).checks, checks, "upgrade changed the consumer's checks");
    assert.equal(m.read(".github/workflows/guard.yml"), reference.read(".github/workflows/guard.yml"), "the unmodified workflow did not move to the candidate's content");

    const k = h.kaalClone();
    k.install(PUBLISHED);
    k.git("add", "-A");
    k.git("commit", "-q", "-m", "0.0.1");
    k.install(candidate.spec);
    assert.deepEqual(changedFiles(k), ["package-lock.json", "package.json"], "F11: a package-code update changed more than the dependency and the lockfile");
  });

  it("guard/T38 (H1) [guard/F13]: upgrade installs and records a managed asset the consumer does not have", async (t) => {
    const h = await a12();
    const candidate = h.candidate();
    announce(t, candidate);
    const m = h.minimalRepo();
    m.write(".github/workflows/guard.yml", "name: Own\non: push\njobs: {}\n");
    m.install(PUBLISHED);
    m.guard("init");
    assert.equal(json(m.read("guard.json")).managed?.[".github/workflows/guard.yml"], undefined, "init recorded a file it did not write");
    m.remove(".github/workflows/guard.yml");

    m.install(candidate.spec);
    const up = m.guard("upgrade");
    assert.equal(up.status, 0, up.output);
    assert.ok(m.exists(".github/workflows/guard.yml"), "upgrade did not install a managed asset the consumer does not have");
    assert.ok(json(m.read("guard.json")).managed?.[".github/workflows/guard.yml"], "upgrade did not record the asset it installed");
  });

  it("guard/T39 (H2) [guard/F14]: guard.json records the writing version and upgrade names the versions it moves between", async (t) => {
    const h = await a12();
    const candidate = h.candidate();
    announce(t, candidate);
    const m = h.minimalRepo();
    m.install(PUBLISHED);
    m.guard("init");
    m.install(candidate.spec);
    const up = m.guard("upgrade");
    assert.equal(up.status, 0, up.output);
    const version = m.installedVersion();
    assert.match(m.read("guard.json"), new RegExp(`"${version.replaceAll(".", "\\.")}"`), "guard.json does not record the version that wrote its managed assets");
    assert.match(up.output, /0\.0\.1/, "upgrade does not name the version it moved from");
    assert.ok(up.output.includes(version), "upgrade does not name the version it moved to");
  });

  it("guard/T40 (H3) [guard/F15]: the candidate reads a guard.json written by 0.0.1 with the same meaning, or refuses it with a next step", async (t) => {
    const h = await a12();
    const candidate = h.candidate();
    announce(t, candidate);
    const m = h.minimalRepo();
    m.install(PUBLISHED);
    m.guard("init");
    const before = m.guard("run", "--check", "unit");
    const written = m.read("guard.json");

    m.install(candidate.spec);
    const after = m.guard("run", "--check", "unit");
    if (after.status === 2) {
      assert.match(after.output, /cannot judge/, after.output);
      assert.match(after.output, /^\s+do: /m, "a refusal does not say what to do next");
      return;
    }
    assert.equal(after.status, before.status, after.output);
    assert.equal(after.output.match(/^\w[\w ]*: unit: .*$/m)?.[0], before.output.match(/^\w[\w ]*: unit: .*$/m)?.[0], "the same guard.json gives another verdict");
    assert.equal(m.read("guard.json"), written, "reading guard.json changed it");
  });

  it("guard/T41 [guard/I5, guard/F16]: rollback to 0.0.1 and forward again restore each version's unmodified assets and keep the consumer's", async (t) => {
    const h = await a12();
    const candidate = h.candidate();
    announce(t, candidate);
    const m = h.minimalRepo();
    m.install(PUBLISHED);
    m.guard("init");
    m.write("README.md", "the consumer's own file\n");
    const old = m.read(".github/workflows/guard.yml");

    m.install(candidate.spec);
    m.guard("upgrade");
    const next = m.read(".github/workflows/guard.yml");

    m.install(PUBLISHED);
    assert.equal(m.guard("upgrade").status, 0);
    assert.equal(m.read(".github/workflows/guard.yml"), old, "rollback did not restore 0.0.1's workflow");
    m.install(candidate.spec);
    assert.equal(m.guard("upgrade").status, 0);
    assert.equal(m.read(".github/workflows/guard.yml"), next, "moving forward again did not restore the candidate's workflow");
    assert.equal(m.read("README.md"), "the consumer's own file\n", "a consumer-owned file changed");
  });

  it("guard/T42 [guard/I2, guard/I5, guard/A12]: a real push in the KAAL clone runs KAAL's hook through the installed published Guard, with run --local's verdict", async () => {
    const h = await a12();
    const k = h.kaalClone();
    k.install(PUBLISHED);
    k.git("add", "-A");
    k.git("commit", "-q", "-m", "consume the published Guard");
    const push = k.push();
    const line = (o) => o.match(/^\w[\w ]*: push: .*$/m)?.[0];
    assert.ok(line(push.output), `the hook printed no verdict for push:\n${push.output}`);
    const direct = k.guard("run", "--local", ...push.facts);
    assert.equal(line(push.output), line(direct.output), "the hook's verdict differs from run --local with the same facts");
  });

  it("guard/T43 (H4) [guard/I5, guard/F17]: init on KAAL adds nothing that duplicates KAAL's existing integration", async (t) => {
    const h = await a12();
    const candidate = h.candidate();
    announce(t, candidate);
    const k = h.kaalClone();
    k.install(candidate.spec);
    const before = k.jobNames();
    const init = k.guard("init");
    assert.equal(init.status, 0, init.output);
    const added = k.jobNames().filter((n) => !before.includes(n));
    const repeated = k.jobNames().length - new Set(k.jobNames()).size;
    assert.ok(!k.exists(".github/workflows/guard.yml"), `init installed a workflow for checks KAAL's workflows already declare (jobs: ${added.join(", ")})`);
    assert.equal(repeated, before.length - new Set(before).size, "init added a job named like an existing one");
    assert.match(init.output, /not managed/i, "init does not report KAAL's integration as executed but not managed");
  });

  it("guard/T44 (H5) [guard/I1, guard/F18]: init then remove leaves KAAL's guard.json byte for byte as KAAL wrote it", async (t) => {
    const h = await a12();
    const candidate = h.candidate();
    announce(t, candidate);
    const k = h.kaalClone();
    k.install(candidate.spec);
    const written = k.read("guard.json");
    k.guard("init");
    k.guard("remove");
    assert.equal(k.read("guard.json"), written, "Guard changed bytes of guard.json it does not own");
  });
});
