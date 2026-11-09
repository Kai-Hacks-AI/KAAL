// RED Case file for plan/pin-behind (testing/C57, provisional). Hand-run: node --test test/plan/pin-behind.red.mjs
// T141 and T142 are RED on kaal/testing until the DO; T143 to T147 are controls that stay GREEN throughout.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findings } from "@kaihacksai/kaal-testing/acceptance";

const NAME = "@kaihacksai/kaal-foundation";
const manifest = (extra = {}) => ({ [NAME]: { tarball: "/run/foundation.tgz", sha256: "a".repeat(64), integrity: "sha512-packed", version: "0.0.2", ...extra } });
const run = (holds, m = manifest()) =>
  findings({ manifest: m, scenarios: ["/s.test.mjs"], records: [{ scenario: "/s.test.mjs", host: "/h", consumed: { [NAME]: "a".repeat(64) } }], holds: { "/h": holds } });
const top = { [`node_modules/${NAME}`]: { version: "0.0.2", integrity: "sha512-packed" } };
const nested = (version, integrity = "sha512-registry", consumer = "kaal-core") => ({ ...top, [`node_modules/${consumer}/node_modules/${NAME}`]: { version, integrity, resolved: "https://registry.npmjs.org/x.tgz" } });
const fails = (found) => found.filter((f) => f.kind === "verified failure");

describe("pin-behind in the acceptance evidence", () => {
  it("testing/T141 [testing/F118]: a nested older copy gives pin-behind naming consumer, package, held and packed version", () => {
    const found = run(nested("0.0.1"));
    const pin = found.filter((f) => f.kind === "pin-behind");
    assert.equal(pin.length, 1);
    assert.deepEqual({ consumer: pin[0].consumer, package: pin[0].package, held: pin[0].held, packed: pin[0].packed, host: pin[0].host, subject: pin[0].subject }, { consumer: "kaal-core", package: NAME, held: "0.0.1", packed: "0.0.2", host: "/h", subject: "/s.test.mjs" });
    assert.deepEqual(fails(found), []);
  });
  it("testing/T142 [testing/F118, testing/F120]: nested older copies under several consumers are all pin-behind and none is a verified failure", () => {
    const found = run({ ...nested("0.0.1", "sha512-r", "kaal-core"), ...nested("0.0.1", "sha512-r", "kaal-change") });
    assert.deepEqual(found.filter((f) => f.kind === "pin-behind").map((f) => f.consumer).sort(), ["kaal-change", "kaal-core"]);
    assert.deepEqual(fails(found), []);
  });
  it("testing/T143 [testing/F119]: a top-level held copy with other bytes is a verified failure", () => {
    assert.equal(fails(run({ [`node_modules/${NAME}`]: { version: "0.0.1", integrity: "sha512-registry" } })).length, 1);
  });
  it("testing/T144 [testing/F119]: a nested copy of the same version with other bytes is a verified failure", () => {
    assert.equal(fails(run(nested("0.0.2"))).length, 1);
  });
  it("testing/T145 [testing/F119]: a nested copy of a newer version is a verified failure", () => {
    assert.equal(fails(run(nested("0.0.3"))).length, 1);
  });
  it("testing/T146 [testing/F119]: a nested older copy is a verified failure when a version is missing or not plain x.y.z", () => {
    assert.equal(fails(run(nested("0.0.1"), manifest({ version: undefined }))).length, 1);
    assert.equal(fails(run({ ...top, [`node_modules/kaal-core/node_modules/${NAME}`]: { integrity: "sha512-registry" } })).length, 1);
    assert.equal(fails(run(nested("0.0.1-rc.1"))).length, 1);
  });
  it("testing/T147 [testing/F121]: a held copy equal to the packed integrity gives neither a failure nor a pin-behind", () => {
    const found = run(nested("0.0.1", "sha512-packed"));
    assert.deepEqual(fails(found), []);
    assert.deepEqual(found.filter((f) => f.kind === "pin-behind"), []);
  });
});
