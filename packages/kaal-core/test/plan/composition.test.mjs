// core/C50 planned outer tests: independent discovery and optional composition, in a clean consumer installed
// from the packed Core (plan/consumer-composition/README.md). Immutable to DO and CHECK. Each title names the
// plan's state it checks. Fixture capabilities only: two scopes that know nothing of each other (a
// portfolio-like and a project-like one), and a third scope the consumer owns, whose one instance traces to both.
//
// Core has no command that unregisters a contribution (`kaal remove` removes Core's own installation), so
// "removing" a capability here is the consumer deleting the files it registered; the tests say so and assert
// what Core reports afterwards. npm runs as its CLI script under this Node (npm_execpath): run through npm.
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

const CORE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPOSITORY = join(CORE, "..", "..");
const HOSTING_DIR = [join(REPOSITORY, "packages", "kaal-hosting"), join(REPOSITORY, "packages", "extensions", "kaal-hosting")].find((d) => existsSync(join(d, "package.json")));
const { name: HOSTING } = JSON.parse(readFileSync(join(HOSTING_DIR, "package.json"), "utf8"));
const { execute } = await import(HOSTING);
const DEPENDENCIES = [join(REPOSITORY, "packages", "kaal-foundation"), HOSTING_DIR];
const NAME = JSON.parse(readFileSync(join(CORE, "package.json"), "utf8")).name;

const npm = async (args, cwd) => {
  const cli = process.env.npm_execpath;
  if (!cli || !/\.[cm]?js$/.test(cli)) return { status: null, stdout: "", out: "npm_execpath names no npm CLI script: run these tests through npm" };
  const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false", npm_config_offline: "true", NODE_TEST_CONTEXT: undefined };
  for (const k of Object.keys(env)) if (/^npm_config_(dry_run|json|pack_destination|ignore_scripts|workspaces?)$/i.test(k)) delete env[k];
  const r = await execute(process.execPath, [cli, ...args], { cwd, env });
  return { status: r.status, stdout: r.stdout, out: `${r.stdout}${r.stderr}` };
};
const pack = async (dir, into) => {
  const r = await npm(["pack", "--json", "--ignore-scripts", "--pack-destination", into], dir);
  assert.equal(r.status, 0, r.out);
  return join(into, JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].filename);
};

let work;
let tarballs;
const installed = (host) => join(host, "node_modules", NAME);

/** A clean consumer: nothing but the packed Core and its two dependencies, with an Engine initialized by `kaal init`. */
async function consumer(label) {
  const host = join(work, label);
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ name: label, version: "1.0.0", private: true }));
  const r = await npm(["install", "--no-package-lock", ...tarballs], host);
  assert.equal(r.status, 0, r.out);
  const init = await kaal(host, ["init"]);
  assert.equal(init.status, 0, init.out);
  return host;
}
const kaal = async (host, args) => {
  const r = await execute(process.execPath, [join(installed(host), "dist", "cli.js"), ...args], { cwd: host, env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  return { status: r.status, stdout: r.stdout, out: `${r.stdout}${r.stderr}` };
};

/** Every byte of the installed Core package, as one Foundation SHA-256 over sorted relative paths and contents. */
function digest(dir) {
  const parts = [];
  for (const p of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(join(dir, p)).isFile()) parts.push(Buffer.from(`${p.split("\\").join("/")}\0`), readFileSync(join(dir, p)), Buffer.from("\0"));
  }
  return sha256(Buffer.concat(parts));
}

/** Registers a fixture capability: a KAAL Capability Node, by the type Core resolves in this Engine. */
async function register(host, name, title) {
  const type = (await kaal(host, ["resolve", "KAAL Capability"])).stdout.trim().split("\t")[0];
  assert.ok(type, "Core resolves KAAL Capability in a freshly initialized Engine");
  const dir = join(work, `contribution-${name}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${title}.md`), `---\nname: ${title}\ntype:\n  name: KAAL Capability\n  id: ${type}\n---\n\nA fixture capability. It knows no other capability.\n`);
  const r = await kaal(host, ["register", "capability", name, dir]);
  assert.equal(r.status, 0, r.out);
}
const unregister = (host, name) => rmSync(join(host, ".kaal", "capabilities", name), { recursive: true, force: true });
const listed = async (host) => (await kaal(host, ["list"])).stdout.trim().split(/\r?\n/).filter(Boolean).map((l) => l.split("\t")[2]);

