// Record numbering under optimistic concurrency: assign, work, check on
// merge, fail on collision, rename and retry. The collector is modelled as
// the list of files at its tip; merging a pull request adds its files.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { checkClaim, nextRecordPath, recordOf } from "kaal-change/record";

const DAY = { capability: "change", date: "2026-10-19" };
const files = (record) => [`${record}README.md`, `${record}evidence.md`];

describe("the Change Record Definition on numbering", () => {
  const text = readFileSync(new URL("../capability/Change-Record.md", import.meta.url), "utf8");

  it("makes the number provisional until merge and leaves the gate to Branching", () => {
    assert.match(text, /The number is provisional until the Change is accepted into its collector/);
    assert.match(text, /A pull request closed without merging consumes no number\./);
    assert.match(text, /There is no allocator, lock or registry\./);
    assert.match(text, /The check runs at merge, fresh against the collector's tip, as Engineering's Branching gate/);
  });
});

describe("recordOf", () => {
  it("names the record a file lies in", () => {
    assert.equal(recordOf(".kaal/changes/change/26/10/19/01/notes/a.md").record, ".kaal/changes/change/26/10/19/01/");
    assert.ok(recordOf(".kaal/changes/change/26/10/19/1/a.md").finding);
    assert.ok(recordOf(".kaal/changes/change/26/10/19/01").finding);
    assert.ok(recordOf(".kaal/changes/change/26/10/19/01/").finding);
  });
});

describe("nextRecordPath", () => {
  it("is one past the day's highest number in the collector, per capability", () => {
    assert.equal(nextRecordPath(DAY, []), ".kaal/changes/change/26/10/19/01/");
    const collector = ["README.md", ...files(".kaal/changes/change/26/10/19/01/"), ...files(".kaal/changes/change/26/10/19/03/"), ...files(".kaal/changes/core/26/10/19/07/"), ...files(".kaal/changes/change/26/10/18/09/")];
    assert.equal(nextRecordPath(DAY, collector), ".kaal/changes/change/26/10/19/04/");
  });

  it("refuses a day whose 99 numbers are used", () => {
    assert.throws(() => nextRecordPath(DAY, files(".kaal/changes/change/26/10/19/99/")), /no record number left/);
  });
});

describe("checkClaim", () => {
  const base = ["README.md"];

  it("fails the second of two competing pull requests, and passes it after rename and retry", () => {
    const first = nextRecordPath(DAY, base);
    const a = files(first);
    const b = files(first);
    assert.deepEqual(checkClaim({ changed: a, collector: base }), { claimed: [first], findings: [] });
    const collector = [...base, ...a];

    const collision = checkClaim({ changed: b, collector });
    assert.equal(collision.findings.length, 1);
    assert.match(collision.findings[0], /^\.kaal\/changes\/change\/26\/10\/19\/01\/ is already taken in the collector: rename the folder to \.kaal\/changes\/change\/26\/10\/19\/02\//);

    const renamed = files(nextRecordPath(DAY, collector));
    assert.deepEqual(checkClaim({ changed: renamed, collector }), { claimed: [".kaal/changes/change/26/10/19/02/"], findings: [] });
    assert.equal(nextRecordPath(DAY, [...collector, ...renamed]), ".kaal/changes/change/26/10/19/03/");
  });

  it("still fails the second pull request after it is rebased onto the collector holding the first", () => {
    const first = nextRecordPath(DAY, base);
    const collector = [...base, ...files(first)];
    // Rebased, the second pull request's files at 01 now modify the first Change's record.
    const rebased = [`${first}README.md`, `${first}evidence.md`];
    assert.match(checkClaim({ changed: rebased, collector }).findings[0], /is already taken in the collector: rename the folder to \.kaal\/changes\/change\/26\/10\/19\/02\//);
  });

  it("lets a pull request closed without merging consume no number", () => {
    const abandoned = files(nextRecordPath(DAY, base));
    assert.deepEqual(checkClaim({ changed: abandoned, collector: base }).findings, []);
    const next = nextRecordPath(DAY, base);
    assert.equal(next, ".kaal/changes/change/26/10/19/01/");
    assert.deepEqual(checkClaim({ changed: files(next), collector: base }), { claimed: [next], findings: [] });
  });

  it("refuses a later Change that changes a record the collector already holds", () => {
    const held = [...base, ...files(".kaal/changes/change/26/10/19/01/")];
    assert.match(checkClaim({ changed: [".kaal/changes/change/26/10/19/01/review.md"], collector: held }).findings[0], /already taken/);
  });

  it("claims nothing for a pull request that changes no record", () => {
    assert.deepEqual(checkClaim({ changed: ["packages/x.mjs"], collector: base }), { claimed: [], findings: [] });
  });

  it("refuses more than one record, malformed record paths, and a file standing where a CC folder belongs", () => {
    const two = [...files(".kaal/changes/change/26/10/19/01/"), ...files(".kaal/changes/change/26/10/19/02/")];
    assert.match(checkClaim({ changed: two, collector: base }).findings[0], /a Change claims one record/);
    assert.match(checkClaim({ changed: [".kaal/changes/change/26/10/19/1/a.md"], collector: base }).findings[0], /is not a record number/);
    assert.deepEqual(checkClaim({ changed: [".kaal/changes/change/26/10/19/01"], collector: base }), { claimed: [], findings: [".kaal/changes/change/26/10/19/01: a record's files lie inside its CC folder"] });
  });
});
