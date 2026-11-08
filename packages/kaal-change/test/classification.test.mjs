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

  it("lets urgency reorder an Emergency Change and retime its authorization, keeping its assurance and accountability", () => {
    assert.match(text, /Urgency may change the order of its controls and the timing of its authorization\. It keeps the assurance those controls exist for, accounts for what it deferred, and is reviewed afterwards like any other\./);
  });

  it("preserves control objectives and their evidence, not identical mechanisms, and leaves rigor and realization to the consumer and the owners", () => {
    assert.match(text, /^A class preserves control objectives, not mechanisms\./m);
    assert.match(text, /the objectives of verification, which is Testing's, of validation and approval, which are Review's, and of the integration gates, which are Engineering's, and the evidence each requires\./);
    assert.match(text, /It does not require the same procedure for every class/);
    assert.match(text, /Urgency never silently discards a required control\./);
    assert.match(text, /chooses which of them it applies, the governance rigor each carries and how it is realized, without Change overriding Testing, Review or Engineering\./);
    assert.match(text, /belongs to the capability that realizes it\./);
    assert.doesNotMatch(text, /the same verification|the same validation|the same integration gates/, "no identical procedure is mandated");
  });
});
