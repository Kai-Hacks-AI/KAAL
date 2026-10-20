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

  it("makes every pull request a Change and gives a synchronization no new number", () => {
    assert.match(text, /Every pull request into a collector is a Change\. A substantive Change, one that brings new work into its collector, claims at most one record folder/);
    assert.match(text, /Whether every substantive Change must claim one is the embedding repository's choice; KAAL's own repository requires it, so there a substantive Change claims exactly one\./);
    assert.match(text, /A synchronization is a Change that carries work already accepted elsewhere, together with the records it was accepted with; it claims no new number/);
  });

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
    assert.deepEqual(checkClaim({ kind: "substantive", changed: a, collector: base }), { claimed: [first], findings: [] });
    const collector = [...base, ...a];

    const collision = checkClaim({ kind: "substantive", changed: b, collector });
    assert.equal(collision.findings.length, 1);
    assert.match(collision.findings[0], /^\.kaal\/changes\/change\/26\/10\/19\/01\/ is already taken in the collector: rename the folder to \.kaal\/changes\/change\/26\/10\/19\/02\//);

    const renamed = files(nextRecordPath(DAY, collector));
    assert.deepEqual(checkClaim({ kind: "substantive", changed: renamed, collector }), { claimed: [".kaal/changes/change/26/10/19/02/"], findings: [] });
    assert.equal(nextRecordPath(DAY, [...collector, ...renamed]), ".kaal/changes/change/26/10/19/03/");
  });

  it("still fails the second pull request after it is rebased onto the collector holding the first", () => {
    const first = nextRecordPath(DAY, base);
    const collector = [...base, ...files(first)];
    // Rebased, the second pull request's files at 01 now modify the first Change's record.
    const rebased = [`${first}README.md`, `${first}evidence.md`];
    assert.match(checkClaim({ kind: "substantive", changed: rebased, collector }).findings[0], /is already taken in the collector: rename the folder to \.kaal\/changes\/change\/26\/10\/19\/02\//);
  });

  it("fails a claim that skips the next free number", () => {
    assert.deepEqual(checkClaim({ kind: "substantive", changed: files(".kaal/changes/change/26/10/19/99/"), collector: base }).findings, [".kaal/changes/change/26/10/19/99/ is not the next free number in the collector: rename the folder to .kaal/changes/change/26/10/19/01/, update its references and check again"]);
  });

  it("reports a day with no number left as a finding", () => {
    const full = [...base, ...files(".kaal/changes/change/26/10/19/99/")];
    assert.deepEqual(checkClaim({ kind: "substantive", changed: files(".kaal/changes/change/26/10/19/99/"), collector: full }).findings, [".kaal/changes/change/26/10/19/99/: change has no record number left on 2026-10-19 in the collector"]);
  });

  it("lets a pull request closed without merging consume no number", () => {
    const abandoned = files(nextRecordPath(DAY, base));
    assert.deepEqual(checkClaim({ kind: "substantive", changed: abandoned, collector: base }).findings, []);
    const next = nextRecordPath(DAY, base);
    assert.equal(next, ".kaal/changes/change/26/10/19/01/");
    assert.deepEqual(checkClaim({ kind: "substantive", changed: files(next), collector: base }), { claimed: [next], findings: [] });
  });

  it("refuses a later Change that changes a record the collector already holds", () => {
    const held = [...base, ...files(".kaal/changes/change/26/10/19/01/")];
    assert.match(checkClaim({ kind: "substantive", changed: [".kaal/changes/change/26/10/19/01/review.md"], collector: held }).findings[0], /already taken/);
  });

  it("fails a substantive Change that claims no record", () => {
    assert.deepEqual(checkClaim({ kind: "substantive", changed: ["packages/x.mjs"], collector: base }), { claimed: [], findings: ["a substantive Change claims exactly one record under .kaal/changes/, and this one claims none"] });
  });

  it("lets a synchronization claim no number, and refuses one that brings a record of its own", () => {
    assert.deepEqual(checkClaim({ kind: "synchronization", changed: [], collector: base }), { claimed: [], findings: [] });
    assert.deepEqual(checkClaim({ kind: "synchronization", changed: ["packages/x.mjs"], collector: base }), { claimed: [], findings: [] });
    assert.match(checkClaim({ kind: "synchronization", changed: files(".kaal/changes/change/26/10/19/01/"), collector: base }).findings[0], /a synchronization carries accepted records and claims none/);
  });

  it("refuses a Change of no known kind", () => {
    assert.deepEqual(checkClaim({ changed: [], collector: base }).findings, ["a Change is substantive or a synchronization, not undefined"]);
  });

  it("refuses more than one record, malformed record paths, and a file standing where a CC folder belongs", () => {
    const two = [...files(".kaal/changes/change/26/10/19/01/"), ...files(".kaal/changes/change/26/10/19/02/")];
    assert.match(checkClaim({ kind: "substantive", changed: two, collector: base }).findings[0], /a substantive Change claims exactly one record, not/);
    assert.match(checkClaim({ kind: "substantive", changed: [".kaal/changes/change/26/10/19/1/a.md"], collector: base }).findings[0], /is not a record number/);
    assert.deepEqual(checkClaim({ kind: "substantive", changed: [".kaal/changes/change/26/10/19/01"], collector: base }), { claimed: [], findings: [".kaal/changes/change/26/10/19/01: a record's files lie inside its CC folder", "a substantive Change claims exactly one record under .kaal/changes/, and this one claims none"] });
  });
});

