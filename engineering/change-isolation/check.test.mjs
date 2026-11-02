// Acceptance for the Change Isolation checker: path sets in, rule results out.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { check, checkRootOwnership, checkRootChange, readLedger, CannotJudge, LEDGER } from "./check.mjs";

const REPO = join(import.meta.dirname, '../..');
const encode = (x) => Buffer.from(JSON.stringify(x, null, 2) + '\n');
const roots = ['package.json', 'package-lock.json'];
const changed = ['packages/a/package.json', 'package-lock.json'];

// Fixtures use actual offline npm, with no registry dependency and no lifecycle scripts.
async function npmLock(manifests, seed) {
  const { execute } = await import('kaal-hosting');
  const dir = mkdtempSync(join(tmpdir(), 'c16-fixture-'));
  try {
    for (const [path, bytes] of Object.entries(manifests)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), bytes);
    }
    if (seed) writeFileSync(join(dir, 'package-lock.json'), seed);
    const r = await execute('npm', ['install', '--package-lock-only', '--ignore-scripts',
      '--offline', '--no-audit', '--no-fund', '--lockfile-version=3'], { cwd: dir });
    assert.equal(r.status, 0, r.stderr);
    return readFileSync(join(dir, 'package-lock.json'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
let fixturePromise;
function fixtures() {
  return fixturePromise ??= (async () => {
    const base = {
      'package.json': encode({ name: 'c16-fixture', version: '1.0.0', private: true,
        dependencies: { isexe: '2.0.0' }, workspaces: ['packages/a', 'packages/b'] }),
      'packages/a/package.json': encode({ name: 'a', version: '1.0.0' }),
      'packages/b/package.json': encode({ name: 'b', version: '1.0.0' }),
    };
    const manifests = { ...base, 'packages/a/package.json': encode({
      name: 'a', version: '1.0.0', dependencies: { b: '1.0.0' },
      scripts: { install: 'node -e "require(\'fs\').writeFileSync(\'RAN\',\'bad\')"' },
    }) };
    // A leaf registry entry already admitted by this repository. npm need not
    // fetch a packument/tarball to preserve the existing resolution offline.
    const entry = JSON.parse(readFileSync(join(REPO, 'package-lock.json'))).packages['node_modules/isexe'];
    assert.equal(entry.version, '2.0.0');
    const seed = encode({ name: 'c16-fixture', version: '1.0.0', lockfileVersion: 3, requires: true,
      packages: { '': JSON.parse(base['package.json']), 'node_modules/isexe': entry } });
    const targetLockfile = await npmLock(base, seed);
    const lockfile = await npmLock(manifests, targetLockfile);
    return { paths: changed, scope: ['a'], targetRootManifest: base['package.json'],
      targetLockfile, manifests, lockfile };
  })();
}
async function governed(input) {
  const parent = mkdtempSync(join(tmpdir(), 'c16-proof-'));
  try {
    const result = await checkRootChange(input, { scratch: join(parent, 'proof') });
    assert.equal(existsSync(join(parent, 'proof', 'first', 'packages/a/RAN')), false);
    assert.equal(existsSync(join(parent, 'proof', 'second', 'packages/a/RAN')), false);
    return result;
  } finally { rmSync(parent, { recursive: true, force: true }); }
}
let admittedPromise;
function admitted() {
  return admittedPromise ??= (async () => {
    const { execute } = await import('kaal-hosting');
    const built = await execute('npm', ['run', 'build', '-w', 'kaal-core'], { cwd: REPO });
    assert.equal(built.status, 0, built.stderr);
    const { evaluate, payload, foundation } = await import('kaal-core');
    const bytes = readFileSync(join(REPO, 'engineering/capability/Engineering.md'));
    const engine = evaluate({ ...payload(), 'engineering/capability/Engineering.md': bytes });
    const owner = engine.nodes.find(n => n.name === 'Engineering');
    assert.ok(owner, 'Engineering must be admitted by Core');
    assert.deepEqual(owner.type, foundation().capability);
    return { kind: 'capability', name: owner.name, id: owner.id };
  })();
}
async function ownership(extra = []) {
  const { inventory } = await import('kaal-testing/inventory');
  const owner = await admitted();
  const claim = readFileSync(join(REPO, 'ownership.kaal.json'));
  const files = roots.map(path => ({ path, bytes: readFileSync(join(REPO, path)) }));
  files.push({ path: 'README.md', bytes: Buffer.from('not root-owned') });
  return { inventory: inventory(files), owners: [owner, ...extra.map(x => x.owner)],
    claimFiles: [{ path: 'ownership.kaal.json', bytes: claim },
      ...extra.map(x => ({ path: x.path, bytes: encode({ owner: x.owner, paths: x.paths }) }))] };
}

describe('Engineering root governance (C16)', () => {
  it('engineering/T77 [engineering/F37]: admitted owner and exactly two root files; broad/extra paths fail', async () => {
    const input = await ownership();
    assert.equal((await checkRootOwnership(input)).verdict, 'passed');
    const good = JSON.parse(input.claimFiles[0].bytes);
    for (const paths of [['package.json', 'package-lock.json', 'README.md'], ['engineering/'], ['package.json']]) {
      const bad = { ...input, claimFiles: [{ path: 'ownership.kaal.json', bytes: encode({ ...good, paths }) }] };
      assert.equal((await checkRootOwnership(bad)).verdict, 'failed');
    }
    assert.equal((await checkRootOwnership({ ...input, owners: [] })).verdict, 'unresolved');
    const stale = { ...good, owner: { ...good.owner, id: '0'.repeat(64) } };
    assert.equal((await checkRootOwnership({ ...input, claimFiles: [{ path: 'ownership.kaal.json', bytes: encode(stale) }] })).verdict, 'failed');
  });

  it('engineering/T78 [engineering/F37]: both root files attributed, no third file; a competing claim fails', async () => {
    const { attribute } = await import('kaal-testing/attribution');
    const input = await ownership();
    const attributed = attribute(input.inventory, input.claimFiles, input.owners);
    assert.deepEqual(attributed.owners[0].entries.map(x => x.path).sort(), [...roots].sort());
    assert.deepEqual(attributed.conflicts.entries, []);
    assert.deepEqual(attributed.unassigned.entries.map(x => x.path), ['README.md']);
    const conflict = await ownership([{ path: 'other/ownership.kaal.json',
      owner: { kind: 'capability', name: 'Other', id: '1'.repeat(64) }, paths: ['package-lock.json'] }]);
    // Testing refuses a nested claim reaching the root rather than resolving by precedence.
    assert.match(attribute(conflict.inventory, conflict.claimFiles, conflict.owners).findings[0].evidence, /outside its scope/);
    assert.equal((await checkRootOwnership(conflict)).verdict, 'failed');
  });

  it('engineering/T79 [engineering/F38]: capability dependency and independently derived lock pass without Engineering', async () => {
    const input = await fixtures();
    const result = await governed(input);
    assert.equal(result.verdict, 'passed', JSON.stringify(result));
    assert.match(result.derivation.npm, /^\d+\.\d+\.\d+/);
    assert.equal(result.derivation.candidate, result.derivation.derived);
    assert.match(result.derivation.base, /^[0-9a-f]{64}$/);
    assert.equal((await governed({ ...input, scope: [] })).verdict, 'unresolved');
  });

  it('engineering/T80 [engineering/F39]: changed root manifest needs Engineering even if omitted from path claims', async () => {
    const input = await fixtures();
    const manifests = { ...input.manifests, 'package.json': encode({
      ...JSON.parse(input.manifests['package.json']), description: 'root governance changed' }) };
    const lockfile = await npmLock(manifests, input.targetLockfile);
    for (const paths of [input.paths, [...input.paths, 'package.json']]) {
      const bad = await governed({ ...input, paths, manifests, lockfile });
      assert.equal(bad.verdict, 'failed', JSON.stringify(bad));
      assert.match(bad.errors.join(' '), /package.json/);
    }
    assert.equal((await governed({ ...input, paths: [...input.paths, 'package.json'],
      scope: ['a', 'engineering'], manifests, lockfile })).verdict, 'passed');
  });

  it('engineering/T81 [engineering/F40]: stale and hand-edited locks fail even with Engineering selected', async () => {
    const input = await fixtures();
    const altered = JSON.parse(input.lockfile);
    altered.packages['node_modules/isexe'].integrity = 'sha512-ZmFrZQ==';
    const tampered = encode(altered);
    // Demonstrate why candidate-seeded idempotence is insufficient.
    assert.deepEqual(await npmLock(input.manifests, tampered), tampered);
    for (const lockfile of [input.targetLockfile, tampered]) {
      const result = await governed({ ...input, lockfile, scope: ['a', 'engineering'] });
      assert.equal(result.verdict, 'failed', JSON.stringify(result));
      assert.match(result.errors.join(' '), /package-lock.json/);
    }
  });

  it('unavailable offline derivation and invalid inputs stay unresolved', async () => {
    const input = await fixtures();
    assert.equal((await checkRootChange(input)).verdict, 'unresolved');
    assert.equal((await governed({ ...input, targetLockfile: undefined })).verdict, 'unresolved');
    assert.equal((await governed({ ...input, manifests: { ...input.manifests, '.npmrc': Buffer.from('bad') } })).verdict, 'unresolved');
    const manifests = { ...input.manifests, 'packages/a/package.json': encode({
      name: 'a', version: '1.0.0', dependencies: { 'kaal-c16-never-cached-fixture': '1.0.0' } }) };
    assert.equal((await governed({ ...input, manifests })).verdict, 'unresolved');
  });

  it('derivation pins byte snapshots before any asynchronous operation', async () => {
    const original = await fixtures();
    const input = { ...original, scope: [...original.scope],
      lockfile: Buffer.from(original.lockfile), targetLockfile: Buffer.from(original.targetLockfile),
      manifests: Object.fromEntries(Object.entries(original.manifests).map(([p, b]) => [p, Buffer.from(b)])) };
    const pending = governed(input);
    input.scope.length = 0;
    input.lockfile.fill(0);
    input.targetLockfile.fill(0);
    input.manifests['package.json'].fill(0);
    assert.equal((await pending).verdict, 'passed');
  });
});

const CLI = join(dirname(fileURLToPath(import.meta.url)), "check.mjs");

const passes = (paths) => assert.deepEqual(check(paths), []);
const fails = (paths, ...offending) =>
  assert.deepEqual(check(paths).map((v) => v.split(": ")[1].split(" ")[0]), offending);

describe("core travels alone", () => {
  it("passes a Core-only change with its tests, metadata, lockfile, acceptance and Engine sync", () => {
    passes(["packages/kaal-core/src/engine.ts", "packages/kaal-core/test/core.test.ts"]);
    passes([
      "packages/kaal-core/payload/core/Node.md",
      "packages/kaal-core/package.json",
      "package.json",
      "package-lock.json",
      "engineering/acceptance/embed.test.mjs",
      ".kaal/AGENTS.md",
      ".kaal/KAAL-KERNEL.md",
      ".kaal/core/Node.md",
    ]);
  });

  it("treats the deployed Engine foundation as Core", () => {
    fails([".kaal/core/Node.md", "packages/kaal-sealing/payload/Sealing.md"], "packages/kaal-sealing/payload/Sealing.md");
  });

  it("fails Core mixed with an unrelated Skill", () => {
    fails(
      ["packages/kaal-core/src/register.ts", "packages/kaal-sealing/src/seal.ts", "engineering/acceptance/sealing.test.mjs"],
      "packages/kaal-sealing/src/seal.ts",
      "engineering/acceptance/sealing.test.mjs",
    );
  });

  it("fails Core mixed with registered Skills in the Engine, repository docs or other engineering", () => {
    fails(
      ["packages/kaal-core/src/cli.ts", ".kaal/skills/kaal-sealing/Sealing.md", "README.md", "AGENTS.md", "engineering/change-isolation/check.mjs"],
      ".kaal/skills/kaal-sealing/Sealing.md",
      "README.md",
      "AGENTS.md",
      "engineering/change-isolation/check.mjs",
    );
  });

  it("fails a rename out of Core when given both sides", () => {
    fails(["packages/kaal-core/src/cli.ts", "packages/kaal-other/src/cli.ts"], "packages/kaal-other/src/cli.ts");
  });

  it("does not let a look-alike path pass as Core", () => {
    fails(["packages/kaal-core/src/node.ts", "packages/kaal-core-extra/index.ts"], "packages/kaal-core-extra/index.ts");
  });
});

describe(".github travels alone", () => {
  it("passes a .github-only change", () => {
    passes([".github/workflows/change-isolation.yml"]);
    passes([".github/workflows/a.yml", ".github/CODEOWNERS"]);
  });

  it("fails .github mixed with any outside file", () => {
    fails([".github/workflows/change-isolation.yml", "README.md"], "README.md");
    fails([".github/workflows/change-isolation.yml", "engineering/change-isolation/check.mjs"], "engineering/change-isolation/check.mjs");
    fails([".github/x.yml", ".githubx/y"], ".githubx/y");
  });

  it("fails .github mixed with Core under both rules", () => {
    fails(
      [".github/workflows/ci.yml", "packages/kaal-core/src/cli.ts"],
      ".github/workflows/ci.yml", // core travels alone
      "packages/kaal-core/src/cli.ts", // .github travels alone
    );
  });
});

describe("ordinary changes", () => {
  it("are unaffected", () => {
    passes([]);
    passes(["README.md"]);
    passes(["package.json", "package-lock.json", "engineering/acceptance/embed.test.mjs"]);
    passes([".kaal/skills/kaal-sealing/Sealing.md", "engineering/change-isolation/check.mjs"]);
  });

  it("include this repository's open Skill PRs as they stand", () => {
    // kaal-engineer-skill, as proposed into kaal/skills.
    passes([
      ".gitattributes",
      "README.md",
      "engineering/acceptance/engineer-skill.test.mjs",
      "package-lock.json",
      "package.json",
      "packages/kaal-engineer-skill/package.json",
      "packages/kaal-engineer-skill/payload/Engineer-Skill.md",
      "packages/kaal-engineer-skill/skills/kaal-engineer-skill/SKILL.md",
    ]);
  });
});

describe("aggregate changes", () => {
  it("do not bypass isolation: Core bundled with unrelated files does not conform", () => {
    assert.notDeepEqual(check([".gitattributes", "AGENTS.md", "README.md", "packages/kaal-core/src/cli.ts"]), []);
  });
});

describe("the CLI", () => {
  const run = (args, input) => spawnSync(process.execPath, [CLI, ...args], { input, encoding: "utf8" });

  it("reads paths from stdin and exits 0 or 1", () => {
    const ok = run([], "packages/kaal-core/src/cli.ts\npackage-lock.json\n");
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /^ok: 2 changed paths conform/);
    const bad = run([], ".github/workflows/x.yml\nREADME.md\n");
    assert.equal(bad.status, 1);
    assert.equal(bad.stderr, ".github travels alone: README.md is outside .github/\n");
  });

  it("reads NUL-separated paths, keeping names that hold spaces or newlines", () => {
    const ok = run([], "packages/kaal-core/a b.ts\0packages/kaal-core/odd\nname.ts\0");
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /^ok: 2 changed paths conform/);
    const bad = run([], "packages/kaal-core/src/cli.ts\0packages/kaal-sealing/new\nline.ts\0");
    assert.equal(bad.status, 1);
  });

  it("refuses unknown arguments and paths that are not repository-relative", () => {
    assert.equal(run(["extra"], "").status, 2);
    for (const p of ["./packages/kaal-core/x", "/packages/kaal-core/x", "a//b", "a/../packages/kaal-core/x"]) {
      assert.equal(run([], `README.md\n${p}\n`).status, 2, p);
    }
  });
});

