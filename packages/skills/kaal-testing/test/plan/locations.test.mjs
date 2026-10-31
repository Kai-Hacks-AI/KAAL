// testing/C43 planned outer tests: test locations by purpose and owner. test/embed/ holds a capability's own
// shipped cases; test/engineer/ holds Engineering's lane scenarios; there is no test/external/ convention.
// Immutable to DO and CHECK; testing/C44 turns them GREEN. Each title names the contracts it checks
// (plan/locations/*.md). They use kaal-testing's public interface only, on fixture workspaces in a fresh
// temporary directory. A location is not a Testing kind: Case, Suite, Plan and Run are unchanged.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { discover } from "kaal-testing/acceptance";

const root = () => mkdtempSync(join(tmpdir(), "kaal-testing-locations-"));
/** A workspace at `<dir>/<name>` holding `files`, each a path relative to the workspace, and the given package.json. */
function workspace(dir, name, files, manifest = { name }) {
  const location = join(dir, name);
  for (const f of files) {
    mkdirSync(join(location, f, ".."), { recursive: true });
    writeFileSync(join(location, f), "");
  }
  writeFileSync(join(location, "package.json"), JSON.stringify(manifest));
  return { name, location };
}
const at = (w, f) => ({ workspace: w.name, path: join(w.location, f) });

describe("Test locations by purpose and owner (testing/C43)", () => {
  it("testing/T88 [testing/F76, testing/N16]: lane scenarios are discovered in test/engineer/, never in test/embed/ or test/external/, as { workspace, path } sorted by path", async () => {
    const dir = root();
    const both = workspace(dir, "both", ["test/engineer/b.test.mjs", "test/engineer/a.test.mjs", "test/embed/one.test.mjs", "test/engineer/nested/x.test.mjs", "test/engineer/notes.mjs", "test/external/e.test.mjs"]);
    const embedded = workspace(dir, "embedded", ["test/embed/one.test.mjs", "test/embed/two.test.mjs"]);
    const none = workspace(dir, "none", ["lib/a.mjs"]);
    assert.deepEqual(await discover([embedded, both, none]), [at(both, "test/engineer/a.test.mjs"), at(both, "test/engineer/b.test.mjs")]);
  });

  it("testing/T89 [testing/F76]: the location alone decides a scenario's role; package.json files never does", async () => {
    for (const files of [undefined, [], ["lib"], ["test"], ["test/engineer"], ["test/embed"], ["test/acceptance"]]) {
      const dir = root();
      const w = workspace(dir, "w", ["test/engineer/a.test.mjs", "test/embed/one.test.mjs"], files === undefined ? { name: "w" } : { name: "w", files });
      assert.deepEqual(await discover([w]), [at(w, "test/engineer/a.test.mjs")], `files ${JSON.stringify(files)} changes nothing`);
    }
  });

  it("testing/T90 [testing/F77]: during the migration, test/acceptance/ is still read as the lane's, beside test/engineer/, so no lane scenario is lost before its owner moves it", async () => {
    const dir = root();
    const legacy = workspace(dir, "legacy", ["test/acceptance/old.test.mjs"]);
    const mixed = workspace(dir, "mixed", ["test/acceptance/old.test.mjs", "test/engineer/new.test.mjs", "test/embed/one.test.mjs"]);
    assert.deepEqual(await discover([mixed, legacy]), [at(legacy, "test/acceptance/old.test.mjs"), at(mixed, "test/acceptance/old.test.mjs"), at(mixed, "test/engineer/new.test.mjs")]);
  });

  it("testing/T91 [testing/F78]: the README states the locations: test/embed/ for a capability's own cases, run by its own npm test against the installed package; test/engineer/ for Engineering's lane scenarios, which install the packed tarballs; and no test/external/ convention", () => {
    const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
    const section = readme.slice(readme.indexOf("## Acceptance runs"), readme.indexOf("## Non-blank text lines"));
    assert.match(section, /`test\/embed\/`[^.]*own `npm test`/, "test/embed/ holds the capability's own cases, run by its own npm test");
    assert.match(section, /`test\/engineer\/`[^.]*Engineering/, "test/engineer/ holds Engineering's lane scenarios");
    assert.match(section, /`install\(\)`/, "which install the packed tarballs");
    assert.match(section, /no `test\/external\/`/, "there is no test/external/ convention");
    assert.match(section, /not (a |new )?(Testing )?kinds?/i, "locations are not Testing kinds");
  });
});