describe("a repository's own choices", () => {
  const root = "docs/changes";
  const base = ["README.md"];

  it("numbers and checks records under the root it chooses", () => {
    const first = nextRecordPath(DAY, base, { root });
    assert.equal(first, "docs/changes/change/26/10/19/01/");
    assert.equal(recordOf(`${first}README.md`, { root }).record, first);
    assert.deepEqual(checkClaim({ kind: "substantive", changed: files(first), collector: base, root }), { claimed: [first], findings: [] });
    const collector = [...base, ...files(first)];
    assert.equal(nextRecordPath(DAY, collector, { root }), "docs/changes/change/26/10/19/02/");
    assert.match(checkClaim({ kind: "substantive", changed: files(first), collector, root }).findings[0], /is already taken in the collector: rename the folder to docs\/changes\/change\/26\/10\/19\/02\//);
  });

  it("ignores files under another root, the default included", () => {
    const elsewhere = files(".kaal/changes/change/26/10/19/01/");
    assert.equal(nextRecordPath(DAY, elsewhere, { root }), "docs/changes/change/26/10/19/01/");
    assert.deepEqual(checkClaim({ kind: "substantive", changed: elsewhere, collector: base, root }).findings, ["a substantive Change claims exactly one record under docs/changes/, and this one claims none"]);
  });

  it("requires a record by default, and lets a repository that chooses otherwise claim none", () => {
    assert.equal(checkClaim({ kind: "substantive", changed: ["packages/x.mjs"], collector: base }).findings.length, 1);
    assert.deepEqual(checkClaim({ kind: "substantive", changed: ["packages/x.mjs"], collector: base, required: false }), { claimed: [], findings: [] });
  });

  it("still checks a claim, and allows at most one, when a record is not required", () => {
    const taken = [...base, ...files(".kaal/changes/change/26/10/19/01/")];
    assert.match(checkClaim({ kind: "substantive", changed: files(".kaal/changes/change/26/10/19/01/"), collector: taken, required: false }).findings[0], /already taken/);
    const two = [...files(".kaal/changes/change/26/10/19/01/"), ...files(".kaal/changes/change/26/10/19/02/")];
    assert.match(checkClaim({ kind: "substantive", changed: two, collector: base, required: false }).findings[0], /a substantive Change claims at most one record, not/);
  });

  it("refuses a root or a requirement it cannot read", () => {
    assert.match(checkClaim({ kind: "substantive", changed: [], collector: base, root: "/abs" }).findings[0], /a record root is a repository-relative folder path/);
    assert.deepEqual(checkClaim({ kind: "substantive", changed: [], collector: base, required: "no" }).findings, ["whether a record is required is true or false, not no"]);
  });
});
