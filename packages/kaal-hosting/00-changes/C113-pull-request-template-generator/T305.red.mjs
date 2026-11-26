// hosting/T305 draft (hosting/C113): renderBody gives exact bytes in declared order.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DO, chapters } from "./fixtures.mjs";

it("hosting/T305: renderBody puts each chapter under its heading in the declared order, whatever the key order", () => {
  const expected = "## Change\n\nhosting generator\n\n## Implement\n\nAdds the generator.\n\n## Refactor\n\nNone planned.\n";
  assert.equal(hosting.renderBody(DO, chapters), expected);
  assert.equal(hosting.renderBody(DO, { Refactor: "None planned.", Change: "hosting generator", Implement: "Adds the generator." }), expected);
  assert.equal(hosting.renderBody(DO, { ...chapters, Change: "  hosting generator\r\n" }), expected, "text is trimmed and LF");
});
