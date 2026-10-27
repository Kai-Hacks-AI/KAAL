// Acceptance: kaal-architecture, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-hosting, kaal-engineer-skill, kaal-graph and
// kaal-architecture from the tarballs the Acceptance lane packed into a
// fresh host of this scenario's own, through Testing's install(). Core
// alone admits the Architecture payload as a Capability, Core realizes the
// Agent Skill from the shipped Installation Contract into the same consumer
// repository, and the installed Engineer Skill finds the Agent Skill conformant.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
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
let consumer;

before(async () => {
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  host = await install(["kaal-core", "kaal-hosting", "kaal-engineer-skill", "kaal-graph", "kaal-architecture"]);
  installed = join(host, "node_modules", "kaal-architecture");
  kaal = join(host, "node_modules", ".bin", "kaal");
  engine = join(work, "elsewhere", "Engine");
  consumer = join(work, "consumer");
  mkdirSync(consumer);
});

describe("the installed package", () => {
  it("holds exactly its intended files and has no runtime dependencies", () => {
    assert.deepEqual(files(installed), ["LICENSE", "README.md", "contract.json", "package.json", "payload/Architecture.md", "payload/URBAN.md", "skills/kaal-architecture/SKILL.md"]);
    assert.equal(JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).dependencies, undefined);
  });

  it("is admitted as a Capability by Core alone, with URBAN beside it", async () => {
    assert.match(await run(kaal, ["init", "--engine", engine], host), /bootstrapped/);
    assert.match(await run(kaal, ["register", "capability", "kaal-architecture", join(installed, "payload"), "--engine", engine], host), /^registered capability kaal-architecture/);
    const id = async (file) => (await run(kaal, ["identify", join(installed, "payload", file)], host)).split("\t")[0];
    const listed = (await run(kaal, ["list", "--engine", engine], host)).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(listed.filter(([, , name]) => name === "Architecture"), [["capability", await id("Architecture.md"), "Architecture"]]);
    assert.match(await run(kaal, ["verify", "--engine", engine], host), /^ok/);
    const urban = await id("URBAN.md");
    assert.ok(files(engine).some((f) => readFileSync(join(engine, f)).equals(readFileSync(join(installed, "payload", "URBAN.md")))), `URBAN ${urban} is not in the Engine`);
  });
});

describe("a consumer repository", () => {
  // The Capability Node, URBAN, the installed Agent Skill and Architecture's installation record
  // meet in one repository: its Engine at .kaal/, the Skill at .agents/skills/, the record in .kaal/state/.
  it("holds Architecture, URBAN, the Agent Skill Core realized from contract.json byte for byte as shipped, and the record that registers it", async () => {
    const kaalIn = (args) => run(kaal, [...args, "--engine", join(consumer, ".kaal")], host);
    assert.match(await kaalIn(["init"]), /bootstrapped/);
    assert.match(await kaalIn(["register", "capability", "kaal-architecture", join(installed, "payload")]), /^registered capability kaal-architecture/);

    const realize = `
      import { readFileSync } from "node:fs";
      import { read } from "kaal-hosting";
      import { realizeIn } from "kaal-core/realization";
      const [root, pkg] = process.argv.slice(1);
      const realized = await realizeIn(root, {
        skills: [{ name: "kaal-architecture", files: await read(pkg + "/skills/kaal-architecture") }],
        contracts: [JSON.parse(readFileSync(pkg + "/contract.json", "utf8"))],
      });
      console.log(JSON.stringify(realized.records));`;
    assert.deepEqual(JSON.parse(await run(process.execPath, ["--input-type=module", "-e", realize, consumer, installed], host)), [".kaal/state/architecture/installation.json"]);

    const contract = JSON.parse(readFileSync(join(installed, "contract.json"), "utf8"));
    const record = JSON.parse(readFileSync(join(consumer, contract.record), "utf8"));
    const skill = files(join(consumer, ".agents")).map((p) => `.agents/${p}`);
    assert.deepEqual(skill, [".agents/skills/kaal-architecture/SKILL.md"]);
    for (const path of skill) {
      const shipped = join(installed, "skills", "kaal-architecture", path.slice(".agents/skills/kaal-architecture/".length));
      assert.ok(readFileSync(join(consumer, path)).equals(readFileSync(shipped)), `${path} is installed byte for byte as shipped`);
      const digest = createHash("sha256").update(readFileSync(join(consumer, path))).digest("hex");
      assert.deepEqual(record.assets[path], { sha256: digest, version: contract.version });
      assert.ok(contract.catalogue[path].includes(digest), `${path} as installed is catalogued`);
    }
    assert.deepEqual(Object.keys(record.assets), skill);

    const listed = (await kaalIn(["list"])).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(listed.filter(([, , name]) => name === "Architecture").map(([kind]) => kind), ["capability"]);
    assert.match(await kaalIn(["verify"]), /^ok/);
    assert.match(readFileSync(join(consumer, skill[0]), "utf8"), /the Nodes `Architecture` and `URBAN` in a KAAL Engine/);
    assert.ok(files(join(consumer, ".kaal")).some((f) => readFileSync(join(consumer, ".kaal", f)).equals(readFileSync(join(installed, "payload", "URBAN.md")))), "URBAN is in the consumer's Engine");
  });
});

describe("the shipped Agent Skill", () => {
  it("conforms, as the installed Engineer Skill checks it", async () => {
    assert.match(await run(join(host, "node_modules", ".bin", "kaal-engineer-skill"), [join(installed, "skills", "kaal-architecture")], host), /^ok/);
  });
});