const registration = (holder, scope, kind, instance, traces) =>
  `---\ntype: Core/Registration\nholder: ${holder}\nscope: ${scope}\nkinds:\n  ${kind}:\n    traces: ${traces ? "any" : "[]"}\ninstances:\n  - id: ${instance}\n    kind: { scope: ${scope}, kind: ${kind} }\n    traces: [${traces ?? ""}]\n---\n`;
const A = registration("portfolio-like", "portfolio", "Item", "PF-1");
const B = registration("project-like", "project", "Task", "PJ-1");
const COMPOSITION = registration("the-consumer", "composition", "Link", "L-1", "{ scope: portfolio, id: PF-1 }, { scope: project, id: PJ-1 }");
const put = (host, file, text) => {
  mkdirSync(join(host, ".kaal", "registrations"), { recursive: true });
  writeFileSync(join(host, ".kaal", "registrations", file), text);
};
const drop = (host, file) => rmSync(join(host, ".kaal", "registrations", file), { force: true });
const verify = (host) => kaal(host, ["verify"]);
const lines = (r) => r.stdout.split(/\r?\n/);
/** What one scope's assembly reports: its holder line and any untraced instances, so a peer's presence can be compared. */
const found = (r) => r.out.split(/\r?\n/).filter((l) => l.startsWith("registration:")).join("\n");
const of = (r, scope) => lines(r).filter((l) => l.startsWith(`scope\t${scope}\t`) || l.startsWith(`untraced\t${scope}\t`));

before(async () => {
  work = mkdtempSync(join(tmpdir(), "kaal-core-composition-"));
  tarballs = [];
  for (const d of [CORE, ...DEPENDENCIES]) tarballs.push(await pack(d, work));
});
after(() => rmSync(work, { recursive: true, force: true }));

