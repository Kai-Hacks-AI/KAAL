// Throwaway measurement (not to be merged): where the time goes on this host.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WIN = process.platform === "win32";
const out = (k, v) => console.log(`MEASURE ${process.platform} ${k}: ${v}`);
const now = () => Number(process.hrtime.bigint()) / 1e6;
const time = (f) => { const t = now(); const r = f(); return [Math.round(now() - t), r]; };
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: "utf8", ...opts });
const bases = { tmp: tmpdir(), ...(WIN ? { D: "D:\\" } : {}) };
const npmCli = join(process.execPath, "..", "node_modules", "npm", "bin", "npm-cli.js");

out("node", process.version);
out("tmpdir", tmpdir());
out("cwd", process.cwd());

// 1. Process start cost, 40 starts each.
const N = 40;
for (const [name, f] of Object.entries({
  "node -e 0": () => run(process.execPath, ["-e", "0"]),
  "git --version": () => run("git", ["--version"]),
  "git rev-parse HEAD (in repo)": () => run("git", ["rev-parse", "HEAD"]),
  "npm --version via shell/cmd": () => run("npm", ["--version"], { shell: WIN }),
  "npm --version via node npm-cli.js": () => run(process.execPath, [npmCli, "--version"]),
})) {
  if (name.includes("npm-cli") && !existsSync(npmCli)) { out(name, "npm-cli.js not found"); continue; }
  const [ms] = time(() => { for (let i = 0; i < N; i++) f(); });
  out(`spawn ${name}`, `${(ms / N).toFixed(1)} ms each`);
}

// 2. Defender state (Windows).
if (WIN) {
  const ps = (c) => run("powershell", ["-NoProfile", "-Command", c]).stdout.trim().replace(/\s+/g, " ");
  out("defender realtime", ps("(Get-MpComputerStatus).RealTimeProtectionEnabled"));
  out("defender exclusions", ps("(Get-MpPreference).ExclusionPath -join ';'"));
  out("drives", ps("Get-PSDrive -PSProvider FileSystem | ForEach-Object { $_.Name + ' ' + [int]($_.Used/1GB) + 'GB used' }"));
}

// 3. Many small files: create 3000 files of 4 KB, copy the tree, remove it.
for (const [label, base] of Object.entries(bases)) {
  const root = mkdtempSync(join(base, "m-"));
  const src = join(root, "src");
  mkdirSync(src);
  const [createMs] = time(() => { for (let d = 0; d < 30; d++) { mkdirSync(join(src, `d${d}`)); for (let i = 0; i < 100; i++) writeFileSync(join(src, `d${d}`, `f${i}`), "x".repeat(4096)); } });
  const [copyMs] = time(() => cpSync(src, join(root, "dst"), { recursive: true, verbatimSymlinks: true }));
  const [rmMs] = time(() => rmSync(root, { recursive: true, force: true }));
  out(`3000 small files on ${label}`, `create ${createMs} ms, copy ${copyMs} ms, remove ${rmMs} ms`);
}