// Transition ledger: a target-held, exact admission for one multi-owner change. The ledger commits to
// the path set and to every path's blob before and after, so these cases use fake blob ids for the rule
// and a real temporary Git repository for the CLI that reads them.
describe("transition ledger", () => {
  const blob = (n) => String(n).repeat(40).slice(0, 40);
  const PATHS = [
    "packages/kaal-foundation/package.json",
    "packages/kaal-core/package.json",
    "packages/skills/kaal-change/package.json",
    "package-lock.json",
  ];
  const entry = (over = {}) => ({
    id: "t1",
    paths: PATHS,
    pre: Object.fromEntries(PATHS.map((p) => [p, blob(1)])),
    post: Object.fromEntries(PATHS.map((p) => [p, blob(2)])),
    ...over,
  });
  const facts = (base = blob(1), head = blob(2), overrides = {}) => (p) => ({ base, head, ...(overrides[p] ?? {}) });
  const ledgerOf = (...e) => readLedger(JSON.stringify({ version: 1, transitions: e }));

  it("is inert: no ledger and an empty ledger judge every existing case identically", () => {
    const cases = [
      PATHS,
      ["packages/kaal-core/src/cli.ts", "package-lock.json"],
      [".github/workflows/x.yml", "README.md"],
      ["README.md"],
    ];
    for (const paths of cases) {
      assert.deepEqual(check(paths, { ledger: readLedger('{"version":1,"transitions":[]}') }), check(paths));
    }
  });

  it("refuses the multi-owner change without a matching entry", () => {
    assert.ok(check(PATHS).some((v) => v.startsWith("core travels alone: packages/kaal-foundation/package.json")));
  });

  it("admits exactly the committed change: path set, pre and post blobs all equal", () => {
    assert.deepEqual(check(PATHS, { ledger: ledgerOf(entry()), facts: facts() }), []);
  });

  it("refuses a path the ledger does not name, and a missing path", () => {
    const extra = check([...PATHS, "README.md"], { ledger: ledgerOf(entry()), facts: facts() });
    assert.ok(extra.some((v) => v.startsWith("core travels alone: README.md")));
    const missing = check(PATHS.slice(1), { ledger: ledgerOf(entry()), facts: facts() });
    assert.ok(missing.some((v) => v.startsWith("core travels alone: ")));
  });

  it("refuses a changed byte in any path (forged lock, altered pin, changed Core)", () => {
    for (const p of PATHS) {
      const v = check(PATHS, { ledger: ledgerOf(entry()), facts: facts(blob(1), blob(2), { [p]: { head: blob(3) } }) });
      assert.ok(v.some((x) => x.includes(`${p} in the change is ${blob(3)}`)), p);
    }
  });

  it("refuses a stale or already adopted target and replay", () => {
    const stale = check(PATHS, { ledger: ledgerOf(entry()), facts: facts(blob(4), blob(2)) });
    assert.ok(stale.some((v) => v.includes("stale or already adopted")));
    const adopted = check(PATHS, { ledger: ledgerOf(entry()), facts: facts(blob(2), blob(2)) });
    assert.ok(adopted.some((v) => v.includes("stale or already adopted")));
  });

  it("does not let an entry lift the .github rule", () => {
    const withGithub = check([...PATHS, ".github/workflows/x.yml"], { ledger: ledgerOf(entry()), facts: facts() });
    assert.ok(withGithub.some((v) => v.startsWith(".github travels alone")));
  });

  it("cannot judge a matching change when no Git facts are supplied", () => {
    assert.throws(() => check(PATHS, { ledger: ledgerOf(entry()) }), CannotJudge);
  });

  it("cannot judge a malformed ledger", () => {
    const bad = (e) => assert.throws(() => ledgerOf(e), CannotJudge);
    assert.throws(() => readLedger("{"), CannotJudge);
    assert.throws(() => readLedger('{"version":2,"transitions":[]}'), CannotJudge);
    bad(entry({ id: "" }));
    bad(entry({ paths: [] }));
    bad(entry({ paths: [...PATHS, PATHS[0]] }));
    bad(entry({ paths: [...PATHS, "a/../b"] }));
    bad(entry({ pre: { ...entry().pre, "package-lock.json": "xyz" } }));
    bad(entry({ post: Object.fromEntries(PATHS.slice(1).map((p) => [p, blob(2)])) }));
    assert.throws(() => readLedger(JSON.stringify({ version: 1, transitions: [entry(), entry()] })), CannotJudge);
  });

  it("never admits .github, the ledger or the checker through an entry", () => {
    for (const forbidden of [".github/workflows/ci.yml", LEDGER, "engineering/change-isolation/check.mjs"]) {
      const paths = [...PATHS, forbidden];
      assert.throws(() => ledgerOf(entry({ paths,
        pre: Object.fromEntries(paths.map((p) => [p, blob(1)])), post: Object.fromEntries(paths.map((p) => [p, blob(2)])) })), CannotJudge, forbidden);
    }
  });

  describe("the CLI, against a real repository", () => {
    const git = (cwd, ...args) => {
      const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd, encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      return r.stdout.trim();
    };
    const setup = (tamper) => {
      const dir = mkdtempSync(join(tmpdir(), "transition-"));
      git(dir, "init", "-q", "-b", "main");
      const write = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); };
      for (const p of PATHS) write(p, "before\n");
      git(dir, "add", "-A"); git(dir, "commit", "-qm", "base");
      const base = git(dir, "rev-parse", "HEAD");
      git(dir, "checkout", "-qb", "candidate");
      for (const p of PATHS) write(p, "after\n");
      if (tamper) write(tamper, "tampered\n");
      git(dir, "add", "-A"); git(dir, "commit", "-qm", "candidate");
      const head = git(dir, "rev-parse", "HEAD");
      const blobAt = (rev, p) => git(dir, "rev-parse", `${rev}:${p}`);
      const ledger = join(dir, "..", `ledger-${Date.now()}-${Math.random()}.json`);
      writeFileSync(ledger, JSON.stringify({ version: 1, transitions: [{ id: "t1", paths: PATHS,
        pre: Object.fromEntries(PATHS.map((p) => [p, blobAt(base, p)])),
        post: Object.fromEntries(PATHS.map((p) => [p, blobAt("candidate~0", p)])) }] }));
      return { dir, base, head, ledger };
    };
    const run = (s, paths) => spawnSync(process.execPath, [CLI, "--ledger", s.ledger, "--git", s.base, s.head],
      { cwd: s.dir, input: paths.join("\n") + "\n", encoding: "utf8" });

    it("admits the exact change, refuses the same paths with one altered byte, and refuses replay", () => {
      const good = setup();
      try {
        const ok = run(good, PATHS);
        assert.equal(ok.status, 0, ok.stderr);
        // Replay: the target already holds the post state.
        const replay = spawnSync(process.execPath, [CLI, "--ledger", good.ledger, "--git", good.head, good.head],
          { cwd: good.dir, input: PATHS.join("\n") + "\n", encoding: "utf8" });
        assert.equal(replay.status, 1);
        assert.match(replay.stderr, /stale or already adopted/);
      } finally { rmSync(good.dir, { recursive: true, force: true }); rmSync(good.ledger, { force: true }); }
      const altered = setup();
      try {
        // The ledger commits to the "after" blobs; the candidate then differs in one path.
        writeFileSync(join(altered.dir, PATHS[3]), "other\n");
        git(altered.dir, "commit", "-qam", "alter");
        const head = git(altered.dir, "rev-parse", "HEAD");
        const r = spawnSync(process.execPath, [CLI, "--ledger", altered.ledger, "--git", altered.base, head],
          { cwd: altered.dir, input: PATHS.join("\n") + "\n", encoding: "utf8" });
        assert.equal(r.status, 1);
        assert.match(r.stderr, /package-lock\.json in the change is/);
      } finally { rmSync(altered.dir, { recursive: true, force: true }); rmSync(altered.ledger, { force: true }); }
    });

    it("exits 2 for a malformed ledger and for partial arguments", () => {
      const s = setup();
      try {
        writeFileSync(s.ledger, "{");
        assert.equal(run(s, PATHS).status, 2);
        assert.equal(spawnSync(process.execPath, [CLI, "--ledger", s.ledger], { input: "", encoding: "utf8" }).status, 2);
        assert.equal(spawnSync(process.execPath, [CLI, "--git", s.base, s.head], { input: "", encoding: "utf8" }).status, 2);
      } finally { rmSync(s.dir, { recursive: true, force: true }); rmSync(s.ledger, { force: true }); }
    });
  });
});
