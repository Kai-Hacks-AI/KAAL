// Cases pull/T1 to pull/T13: pull Promotion. Each Case lives in test/pull/T<n>.test.mjs and exports run().
import { describe, it } from "node:test";
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = fileURLToPath(new URL("./pull/", import.meta.url));
const cases = readdirSync(DIR)
  .filter((name) => /^T\d+\.test\.mjs$/.test(name))
  .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));

describe("pull Promotion (pull/C1)", () => {
  it("has Cases T1 to T13", () => {
    if (cases.length !== 13) throw new Error(`expected 13 Cases, found ${cases.length}`);
  });
  for (const name of cases) {
    it(name.replace(".test.mjs", ""), async () => {
      const module = await import(pathToFileURL(DIR + name).href);
      await module.run();
      if (!module.id || !module.tests?.length) throw new Error(`${name} does not name its id and the requirements it tests`);
    });
  }
});
