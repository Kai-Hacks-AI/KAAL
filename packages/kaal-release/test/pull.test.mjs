// Cases pull/T14, T18 and T26 to T31: pull Promotion from file state. Each Case lives in test/pull/T<n>.test.mjs and exports run().
// A Case is reported under its scoped id (pull/T<n>), the id the host's execution record carries.
import { describe, it } from "node:test";
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = fileURLToPath(new URL("./pull/", import.meta.url));
const cases = readdirSync(DIR)
  .filter((name) => /^T\d+\.test\.mjs$/.test(name))
  .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));

describe("pull Promotion (pull/C4, pull/C2)", () => {
  it("has Cases T14, T18 and T26 to T31", () => {
    if (cases.length !== 8) throw new Error(`expected 8 Cases, found ${cases.length}`);
  });
  for (const name of cases) {
    it(`pull/${name.replace(".test.mjs", "")}`, async () => {
      const module = await import(pathToFileURL(DIR + name).href);
      await module.run();
      if (!module.id || !module.tests?.length) throw new Error(`${name} does not name its id and the requirements it tests`);
    });
  }
});
