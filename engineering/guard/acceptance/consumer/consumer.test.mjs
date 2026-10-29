// Guard outer acceptance, Engineering part: the consumer upgrade. guard/T36, guard/T40, guard/T42 and
// guard/T43 check guard/I5 for a consumer of a published version, with KAAL as that consumer (guard/A12):
// guard/T36 and guard/T42 consume the published 0.0.2 (guard/C37), guard/T40 reads what 0.0.1 wrote.
// guard/T64 (guard/C24) checks one candidate of 0.0.2's configuration (guard/C23), so it can gate the
// first published 0.0.2; guard/T65–guard/T68 check it between two candidates, so their `registry` evidence
// needs a second published version of the 0.0.2 line:
// guard/T118 (guard/C112) moves an installation of a released version to the target and runs the target's
// verification on the result. guard/T65, guard/T66, guard/T68 and guard/T118 declare their applicability first.
// 0.0.2 breaks 0.0.1 deliberately, so guard/T37–guard/T39, guard/T41 and guard/T44 are retired.
// Each test runs in a disposable clone of KAAL, or in a minimal repository beside it, never in KAAL's
// own tree (N8). It moves from the published 0.0.1 to a candidate: `packed` (the package at this
// commit, simulated) or `registry` (a published version), and says which (N9). No test claims that
// KAAL's real GitHub CI or branch protection enforces a published version.
// These tests need the network to reach the registry, so they sit outside the required Guard jobs'
// glob and run directly:
//   node --test engineering/guard/acceptance/consumer/*.test.mjs
// Planned in PLAN (K2a, guard/C24); DO (K2b, guard/C25) supplies the harness and does not change them.
// guard/C24's tests need the harness to give:
//   - candidates(): { older, newer }, two `packed` candidates of the planned configuration, whose
//     managed assets differ in content and whose versions differ; newer's catalogue holds older's content;
//   - minimalRepo({ declarations: true }): the minimal consumer, its check declared in .kaal/config/guard/.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const KAAL = resolve(HERE, "..", "..", "..", "..");
const HARNESS = resolve(KAAL, "engineering", "guard", "consumer", "harness.mjs");
const PUBLISHED = "@kaihacksai/kaal-guard@0.0.1";
/**
 * The published release guard/T36 and guard/T42 consume (guard/C37). A KAAL clone declares its checks in
 * .kaal/config/guard/ since guard/C25, which 0.0.1 cannot read, so they install the release of that
 * configuration and run its hook surface, run --hook. Until 0.0.2 is published their failures are
 * transitional evidence, never GREEN; guard/C20 proves both with it.
 */
const RELEASE = "@kaihacksai/kaal-guard@0.0.2";

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
const CONFIG = ".kaal/config/guard";
const RECORD = ".kaal/state/guard/installation.json";

/** The two candidates of the planned configuration, or a blocked RED naming what the harness lacks. */
function two(h) {
  assert.equal(typeof h.candidates, "function", "blocked before behavioural assertion: the A12 harness builds no two candidates (candidates())");
  const { older, newer } = h.candidates();
  assert.notEqual(older.version, newer.version, "the two candidates carry the same version");
  return { older, newer };
}

/** Every declaration of a consumer, by path, byte for byte. */
const declarations = (c) => {
  const dir = join(c.dir, CONFIG);
  return existsSync(dir) ? Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => [f, readFileSync(join(dir, f), "utf8")])) : {};
};
const record = (c) => json(c.read(RECORD)).assets;
const changedFiles = (c) => c.git("status", "--porcelain").output.split("\n").filter(Boolean).map((l) => l.slice(3)).sort();
const changedPaths = (c) => c.git("status", "--porcelain", "--untracked-files=all").output.split("\n").filter(Boolean).map((l) => l.slice(3)).sort();

const ROOT = "node_modules/@kaihacksai/kaal-guard";
/** Every file under a directory of a consumer, by path relative to the directory, with its content. */
const tree = (dir) =>
  readdirSync(dir, { recursive: true })
    .filter((f) => statSync(join(dir, f)).isFile())
    .map((f) => f.split("\\").join("/"))
    .sort()
    .map((f) => [f, readFileSync(join(dir, f), "utf8")]);

/**
 * The upgrade paths a release declares under guard/F42 (guard/C113): the release they lead to and the
 * source versions it supports, or null for a release that declares none, as every release before 0.0.5.
 */
