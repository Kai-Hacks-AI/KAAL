// Acceptance: kaal-architecture, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-hosting, kaal-engineer-skill, kaal-graph and
// kaal-architecture from the tarballs the Acceptance lane packed into a
// fresh host of this scenario's own, through Testing's install(). Core
// alone admits the Architecture payload, and the installed Engineer Skill
// finds the shipped Agent Skill conformant.
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { before, describe, it } from "node:test";
import { execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";

const work = mkdtempSync(join(tmpdir(), "kaal-architecture-acceptance-"));

// Commands run through Hosting, which owns how the host realizes them.
async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

function files(dir) {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .map((p) => p.split("\\").join("/"))
    .filter((p) => statSync(join(dir, p)).isFile())
    .sort();
}

let host;
let installed;
let kaal;
let engine;

before(async () => {
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  host = await install(["kaal-core", "kaal-hosting", "kaal-engineer-skill", "kaal-graph", "kaal-architecture"]);
  installed = join(host, "node_modules", "kaal-architecture");
  kaal = join(host, "node_modules", ".bin", "kaal");
  engine = join(work, "elsewhere", "Engine");
});

describe("the installed package", () => {
  it("holds exactly its intended files and has no runtime dependencies", () => {
    assert.deepEqual(files(installed), ["LICENSE", "README.md", "package.json", "payload/Architecture.md", "payload/URBAN.md", "skills/kaal-architecture/SKILL.md"]);
    assert.equal(JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).dependencies, undefined);
  });

  it("is admitted as a Skill by Core alone, with URBAN beside it", async () => {
    assert.match(await run(kaal, ["init", "--engine", engine], host), /bootstrapped/);
    assert.match(await run(kaal, ["register", "skill", "kaal-architecture", join(installed, "payload"), "--engine", engine], host), /^registered skill kaal-architecture/);
    const id = async (file) => (await run(kaal, ["identify", join(installed, "payload", file)], host)).split("\t")[0];
    const listed = (await run(kaal, ["list", "--engine", engine], host)).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(listed.filter(([, , name]) => name === "Architecture"), [["skill", await id("Architecture.md"), "Architecture"]]);
    assert.match(await run(kaal, ["verify", "--engine", engine], host), /^ok/);
    const urban = await id("URBAN.md");
    assert.ok(files(engine).some((f) => readFileSync(join(engine, f)).equals(readFileSync(join(installed, "payload", "URBAN.md")))), `URBAN ${urban} is not in the Engine`);
  });
});

describe("the shipped Agent Skill", () => {
  it("conforms, as the installed Engineer Skill checks it", async () => {
    assert.match(await run(join(host, "node_modules", ".bin", "kaal-engineer-skill"), [join(installed, "skills", "kaal-architecture")], host), /^ok/);
  });
});
