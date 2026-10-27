// The Change Classification Definition, decided mechanically: its Form and
// type, and its key statements as written. Whether it says the right thing is
// validation, by independent Agent or human review.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { foundation } from "kaal-core";
import { identify } from "kaal-graph";

const CAPABILITY = fileURLToPath(new URL("../capability/", import.meta.url));
const text = readFileSync(join(CAPABILITY, "Change-Classification.md"), "utf8");

describe("the Change Classification Definition", () => {
  it("is typed by Core's KAAL Definition and provided by the Capability Node", () => {
    const node = identify(readFileSync(join(CAPABILITY, "Change-Classification.md")));
    assert.equal(node.name, "Change Classification");
    assert.deepEqual(node.type, foundation().definition);
    assert.match(readFileSync(join(CAPABILITY, "Change.md"), "utf8"), /the Change Classification Definition and the CHAOS Definition\./);
  });

  it("classifies a Change as Normal, Standard or Emergency, apart from its lifecycle state", () => {
    assert.match(text, /^A Change is classified as Normal, Standard or Emergency\./m);
    assert.match(text, /The class is not a state of the Change's lifecycle, and it is not where the Change lands\./);
  });

  it("makes Normal the default, with Project governance added only where warranted", () => {
    assert.match(text, /A \*\*Normal Change\*\* is assessed and authorized on its own/);
    assert.match(text, /It is the default class\./);
    assert.match(text, /may be added over one or more Normal Changes where it is warranted\. No Normal Change needs it merely by being one\./);
  });

  it("authorizes a Standard Change by a procedure that was itself a Normal Change", () => {
    assert.match(text, /Each Change that stays within the procedure is authorized by it, and one that leaves it is a Normal Change\. Authorizing the procedure is itself a Normal Change\./);
  });

  it("lets urgency reorder an Emergency Change without removing any of its controls", () => {
    assert.match(text, /It does not remove its assessment, authorization, verification or evidence, and it is reviewed afterwards like any other\./);
  });

  it("changes no control, and leaves verification, validation, gates and realization to their owners", () => {
    assert.match(text, /The class changes no control\./);
    assert.match(text, /verification, which is Testing's, the same validation and approval, which are Review's, and the same integration gates, which are Engineering's\./);
    assert.match(text, /a repository that embeds KAAL chooses which of them it applies and how strictly\./);
    assert.match(text, /belongs to the capability that realizes it\./);
  });
});
