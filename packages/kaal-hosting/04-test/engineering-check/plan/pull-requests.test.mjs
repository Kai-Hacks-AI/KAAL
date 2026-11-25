// hosting/C111 planned outer tests: reading the open pull requests, placement and guidance (hosting/A39, hosting/F88, hosting/F89;
// hosting/T294). Immutable to CHECK. They reach Hosting through its build by path, never through the package name, and read the
// package's sources, which do not ship.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SCRIPTS = join(PACKAGE, "dist/skills/kaal-hosting/scripts");
const SOURCES = join(PACKAGE, "05-src/skills/kaal-hosting/scripts/github");
const text = (...p) => readFileSync(join(PACKAGE, ...p), "utf8");

it("hosting/T294: readPullRequests is exported from the main entry; each transport is its own small module and the selection step holds no route; the command is built, declared in bin and in the interface table; the Skill, Agent text and README name them", async () => {
  const h = await import(pathToFileURL(join(SCRIPTS, "index.js")).href);
  assert.equal(typeof h.readPullRequests, "function", "readPullRequests is not exported from the main entry");
  for (const file of ["gh-graphql.ts", "gh-rest.ts", "cloud-threads.ts", "gh.ts", "pull-requests.ts", "pull-requests-command.ts", "pull-requests-cli.mjs"]) assert.ok(existsSync(join(SOURCES, file)), `${file} is absent`);
  const selection = readFileSync(join(SOURCES, "pull-requests.ts"), "utf8");
  assert.ok(!/"graphql"|\/ccr\/|repos\/|query\s*\(|\bprocess\.(platform|env)\b/.test(selection.replace(/\/\*\*[\s\S]*?\*\//g, "")), "the selection step names a route or tests the environment");
  assert.ok(existsSync(join(SCRIPTS, "github/pull-requests-cli.mjs")), "the command is not built into dist");
  const manifest = JSON.parse(text("package.json"));
  assert.equal(manifest.bin["kaal-hosting-pulls"], "dist/skills/kaal-hosting/scripts/github/pull-requests-cli.mjs");
  for (const file of ["03-architecture/architecture.md", "00-changes/interface/architecture.md"]) assert.match(text(file), /\| bin \| `kaal-hosting-pulls` \| `dist\/skills\/kaal-hosting\/scripts\/github\/pull-requests-cli\.mjs` \| delivered \|/, `${file} has no interface row`);
  assert.match(text("05-src/skills/kaal-hosting/scripts/index.ts"), /"PULLS_UNREADABLE"/, "HostingError has no PULLS_UNREADABLE");
  for (const file of ["05-src/skills/kaal-hosting/SKILL.md", "05-src/skills/kaal-hosting/references/operations.md", "05-src/AGENTS.md"]) assert.match(text(file), /readPullRequests|kaal-hosting-pulls/, `${file} does not name them`);
  assert.match(text("05-src/skills/kaal-hosting/SKILL.md"), /kaal-hosting-pulls/);
  assert.match(text("README.md"), /readPullRequests/, "the README entry list does not name readPullRequests");
  assert.match(text("AGENTS.md"), /pull-requests\.ts/, "the engineering rules do not say library and command share one implementation");
});
