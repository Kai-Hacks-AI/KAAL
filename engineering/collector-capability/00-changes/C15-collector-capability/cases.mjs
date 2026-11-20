// engineering/C15 Cases: shared fixtures and the twelve Case bodies. Each T<n>.test.mjs next to this
// file is the Case file the engineering Case runner loads (engineering/cases/cases.test.mjs).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectorCapability, report } from "../../collector-capability.mjs";
import { readEvidence } from "../../evidence.mjs";

// Verdict fixtures. Evidence shape (read from main, never the head):
//   registrations: the scope claims of Core's assemble() over main's Registrations, [{ scope, holder }], and
//                  `collisions`; capabilities: the names of the admitted KAAL Capability Nodes.
const capabilities = new Set(["Core", "Change", "Guard", "Testing"]);
const evidence = (claims, extra = {}) => ({ registrations: { claims, collisions: [] }, capabilities, ...extra });
const claims = [{ scope: "core", holder: "Core" }, { scope: "testing", holder: "Testing" }, { scope: "release", holder: "Release" }];

// Evidence-reader fixtures: Core's own payload plus one Capability and its Registration, from files alone.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const PAYLOAD = join(ROOT, "packages/kaal-core/payload/core");
const core = readdirSync(PAYLOAD).map((f) => ({ path: `core/${f}`, bytes: readFileSync(join(PAYLOAD, f)) }));
const capabilityId = createHash("sha256").update(readFileSync(join(PAYLOAD, "KAAL-Capability.md"))).digest("hex");
const node = (name) => Buffer.from(`---\nname: ${name}\ntype:\n  name: KAAL Capability\n  id: ${capabilityId}\n---\n\n# ${name}\n`);
const registration = (holder, scope) => Buffer.from(`---\ntype: Core/Registration\nholder: ${holder}\nscope: ${scope}\n---\n`);
const tree = (extra) => [...core, { path: "atlas/Atlas.md", bytes: node("Atlas") }, ...extra];

export const cases = {
  T268: {
    title: "a segment that is a registered scope held by an admitted Capability passes",
    run: () => {
    assert.equal(collectorCapability("kaal/core/x", evidence(claims)).verdict, "PASS");
    },
  },
  T269: {
    title: "a registered scope whose holder is not an admitted Capability (a Skill) fails",
    run: () => {
    assert.equal(collectorCapability("kaal/release/x", evidence(claims)).verdict, "FAIL");
    },
  },
  T270: {
    title: "an admitted Capability Node name without a registered scope never passes, whatever its spelling",
    run: () => {
    assert.notEqual(collectorCapability("kaal/guard/x", evidence(claims)).verdict, "PASS");
    assert.equal(collectorCapability("kaal/guard/x", evidence(claims)).verdict, "FAIL");
    },
  },
  T271: {
    title: "absent Registration evidence gives UNKNOWN, which never passes",
    run: () => {
    assert.equal(collectorCapability("kaal/core/x", { registrations: null, capabilities }).verdict, "UNKNOWN");
    assert.equal(collectorCapability("kaal/core/x", evidence([])).verdict, "UNKNOWN");
    assert.equal(collectorCapability("kaal/core/x", { registrations: { claims, collisions: [] }, capabilities: null }).verdict, "UNKNOWN");
    },
  },
  T272: {
    title: "a Registration or Capability Node only in the pull request head does not count",
    run: () => {
    assert.equal(collectorCapability("kaal/atlas/x", evidence(claims, { head: { claims: [{ scope: "atlas", holder: "Atlas" }], capabilities: new Set(["Atlas"]) } })).verdict, "FAIL");
    },
  },
  T273: {
    title: "bootstrap: a new capability's collector passes only once its Registration and Node are on main",
    run: () => {
    assert.equal(collectorCapability("kaal/atlas/x", evidence(claims)).verdict, "FAIL");
    const later = [...claims, { scope: "atlas", holder: "Atlas" }];
    assert.equal(collectorCapability("kaal/atlas/x", { registrations: { claims: later, collisions: [] }, capabilities: new Set([...capabilities, "Atlas"]) }).verdict, "PASS");
    assert.equal(collectorCapability("kaal/core/register-atlas", evidence(claims)).verdict, "PASS");
    },
  },
  T274: {
    title: "legacy, flat and non-Node refs are migration findings, never authorized, and change no exit status",
    run: () => {
    const r = report(["kaal/core", "kaal/old/core", "kaal/engineering/x", "kaal/architecture/classify"], evidence(claims));
    assert.equal(r.findings.length, 4);
    assert.ok(r.findings.every((f) => f.authorized === false));
    assert.equal(r.exitStatus, 0);
    },
  },
  T275: {
    title: "a scope held by a Skill, not a Capability, fails even when registered",
    run: () => {
    assert.equal(collectorCapability("kaal/release/x", evidence([{ scope: "release", holder: "Release" }])).verdict, "FAIL");
    },
  },
  T276: {
    title: "a scope Core reports as claimed by several holders gives UNKNOWN, never PASS",
    run: () => {
    const e = { registrations: { claims: [{ scope: "core", holder: "Core" }, { scope: "core", holder: "Change" }], collisions: ["core"] }, capabilities };
    assert.equal(collectorCapability("kaal/core/x", e).verdict, "UNKNOWN");
    },
  },
  T277: {
    title: "a Registration of a scope held by an admitted Capability gives PASS for that segment",
    run: () => {
    const evidence = readEvidence(tree([{ path: "atlas/registration.md", bytes: registration("Atlas", "atlas") }]));
    assert.deepEqual(evidence.registrations.claims, [{ scope: "atlas", holder: "Atlas" }]);
    assert.ok(evidence.capabilities.has("Atlas"));
    assert.equal(collectorCapability("kaal/atlas/x", evidence).verdict, "PASS");
    assert.equal(collectorCapability("kaal/other/x", evidence).verdict, "FAIL");
    },
  },
  T278: {
    title: "no Registration in the tree, or an invalid one, gives UNKNOWN, never PASS",
    run: () => {
    assert.equal(collectorCapability("kaal/atlas/x", readEvidence(tree([]))).verdict, "UNKNOWN");
    const invalid = readEvidence(tree([{ path: "atlas/registration.md", bytes: Buffer.from("---\ntype: Core/Registration\nholder: Atlas\n---\n") }]));
    assert.equal(invalid.registrations, null);
    assert.equal(collectorCapability("kaal/atlas/x", invalid).verdict, "UNKNOWN");
    },
  },
  T279: {
    title: "two Registrations of one scope are ambiguous: UNKNOWN, never PASS",
    run: () => {
    const evidence = readEvidence(
      tree([
        { path: "atlas/registration.md", bytes: registration("Atlas", "atlas") },
        { path: "other/registration.md", bytes: registration("Other", "atlas") },
      ]),
    );
    assert.deepEqual(evidence.registrations.collisions, ["atlas"]);
    assert.equal(collectorCapability("kaal/atlas/x", evidence).verdict, "UNKNOWN");
    },
  },
};
