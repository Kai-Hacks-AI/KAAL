// requirements/C17: the planned tests of "Requirements in the flat layout", packages/kaal-requirements/plan/port/testing.md.
// They are immutable to DO. They run with `node --test packages/kaal-requirements/test/plan/port.test.mjs`.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));
const PACKAGE = join(ROOT, "packages", "kaal-requirements");
const read = (path) => {
  assert.ok(existsSync(path), `blocked before behavioural assertion: ${path} does not exist`);
  return readFileSync(path);
};
const json = (path) => JSON.parse(read(path).toString("utf8"));
const OWNER_ID = "b29196303a51090f066f5939ddc48dce4b72b9426f448e327bc983ec078ec94d";
const DIGESTS = {
  "Requirement.md": "b226b2cedcd899c3ef98fceb4afcabe0a71498c24c6e3c4a4e53794399d01c32",
  "Requirements.md": OWNER_ID,
  "Serves.md": "74e2287ee56477c340a0a34477719a0214800e3442dc852d07ebd8dabfdcf298",
};
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

describe("kaal-requirements: in the flat layout", () => {
  it("requirements/T400: the package is packages/kaal-requirements, named kaal-requirements [requirements/F30]", () => {
    assert.equal(json(join(PACKAGE, "package.json")).name, "kaal-requirements");
  });

  it("requirements/T401: the root package.json lists the package as a workspace [requirements/F30]", () => {
    assert.ok(json(join(ROOT, "package.json")).workspaces.includes("packages/kaal-requirements"));
  });

  it("requirements/T402: ownership.kaal.json claims packages/kaal-requirements/ for the same owner id [requirements/F32]", () => {
    const claim = json(join(PACKAGE, "ownership.kaal.json"));
    assert.deepEqual(claim.paths, ["packages/kaal-requirements/"]);
    assert.equal(claim.owner.id, OWNER_ID);
  });

  it("requirements/T403: the three Nodes have the bytes the old contract catalogued [requirements/F31]", () => {
    for (const [name, digest] of Object.entries(DIGESTS)) {
      assert.equal(createHash("sha256").update(read(join(PACKAGE, "capability", name))).digest("hex"), digest, name);
    }
  });

  it("requirements/T404: no file under test/ imports kaal-hosting unscoped [requirements/F33]", () => {
    const dir = join(PACKAGE, "test");
    assert.ok(existsSync(join(dir, "requirements.test.mjs")), "blocked before behavioural assertion: the package's tests have not moved");
    for (const file of walk(dir).filter((f) => /\.m?[jt]s$/.test(f))) {
      assert.doesNotMatch(readFileSync(file, "utf8"), /from ["']kaal-hosting["']/, file);
    }
  });
});