describe("kaal-core's independent discovery and optional composition (core/C50)", () => {
  it("core/T112 [core/C50 states 1-3, 5]: A alone is discovered and verifies; B added afterwards is discovered beside it; removing B's files leaves A discovered, with Core's installed bytes unchanged throughout", async () => {
    const host = await consumer("states-a-b");
    const before = digest(installed(host));
    await register(host, "portfolio-like", "Portfolio");
    put(host, "portfolio.md", A);
    assert.deepEqual(await listed(host), ["Portfolio"], "state 1: A alone");
    const alone = await verify(host);
    assert.equal(alone.status, 0, alone.out);
    assert.ok(lines(alone).includes("registration\t1 kinds, 1 instances, 0 findings"), alone.out);

    await register(host, "project-like", "Project");
    put(host, "project.md", B);
    assert.deepEqual((await listed(host)).sort(), ["Portfolio", "Project"], "state 2: B discovered beside A");
    const both = await verify(host);
    assert.equal(both.status, 0, both.out);
    assert.ok(lines(both).includes("registration\t2 kinds, 2 instances, 0 findings"), both.out);
    assert.deepEqual(of(both, "portfolio"), of(alone, "portfolio"), "A's own scope result is the same beside B as alone");
    assert.equal(of(both, "project").length > 0, true, "B's scope is reported beside A");

    unregister(host, "project-like");
    drop(host, "project.md");
    assert.deepEqual(await listed(host), ["Portfolio"], "state 3: B's absence is plain, not an error");
    const again = await verify(host);
    assert.equal(again.status, 0, again.out);
    assert.equal(again.stdout, alone.stdout, "A's own result is the same without B as before B was ever registered");
    assert.equal(digest(installed(host)), before, "adding and removing a capability changed nothing in Core");
  });

  it("core/T113 [core/C50 state 4, 6]: B alone, in a clean consumer, is discovered and verifies, and states nothing that needs A", async () => {
    const host = await consumer("state-b-only");
    await register(host, "project-like", "Project");
    put(host, "project.md", B);
    assert.deepEqual(await listed(host), ["Project"]);
    const r = await verify(host);
    assert.equal(r.status, 0, r.out);
    assert.ok(lines(r).includes("registration\t1 kinds, 1 instances, 0 findings"), r.out);
    assert.ok(lines(r).includes("scope\tproject\tproject-like"), r.out);
    await register(host, "portfolio-like", "Portfolio");
    put(host, "portfolio.md", A);
    const beside = await verify(host);
    assert.equal(beside.status, 0, beside.out);
    assert.deepEqual(of(beside, "project"), of(r, "project"), "B's own scope result is the same beside A as alone");
  });

  it("core/T114 [core/C50 composition result]: a consumer-owned scope tracing to A's and B's instances resolves with both present; with B absent the trace to B is a reported unresolved target naming B, never a crash or a silent pass", async () => {
    const host = await consumer("composition");
    await register(host, "portfolio-like", "Portfolio");
    await register(host, "project-like", "Project");
    put(host, "portfolio.md", A);
    put(host, "project.md", B);
    put(host, "composition.md", COMPOSITION);
    const composed = await verify(host);
    assert.equal(composed.status, 0, composed.out);
    assert.ok(lines(composed).includes("registration\t3 kinds, 3 instances, 0 findings"), composed.out);
    for (const scope of ["portfolio", "project", "composition"]) assert.ok(lines(composed).some((l) => l.startsWith(`scope\t${scope}\t`)), `${scope} in ${composed.out}`);

    // Both outgoing traces are live: removing either peer alone is reported, naming that peer's instance and only that one.
    drop(host, "portfolio.md");
    const noA = await verify(host);
    assert.equal(noA.status, 1, noA.out);
    assert.match(found(noA), /PF-1/, "the finding names A's instance when A is absent");
    assert.doesNotMatch(found(noA), /PJ-1/, "B's trace still resolves when only A is absent");
    put(host, "portfolio.md", A);
    assert.ok(!lines(composed).some((l) => l.startsWith("untraced\tcomposition\t")), "the composition instance is traced");

    unregister(host, "project-like");
    drop(host, "project.md");
    const missing = await verify(host);
    assert.notEqual(missing.status, null, "Core ran; it did not crash");
    assert.equal(missing.status, 1, missing.out);
    assert.match(missing.out, /unclaimed scope|unresolved/, "the report says the target does not resolve");
    assert.match(found(missing), /PJ-1/, "the finding names B's instance");
    assert.doesNotMatch(found(missing), /PF-1/, "A's trace still resolves when only B is absent");
    assert.ok(!lines(missing).some((l) => /^registration\t.* 0 findings$/.test(l)), "never a silent pass");

    // A's own standalone result is unaffected by the composition scope's being present or not.
    drop(host, "composition.md");
    const aOnly = await verify(host);
    assert.equal(aOnly.status, 0, aOnly.out);
    assert.ok(lines(aOnly).includes("registration\t1 kinds, 1 instances, 0 findings"), aOnly.out);
  });

  // Findings of this PLAN's RED Cases, recorded RED and raised as their own PLAN (core/C52), never fixed in passing.
  // By design the package contains no registrations and installed != registered: Core, like any package, is registered
  // into the instance's .kaal/ (`kaal register capability`), and its registration-dependent features, such as the
  // Registration Type Definition, are active only then. What a consumer registers itself stays its own.
  it("core/T115 [core/C50 finding]: the packed Core carries its own contribution; registering it into .kaal/ like any package makes the Registration Type active, so a consumer's Registration Node is not reported unregistered", async () => {
    const host = await consumer("type-definition");
    assert.ok(!existsSync(join(host, ".kaal", "registrations")), "by design the package ships no registrations: .kaal/registrations is the consumer's own");
    const contribution = join(installed(host), "capability");
    assert.ok(existsSync(join(contribution, "Registration.md")), "the package carries Core's own contribution (Core.md, Registration.md) so that it can be registered like any package");
    const r = await kaal(host, ["register", "capability", "core", contribution]);
    assert.equal(r.status, 0, r.out);
    put(host, "portfolio.md", A);
    const v = await verify(host);
    assert.equal(v.status, 0, v.out);
    assert.doesNotMatch(v.stdout, /unregistered/, "with Core registered, the Registration Type Definition is in the Engine");
  });

  it("core/T116 [core/C50 finding]: an installed but unregistered Core says so plainly, rather than only that a Type has no Definition", async () => {
    const host = await consumer("installed-not-registered");
    put(host, "portfolio.md", A);
    const v = await verify(host);
    assert.match(v.stdout, /Core is installed but not registered/, "installed != registered: the report names the state and the remedy");
  });

  it("core/T117 [core/C50 finding]: `kaal help` explains the sequence, install the instance with init, then register Core itself like any package", async () => {
    const host = await consumer("help");
    const h = await kaal(host, ["help"]);
    assert.equal(h.status, 0, h.out);
    assert.match(h.out, /kaal init/, "help names the install step");
    assert.match(h.out, /kaal register capability core/, "help names the registration step for Core itself");
    assert.match(h.out, /installed.*not.*registered/is, "help says that installed is not registered");
  });
});
