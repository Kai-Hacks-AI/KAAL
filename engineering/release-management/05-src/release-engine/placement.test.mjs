// release-management/T11 (F1, F2, F3): the Release engine's home is this component.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

describe("release-management/T11 the Release engine is placed in its component", () => {
  it("the engine, its runner and its Cases are in this component", () => {
    for (const f of ["release.mjs", "run.mjs", "release.test.mjs"]) assert.ok(existsSync(join(HERE, f)), f);
  });
});
