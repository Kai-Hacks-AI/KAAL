// hosting/T173 to hosting/T175: the runtime-dependency clauses of hosting/T21, hosting/T83 and hosting/T133,
// superseded under the Owner's ruling of 5 November 2026 (hosting/D8: `couplings` parses sources with `typescript`).
//
// The original Cases stay byte for byte as they were, in release.test.mjs, release-record.test.mjs and
// directory-listing.test.mjs. They name four runtime dependencies, so `npm run test:publisher` skips them by name
// (`--test-skip-pattern`) and these Cases carry the same assertions with `typescript` 5.9.3 as the fifth.
// 00-changes/defect-corrections/d8-fix-record.md lists the old and the new wording side by side.
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import * as hosting from "../../../dist/skills/kaal-hosting/scripts/index.js";
import { PACKAGE } from "../../package-check/verify.mjs";

const NAME = "@kaihacksai/kaal-hosting";
const pkg = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const FIVE = ["cross-spawn", "es-module-lexer", "graceful-fs", "proper-lockfile", "typescript"];

describe("hosting dependency successors", () => {
  it("hosting/T173 [hosting/F15] supersedes hosting/T21: the package is @kaihacksai/kaal-hosting 0.0.1, public, with its repository directory, engines, license and five runtime dependencies, and a README that names it and how to install it", () => {
    const p = pkg();
    assert.equal(p.name, NAME);
    assert.equal(p.version, "0.0.1");
    assert.deepEqual(p.publishConfig, { access: "public" });
    assert.deepEqual(p.repository, { type: "git", url: "git+https://github.com/Kai-Hacks-AI/KAAL.git", directory: "packages/kaal-hosting" });
    assert.deepEqual(p.engines, { node: ">=24" });
    assert.equal(p.license, "MIT");
    assert.deepEqual(Object.keys(p.dependencies).sort(), FIVE);
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    assert.equal(readme.split("\n")[0], `# ${NAME}`);
    assert.match(readme, new RegExp(`npm install ${NAME}`));
  });

  it("hosting/T174 [hosting/F15] supersedes hosting/T83: the package declares the exact runtime versions, typescript 5.9.3 among them", () => {
    assert.deepEqual(pkg().dependencies, {
      "cross-spawn": "7.0.6", "es-module-lexer": "3.0.3",
      "graceful-fs": "4.2.11", "proper-lockfile": "4.1.2", "typescript": "5.9.3",
    });
  });

  it("hosting/T175 [hosting/F74, hosting/N10] supersedes hosting/T133: list and scratch are exported and declared, typescript is the only runtime dependency added since, node:test is not loaded", () => {
    assert.equal(typeof hosting.list, "function");
    assert.equal(typeof hosting.scratch, "function");
    const contract = readFileSync(join(PACKAGE, "00-changes", "interface", "architecture.md"), "utf8");
    assert.match(contract, /`list`/, "the interface declares list");
    assert.match(contract, /`scratch`/, "the interface declares scratch");
    assert.deepEqual(Object.keys(pkg().dependencies).sort(), FIVE);
    assert.equal(statSync(join(PACKAGE, "dist/skills/kaal-hosting/scripts", "index.js")).isFile(), true);
    assert.ok(!/node:test/.test(readFileSync(join(PACKAGE, "dist/skills/kaal-hosting/scripts", "index.js"), "utf8")), "the main entry does not load node:test");
  });
});
