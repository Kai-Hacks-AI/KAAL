// The Change lifecycle, decided mechanically from a realization's facts.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { foundation } from "kaal-core";
import { identify } from "kaal-graph";
import { STATES, canMove, readLifecycle } from "kaal-change/lifecycle";

const FILE = new URL("../capability/Change-Lifecycle.md", import.meta.url);

describe("the Change Lifecycle Definition", () => {
  const text = readFileSync(FILE, "utf8");

  it("is typed by Core's KAAL Definition", () => {
    const node = identify(readFileSync(FILE));
    assert.equal(node.name, "Change Lifecycle");
    assert.deepEqual(node.type, foundation().definition);
  });

  it("reads state from facts and stores none", () => {
    assert.match(text, /A Change's state is read from facts its realization already keeps; Change stores no state of its own\./);
  });

  it("never undoes acceptance, and lets an Accepted Change move on only to Promoted", () => {
    assert.match(text, /acceptance is never undone: it can only move on to Promoted, and undoing its work is a new Change\./);
  });

  it("keeps approval, verification and validation out of the states", () => {
    assert.match(text, /Approval, verification and validation are not states\./);
    assert.match(text, /does not prove that the Intent a Change realizes achieved its Outcome/);
  });
});

describe("readLifecycle", () => {
  it("reads the four states", () => {
    assert.deepEqual(STATES, ["Proposed", "Accepted", "Withdrawn", "Promoted"]);
    assert.deepEqual(readLifecycle({ open: true, merged: false, promoted: false }), { state: "Proposed" });
    assert.deepEqual(readLifecycle({ open: false, merged: true, promoted: false }), { state: "Accepted" });
    assert.deepEqual(readLifecycle({ open: false, merged: false, promoted: false }), { state: "Withdrawn" });
    assert.deepEqual(readLifecycle({ open: false, merged: true, promoted: true }), { state: "Promoted" });
  });

  it("refuses facts that contradict each other or are missing", () => {
    assert.ok(readLifecycle({ open: true, merged: true, promoted: false }).finding);
    assert.ok(readLifecycle({ open: false, merged: false, promoted: true }).finding);
    assert.ok(readLifecycle({ open: true, merged: false }).finding);
  });
});

describe("canMove", () => {
  it("lets a Proposed Change be Accepted or Withdrawn, and a Withdrawn one be proposed again", () => {
    assert.ok(canMove("Proposed", "Accepted"));
    assert.ok(canMove("Proposed", "Withdrawn"));
    assert.ok(canMove("Withdrawn", "Proposed"));
    assert.ok(canMove("Accepted", "Promoted"));
  });

  it("never moves an Accepted Change back, and nothing leaves Promoted", () => {
    for (const to of ["Proposed", "Withdrawn"]) assert.ok(!canMove("Accepted", to), to);
    for (const to of STATES) assert.ok(!canMove("Promoted", to), to);
    assert.ok(!canMove("Withdrawn", "Accepted"));
    assert.ok(!canMove("Unknown", "Proposed"));
  });
});
