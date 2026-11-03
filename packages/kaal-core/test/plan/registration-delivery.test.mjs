// core/C52 planned outer tests (plan/registration-type-delivery/README.md): Core is installed, then registered, like any
// package. Immutable to DO and CHECK. They add to C50's T115 to T117 the CPO's settled wording, the before and after of an
// explicit registration in a fresh packed consumer, no implicit registration, and no false claim that Core is installed.
// npm runs as its CLI script under this Node (npm_execpath): run through npm.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

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
const kaal = async (host, args) => {
  const r = await execute(process.execPath, [join(installed(host), "dist", "cli.js"), ...args], { cwd: host, env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  return { status: r.status, stdout: r.stdout, out: `${r.stdout}${r.stderr}` };
};
/** A fresh packed consumer: nothing but the packed Core and its two dependencies; `init` is not run. */
async function fresh(label) {
  const host = join(work, label);
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ name: label, version: "1.0.0", private: true }));
  const r = await npm(["install", "--no-package-lock", ...tarballs], host);
  assert.equal(r.status, 0, r.out);
  return host;
}
const initialized = async (label) => {
  const host = await fresh(label);
  const r = await kaal(host, ["init"]);
  assert.equal(r.status, 0, r.out);
  return host;
};
const REGISTRATION = "---\ntype: Core/Registration\nholder: the-consumer\nscope: consumer\nkinds:\n  Item:\n    traces: []\ninstances:\n  - id: I-1\n    kind: { scope: consumer, kind: Item }\n    traces: []\n---\n";
const MESSAGE = /^Core is installed but not registered in this Engine\. Register it with: (kaal register capability core \S+)$/m;

before(async () => {
  work = mkdtempSync(join(tmpdir(), "kaal-core-registration-"));
  tarballs = [];
  for (const d of [CORE, ...DEPENDENCIES]) tarballs.push(await pack(d, work));
});
after(() => rmSync(work, { recursive: true, force: true }));

describe("kaal-core is installed, then registered, like any package (core/C52)", () => {
  it("core/T118 [core/C52 settled wording, before and after]: after init alone verify says exactly `Core is installed but not registered in this Engine.` and gives the explicit registration command; running that command registers Core, the message is gone and the Registration Type is active", async () => {
    const host = await initialized("before-after");
    mkdirSync(join(host, ".kaal", "registrations"), { recursive: true });
    writeFileSync(join(host, ".kaal", "registrations", "consumer.md"), REGISTRATION);
    const before = await kaal(host, ["verify"]);
    const said = MESSAGE.exec(before.stdout);
    assert.ok(said, `the settled message with the explicit command: ${before.out}`);
    assert.match(before.stdout, /unregistered: no Type Definition named Core\/Registration/, "the specific missing-Type finding stays as its own diagnostic");

    const directory = said[1].split(" ")[4];
    assert.ok(existsSync(join(host, directory, "Registration.md")), `the command names the installed package's own capability directory: ${said[1]}`);
    const done = await kaal(host, ["register", "capability", "core", join(host, directory)]);
    assert.equal(done.status, 0, done.out);
    const after = await kaal(host, ["verify"]);
    assert.equal(after.status, 0, after.out);
    assert.doesNotMatch(after.out, /not registered/);
    assert.doesNotMatch(after.stdout, /unregistered/);
    const again = await kaal(host, ["register", "capability", "core", join(host, directory)]);
    assert.equal(again.status, 0, again.out);
    assert.match(again.stdout, /already registered/, "registering the identical contribution again is a no-op");
  });

  it("core/T119 [core/C52 no implicit registration]: init leaves Core unregistered and `.kaal/registrations` empty; the package carries the contribution as content only", async () => {
    const host = await initialized("no-implicit");
    assert.ok(existsSync(join(installed(host), "capability", "Core.md")), "the package carries Core.md");
    assert.ok(existsSync(join(installed(host), "capability", "Registration.md")), "the package carries Registration.md");
    assert.ok(!existsSync(join(host, ".kaal", "capabilities", "core")), "init registered nothing");
    assert.ok(!existsSync(join(host, ".kaal", "registrations")), "no registration is shipped");
    const listed = await kaal(host, ["list"]);
    assert.doesNotMatch(listed.stdout, /^capability\t[^\t]+\tCore$/m, "Core is not among the registered capabilities until registered");
  });

  it("core/T120 [core/C52 no false installed]: where Core's installation is not established, verify does not claim Core is installed", async () => {
    // Never initialized: there is no Engine and no record. Verify fails, and says nothing about an installation.
    const never = await fresh("never-initialized");
    const r = await kaal(never, ["verify"]);
    assert.notEqual(r.status, 0, r.out);
    assert.doesNotMatch(r.out, /Core is installed/);
    // An Engine elsewhere has no record (core/F46): its materialization is not Core's installation.
    const host = await fresh("other-engine");
    const made = await kaal(host, ["--engine", "other", "init"]);
    assert.equal(made.status, 0, made.out);
    const there = await kaal(host, ["--engine", "other", "verify"]);
    assert.doesNotMatch(there.out, /Core is installed/);
  });
});
