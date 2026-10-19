// Acceptance: kaal-slack, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-graph, kaal-hosting, kaal-communication and
// kaal-slack from the tarballs the Acceptance lane packed into a fresh host of
// this scenario's own, through Testing's install(), and operates them there
// through the installed packages alone: registration with and without the
// communication prerequisite. It also checks that communication stays
// independent of the Channel Extension that depends on it.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { before, describe, it } from "node:test";
import { execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";
// The repository's privacy check, applied to the bytes this run packed.
import { scan, unpack } from "../../../../../engineering/privacy/check.mjs";

const COMMUNICATION = "kaal-communication";
const SLACK = "kaal-slack";

// Commands run through Hosting, which owns how the host realizes them.
async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

async function fails(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd });
  assert.equal(r.status, 1, `${cmd} ${args.join(" ")} should fail\n${r.stdout}${r.stderr}`);
  return r;
}

function files(dir) {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .map((p) => p.split("\\").join("/"))
    .filter((p) => statSync(join(dir, p)).isFile())
    .sort();
}

function tree(dir) {
  return Object.fromEntries(files(dir).map((p) => [p, readFileSync(join(dir, p), "utf8")]));
}

let host;
let kaal;
let engine;
const installed = (name) => join(host, "node_modules", name);
const payload = (name) => join(installed(name), "payload");

before(async () => {
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  host = await install(["kaal-core", "kaal-graph", "kaal-hosting", COMMUNICATION, SLACK]);
  kaal = join(host, "node_modules", ".bin", "kaal");
  engine = join(host, ".kaal");
  await run(kaal, ["init"], host);
});

describe("the installed package", () => {
  it("holds exactly its intended contents", () => {
    assert.deepEqual(files(installed(SLACK)), [
      "LICENSE",
      "README.md",
      "package.json",
      "payload/Slack-Channel.md",
      "payload/Slack.md",
      "skills/kaal-slack/SKILL.md",
      "skills/kaal-slack/references/defaults.md",
    ]);
  });

  it("packs nothing private", () => {
    const manifest = JSON.parse(readFileSync(join(process.env.KAAL_ACCEPTANCE_RUN, "manifest.json"), "utf8"));
    const findings = scan(unpack(readFileSync(manifest[SLACK].tarball)));
    assert.deepEqual(findings, [], JSON.stringify(findings));
  });
});

describe("independence", () => {
  it("kaal-slack depends on kaal-communication, which depends on none of its dependents", () => {
    const slack = JSON.parse(readFileSync(join(installed(SLACK), "package.json"), "utf8"));
    assert.ok(Object.keys(slack.dependencies ?? {}).includes(COMMUNICATION));
    const own = JSON.parse(readFileSync(join(installed(COMMUNICATION), "package.json"), "utf8"));
    const deps = Object.keys({ ...own.dependencies, ...own.peerDependencies, ...own.devDependencies, ...own.optionalDependencies });
    assert.ok(!deps.includes(SLACK), `kaal-communication depends on its dependent ${SLACK}`);
  });

  it("kaal-communication names neither kaal-slack, its capability nor its Nodes", () => {
    const forbidden = new Set([SLACK, "slack"]);
    for (const text of Object.values(tree(payload(SLACK)))) forbidden.add(/^name: (.+)$/m.exec(text)[1]);
    for (const [path, text] of Object.entries(tree(installed(COMMUNICATION)))) {
      for (const word of forbidden) assert.ok(!new RegExp(`\\b${word.toLowerCase()}\\b`).test(text.toLowerCase()), `${path} names ${word}`);
    }
  });
});

describe("registration in a fresh host", () => {
  it("refuses kaal-slack while kaal-communication is absent, writing nothing", async () => {
    const before = tree(engine);
    const r = await fails(kaal, ["register", "extension", SLACK, payload(SLACK)], host);
    assert.match(r.stderr, /Slack-Channel\.md is not admitted: type Channel \(\w+\) resolves to no Node/);
    assert.deepEqual(tree(engine), before);
  });

  it("admits kaal-slack once kaal-communication is registered", async () => {
    assert.match(await run(kaal, ["register", "skill", COMMUNICATION, payload(COMMUNICATION)], host), /^registered skill kaal-communication/);
    assert.match(await run(kaal, ["register", "extension", SLACK, payload(SLACK)], host), /^registered extension kaal-slack/);
    const listed = (await run(kaal, ["list"], host)).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(
      listed.map(([kind, , name]) => `${kind} ${name}`),
      ["skill Communication", "extension Slack"],
    );
    assert.match(await run(kaal, ["verify"], host), /^ok/);
  });
});
