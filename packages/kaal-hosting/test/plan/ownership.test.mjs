// hosting/C24 planned outer test: Hosting's ownership claim (hosting/I13, hosting/F56,
// hosting/A22). Immutable to DO and CHECK. It reads the claim and Hosting's Node with
// Node's built-ins only: Hosting depends on no Testing package.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

describe("hosting/C24: Hosting's ownership claim", () => {
  it("hosting/T70 [hosting/I13, hosting/F56, hosting/A22]: the claim names Hosting's Extension Node by kind, name and id, claims exactly Hosting's tree, and does not ship", () => {
    const claim = JSON.parse(readFileSync(join(PACKAGE, "ownership.kaal.json"), "utf8"));
    assert.deepEqual(Object.keys(claim).sort(), ["owner", "paths"]);
    assert.deepEqual(Object.keys(claim.owner).sort(), ["id", "kind", "name"]);

    const node = readFileSync(join(PACKAGE, "payload", "Hosting.md"));
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(node.toString("utf8"))?.[1] ?? "";
    assert.match(front, /^name: Hosting$/m);
    assert.match(front, /^type:\r?\n  name: KAAL Extension$/m);
    assert.deepEqual(claim.owner, { kind: "extension", name: "Hosting", id: createHash("sha256").update(node).digest("hex") });

    assert.deepEqual(claim.paths, ["packages/extensions/kaal-hosting/"]);
    const files = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).files;
    assert.ok(!files.some((f) => f === "ownership.kaal.json" || f === "*" || f === "."), `files ships the claim: ${JSON.stringify(files)}`);
  });
});
