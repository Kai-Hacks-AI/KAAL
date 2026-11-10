// release-management/T1 to T3 (F3, version Package): the pure judgments of version.mjs, and T1 through readiness.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readiness } from "./release.mjs";
import { highestPublished, tagAfterRelease, tagPreflight, versionFindings, versionRecorded } from "./version.mjs";

const NAME = "@kaihacksai/kaal-demo";
const C1 = "1".repeat(40);
const C2 = "2".repeat(40);
const manifest = (version) => ({
  name: NAME, version, license: "Apache-2.0", engines: { node: ">=24" }, files: ["dist"], publishConfig: { access: "public" },
  repository: { type: "git", url: "git+https://github.com/Kai-Hacks-AI/KAAL.git", directory: "packages/kaal-demo" },
});
const ready = (version, published) => readiness({ manifest: manifest(version), directory: "packages/kaal-demo", registry: { [NAME]: published } });

describe("release-management/T1: a version lower than the highest published one is refused by readiness", () => {
  it("refuses a lower version and names the highest", () => {
    const r = ready("0.0.3", ["0.0.2", "0.0.4", "0.0.1"]);
    assert.ok(r.findings.some((f) => /not greater than the highest published version 0\.0\.4/.test(f)), r.findings.join("\n"));
  });
  it("orders by semver, not by text (0.0.10 is greater than 0.0.9)", () => {
    assert.equal(highestPublished(["0.0.9", "0.0.10", "0.0.2"]), "0.0.10");
    assert.deepEqual(ready("0.0.11", ["0.0.9", "0.0.10"]).findings, []);
    assert.ok(ready("0.0.10", ["0.0.2", "0.0.10"]).findings.some((f) => /already on the registry/.test(f)));
  });
  it("accepts a greater version, and a first publication with nothing published", () => {
    assert.deepEqual(ready("0.0.5", ["0.0.4"]).findings, []);
    assert.deepEqual(ready("0.0.1", null).findings, []);
  });
  it("a prerelease below a published stable is refused like any lower version, and a prerelease is refused until the policy is decided", () => {
    assert.ok(versionFindings({ name: NAME, version: "0.0.4-rc.1", published: ["0.0.4"] }).some((f) => /not greater/.test(f)));
    assert.ok(versionFindings({ name: NAME, version: "0.1.0-rc.1", published: ["0.0.4"] }).some((f) => /prerelease/.test(f)));
  });
});

describe("release-management/T2: a tag names the version and commit", () => {
  const base = { name: NAME, version: "0.0.1", commit: C1 };
  it("preflight passes when no tag exists and writes nothing (asks to create)", () => {
    const r = tagPreflight({ ...base, tags: {}, published: {} });
    assert.deepEqual([r.findings, r.create, r.retry], [[], true, false]);
  });
  it("fails when the tag names another commit", () => {
    assert.ok(tagPreflight({ ...base, tags: { [`${NAME}@0.0.1`]: C2 }, published: {} }).findings.length > 0);
  });
  it("a tag at the right commit for a version not yet published is a retry, not a creation", () => {
    const r = tagPreflight({ ...base, tags: { [`${NAME}@0.0.1`]: C1 }, published: {} });
    assert.deepEqual([r.findings, r.create, r.retry], [[], false, true]);
  });
  it("fails when the version is on the registry from another commit, tag or none", () => {
    assert.ok(tagPreflight({ ...base, tags: {}, published: { "0.0.1": C2 } }).findings.length > 0);
  });
  it("missing facts are no evidence: an absent or malformed tags/published is a non-passing verdict, an empty one is a successful query", () => {
    for (const bad of [undefined, null, [], "x"]) {
      const a = tagPreflight({ ...base, tags: bad, published: {} });
      assert.deepEqual([a.create, a.retry], [false, false]);
      assert.ok(a.findings.some((f) => /tags was not gathered/.test(f)));
      assert.ok(tagPreflight({ ...base, tags: {}, published: bad }).findings.some((f) => /published was not gathered/.test(f)));
      assert.ok(tagAfterRelease({ ...base, tags: bad, published: { "0.0.1": C1 } }).findings.length > 0);
    }
    assert.equal(tagPreflight({ ...base, tags: {}, published: {} }).create, true, "an empty, successfully queried collection permits creation");
  });
  it("retry claims commit equality only: it names no annotation or object identity", () => {
    const r = tagPreflight({ ...base, tags: { [`${NAME}@0.0.1`]: C1 }, published: {} });
    assert.equal(r.retry, true);
    assert.ok(!("object" in r) && !("annotation" in r), "the tag writer, not this function, verifies the annotated tag object before a no-write retry");
  });
  it("after publication the tag must still name exactly the released commit and the version must be on the registry", () => {
    assert.deepEqual(tagAfterRelease({ ...base, tags: { [`${NAME}@0.0.1`]: C1 }, published: { "0.0.1": C1 } }).findings, []);
    assert.ok(tagAfterRelease({ ...base, tags: { [`${NAME}@0.0.1`]: C2 }, published: { "0.0.1": C1 } }).findings.length > 0);
    assert.ok(tagAfterRelease({ ...base, tags: {}, published: { "0.0.1": C1 } }).findings.length > 0);
    assert.ok(tagAfterRelease({ ...base, tags: { [`${NAME}@0.0.1`]: C1 }, published: {} }).findings.length > 0);
  });
});

describe("release-management/T3: the version in package.json is the one a recorded Change set", () => {
  const input = { name: NAME, version: "0.0.2", previous: "0.0.1" };
  it("an unchanged version needs no record", () => assert.deepEqual(versionRecorded({ ...input, version: "0.0.1", records: [] }).findings, []));
  it("records that were not read are no evidence", () => {
    for (const bad of [undefined, null, "x"]) assert.ok(versionRecorded({ ...input, records: bad }).findings.length > 0);
  });
  it("a changed version with no record naming it is refused", () => assert.ok(versionRecorded({ ...input, records: ["# C\n\nNothing here.\n"] }).findings.length > 0));
  it("a Version: member naming it, read with the parser, records it", () => {
    assert.deepEqual(versionRecorded({ ...input, records: [`# C\n\n- **Version:** ${NAME}@0.0.2\n`.replace("**Version:**", "Version:")] }).findings, []);
    assert.deepEqual(versionRecorded({ ...input, records: [`# C\n\nVersion: \`${NAME}@0.0.2\`\n`] }).findings, []);
  });
  it("prose that merely mentions the version, or another version, does not record it", () => {
    assert.ok(versionRecorded({ ...input, records: [`# C\n\nWe discussed ${NAME}@0.0.2 today.\n`] }).findings.length > 0);
    assert.ok(versionRecorded({ ...input, records: [`# C\n\nVersion: ${NAME}@0.0.3\n`] }).findings.length > 0);
  });
});
