// Delivered Architecture loop (core/F70): the installed package's shape, checked against the installed copy.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { readFile } from "kaal-hosting";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

const json = async (path) => JSON.parse((await readFile(fileURLToPath(new URL(path, import.meta.url)))).toString("utf8"));

describe("kaal-core Architecture loop", () => {
  it("offers each entry point it declares, and each loads [core/F68, core/A19]", async () => {
    const pkg = await json("../../package.json");
    const expected = { ".": ["evaluate", "verify", "bootstrap"], "./registration": ["assemble"], "./frontmatter": ["validate"], "./installation": ["checkContract"], "./conformance": ["installationConformance"], "./agent": ["realize"], "./realization": ["realizeIn"] };
    for (const [entry, names] of Object.entries(expected)) {
      assert.ok(entry in pkg.exports, `${entry} is an entry point`);
      const m = await import(entry === "." ? pkg.name : `${pkg.name}/${entry.slice(2)}`);
      for (const n of names) assert.equal(typeof m[n], "function", `${entry} exports ${n}`);
    }
  });

  it("runs without Graph: no runtime dependency on it, and its Node support is delivered inside with provenance [core/F76, core/F77, core/F79]", async () => {
    const pkg = await json("../../package.json");
    for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) {
      assert.ok(!Object.keys(pkg[field] ?? {}).some((n) => /(^|\/)kaal-graph$/.test(n)), `${field} names no Graph package`);
    }
    const provenance = await json("../../dist/node/provenance.json");
    for (const [file, entry] of Object.entries(provenance.files)) {
      assert.equal(sha256(await readFile(fileURLToPath(new URL(`../../dist/node/${file}`, import.meta.url)))), entry.sha256, `${file} is the copy its provenance records`);
    }
  });
});
