// The Change Record path syntax, decided mechanically. Whether a record's
// contents say the right thing is validation, by review.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { foundation } from "kaal-core";
import { identify } from "kaal-graph";
import { readRecordPath, recordPath } from "kaal-change/record";

const CAPABILITY = fileURLToPath(new URL("../capability/", import.meta.url));

describe("the Change Record Definition", () => {
  const text = readFileSync(join(CAPABILITY, "Change-Record.md"), "utf8");

  it("is typed by Core's KAAL Definition", () => {
    const node = identify(readFileSync(join(CAPABILITY, "Change-Record.md")));
    assert.equal(node.name, "Change Record");
    assert.deepEqual(node.type, foundation().definition);
  });

  it("holds what supports a Change and references the work", () => {
    assert.match(text, /It references the work and never contains it\./);
    assert.match(text, /a record is never a second source of truth/);
  });

  it("is an address, not an identity, and leaves files to Hosting", () => {
    assert.match(text, /^A record is the folder `\.kaal\/changes\/<capability>\/YY\/MM\/DD\/CC\/`\./m);
    assert.match(text, /Core does not admit anything as a Node because it lies under this path/);
    assert.match(text, /reading and writing files there is Hosting's/);
  });
});

describe("readRecordPath", () => {
  it("reads a record's capability, day and number, with or without a trailing slash", () => {
    const address = { capability: "change", date: "2026-10-19", number: 1 };
    assert.deepEqual(readRecordPath(".kaal/changes/change/26/10/19/01/"), address);
    assert.deepEqual(readRecordPath(".kaal/changes/change/26/10/19/01"), address);
    assert.deepEqual(readRecordPath(".kaal/changes/engineer-skill/24/02/29/99/"), { capability: "engineer-skill", date: "2024-02-29", number: 99 });
  });

  it("refuses paths outside .kaal/changes, of the wrong depth, or with backslashes", () => {
    for (const path of ["changes/change/26/10/19/01/", ".kaal/change/26/10/19/01/", ".kaal/changes/change/26/10/19/", ".kaal/changes/change/26/10/19/01/notes.md", ".kaal\\changes\\change\\26\\10\\19\\01", "/.kaal/changes/change/26/10/19/01/"]) {
      assert.ok(readRecordPath(path).finding, path);
    }
  });

  it("refuses capability names that are not lowercase letters, digits and single hyphens", () => {
    for (const name of ["Change", "kaal_change", "-change", "change-", "kaal--change", ".", ".."]) {
      assert.match(readRecordPath(`.kaal/changes/${name}/26/10/19/01/`).finding, /is not a capability name/, name);
    }
  });

  it("refuses days that do not exist and parts that are not two digits", () => {
    for (const day of ["26/02/29", "26/13/01", "26/00/10", "26/04/31", "26/10/00", "2026/10/19", "26/1/19"]) {
      assert.ok(readRecordPath(`.kaal/changes/change/${day}/01/`).finding, day);
    }
  });

  it("numbers records from 01 to 99", () => {
    for (const cc of ["00", "1", "100", "ab"]) {
      assert.ok(readRecordPath(`.kaal/changes/change/26/10/19/${cc}/`).finding, cc);
    }
  });
});

describe("recordPath", () => {
  it("is the inverse of readRecordPath", () => {
    const address = { capability: "change", date: "2026-10-19", number: 7 };
    assert.equal(recordPath(address), ".kaal/changes/change/26/10/19/07/");
    assert.deepEqual(readRecordPath(recordPath(address)), address);
  });

  it("refuses addresses that have no record path", () => {
    assert.throws(() => recordPath({ capability: "change", date: "2026-10-19", number: 100 }));
    assert.throws(() => recordPath({ capability: "change", date: "2126-10-19", number: 1 }));
  });
});
