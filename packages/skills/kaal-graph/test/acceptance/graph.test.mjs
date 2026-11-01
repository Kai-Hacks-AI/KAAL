// Acceptance: kaal-graph, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-hosting and kaal-graph from the tarballs the
// Acceptance lane packed into a fresh host of this scenario's own, through
// Testing's install(). Graph stands on Hosting alone, Core alone admits Graph's
// Skill Node, and Graph's identity of every Node in this repository is
// Core's, byte for byte, refusals included.
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "@kaihacksai/kaal-hosting";
import { install } from "kaal-testing/acceptance";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const work = mkdtempSync(join(tmpdir(), "kaal-graph-acceptance-"));

// Commands run through Hosting, which owns how the host realizes them.
async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

let host;
let installed;
let kaal;

before(async () => {
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  host = await install(["@kaihacksai/kaal-foundation", "kaal-core", "@kaihacksai/kaal-hosting", "@kaihacksai/kaal-graph"]);
  installed = join(host, "node_modules", "@kaihacksai", "kaal-graph");
  kaal = join(host, "node_modules", ".bin", "kaal");
});

describe("the installed package", () => {
  it("depends at runtime on kaal-hosting and its pinned YAML parser, and not on kaal-core", () => {
    const pkg = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
    assert.deepEqual(Object.keys(pkg.dependencies).sort(), ["@kaihacksai/kaal-hosting", "yaml"]);
    for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) assert.equal(pkg[field]?.["kaal-core"], undefined, `kaal-graph ${field}`);
  });

  it("has a Skill Node, and KNIFE beside it, admitted by Core alone", async () => {
    const engine = join(work, "elsewhere", "Engine");
    assert.match(await run(kaal, ["init", "--engine", engine], host), /bootstrapped/);
    assert.match(await run(kaal, ["register", "skill", "kaal-graph", join(installed, "payload"), "--engine", engine], host), /^registered skill kaal-graph/);
    const id = (await run(kaal, ["identify", join(installed, "payload", "Graph.md")], host)).split("\t")[0];
    const listed = (await run(kaal, ["list", "--engine", engine], host)).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(listed.filter(([, , name]) => name === "Graph"), [["skill", id, "Graph"]]);
    const knife = (await run(kaal, ["identify", join(installed, "payload", "KNIFE.md")], host)).split("\t")[0];
    assert.equal((await run(kaal, ["resolve", "KNIFE", knife, "--engine", engine], host)).split("\t")[0], knife, "KNIFE is admitted beside Graph");
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
  it("reads Core's genesis Node, the one Node that declares no type, as a root, and refuses every typed Node as one", async () => {
    const script = `
      import { readFileSync } from "node:fs";
      import * as core from "kaal-core";
      import * as graph from "@kaihacksai/kaal-graph";
      const genesis = readFileSync(new URL("./payload/core/Node.md", import.meta.resolve("kaal-core/package.json")));
      const root = graph.identifyRoot(genesis);
      const typed = JSON.parse(process.argv[1]).map((p) => readFileSync(p)).filter((b) => { try { return graph.identify(b).type; } catch { return false; } });
      const refused = typed.filter((b) => { try { graph.identifyRoot(b); return false; } catch (e) { return e instanceof graph.FormError; } }).length;
      const ordinary = (() => { try { graph.identify(genesis); return "read"; } catch (e) { return e instanceof graph.FormError && e.message.startsWith("untyped: ") ? "untyped" : e.message; } })();
      console.log(JSON.stringify({ root, ordinary, foundation: core.foundation().node, typed: typed.length, refused }));`;
    const r = JSON.parse(await run(process.execPath, ["--input-type=module", "-e", script, JSON.stringify(claimants().map((p) => join(REPO, p)))], host));
    assert.equal(r.ordinary, "untyped", "identify() refuses the root: it reads only ordinary Nodes");
    assert.deepEqual({ name: r.root.name, id: r.root.id }, r.foundation, "the root Graph reads is the Node Core's foundation names");
    assert.ok(r.typed >= 10);
    assert.equal(r.refused, r.typed);
  });
});
