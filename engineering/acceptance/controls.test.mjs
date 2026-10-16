// Acceptance: kaal-controls, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-hosting, kaal-engineer-skill and kaal-controls from the tarballs the
// Acceptance lane packed into a fresh host outside this repository, and operates them there through
// the installed packages alone: Core admits the Controls Node into an Engine, and the installed
// Engineer Skill finds the shipped Agent Skill conformant.
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";
import { install } from "./packages.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const work = mkdtempSync(join(tmpdir(), "kaal-controls-acceptance-"));

// Commands run through Hosting, which owns how the host realizes them.
async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

function tree(dir) {
  const out = {};
  for (const p of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(join(dir, p)).isFile()) out[p.split("\\").join("/")] = readFileSync(join(dir, p), "utf8");
  }
  return out;
}

let host;
let installed;
let kaal;
let engine;

before(async () => {
  host = join(work, "host");
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  await install(host, ["kaal-core", "kaal-hosting", "kaal-engineer-skill", "kaal-controls"]);
  installed = join(host, "node_modules", "kaal-controls");
  kaal = join(host, "node_modules", ".bin", "kaal");
  engine = join(work, "elsewhere", "EngineX");
});

describe("the package", () => {
  it("installs exactly its intended contents", () => {
    assert.deepEqual(Object.keys(tree(installed)), ["LICENSE", "README.md", "package.json", "payload/Controls.md", "skills/kaal-controls/SKILL.md"]);
  });

  it("has no runtime dependencies", () => {
    assert.equal(JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).dependencies, undefined);
  });
});

describe("embedding into an Engine", () => {
  it("is admitted as a Skill by Core alone", async () => {
    assert.match(await run(kaal, ["init", "--engine", engine], host), /bootstrapped/);
    assert.match(await run(kaal, ["register", "skill", "kaal-controls", join(installed, "payload"), "--engine", engine], host), /^registered skill kaal-controls/);
    const [kind, id, name] = (await run(kaal, ["list", "--engine", engine], host)).trim().split("\t");
    assert.deepEqual([kind, name], ["skill", "Controls"]);
    assert.equal((await run(kaal, ["identify", join(installed, "payload", "Controls.md")], host)).split("\t")[0], id);
    assert.match(await run(kaal, ["verify", "--engine", engine], host), /ok: 5 Nodes admitted/);
  });

  it("leaves Core untouched", () => {
    assert.deepEqual(tree(join(host, "node_modules", "kaal-core", "payload")), tree(join(REPO, "packages", "kaal-core", "payload")));
  });
});

describe("the shipped Agent Skill", () => {
  it("conforms, as the installed Engineer Skill checks it", async () => {
    assert.match(await run(join(host, "node_modules", ".bin", "kaal-engineer-skill"), [join(installed, "skills", "kaal-controls")], host), /^ok/);
  });

  it("names no host skills location", () => {
    for (const [path, text] of Object.entries(tree(installed))) assert.doesNotMatch(text, /\.claude\/|\.agents\/|\.codex\/|\.cursor\//, path);
  });
});
