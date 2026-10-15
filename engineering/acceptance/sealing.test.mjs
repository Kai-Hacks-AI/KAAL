// Acceptance: kaal-sealing, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-hosting and kaal-sealing from their packed tarballs
// into a fresh host outside this repository, as the repository's other
// acceptance does. Core alone admits the Sealing Node into an Engine at an
// arbitrary location. The shipped Agent Skill seals and verifies there, from
// wherever in the host the skill is placed, and keeps doing so after
// everything is relocated.
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const work = mkdtempSync(join(tmpdir(), "kaal-sealing-acceptance-"));

// Commands run through Hosting, which owns how the host realizes them.
async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

/** Run a command expected to fail; returns its stderr. */
async function fails(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd });
  assert.equal(r.status, 1, `${cmd} ${args.join(" ")} should fail\n${r.stdout}${r.stderr}`);
  return r.stderr;
}

function tree(dir) {
  const out = {};
  for (const p of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(join(dir, p)).isFile()) out[p.split("\\").join("/")] = readFileSync(join(dir, p), "utf8");
  }
  return out;
}

async function pack(...path) {
  const out = JSON.parse(await run("npm", ["pack", "--json", "--pack-destination", work], join(REPO, "packages", ...path)));
  return join(work, out[0].filename);
}

const EXPECTED_TARBALL = [
  "package/LICENSE",
  "package/README.md",
  "package/package.json",
  "package/payload/Sealing.md",
  "package/skills/kaal-sealing/SKILL.md",
  "package/skills/kaal-sealing/scripts/kaal-sealing.mjs",
  "package/skills/kaal-sealing/scripts/sealing.mjs",
];

// An arbitrary Engine location: outside the host, under a name that is not .kaal.
const ENGINE = "../elsewhere/Vault";

let tarball;
let host;
let installed;
let kaal;
let sealing;
let engineDir;

before(async () => {
  const core = await pack("kaal-core");
  const hosting = await pack("extensions", "kaal-hosting");
  tarball = await pack("skills", "kaal-sealing");
  host = join(work, "host");
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ name: "fresh-host", version: "1.0.0", private: true }, null, 2));
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  await run("npm", ["install", "--prefer-offline", "--no-package-lock", core, hosting, tarball], host);
  installed = join(host, "node_modules", "kaal-sealing");
  kaal = join(host, "node_modules", ".bin", "kaal");
  sealing = join(host, "node_modules", ".bin", "kaal-sealing");
  engineDir = join(work, "elsewhere", "Vault");
});

