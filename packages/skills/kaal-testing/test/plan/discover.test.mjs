// testing/C43 planned outer tests: discover() leaves out the acceptance cases a package ships as its own.
// Immutable to DO and CHECK; testing/C44 turns them GREEN. Each title names the contracts it checks
// (plan/discover/*.md). They use kaal-testing's public interface only, on fixture workspaces in a fresh
// temporary directory.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { discover } from "kaal-testing/acceptance";

const root = () => mkdtempSync(join(tmpdir(), "kaal-testing-discover-"));
/** A workspace at `<dir>/<name>` with one scenario, `one.test.mjs`, and the given package.json text (none if undefined). */
function workspace(dir, name, manifest) {
  const location = join(dir, name);
  mkdirSync(join(location, "test", "acceptance"), { recursive: true });
  writeFileSync(join(location, "test", "acceptance", "one.test.mjs"), "");
  if (manifest !== undefined) writeFileSync(join(location, "package.json"), typeof manifest === "string" ? manifest : JSON.stringify(manifest));
  return { name, location };
}
const scenario = (w) => ({ workspace: w.name, path: join(w.location, "test", "acceptance", "one.test.mjs") });

describe("Acceptance discovery leaves out shipped product cases (testing/C43)", () => {
  it("testing/T88 [testing/F76, testing/N16]: a workspace whose package.json files ships test/acceptance has no lane scenario; one beside it that does not is discovered as before", async () => {
    for (const entry of ["test/acceptance", "test/acceptance/", "test/acceptance/**", "./test/acceptance", "test", "test/", "test/**"]) {
      const dir = root();
      const product = workspace(dir, "product", { name: "product", files: ["lib", entry] });
      const lane = workspace(dir, "lane", { name: "lane", files: ["lib"] });
      assert.deepEqual(await discover([product, lane]), [scenario(lane)], `files entry ${JSON.stringify(entry)} ships the cases, so they are the product's, not the lane's`);
    }
  });

  it("testing/T89 [testing/F77]: a workspace whose files does not ship test/acceptance, or whose package.json is absent, unreadable or has no files list, keeps its scenarios as lane scenarios", async () => {
    const manifests = [
      undefined,
      "{",
      "null",
      { name: "x" },
      { name: "x", files: "test" },
      { name: "x", files: [] },
      { name: "x", files: ["lib", "test/unit", "test/acceptance-old", "tests", "!test/acceptance", "test/acceptance/one.test.mjs", 42, null, ["test"], { path: "test" }] },
    ];
    for (const manifest of manifests) {
      const dir = root();
      const w = workspace(dir, "w", manifest);
      assert.deepEqual(await discover([w]), [scenario(w)], `${JSON.stringify(manifest)}: the scenarios stay lane scenarios`);
    }
  });

  it("testing/T90 [testing/F78]: the README's acceptance section states that a workspace shipping test/acceptance in its files has no lane scenarios, because its own npm test runs those cases", () => {
    const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
    const section = readme.slice(readme.indexOf("## Acceptance runs"), readme.indexOf("## Non-blank text lines"));
    assert.match(section, /`files`/, "it names package.json files");
    assert.match(section, /ships?[^.]*`test\/acceptance\/?`[^.]*(left out|not (a )?lane|no lane)/i, "it says a shipped test/acceptance is left out of the lane");
    assert.match(section, /own `npm test`/, "and that the package's own npm test runs them");
  });
});
