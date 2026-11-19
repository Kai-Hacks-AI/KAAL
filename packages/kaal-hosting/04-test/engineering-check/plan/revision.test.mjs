// hosting/C110 planned outer tests: reading the files of a revision, placement and guidance (hosting/A38, hosting/F84;
// hosting/T277 and hosting/T278). Immutable to CHECK. They reach Hosting through its build by path, never through the
// package name, and read the package's sources, which do not ship.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SCRIPTS = join(PACKAGE, "dist/skills/kaal-hosting/scripts");
const load = () => import(pathToFileURL(join(SCRIPTS, "index.js")).href);

it("hosting/T277: readRevision and revision are exported from the main entry, the command is built, declared in bin and in the Architecture's interface table, and the three error codes join HostingError's", async () => {
    const h = await load();
    assert.equal(typeof h.readRevision, "function", "readRevision is not exported from the main entry");
    assert.equal(typeof h.revision, "function", "revision is not exported from the main entry");
    assert.ok(existsSync(join(PACKAGE, "05-src/skills/kaal-hosting/scripts/revision.ts")), "revision.ts is absent");
    assert.ok(existsSync(join(SCRIPTS, "revision-cli.mjs")), "the command is not built into dist");
    const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.equal(manifest.bin?.["kaal-hosting-revision"], "dist/skills/kaal-hosting/scripts/revision-cli.mjs", "the command is not declared in bin");
    const architecture = readFileSync(join(PACKAGE, "03-architecture/architecture.md"), "utf8");
    const table = /<!-- kaal-hosting:interface -->([\s\S]*?)<!-- \/kaal-hosting:interface -->/.exec(architecture)?.[1] ?? "";
    assert.match(table, /\| bin \| `kaal-hosting-revision` \| `dist\/skills\/kaal-hosting\/scripts\/revision-cli\.mjs` \| delivered \|/, "the interface table does not declare the command");
    assert.match(architecture, /\*\*hosting\/A38\*\*/, "hosting/A38 is absent");
    const source = readFileSync(join(PACKAGE, "05-src/skills/kaal-hosting/scripts/index.ts"), "utf8");
    for (const code of ["REVISION_NOT_FOUND", "REVISION_UNREADABLE", "REVISION_ENTRY"]) assert.ok(source.includes(`"${code}"`), `${code} is not a HostingError code`);
});

it("hosting/T278: the Skill, its operation guide, the shipped Agent instructions, the engineering rules and the README name readRevision and the command, each where it belongs", async () => {
    const text = (path) => readFileSync(join(PACKAGE, path), "utf8");
    const skill = text("05-src/skills/kaal-hosting/SKILL.md");
    assert.match(skill, /readRevision/, "SKILL.md does not name readRevision");
    assert.match(skill, /kaal-hosting-revision/, "SKILL.md does not name the command");
    assert.match(skill, /REVISION_NOT_FOUND[\s\S]*REVISION_UNREADABLE|REVISION_UNREADABLE[\s\S]*REVISION_NOT_FOUND/, "SKILL.md does not keep the two outcomes apart");
    const operations = text("05-src/skills/kaal-hosting/references/operations.md");
    assert.match(operations, /^\| Read the files of a Git revision \| `readRevision\(/m, "the operation guide has no row for readRevision");
    const agent = text("05-src/AGENTS.md");
    assert.match(agent, /readRevision/);
    assert.match(agent, /kaal-hosting-revision/);
    const engineering = text("AGENTS.md");
    assert.match(engineering, /one implementation/);
    assert.match(engineering, /revision\.ts/);
    const readme = text("README.md");
    assert.match(readme, /`readRevision`/);
    assert.match(readme, /`revision`/);
});
