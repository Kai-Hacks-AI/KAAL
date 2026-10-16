// Acceptance: kaal-communication and kaal-slack, Engineering -> Package -> Embed.
//
// Packs both packages with kaal-core and kaal-hosting as npm would publish them, inspects and
// privacy-checks the actual tarballs, installs them into a fresh host outside this repository,
// and operates them there through the installed packages alone: registration with and without
// the communication prerequisite. It also checks that communication stays independent of every
// Transport Extension that depends on it.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";
import { scan, unpack } from "../privacy/check.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const COMMUNICATION = "kaal-communication";
const work = mkdtempSync(join(tmpdir(), "kaal-communication-acceptance-"));

const EXPECTED = {
  [COMMUNICATION]: [
    "package/LICENSE",
    "package/README.md",
    "package/package.json",
    "package/payload/CHAOS.md",
    "package/payload/Communication.md",
    "package/payload/Transport.md",
    "package/skills/kaal-communication/SKILL.md",
  ],
  "kaal-slack": [
    "package/LICENSE",
    "package/README.md",
    "package/package.json",
    "package/payload/Slack-Transport.md",
    "package/payload/Slack.md",
    "package/skills/kaal-slack/SKILL.md",
    "package/skills/kaal-slack/references/defaults.md",
  ],
};

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

function tree(dir) {
  const out = {};
  for (const p of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(join(dir, p)).isFile()) out[p.split("\\").join("/")] = readFileSync(join(dir, p), "utf8");
  }
  return out;
}

/** The repository's workspace packages, by name: directory and manifest. */
function workspaces() {
  const root = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8"));
  return Object.fromEntries(
    root.workspaces.map((w) => {
      const manifest = JSON.parse(readFileSync(join(REPO, w, "package.json"), "utf8"));
      return [manifest.name, { dir: join(REPO, w), manifest }];
    }),
  );
}

const tarballs = {};
let host;
let kaal;
let engine;

before(async () => {
  for (const [name, path] of [
    ["kaal-core", ["kaal-core"]],
    ["kaal-hosting", ["extensions", "kaal-hosting"]],
    [COMMUNICATION, ["skills", COMMUNICATION]],
    ["kaal-slack", ["extensions", "kaal-slack"]],
  ]) {
    const out = JSON.parse(await run("npm", ["pack", "--json", "--pack-destination", work], join(REPO, "packages", ...path)));
    tarballs[name] = join(work, out[0].filename);
  }
  host = join(work, "host");
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ name: "fresh-host", version: "1.0.0", private: true }, null, 2));
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  await run("npm", ["install", "--prefer-offline", "--no-package-lock", ...Object.values(tarballs)], host);
  kaal = join(host, "node_modules", ".bin", "kaal");
  engine = join(host, ".kaal");
  await run(kaal, ["init"], host);
});

describe("packages", () => {
  for (const name of Object.keys(EXPECTED)) {
    it(`${name} packs exactly its intended contents`, () => {
      assert.deepEqual(Object.keys(unpack(readFileSync(tarballs[name]))).sort(), EXPECTED[name]);
    });
  }

  it("pack nothing private, and neither do the repository's files", async () => {
    for (const name of Object.keys(EXPECTED)) {
      const findings = scan(unpack(readFileSync(tarballs[name])));
      assert.deepEqual(findings, [], `${name}: ${JSON.stringify(findings)}`);
    }
    const listed = await run("git", ["ls-files", "-z"], REPO);
    const files = Object.fromEntries(
      listed
        .split("\0")
        .filter(Boolean)
        .map((p) => [p, readFileSync(join(REPO, p))]),
    );
    assert.deepEqual(scan(files), []);
  });
});

describe("independence", () => {
  const all = workspaces();
  const dependents = Object.entries(all).filter(([, { manifest }]) => Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies }).includes(COMMUNICATION));

  it("communication has Transport Extensions depending on it, and depends on none of them", () => {
    assert.ok(dependents.length > 0, "no package depends on kaal-communication: nothing to check");
    const own = all[COMMUNICATION].manifest;
    const deps = Object.keys({ ...own.dependencies, ...own.peerDependencies, ...own.devDependencies, ...own.optionalDependencies });
    for (const [name] of dependents) assert.ok(!deps.includes(name), `kaal-communication depends on its dependent ${name}`);
  });

  it("communication names none of its dependents, their capabilities or their Nodes", () => {
    const forbidden = new Set();
    for (const [name, { dir }] of dependents) {
      forbidden.add(name);
      forbidden.add(name.replace(/^kaal-/, ""));
      for (const text of Object.values(tree(join(dir, "payload")))) forbidden.add(/^name: (.+)$/m.exec(text)[1]);
    }
    const shipped = unpack(readFileSync(tarballs[COMMUNICATION]));
    const repo = tree(all[COMMUNICATION].dir);
    for (const [path, bytes] of [...Object.entries(shipped), ...Object.entries(repo).filter(([p]) => !p.startsWith("node_modules/"))]) {
      const text = Buffer.from(bytes).toString("utf8").toLowerCase();
      for (const word of forbidden) assert.ok(!new RegExp(`\\b${word.toLowerCase()}\\b`).test(text), `${path} names ${word}`);
    }
  });
});

describe("registration in a fresh host", () => {
  const payload = (name) => join(host, "node_modules", name, "payload");

  it("refuses kaal-slack while kaal-communication is absent, writing nothing", async () => {
    const before = tree(engine);
    const r = await fails(kaal, ["register", "extension", "kaal-slack", payload("kaal-slack")], host);
    assert.match(r.stderr, /Slack-Transport\.md is not admitted: type Transport \(\w+\) resolves to no Node/);
    assert.deepEqual(tree(engine), before);
  });

  it("admits kaal-slack once kaal-communication is registered", async () => {
    assert.match(await run(kaal, ["register", "skill", COMMUNICATION, payload(COMMUNICATION)], host), /^registered skill kaal-communication/);
    assert.match(await run(kaal, ["register", "extension", "kaal-slack", payload("kaal-slack")], host), /^registered extension kaal-slack/);
    const listed = (await run(kaal, ["list"], host)).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(
      listed.map(([kind, , name]) => `${kind} ${name}`),
      ["skill Communication", "extension Slack"],
    );
    assert.match(await run(kaal, ["verify"], host), /ok: 9 Nodes admitted/);
  });
});