function declaredPaths(text) {
  const at = text.indexOf("**guard/F42 ");
  const head = at < 0 ? null : /Supported upgrade paths to `(\d+\.\d+\.\d+)`/.exec(text.slice(at));
  if (!head) return null;
  const lines = text.slice(at + head.index).split("\n");
  const start = lines.findIndex((l) => l.startsWith("|"));
  const end = lines.findIndex((l, i) => i > start && !l.startsWith("|"));
  const sources = lines.slice(start + 2, end < 0 ? undefined : end).map((l) => /^\| `(\d+\.\d+\.\d+)` \|/.exec(l)?.[1]).filter(Boolean);
  return { target: head[1], sources };
}

/**
 * What the two candidates ship, read from their packages installed side by side before any behavioural
 * step (guard/C112): each candidate's Installation Contract, and each managed asset's content as it ships.
 */
function shipped(h, older, newer) {
  const side = (spec) => {
    const r = h.minimalRepo();
    r.install(spec);
    const contract = json(r.read(`${ROOT}/contract.json`));
    const assets = Object.fromEntries(
      contract.assets.map((a) => {
        const at = join(r.dir, ROOT, a.source);
        return [a.target ?? a.path, { ...a, content: JSON.stringify(a.kind === "directory" ? tree(at) : readFileSync(at, "utf8")) }];
      }),
    );
    const requirements = join(r.dir, ROOT, "docs", "requirements.md");
    return { contract, assets, paths: existsSync(requirements) ? declaredPaths(readFileSync(requirements, "utf8")) : null };
  };
  const from = side(older.spec);
  const to = side(newer.spec);
  return {
    from,
    to,
    /** Whether the asset at target ships with different content in the two candidates. */
    differs: (target) => from.assets[target]?.content !== to.assets[target]?.content,
    /** The assets the newer candidate adds to a surface. */
    added: (surface) => Object.values(to.assets).filter((a) => a.surface === surface && !from.assets[a.target ?? a.path]),
  };
}

/**
 * Declared applicability (guard/C112): a case whose condition the candidates do not meet is reported not
 * applicable with the reason and ends before any behavioural step. That is neither GREEN nor RED, and the
 * assertions it did not execute are not counted as passed.
 */
function applies(t, condition, reason) {
  if (!condition) t.skip(`not applicable: ${reason}`);
  return condition;
}