describe("package", () => {
  it("is a tarball of exactly the intended contents, with its own MIT license", async () => {
    assert.deepEqual((await run("tar", ["-tzf", tarball], work)).split("\n").filter(Boolean).sort(), EXPECTED_TARBALL);
    const pkg = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
    assert.equal(pkg.license, "MIT");
    assert.match(readFileSync(join(installed, "LICENSE"), "utf8"), /^MIT License/);
    assert.deepEqual(pkg.dependencies, { "kaal-core": "0.0.1", "kaal-hosting": "0.0.1" });
  });

  it("names no repository path and no host skills location", () => {
    for (const [path, text] of Object.entries(tree(installed))) {
      assert.ok(!text.includes(REPO), `${path} mentions ${REPO}`);
      assert.doesNotMatch(text, /\.claude\/|\.agents\/|\.codex\/|\.cursor\//, path);
    }
  });
});

describe("embedding Sealing into a fresh Engine", () => {
  let fileRef;
  let dirRef;

  it("refuses an Engine that does not hold Sealing", async () => {
    assert.match(await run(kaal, ["init", "--engine", ENGINE], host), /bootstrapped/);
    const before = tree(engineDir);
    writeFileSync(join(host, "early.txt"), "too early\n");
    assert.match(await fails(sealing, ["seal", "early.txt", "--engine", ENGINE], host), /does not hold Sealing/);
    assert.deepEqual(tree(engineDir), before);
  });

  it("is admitted as a Skill by Core alone and discovered through Core", async () => {
    assert.match(await run(kaal, ["register", "skill", "kaal-sealing", join(installed, "payload"), "--engine", ENGINE], host), /^registered skill kaal-sealing/);
    const [kind, id, name] = (await run(kaal, ["list", "--engine", ENGINE], host)).trim().split("\t");
    assert.deepEqual([kind, name], ["skill", "Sealing"]);
    assert.equal((await run(kaal, ["identify", join(installed, "payload", "Sealing.md")], host)).split("\t")[0], id);
    assert.match(await run(kaal, ["verify", "--engine", ENGINE], host), /ok: 5 Nodes admitted/);
  });

  it("seals a file and a directory and verifies each against its intended Seal", async () => {
    writeFileSync(join(host, "report.txt"), "the sealed report\n");
    mkdirSync(join(host, "bundle", "inner"), { recursive: true });
    writeFileSync(join(host, "bundle", "one.md"), "one\n");
    writeFileSync(join(host, "bundle", "inner", "two.bin"), Buffer.from([0, 1, 2, 255]));
    fileRef = (await run(sealing, ["seal", "report.txt", "--engine", ENGINE], host)).trim();
    dirRef = (await run(sealing, ["seal", "bundle", "--named", "--domain", "Acceptance Bundle", "--engine", ENGINE], host)).trim();
    const fileId = (await run(sealing, ["id", "report.txt"], host)).trim();
    assert.equal(await run(sealing, ["verify", "report.txt", "--seal", fileRef, "--engine", ENGINE], host), `ok\t${fileId}\n`);
    assert.match(await run(sealing, ["verify", "bundle", "--seal", dirRef, "--engine", ENGINE], host), /^ok\t/);
    assert.deepEqual((await run(sealing, ["list", "--engine", ENGINE], host)).trim().split("\n"), [fileRef, dirRef].sort());
    // Core still sees the same Engine.
    assert.match(await run(kaal, ["verify", "--engine", ENGINE], host), /ok: 5 Nodes admitted/);
    assert.match(await run(kaal, ["init", "--engine", ENGINE], host), /already holds the foundation/);
  });

  it("detects changed bytes, and a second version does not satisfy the original Seal", async () => {
    writeFileSync(join(host, "report.txt"), "the sealed report.\n");
    assert.match(await fails(sealing, ["verify", "report.txt", "--seal", fileRef, "--engine", ENGINE], host), /^mismatch: the Seal binds [0-9a-f]{64}, report\.txt is [0-9a-f]{64}/);
    const v2 = (await run(sealing, ["seal", "report.txt", "--engine", ENGINE], host)).trim();
    assert.match(await run(sealing, ["verify", "report.txt", "--seal", v2, "--engine", ENGINE], host), /^ok/);
    assert.match(await fails(sealing, ["verify", "report.txt", "--seal", fileRef, "--engine", ENGINE], host), /^mismatch/);
    writeFileSync(join(host, "bundle", "inner", "two.bin"), Buffer.from([0, 1, 2, 254]));
    assert.match(await fails(sealing, ["verify", "bundle", "--seal", dirRef, "--engine", ENGINE], host), /^mismatch/);
    writeFileSync(join(host, "bundle", "inner", "two.bin"), Buffer.from([0, 1, 2, 255]));
  });

  it("detects a changed or missing Seal while the artifact is unchanged", async () => {
    const stored = join(engineDir, "seals", dirRef, "seal");
    const original = readFileSync(stored);
    writeFileSync(stored, Buffer.concat([original, Buffer.from(" ")]));
    assert.match(await fails(sealing, ["verify", "bundle", "--seal", dirRef, "--engine", ENGINE], host), /^corrupt/);
    rmSync(join(engineDir, "seals", dirRef), { recursive: true });
    assert.match(await fails(sealing, ["verify", "bundle", "--seal", dirRef, "--engine", ENGINE], host), /^missing/);
    mkdirSync(join(engineDir, "seals", dirRef));
    writeFileSync(stored, original);
    assert.match(await run(sealing, ["verify", "bundle", "--seal", dirRef, "--engine", ENGINE], host), /^ok/);
  });

  it("runs from wherever the host places the Agent Skill, from any working directory, outside any repository", async () => {
    assert.ok(!existsSync(join(work, ".git")) && !existsSync(join(host, ".git")));
    const elsewhere = join(work, "unrelated", "cwd");
    mkdirSync(elsewhere, { recursive: true });
    for (const where of ["agent-skills", join("deep", "x", "skills")]) {
      const placed = join(host, where, "kaal-sealing");
      mkdirSync(dirname(placed), { recursive: true });
      cpSync(join(installed, "skills", "kaal-sealing"), placed, { recursive: true });
      const script = join(placed, "scripts", "kaal-sealing.mjs");
      // From the host, with paths relative to the working directory.
      assert.match(await run(process.execPath, [script, "verify", "bundle", "--seal", dirRef, "--engine", ENGINE], host), /^ok/);
      // From the skill's own directory and from an unrelated one, with absolute paths.
      for (const cwd of [placed, elsewhere]) {
        assert.match(await run(process.execPath, [script, "verify", join(host, "bundle"), "--seal", dirRef, "--engine", engineDir], cwd), /^ok/);
      }
    }
    // The installed command, from an unrelated working directory.
    assert.match(await run(sealing, ["verify", join(host, "bundle"), "--seal", dirRef, "--engine", engineDir], elsewhere), /^ok/);
  });

  it("verifies after everything is relocated", async () => {
    const moved = join(mkdtempSync(join(tmpdir(), "kaal-sealing-relocated-")), "anywhere");
    cpSync(work, moved, { recursive: true, verbatimSymlinks: true });
    const there = join(moved, "host");
    assert.match(await run(join(there, "node_modules", ".bin", "kaal-sealing"), ["verify", "bundle", "--seal", dirRef, "--engine", ENGINE], there), /^ok/);
    // report.txt changed after fileRef was sealed: still a mismatch, wherever it now lies.
    assert.match(await fails(process.execPath, [join(there, "agent-skills", "kaal-sealing", "scripts", "kaal-sealing.mjs"), "verify", "report.txt", "--seal", fileRef, "--engine", ENGINE], there), /^mismatch/);
  });
});
