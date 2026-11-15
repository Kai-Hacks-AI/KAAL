// hosting/C109 planned outer tests: starting processes without cmd.exe and preparing a fixture once
// (hosting/F75–hosting/F79, hosting/N11; hosting/T206–hosting/T216 and hosting/T226). Immutable to DO and CHECK;
// the DO turns them GREEN. They reach Hosting through its build by path, never through the package
// name. Fixtures are built in a temporary directory, and cost is asserted by what can be counted
// (starts, installs, builds), never by the clock.
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, statSync, symlinkSync, lstatSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative as pathRelative, resolve, win32 } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import * as hosting from "../../../dist/skills/kaal-hosting/scripts/index.js";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const tmp = () => mkdtempSync(join(tmpdir(), "hosting-facility-"));
const NODE = process.execPath;
const fails = (run, code) =>
  assert.throws(run, (e) => {
    assert.equal(e?.code, code, `expected ${code}, got ${e?.code}: ${e?.message}`);
    return true;
  });

describe("hosting/F75 a process start without cmd.exe", () => {
  const win = { platform: "win32", execPath: "C:\\node\\node.exe", env: {} };
  const script = win32.join(win32.dirname(win.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  const npx = win32.join(win32.dirname(win.execPath), "node_modules", "npm", "bin", "npx-cli.js");

  it("hosting/T206: on a host with shims, npm and npx are started as Node running the package manager's own script, arguments exactly as given, and nothing else is rewritten", () => {
    const args = ["install", "a b", "\"quoted\"", "50%", "$HOME; echo altered", "^&"];
    const exists = (p) => p === script || p === npx;
    assert.deepEqual(hosting.startPlan("npm", args, { ...win, exists }), { command: win.execPath, args: [script, ...args], viaShim: false });
    assert.deepEqual(hosting.startPlan("npx", ["x"], { ...win, exists }), { command: win.execPath, args: [npx, "x"], viaShim: false });
    assert.deepEqual(hosting.startPlan("git", ["status"], { ...win, exists }), { command: "git", args: ["status"], viaShim: false });
    assert.deepEqual(hosting.startPlan("npm", args, { platform: "linux", exists: () => false }), { command: "npm", args, viaShim: false });
    const named = "D:\\nodejs\\node_modules\\npm\\bin\\npm-cli.js";
    assert.equal(hosting.startPlan("npm", [], { ...win, env: { npm_execpath: named }, exists: (p) => p === named }).args[0], named, "the script the environment names is preferred");
  });

  it("hosting/T207: when the script cannot be found the start is refused with NO_DIRECT_START naming the places searched, never taken through the shim silently; viaShim accepts the shim and says so", async () => {
    const none = () => false;
    fails(() => hosting.startPlan("npm", ["--version"], { ...win, env: { npm_execpath: "D:\\x\\npm-cli.js" }, exists: none }), "NO_DIRECT_START");
    try {
      hosting.startPlan("npm", [], { ...win, exists: none });
      assert.fail("a start without the script must be refused");
    } catch (e) {
      assert.match(e.message, /npm-cli\.js/, "the refusal names the place it searched");
    }
    assert.deepEqual(hosting.startPlan("npm", ["-v"], { ...win, exists: none, viaShim: true }), { command: "npm", args: ["-v"], viaShim: true });
    assert.doesNotThrow(() => hosting.startPlan("npm", [], { platform: "linux", exists: none }), "a host without the shim has nothing to refuse");
    // On this host, a start that needs no shim does not say viaShim.
    const r = await hosting.execute(NODE, ["-e", "process.stdout.write('x')"], { cwd: tmp() });
    assert.equal("viaShim" in r, false);
  });

  it("hosting/T214: npx is resolved beside the npm script the environment names, as npm is, and not only beside Node", () => {
    const named = "D:\\nodejs\\node_modules\\npm\\bin\\npm-cli.js";
    const sibling = "D:\\nodejs\\node_modules\\npm\\bin\\npx-cli.js";
    const plan = hosting.startPlan("npx", ["x"], { ...win, env: { npm_execpath: named }, exists: (p) => p === sibling });
    assert.deepEqual(plan, { command: win.execPath, args: [sibling, "x"], viaShim: false });
    fails(() => hosting.startPlan("npx", [], { ...win, env: { npm_execpath: named }, exists: () => false }), "NO_DIRECT_START");
  });

  it("hosting/T208: where the host uses shims, execute('npm') runs the package manager and leaves a recording npm.cmd first on PATH unstarted", { skip: process.platform !== "win32" && "applies where the host realizes npm as a shim" }, async () => {
    const bin = tmp();
    const marker = join(bin, "shim-ran");
    writeFileSync(join(bin, "npm.cmd"), `@echo off\r\necho ran> "${marker}"\r\n`);
    const env = { PATH: `${bin};${process.env.PATH}`, Path: `${bin};${process.env.Path ?? process.env.PATH}` };
    const r = await hosting.execute("npm", ["--version"], { cwd: tmp(), env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /\d+\.\d+\.\d+/);
    assert.equal(existsSync(marker), false, "the shim was started");
  });
});

describe("hosting/F76 executeSync", () => {
  const cwd = tmp();
  const run = (script, options = {}) => hosting.executeSync(NODE, ["-e", script], { cwd, ...options });

  it("hosting/T209: executeSync gives what execute gives (status, stdout, stderr, output) and the same error when the command cannot start; stdin is closed by default and input reaches the child; a timeout gives status null; the environment is the child's own as given, and the caller's by default", async () => {
    const script = "process.stdout.write('out');process.stderr.write('err');process.exitCode=3";
    const a = await hosting.execute(NODE, ["-e", script], { cwd });
    const b = run(script);
    assert.deepEqual({ status: b.status, stdout: b.stdout, stderr: b.stderr, output: b.output }, { status: 3, stdout: "out", stderr: "err", output: "outerr" });
    assert.deepEqual({ status: a.status, stdout: a.stdout, stderr: a.stderr, output: a.output }, { status: 3, stdout: "out", stderr: "err", output: "outerr" });
    assert.equal(b.signal, null);

    const missing = join(cwd, "does-not-exist");
    const viaExecute = await hosting.execute(missing, [], { cwd }).then(() => undefined, (e) => e);
    let viaSync;
    try {
      hosting.executeSync(missing, [], { cwd });
    } catch (e) {
      viaSync = e;
    }
    assert.equal(viaExecute?.code, "ENOENT");
    assert.equal(viaSync?.code, "ENOENT");

    assert.equal(run("process.stdin.on('data',d=>process.stdout.write('got:'+d));process.stdin.on('end',()=>process.stdout.write('eof'))").stdout, "eof", "standard input is closed by default");
    assert.equal(run("process.stdin.setEncoding('utf8');let t='';process.stdin.on('data',d=>t+=d);process.stdin.on('end',()=>process.stdout.write(t))", { input: "hello" }).stdout, "hello");

    const slow = run("setTimeout(()=>{},60000)", { timeout: 300 });
    assert.equal(slow.status, null);
    assert.ok(slow.signal, "the signal that ended the child is stated");

    // The environment is the child's own, as given: a variable the caller leaves out stays out, and by default the caller's is passed unchanged.
    process.env.HOSTING_FACILITY_KEPT = "kept";
    try {
      const probe = "process.stdout.write(JSON.stringify([process.env.HOSTING_FACILITY_KEPT ?? null,process.env.HOSTING_FACILITY_SET ?? null]))";
      assert.deepEqual(JSON.parse(run(probe).stdout), ["kept", null]);
      assert.deepEqual(JSON.parse(run(probe, { env: { ...process.env, HOSTING_FACILITY_SET: "set" } }).stdout), ["kept", "set"]);
      const without = { ...process.env };
      delete without.HOSTING_FACILITY_KEPT;
      assert.deepEqual(JSON.parse(run(probe, { env: without }).stdout), [null, null]);
      assert.deepEqual(JSON.parse((await hosting.execute(NODE, ["-e", probe], { cwd, env: without })).stdout), [null, null]);
    } finally {
      delete process.env.HOSTING_FACILITY_KEPT;
    }
  });
});

describe("hosting/F77 isolatedEnvironment", () => {
  it("hosting/T210: HOME, USERPROFILE, XDG_CONFIG_HOME, npm_config_cache and GIT_CONFIG_GLOBAL lie under the directory and GIT_CONFIG_NOSYSTEM is 1, the base is kept, and a git config --global run under it changes nothing outside", () => {
    const dir = tmp();
    const base = { KEPT: "yes", HOME: "/elsewhere" };
    const env = hosting.isolatedEnvironment(dir, base);
    assert.equal(env.KEPT, "yes");
    for (const name of ["HOME", "USERPROFILE", "XDG_CONFIG_HOME", "npm_config_cache", "GIT_CONFIG_GLOBAL"]) {
      assert.ok(resolve(env[name]).startsWith(resolve(dir)), `${name} is outside the directory: ${env[name]}`);
    }
    assert.equal(env.GIT_CONFIG_NOSYSTEM, "1");
    assert.equal(base.HOME, "/elsewhere", "the base is not changed");
    const r = hosting.executeSync("git", ["config", "--global", "user.name", "Isolated"], { cwd: dir, env });
    assert.equal(r.status, 0, r.output);
    assert.equal(readFileSync(env.GIT_CONFIG_GLOBAL, "utf8").includes("Isolated"), true);
  });
});

describe("hosting/F77 isolatedEnvironment, npm's own configuration files", () => {
  it("hosting/T215: npm's user and global configuration files are redirected into the directory whatever the case of the inherited variable names, and an inherited variable of another case cannot reach outside", () => {
    const dir = tmp();
    const base = { ...process.env, npm_config_userconfig: "/home/real/.npmrc", NPM_CONFIG_GLOBALCONFIG: "/etc/npmrc", NPM_CONFIG_CACHE: "/home/real/.npm", Home: "/home/real" };
    const env = hosting.isolatedEnvironment(dir, base);
    const inside = (v) => resolve(v).startsWith(resolve(dir));
    for (const name of ["npm_config_userconfig", "npm_config_globalconfig", "npm_config_cache"]) assert.ok(inside(env[name]), `${name} is outside the directory: ${env[name]}`);
    const reaching = Object.entries(env).filter(([k, v]) => /^(npm_config_(userconfig|globalconfig|cache)|home)$/i.test(k) && v !== undefined && !inside(v));
    assert.deepEqual(reaching, [], "a variable of another case still points outside");
    const r = hosting.executeSync("npm", ["config", "set", "init-author-name=Isolated", "--location=user"], { cwd: dir, env });
    assert.equal(r.status, 0, r.output);
    assert.equal(readFileSync(env.npm_config_userconfig, "utf8").includes("Isolated"), true);
  });
  it("hosting/T216: a relative directory is resolved before the paths are derived, so every path stays valid in a child whose working directory is another", () => {
    const dir = tmp();
    const relative = pathRelative(process.cwd(), dir);
    const env = hosting.isolatedEnvironment(relative, { ...process.env });
    for (const name of ["HOME", "USERPROFILE", "XDG_CONFIG_HOME", "npm_config_cache", "npm_config_userconfig", "npm_config_globalconfig", "GIT_CONFIG_GLOBAL"]) {
      assert.ok(isAbsolute(env[name]), `${name} is not absolute: ${env[name]}`);
      assert.ok(resolve(env[name]).startsWith(resolve(dir)), `${name} is outside the directory: ${env[name]}`);
    }
    const r = hosting.executeSync("git", ["config", "--global", "user.name", "Relative"], { cwd: tmp(), env });
    assert.equal(r.status, 0, r.output);
    assert.equal(readFileSync(env.GIT_CONFIG_GLOBAL, "utf8").includes("Relative"), true);
  });
});

describe("hosting/F78 prepare", () => {
  const canLink = (() => {
    const d = tmp();
    try {
      symlinkSync("target", join(d, "l"), "file");
      return true;
    } catch {
      return false;
    }
  })();

  it("hosting/T211: build runs once for any number of copies; copies are independent of each other and of the prepared directory; modes and links are kept, links never followed; excluded names are left out; copies may be made at once; dispose removes everything; a failing build leaves nothing and throws its own error", async () => {
    let builds = 0;
    const prepared = await hosting.prepare((dir) => {
      builds += 1;
      mkdirSync(join(dir, "sub"));
      writeFileSync(join(dir, "a.txt"), "a");
      writeFileSync(join(dir, "sub", "b.txt"), "b");
      mkdirSync(join(dir, "npm-cache"));
      writeFileSync(join(dir, "npm-cache", "big"), "cache");
      writeFileSync(join(dir, "run.sh"), "#!/bin/sh\n");
      if (process.platform !== "win32") chmodSync(join(dir, "run.sh"), 0o755);
      if (canLink) symlinkSync("a.txt", join(dir, "alias"), "file");
    }, { exclude: ["npm-cache"] });
    assert.equal(builds, 1);
    const copies = await Promise.all([prepared.copy(), prepared.copy(), prepared.copy()]);
    assert.equal(builds, 1, "build ran again for a copy");
    assert.equal(new Set(copies).size, 3);
    for (const c of copies) {
      assert.equal(readFileSync(join(c, "sub", "b.txt"), "utf8"), "b");
      assert.equal(existsSync(join(c, "npm-cache")), false, "an excluded name was copied");
      if (process.platform !== "win32") assert.equal(statSync(join(c, "run.sh")).mode & 0o111, 0o111, "an executable file lost its mode");
      if (canLink) {
        assert.equal(lstatSync(join(c, "alias")).isSymbolicLink(), true, "a link was followed");
        assert.equal(readlinkSync(join(c, "alias")), "a.txt", "a link was rewritten");
      }
    }
    writeFileSync(join(copies[0], "a.txt"), "changed");
    rmSync(join(copies[1], "sub"), { recursive: true });
    assert.equal(readFileSync(join(copies[2], "a.txt"), "utf8"), "a");
    assert.equal(readFileSync(join(prepared.dir, "a.txt"), "utf8"), "a");
    assert.equal(existsSync(join(prepared.dir, "sub", "b.txt")), true);

    await prepared.dispose();
    for (const path of [prepared.dir, ...copies]) assert.equal(existsSync(path), false, `${path} remains after dispose`);
    await assert.rejects(prepared.copy());

    const before = new Set();
    const boom = new Error("build failed");
    await assert.rejects(hosting.prepare((dir) => { before.add(dir); throw boom; }), (e) => e === boom);
    assert.equal(existsSync([...before][0]), false, "a failed build left its directory");
  });
  it("hosting/T226: when build rejects and its directory cannot be removed, build's own error is still the one thrown and the failed removal is reported on it as leftover, SCRATCH_LEFTOVER naming the directory", async (t) => {
    if (process.platform === "win32" || process.getuid?.() === 0) return t.skip("needs a host that enforces read-only directories");
    const boom = new Error("build failed");
    let made;
    await assert.rejects(
      hosting.prepare((dir) => {
        made = dir;
        mkdirSync(join(dir, "locked"));
        writeFileSync(join(dir, "locked", "f"), "f");
        chmodSync(join(dir, "locked"), 0o500);
        throw boom;
      }),
      (e) => {
        assert.equal(e, boom);
        assert.equal(e.leftover?.code, "SCRATCH_LEFTOVER");
        assert.ok(e.leftover.message.includes(made), "the leftover names the directory");
        return true;
      },
    );
    chmodSync(join(made, "locked"), 0o700);
    rmSync(made, { recursive: true, force: true });
  });
});

describe("hosting/F79 and hosting/N11 the facility is Hosting's", () => {
  it("hosting/T212: the main entry exports execute, executeSync, startPlan, isolatedEnvironment and prepare; the package adds no runtime dependency and Hosting imports nothing from Packaging", () => {
    for (const name of ["execute", "executeSync", "startPlan", "isolatedEnvironment", "prepare"]) assert.equal(typeof hosting[name], "function", `${name} is not exported`);
    const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.deepEqual(Object.keys(manifest.dependencies).sort(), ["cross-spawn", "es-module-lexer", "graceful-fs", "proper-lockfile", "typescript"]);
    const source = readFileSync(new URL("../../../05-src/skills/kaal-hosting/scripts/index.ts", import.meta.url), "utf8");
    assert.doesNotMatch(source, /kaal-packaging/);
  });

  it("hosting/T213: Hosting's own installed-package Cases install once and copy per Case (the successors of hosting/T24 to hosting/T31 and hosting/T75): the successor suite of the installed-package Cases has exactly one npm install and builds its consumer through prepare", () => {
    const text = readFileSync(join(PACKAGE, "04-test", "engineering-check", "publisher", "prepared-release.test.mjs"), "utf8");
    const installs = [...text.matchAll(/run\("npm", \["install"/g)].length;
    assert.equal(installs, 1, `the suite runs npm install at ${installs} places`);
    assert.match(text, /\bprepare\(/);
  });
});
