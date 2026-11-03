// The planned tests of agents/C11, the instruction model and its ownership (plan/instructions-0.0.1/plan.md).
// DO and CHECK do not change them. Each fails today on the charter's text.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const charter = readFileSync(join(PACKAGE, "capability", "Agents.md"), "utf8");

describe("agents/C11 instruction model", () => {
  it("agents/T25 [agents/F13]: the charter states the instruction model and its composition, and that an instruction guides and never authorizes", () => {
    assert.match(charter, /instruction model|model of the instructions/i, "names the instruction model");
    assert.match(charter, /compos/i, "names composition");
    assert.match(charter, /guides? an Agent/i, "says an instruction guides");
    assert.match(charter, /never authorizes/i, "says an instruction never authorizes");
  });

  it("agents/T26 [agents/F14]: the charter states that a deployment instance owns its instruction files, that Agents writes none, and that the owner of a matter owns what is said about it", () => {
    assert.match(charter, /deployment instance owns its own instruction files/i, "the instance owns its files");
    assert.match(charter, /writes no instruction file/i, "Agents writes none");
    assert.match(charter, /owner of a matter owns what is said about it/i, "the matter's owner owns the content");
  });

  it("agents/T27 [agents/F15]: the charter's text does not leave instruction placement to Communication: it names Communication's part as channels and carriers", () => {
    assert.doesNotMatch(charter, /where content goes is Communication's/i, "the broad clause is gone");
    assert.match(charter, /Communication[^.]*channels?[^.]*carriers?|channels? and carriers?[^.]*Communication/i, "Communication's part is channels and carriers");
  });
});
