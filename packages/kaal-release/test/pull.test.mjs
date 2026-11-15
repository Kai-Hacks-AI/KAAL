// Cases pull/T14, T18, T26 to T33, T35 to T39: pull Promotion from file state. Each Case lives in test/pull/T<n>.test.mjs and exports run().
// A Case is reported under its scoped id (pull/T<n>), the id the host's execution record carries.
import { describe, it } from "node:test";
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = fileURLToPath(new URL("./pull/", import.meta.url));
const cases = readdirSync(DIR)
  .filter((name) => /^T\d+\.test\.mjs$/.test(name) && name !== "T34.test.mjs") // T34 (the wiring of the engineering Cases) runs from wire.test.mjs, which test:engineering names
  .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));

describe("pull Promotion (pull/C4, pull/C2)", () => {
  it("has Cases T14, T18, T26 to T33 and T35 to T39", () => {
    if (cases.length !== 15) throw new Error(`expected 15 Cases, found ${cases.length}`);
  });
  for (const name of cases) {
    it(`pull/${name.replace(".test.mjs", "")}`, async () => {
      const module = await import(pathToFileURL(DIR + name).href);
      await module.run();
      if (!module.id || !module.tests?.length) throw new Error(`${name} does not name its id and the requirements it tests`);
    });
  }
});
