// Acceptance: kaal-controls, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-hosting, kaal-engineer-skill, kaal-graph and
// kaal-controls from the tarballs the Acceptance lane packed into a fresh
// host of this scenario's own, through Testing's install(). Core alone
// admits the Controls payload, the installed Engineer Skill finds the
// shipped Agent Skill conformant, and the installed Graph finds the Nodes a
// documented control relies on resolved.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { before, describe, it } from "node:test";
import { execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";

const work = mkdtempSync(join(tmpdir(), "kaal-controls-acceptance-"));

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
  host = await install(["kaal-core", "kaal-hosting", "kaal-engineer-skill", "kaal-graph", "kaal-controls"]);
  installed = join(host, "node_modules", "kaal-controls");
  kaal = join(host, "node_modules", ".bin", "kaal");
  engine = join(work, "elsewhere", "Engine");
});

describe("the installed package", () => {
  it("controls/T7: holds exactly its intended files and has no runtime dependencies", () => {
    assert.deepEqual(files(installed), ["LICENSE", "README.md", "package.json", "payload/CATCH-ME-IF-YOU-CAN.md", "payload/Control.md", "payload/Controls.md", "payload/HAPTIC.md", "payload/Realized-by.md", "payload/VARISC.md", "skills/kaal-controls/SKILL.md"]);
    assert.equal(JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).dependencies, undefined);
  });

  it("controls/T4: is admitted as a Capability by Core alone", async () => {
    assert.match(await run(kaal, ["init", "--engine", engine], host), /bootstrapped/);
    assert.match(await run(kaal, ["register", "capability", "kaal-controls", join(installed, "payload"), "--engine", engine], host), /^registered capability kaal-controls/);
    const id = (await run(kaal, ["identify", join(installed, "payload", "Controls.md")], host)).split("\t")[0];
    const listed = (await run(kaal, ["list", "--engine", engine], host)).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(listed.filter(([, , name]) => name === "Controls"), [["capability", id, "Controls"]]);
    assert.match(await run(kaal, ["verify", "--engine", engine], host), /^ok/);
  });
});

describe("the shipped Agent Skill", () => {
  it("controls/T7: conforms, as the installed Engineer Skill checks it", async () => {
    assert.match(await run(join(host, "node_modules", ".bin", "kaal-engineer-skill"), [join(installed, "skills", "kaal-controls")], host), /^ok/);
  });
});

describe("a documented control", () => {
  it("has its Realized by Edge found resolved by the installed Graph, within the Engine", async () => {
    const id = async (file) => (await run(kaal, ["identify", file], host)).split("\t")[0];
    const control = { name: "Control", id: await id(join(installed, "payload", "Control.md")) };
    const realizedBy = { name: "Realized by", id: await id(join(installed, "payload", "Realized-by.md")) };
    const controls = { name: "Controls", id: await id(join(installed, "payload", "Controls.md")) };
    const dir = join(work, "documented");
    mkdirSync(dir);
    // Realized by Controls' own Capability Node only to have a target present; any realizing Node serves.
    writeFileSync(
      join(dir, "Example-review.md"),
      `---\nname: Example review\ntype:\n  name: ${control.name}\n  id: "${control.id}"\nedges:\n  - type:\n      name: ${realizedBy.name}\n      id: "${realizedBy.id}"\n    targets:\n      - name: ${controls.name}\n        id: "${controls.id}"\n---\n\n# Example review\n`,
    );
    assert.equal((await execute(join(host, "node_modules", ".bin", "kaal-graph"), ["check", engine, dir], { cwd: host })).status, 0);
    const out = await run(join(host, "node_modules", ".bin", "kaal-graph"), ["out", await id(join(dir, "Example-review.md")), engine, dir], host);
    assert.match(out, new RegExp(`${realizedBy.id}.*${controls.id}`));
  });
});