describe("guard/I5 a consumer moves between published versions safely", () => {
  it("guard/T36 [guard/I5, guard/F11, guard/N8, guard/N9, guard/A12]: a KAAL clone installs the published 0.0.2 from the registry and runs KAAL's checks through it", async (t) => {
    const h = await a12();
    const k = h.kaalClone();
    k.install(RELEASE);
    assert.equal(k.lockIntegrity(), h.registryIntegrity(RELEASE), "the lockfile does not hold the registry's integrity for 0.0.2");
    assert.equal(json(readFileSync(join(KAAL, "package.json"), "utf8")).devDependencies["@kaihacksai/kaal-guard"], "file:packages/kaal-guard", "N8: KAAL's own development dependency changed");
    const verify = k.guard("verify");
    assert.equal(verify.status, 0, verify.output);
    const facts = ["--head", "HEAD", "--base", "HEAD", "--base-ref", "main"];
    const published = k.guard("run", "--hook", ...facts);
    const development = k.development("run", "--hook", ...facts);
    assert.equal(published.status, development.status, `the published Guard's verdict differs from the development Guard's:\n${published.output}\n${development.output}`);
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

  it("guard/T42 [guard/I2, guard/I5, guard/A12]: a real push in the KAAL clone runs KAAL's hook through the installed published Guard, with run --hook's verdict", async () => {
    const h = await a12();
    const k = h.kaalClone();
    k.install(RELEASE);
    k.git("add", "-A");
    k.git("commit", "-q", "-m", "consume the published Guard");
    const push = k.push();
    const line = (o) => o.match(/^\w[\w ]*: push: .*$/m)?.[0];
    assert.ok(line(push.output), `the hook printed no verdict for push:\n${push.output}`);
    const direct = k.guard("run", "--hook", ...push.facts);
    assert.equal(line(push.output), line(direct.output), "the hook's verdict differs from run --hook with the same facts");
  });

  it("guard/T43 (H4) [guard/I5, guard/F17, guard/D3]: init on KAAL adds nothing that duplicates KAAL's existing integration", async (t) => {
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


  it("guard/T64 [guard/I1, guard/F18, guard/F29]: init then remove leaves every declaration byte for byte, and Guard writes only catalogued assets, its record and its checkout state", async (t) => {
    const h = await a12();
    const candidate = h.candidate();
    announce(t, candidate);
    for (const c of [h.kaalClone(), h.minimalRepo({ declarations: true })]) {
      c.install(candidate.spec);
      c.git("add", "-A");
      c.git("commit", "-q", "-m", "candidate");
      const before = declarations(c);
      assert.ok(Object.keys(before).length > 0, `${c.dir} declares no check in ${CONFIG}`);
      const init = c.guard("init");
      assert.equal(init.status, 0, init.output);
      const written = c.git("status", "--porcelain", "--untracked-files=all").output.split("\n").filter(Boolean).map((l) => l.slice(3));
      const assets = c.exists(RECORD) ? record(c) : {};
      const catalogue = json(c.read(`node_modules/@kaihacksai/kaal-guard/contract.json`)).catalogue;
      for (const path of written) {
        if (path === RECORD) continue;
        assert.ok(assets[path], `init wrote ${path}, which it did not register`);
        assert.ok((catalogue[path] ?? []).includes(assets[path].sha256), `init wrote ${path} with content the package does not catalogue`);
      }
      assert.deepEqual(declarations(c), before, "init changed a declaration");
      const rm = c.guard("remove");
      assert.equal(rm.status, 0, rm.output);
      assert.deepEqual(declarations(c), before, "init then remove changed a declaration");
    }
  });

  it("guard/T65 [guard/I5, guard/F11, guard/F12]: between two candidates, a dependency and lockfile change, then upgrade, moves unmodified assets and keeps everything the consumer owns", async (t) => {
    const h = await a12();
    const { older, newer } = two(h);
    announce(t, newer);
    const workflow = ".github/workflows/guard.yml";
    if (!applies(t, shipped(h, older, newer).differs(workflow), `${older.version} and ${newer.version} ship the same workflow, so nothing can be seen to move`)) return;
    const reference = { older: h.minimalRepo({ declarations: true }), newer: h.minimalRepo({ declarations: true }) };
    reference.older.install(older.spec);
    reference.older.guard("init", "--hook", "--ci");
    reference.newer.install(newer.spec);
    reference.newer.guard("init", "--hook", "--ci");
    assert.notEqual(reference.newer.read(workflow), reference.older.read(workflow), "the candidates' workflows do not differ, so nothing can be seen to move");

    const m = h.minimalRepo({ declarations: true });
    m.install(older.spec);
    assert.equal(m.guard("init", "--hook", "--ci").status, 0);
    m.write(".githooks/pre-push", `${m.read(".githooks/pre-push")}# the consumer's own line\n`);
    m.write("README.md", "the consumer's own file\n");
    m.git("add", "-A");
    m.git("commit", "-q", "-m", "older");
    const hook = m.read(".githooks/pre-push");
    const before = declarations(m);

    m.install(newer.spec);
    assert.deepEqual(changedFiles(m), ["package-lock.json", "package.json"], "guard/F11: a package-code update changed more than the dependency and the lockfile");
    const up = m.guard("upgrade");
    assert.equal(up.status, 0, up.output);
    assert.equal(m.read(".githooks/pre-push"), hook, "upgrade changed a modified managed asset");
    assert.equal(m.read("README.md"), "the consumer's own file\n", "upgrade changed a file Guard did not write");
    assert.deepEqual(declarations(m), before, "upgrade changed a declaration");
    assert.equal(m.read(workflow), reference.newer.read(workflow), "the unmodified workflow did not move to the newer candidate's content");
  });

  it("guard/T66 [guard/F13, guard/F30]: between two candidates, upgrade installs an asset the newer one adds only to a surface the consumer activated", async (t) => {
    const h = await a12();
    const { older, newer } = two(h);
    announce(t, newer);
    if (!applies(t, shipped(h, older, newer).added("hook").length > 0, `${newer.version} adds no asset to the hook surface that ${older.version} lacks`)) return;
    // Core's Installation Contract format names an asset's location `target` (guard/C51); `path` until then.
    const contract = (c) => json(c.read("node_modules/@kaihacksai/kaal-guard/contract.json")).assets.map((a) => ({ ...a, path: a.target ?? a.path }));
    const hooked = h.minimalRepo({ declarations: true });
    hooked.install(older.spec);
    assert.equal(hooked.guard("init", "--hook").status, 0);
    const ciOnly = h.minimalRepo({ declarations: true });
    ciOnly.install(older.spec);
    assert.equal(ciOnly.guard("init", "--ci").status, 0);
    const known = contract(hooked).map((a) => a.path);

    hooked.install(newer.spec);
    ciOnly.install(newer.spec);
    const added = contract(hooked).filter((a) => !known.includes(a.path));
    assert.ok(added.some((a) => a.surface === "hook"), "blocked before behavioural assertion: the newer candidate adds no asset to the hook surface");
    for (const [c, active] of [[hooked, "hook"], [ciOnly, "ci"]]) {
      const up = c.guard("upgrade");
      assert.equal(up.status, 0, up.output);
      for (const asset of added) {
        if (asset.surface === active) {
          assert.ok(c.exists(asset.path), `upgrade did not install ${asset.path}, which the newer candidate adds to the activated ${active} surface`);
          assert.equal(record(c)[asset.path]?.version, newer.version, `upgrade did not register ${asset.path}`);
        } else assert.ok(!c.exists(asset.path), `upgrade installed ${asset.path} on the ${asset.surface} surface, which this consumer did not activate`);
      }
    }
    assert.ok(!ciOnly.exists(".githooks/pre-push"), "upgrade activated the hook");
    assert.ok(!hooked.exists(".github/workflows/guard.yml"), "upgrade activated CI");
  });

  it("guard/T67 [guard/F14]: between two candidates, the record registers each unmodified asset's new version and hash, upgrade names both versions, and a modified asset keeps its registered version", async (t) => {
    const h = await a12();
    const { older, newer } = two(h);
    announce(t, newer);
    const m = h.minimalRepo({ declarations: true });
    m.install(older.spec);
    assert.equal(m.guard("init", "--hook", "--ci").status, 0);
    const registered = record(m)[".githooks/pre-push"];
    assert.equal(registered?.version, older.version);
    m.write(".githooks/pre-push", `${m.read(".githooks/pre-push")}# the consumer's own line\n`);

    m.install(newer.spec);
    const up = m.guard("upgrade");
    assert.equal(up.status, 0, up.output);
    const after = record(m);
    const workflow = after[".github/workflows/guard.yml"];
    assert.equal(workflow?.version, newer.version, "the record does not register the version that moved the workflow");
    assert.equal(workflow?.sha256, createHash("sha256").update(readFileSync(join(m.dir, ".github/workflows/guard.yml"))).digest("hex"));
    assert.deepEqual(after[".githooks/pre-push"], registered, "a modified asset lost its registered version");
    assert.ok(up.output.includes(older.version) && up.output.includes(newer.version), `upgrade does not name the versions it moved between:\n${up.output}`);
    assert.match(up.output, /\.githooks\/pre-push[^\n]*modified|modified[^\n]*\.githooks\/pre-push/, "upgrade does not report the modified asset as modified");
  });

  it("guard/T68 [guard/I5, guard/F16]: between two candidates, back and forward again restore each version's unmodified assets and keep the consumer's", async (t) => {
    const h = await a12();
    const { older, newer } = two(h);
    announce(t, newer);
    const workflow = ".github/workflows/guard.yml";
    if (!applies(t, shipped(h, older, newer).differs(workflow), `${older.version} and ${newer.version} ship the same workflow, so it cannot be seen to move back and forward`)) return;
    const m = h.minimalRepo({ declarations: true });
    m.install(older.spec);
    assert.equal(m.guard("init", "--hook", "--ci").status, 0);
    m.write("README.md", "the consumer's own file\n");
    const old = m.read(workflow);
    const before = declarations(m);

    m.install(newer.spec);
    assert.equal(m.guard("upgrade").status, 0);
    const next = m.read(workflow);
    assert.notEqual(next, old, "the workflow did not move forward");

    m.install(older.spec);
    assert.equal(m.guard("upgrade").status, 0);
    assert.equal(m.read(workflow), old, "moving back did not restore the older candidate's workflow");
    m.install(newer.spec);
    assert.equal(m.guard("upgrade").status, 0);
    assert.equal(m.read(workflow), next, "moving forward again did not restore the newer candidate's workflow");
    assert.equal(m.read("README.md"), "the consumer's own file\n", "a consumer-owned file changed");
    assert.deepEqual(declarations(m), before, "a declaration changed");
  });

  it("guard/T118 [guard/I5, guard/F11, guard/F12, guard/F14, guard/F31]: an installation of the older candidate, integrated and holding a consumer's file and a modified managed asset, moves to the newer one by a dependency change and upgrade, changing only what the two ship differently, and the newer candidate's verification gives verified", async (t) => {
    const h = await a12();
    const { older, newer } = two(h);
    announce(t, newer);
    t.diagnostic(`from: ${older.spec} (${older.source})`);
    // The harness's own variants change a package after its manifest was made, so their verification cannot pass by design.
    if (!applies(t, !/-candidate\.\d+$/.test(newer.version), `${newer.version} is a variant the harness built, not a release whose verification can pass; name the pair with GUARD_CANDIDATES`)) return;
    const pair = shipped(h, older, newer);
    // The target release owns its supported paths (guard/C113): a pair it does not declare is not a path it supports.
    if (pair.to.paths) {
      t.diagnostic(`${newer.version} declares upgrade paths from: ${pair.to.paths.sources.join(", ")}`);
      if (!applies(t, pair.to.paths.sources.includes(older.version), `${newer.version} declares no upgrade path from ${older.version}`)) return;
    }
    const hook = ".githooks/pre-push";
    const managed = Object.values(pair.to.assets).filter((a) => a.surface !== undefined && (a.target ?? a.path) !== hook);

    const m = h.minimalRepo({ declarations: true });
    m.install(older.spec);
    const init = m.guard("init", "--hook", "--ci");
    assert.equal(init.status, 0, init.output);
    m.write(hook, `${m.read(hook)}# the consumer's own line\n`);
    m.write("README.md", "the consumer's own file\n");
    m.git("add", "-A");
    m.git("commit", "-q", "-m", "older");
    const kept = { hook: m.read(hook), readme: m.read("README.md"), declarations: declarations(m) };
    const before = Object.fromEntries(managed.map((a) => [a.target ?? a.path, m.exists(a.target ?? a.path) ? m.read(a.target ?? a.path) : undefined]));

    m.install(newer.spec);
    assert.deepEqual(changedFiles(m), ["package-lock.json", "package.json"], "guard/F11: the dependency change changed more than the dependency and the lockfile");
    const up = m.guard("upgrade");
    assert.equal(up.status, 0, up.output);

    const moved = managed.map((a) => a.target ?? a.path).filter((target) => pair.differs(target));
    t.diagnostic(`shipped differently: ${moved.join(", ") || "none"}`);
    assert.deepEqual(changedPaths(m), ["package-lock.json", "package.json", RECORD, ...moved].sort(), "upgrade changed something other than the record and the assets the two candidates ship differently");
    const reference = h.minimalRepo({ declarations: true });
    reference.install(newer.spec);
    assert.equal(reference.guard("init", "--hook", "--ci").status, 0);
    for (const target of managed.map((a) => a.target ?? a.path).filter((target) => before[target] !== undefined)) {
      if (moved.includes(target)) assert.equal(m.read(target), reference.read(target), `${target} did not move to the newer candidate's content`);
      else assert.equal(m.read(target), before[target], `${target}, which the two candidates ship identically, changed`);
    }
    assert.equal(m.read(hook), kept.hook, "upgrade changed a modified managed asset");
    assert.equal(m.read("README.md"), kept.readme, "upgrade changed a file Guard did not write");
    assert.deepEqual(declarations(m), kept.declarations, "upgrade changed a declaration");

    const registered = record(m);
    for (const target of managed.map((a) => a.target ?? a.path).filter((target) => registered[target])) {
      assert.equal(registered[target].version, newer.version, `the record does not name ${newer.version} for the unmodified ${target}`);
    }
    assert.notEqual(registered[hook]?.version, newer.version, "the record names the newer version for the modified asset");

    const verify = spawnSync("npm", ["explore", "@kaihacksai/kaal-guard", "--", "npm", "test"], { cwd: m.dir, encoding: "utf8", shell: process.platform === "win32" });
    const output = `${verify.stdout}${verify.stderr}`;
    assert.equal(verify.status, 0, `the newer candidate's verification of the migrated installation did not pass:\n${output.slice(-4000)}`);
    assert.match(output, /\bverified\b/, `the newer candidate's verification did not end in verified:\n${output.slice(-4000)}`);
  });
});
