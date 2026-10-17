// Acceptance: kaal-graph, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-hosting and kaal-graph from their packed tarballs
// into a fresh host outside this repository, as the repository's other
// acceptance does. Graph stands on Hosting alone, Core alone admits Graph's
// Skill Node, and Graph's identity of every Node in this repository is
// Core's, byte for byte, refusals included.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const work = mkdtempSync(join(tmpdir(), "kaal-graph-acceptance-"));

// Commands run through Hosting, which owns how the host realizes them.
async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

async function pack(...path) {
  const out = JSON.parse(await run("npm", ["pack", "--json", "--pack-destination", work], join(REPO, "packages", ...path)));
  return join(work, out[0].filename);
}

let host;
let installed;
let kaal;

before(async () => {
  const core = await pack("kaal-core");
  const hosting = await pack("extensions", "kaal-hosting");
  const graph = await pack("skills", "kaal-graph");
  host = join(work, "host");
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ name: "fresh-host", version: "1.0.0", private: true }, null, 2));
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  await run("npm", ["install", "--prefer-offline", "--no-package-lock", core, hosting, graph], host);
  installed = join(host, "node_modules", "kaal-graph");
  kaal = join(host, "node_modules", ".bin", "kaal");
});

describe("the installed package", () => {
  it("depends at runtime on kaal-hosting and its pinned YAML parser, and not on kaal-core", () => {
    const pkg = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
    assert.deepEqual(Object.keys(pkg.dependencies).sort(), ["kaal-hosting", "yaml"]);
    for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) assert.equal(pkg[field]?.["kaal-core"], undefined, `kaal-graph ${field}`);
  });

  it("has a Skill Node admitted by Core alone", async () => {
    const engine = join(work, "elsewhere", "Engine");
    assert.match(await run(kaal, ["init", "--engine", engine], host), /bootstrapped/);
    assert.match(await run(kaal, ["register", "skill", "kaal-graph", join(installed, "payload"), "--engine", engine], host), /^registered skill kaal-graph/);
    const id = (await run(kaal, ["identify", join(installed, "payload", "Graph.md")], host)).split("\t")[0];
    const listed = (await run(kaal, ["list", "--engine", engine], host)).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(listed.filter(([, , name]) => name === "Graph"), [["skill", id, "Graph"]]);
    assert.match(await run(kaal, ["verify", "--engine", engine], host), /^ok/);
  });
});

/** Every Markdown file in this repository that claims to be a Node, outside dependencies. */
function claimants() {
  return readdirSync(REPO, { recursive: true, encoding: "utf8" })
    .map((p) => p.split("\\").join("/"))
    .filter((p) => p.endsWith(".md") && !p.split("/").some((s) => s === "node_modules" || s === ".git") && statSync(join(REPO, p)).isFile())
    .filter((p) => /^---\r?\n/.test(readFileSync(join(REPO, p), "latin1")))
    .sort();
}

describe("identity", () => {
  it("is Core's for every Node in this repository, and refuses what Core refuses with the same message", async () => {
    const paths = claimants();
    assert.ok(paths.length >= 10, `${paths.length} Nodes`);
    const script = `
      import { readFileSync } from "node:fs";
      import * as core from "kaal-core";
      import * as graph from "kaal-graph";
      const read = (identify, bytes) => { try { return { node: identify(bytes) }; } catch (e) { return { refused: e.message }; } };
      const out = [];
      for (const path of JSON.parse(process.argv[1])) {
        const bytes = readFileSync(path);
        out.push({ path, core: read(core.identify, bytes), graph: read(graph.identify, bytes), sameId: core.sha256(bytes) === graph.sha256(bytes) });
      }
      console.log(JSON.stringify(out));`;
    const results = JSON.parse(await run(process.execPath, ["--input-type=module", "-e", script, JSON.stringify(paths.map((p) => join(REPO, p)))], host));
    for (const r of results) {
      assert.deepEqual(r.graph, r.core, r.path);
      assert.ok(r.sameId, r.path);
    }
    assert.ok(results.filter((r) => r.core.node).length >= 10);
  });
});