// 4. npm pack and install of Guard's tarball (with Hosting), cold and warm cache, on each base.
const pkg = join(process.cwd(), "packages", "kaal-guard");
for (const [label, base] of Object.entries(bases)) {
  const root = mkdtempSync(join(base, "n-"));
  const cache = join(root, "cache");
  const env = { ...process.env, npm_config_cache: cache, npm_config_update_notifier: "false" };
  const [packMs, packed] = time(() => run("npm", ["pack", "--pack-destination", root, "--silent"], { cwd: pkg, shell: WIN, env }));
  const tgz = join(root, packed.stdout.trim().split(/\r?\n/).pop());
  out(`npm pack on ${label}`, `${packMs} ms`);
  const trial = (name, extra) => {
    const dir = join(root, name);
    mkdirSync(dir);
    writeFileSync(join(dir, "package.json"), '{"name":"c","version":"1.0.0","private":true}');
    const [ms, r] = time(() => run("npm", ["install", "--save-dev", "--no-audit", "--no-fund", ...extra, tgz], { cwd: dir, shell: WIN, env }));
    out(`npm install (${name}) on ${label}`, `${ms} ms, exit ${r.status}`);
    return dir;
  };
  const a = trial("cold", []);
  trial("warm-cache", []);
  trial("offline-warm", ["--offline"]);
  trial("ignore-scripts", ["--ignore-scripts"]);
  // Size of what an install brings.
  const nm = join(a, "node_modules");
  let files = 0, bytes = 0;
  const per = {};
  const walk = (d, top) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p, top ?? e.name); else { const s = statSync(p).size; files++; bytes += s; const k = top ?? "(root)"; per[k] ??= [0, 0]; per[k][0]++; per[k][1] += s; } } };
  walk(nm);
  out(`node_modules of the install on ${label}`, `${files} files, ${(bytes / 1e6).toFixed(1)} MB`);
  const top = Object.entries(per).sort((x, y) => y[1][1] - x[1][1]).slice(0, 6).map(([k, [f, b]]) => `${k}: ${f} files ${(b / 1e6).toFixed(1)} MB`);
  out("largest entries", top.join("; "));
  const [cpMs] = time(() => cpSync(a, join(root, "copy"), { recursive: true, verbatimSymlinks: true }));
  out(`copy of that consumer (what each Case does) on ${label}`, `${cpMs} ms`);
  const [rm2] = time(() => rmSync(root, { recursive: true, force: true }));
  out(`remove it on ${label}`, `${rm2} ms`);
}

// 5. A git-heavy sequence like a Case's setup.
{
  const root = mkdtempSync(join(tmpdir(), "g-"));
  const env = { ...process.env, GIT_CONFIG_NOSYSTEM: "1", HOME: root, USERPROFILE: root };
  const g = (...a) => run("git", a, { cwd: join(root, "repo"), env });
  mkdirSync(join(root, "repo"));
  const [ms] = time(() => {
    run("git", ["init", "-q", "--bare", join(root, "remote.git")], { env });
    g("init", "-q", "-b", "main"); g("config", "user.name", "x"); g("config", "user.email", "x@example.invalid"); g("config", "commit.gpgsign", "false");
    writeFileSync(join(root, "repo", "a.txt"), "a");
    g("add", "-A"); g("commit", "-q", "-m", "a"); g("remote", "add", "origin", join(root, "remote.git")); g("push", "-q", "-u", "origin", "main");
  });
  out("git setup (init, config x3, add, commit, remote, push)", `${ms} ms for 10 git calls`);
  rmSync(root, { recursive: true, force: true });
}

// 6. Whether realtime protection costs much: repeat the cold install with it off (Windows only; may be refused).
if (WIN) {
  const r = run("powershell", ["-NoProfile", "-Command", "Set-MpPreference -DisableRealtimeMonitoring $true; (Get-MpComputerStatus).RealTimeProtectionEnabled"]);
  out("defender realtime after disabling attempt", (r.stdout + r.stderr).trim().replace(/\s+/g, " "));
  const root = mkdtempSync(join(tmpdir(), "d-"));
  const env = { ...process.env, npm_config_cache: join(root, "cache"), npm_config_update_notifier: "false" };
  const p = run("npm", ["pack", "--pack-destination", root, "--silent"], { cwd: pkg, shell: true, env });
  const tgz = join(root, p.stdout.trim().split(/\r?\n/).pop());
  const dir = join(root, "c"); mkdirSync(dir); writeFileSync(join(dir, "package.json"), '{"name":"c","version":"1.0.0","private":true}');
  const [ms, ir] = time(() => run("npm", ["install", "--save-dev", "--no-audit", "--no-fund", tgz], { cwd: dir, shell: true, env }));
  out("npm install cold with realtime protection disabled (if it was)", `${ms} ms, exit ${ir.status}`);
  const [cp] = time(() => cpSync(dir, join(root, "copy"), { recursive: true, verbatimSymlinks: true }));
  out("copy of consumer with realtime protection disabled (if it was)", `${cp} ms`);
  rmSync(root, { recursive: true, force: true });
}
