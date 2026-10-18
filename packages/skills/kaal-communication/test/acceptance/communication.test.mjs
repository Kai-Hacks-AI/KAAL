// Acceptance: kaal-communication, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-graph, kaal-hosting and kaal-communication from the
// tarballs the Acceptance lane packed into a fresh host of this scenario's own,
// through Testing's install(), and operates them there through the installed
// packages alone. kaal-graph is installed from its tarball because it is not
// published and Core depends on it.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { before, describe, it } from "node:test";
import { execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";

const COMMUNICATION = "kaal-communication";

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

before(async () => {
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  host = await install(["kaal-core", "kaal-graph", "kaal-hosting", COMMUNICATION]);
  installed = join(host, "node_modules", COMMUNICATION);
  kaal = join(host, "node_modules", ".bin", "kaal");
  await run(kaal, ["init"], host);
});

describe("the installed package", () => {
  it("holds exactly its intended contents", () => {
    assert.deepEqual(files(installed), [
      "LICENSE",
      "README.md",
      "package.json",
      "payload/CHAOS.md",
      "payload/Communication.md",
      "payload/Transport.md",
      "skills/kaal-communication/SKILL.md",
    ]);
  });

  it("depends at runtime on nothing", () => {
    const pkg = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
    for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) assert.deepEqual(Object.keys(pkg[field] ?? {}), [], field);
  });
});

describe("registration in a fresh host", () => {
  it("admits the Skill and its Definitions through Core alone", async () => {
    assert.match(await run(kaal, ["register", "skill", COMMUNICATION, join(installed, "payload")], host), /^registered skill kaal-communication/);
    const listed = (await run(kaal, ["list"], host)).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(
      listed.map(([kind, , name]) => `${kind} ${name}`),
      ["skill Communication"],
    );
    assert.match(await run(kaal, ["verify"], host), /^ok/);
  });
});
