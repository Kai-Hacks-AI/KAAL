// The RATIFICATION Definition, decided mechanically: its Form and type,
// admission, and its key statements as written. Whether it says the right
// thing is validation, by independent Agent or human review.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, foundation, readContribution, register, verify } from "kaal-core";
import { identify } from "kaal-graph";

const CAPABILITY = fileURLToPath(new URL("../capability/", import.meta.url));
const text = readFileSync(join(CAPABILITY, "RATIFICATION.md"), "utf8");

describe("the RATIFICATION Definition", () => {
  it("is typed by Core's KAAL Definition and provided by the Capability Node", () => {
    const node = identify(readFileSync(join(CAPABILITY, "RATIFICATION.md")));
    assert.equal(node.name, "RATIFICATION");
    assert.deepEqual(node.type, foundation().definition);
    assert.match(readFileSync(join(CAPABILITY, "Change.md"), "utf8"), /the RATIFICATION Definition and the CHAOS Definition\./);
  });

  it("is admitted with the capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-ratification-")), "engine");
    await bootstrap(engine);
    await register(engine, "capability", "change", await readContribution(CAPABILITY));
    assert.equal((await verify(engine)).ok, true);
  });

  it("carries its canonical expansion verbatim", () => {
    assert.match(text, /^Requirements, Architecture, Test, Intend, Formalized; Implement, Code, And, Test, Its, Outcome, Neat\.$/m);
  });

  it("is selectable by the repository, not a universal pipeline", () => {
    assert.match(text, /A repository that embeds KAAL chooses whether to apply it, and how strictly\. It is not a universal pipeline\./);
  });

  it("makes PLAN establish Intent, Requirements and Architecture, each with planned tests, applying RATS!", () => {
    assert.match(text, /PLAN establishes the Intent, the Requirements and the Architecture, each with its corresponding planned tests\./);
    assert.match(text, /It applies RATS!, which aligns Requirements, Architecture and Testing\./);
  });

  it("keeps two distinct Tests: the whole planned set as the immutable boundary, then GREEN against it", () => {
    assert.match(text, /Its first Test is the entire planned test set\. Before implementation that set becomes the acceptance boundary, and it is immutable\./);
    assert.match(text, /DO codes; CHECK verifies; they repeat until all planned tests are GREEN\. That is its second Test, and it produces evidence\./);
  });

  it("forbids DO and CHECK to modify any planned test, and sends planning defects to ACT and a new PLAN", () => {
    assert.match(text, /DO and CHECK cannot modify any test established by PLAN, whatever the motive\./);
    assert.match(text, /handled through ACT and a subsequent PLAN, never by rewriting planned tests within DO or CHECK\./);
    assert.match(text, /This Definition does not define ACT\./);
  });

  it("treats GREEN as evidence, leaving evidence to Testing and the Outcome to Intent", () => {
    assert.match(text, /GREEN is test evidence\. It is not proof that the Intent achieved its Outcome\./);
    assert.match(text, /Testing owns what planned tests mean as evidence, and Intent owns the Outcome\./);
  });

  it("cites no earlier repository", () => {
    assert.doesNotMatch(text, /g2|KAAL\.g|kaal-changing/i);
  });
});
