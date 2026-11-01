// core/C16 planned outer tests: Core as a package, and LOVE. Immutable to DO
// and CHECK; core/C17 turns them GREEN. Each title names the contracts it
// checks (plan/love/*.md).
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { identify } from "kaal-graph";

const PACKAGE = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, PACKAGE));
const pkg = JSON.parse(read("package.json"));

/** The bytes at `path` in kaal-core's tree, or the reason the test is blocked before any behavioural assertion. */
function needed(path, what) {
  if (!existsSync(new URL(path, PACKAGE))) assert.fail(`blocked before behavioural assertion: kaal-core has no ${what} (${path})`);
  return read(path);
}

/** The foundation as core/C16 found it: core/C17 changes none of these. */
const FOUNDATION = {
  kernel: "14864b6ee33a5c0e4105dfa2354d5af191013c9a4ecd9c264b1e710fe66579fc",
  node: { name: "Node", id: "c9097c4ff01faeb44847b89e21319f0dc4adfd4945437af071141995e31b4663" },
  definition: { name: "KAAL Definition", id: "a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2" },
  capability: { name: "KAAL Capability", id: "56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e" },
  agent: { name: "KAAL Agent", id: "d632c1fb4c4201d65c7834d4af0463cd1bd3928dd0fb8cc0b503521a4d2cf447" },
  skill: { name: "KAAL Skill", id: "4e01b2d4da8bbaea7c73eb1a02a4f5e898f7a4154a0186c16cedfd1ef9a53933" },
  extension: { name: "KAAL Extension", id: "f72271c291ef6f15a7bea234111616e5213af57160daa11d0db1045e83267a94" },
};

/** The KAAL packages Core may depend on (core/N11). */
const ALLOWED = ["kaal-graph", "kaal-hosting", "@kaihacksai/kaal-foundation"];
const isKaal = (name) => /^(@kaihacksai\/)?kaal-/.test(name) && name !== "kaal-core";

function files(dir) {
  const url = new URL(dir, PACKAGE);
  if (!existsSync(url)) return [];
  return readdirSync(url, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.(ts|mts|mjs|js)$/.test(e.name))
    .map((e) => `${e.parentPath.slice(new URL(PACKAGE).pathname.length)}/${e.name}`);
}

describe("LOVE (core/C16)", () => {
  it("core/T39 [core/F39, core/A16]: the payload carries a LOVE Definition beside CASE, and no existing id changes", async () => {
    const bytes = needed("payload/core/LOVE.md", "LOVE Definition");
    const love = identify(bytes);
    assert.equal(love.name, "LOVE");
    assert.deepEqual(love.type, FOUNDATION.definition, "LOVE is typed by KAAL Definition");
    const text = bytes.toString("utf8");
    for (const word of ["Lifecycle", "Ownership", "Verification", "Encapsulation"]) assert.ok(text.includes(word), `LOVE states ${word}`);
    const { foundation, payload } = await import("kaal-core");
    assert.ok("core/LOVE.md" in payload(), "the payload carries LOVE as it deploys into .kaal/");
    assert.deepEqual(foundation(), FOUNDATION, "the Kernel's bytes and every foundational id are unchanged");
  });
});

describe("Core as a package (core/C16)", () => {
  it("core/T40 [core/F40, core/A18]: Core is a Capability Node of its own and claims its tree, neither delivered", () => {
    const bytes = needed("capability/Core.md", "Core Capability Node");
    const core = identify(bytes);
    assert.equal(core.name, "Core");
    assert.deepEqual(core.type, FOUNDATION.capability, "Core is typed by KAAL Capability");
    const claim = JSON.parse(needed("ownership.kaal.json", "ownership claim"));
    assert.deepEqual(claim, { owner: { kind: "capability", name: "Core", id: core.id }, paths: ["packages/kaal-core/"] });
    for (const path of ["capability", "ownership.kaal.json"]) {
      assert.ok(!pkg.files.some((f) => f === path || f.startsWith(`${path}/`)), `${path} is repository data, not delivered`);
    }
  });

  it("core/T41 [core/F41, core/A19]: every entry point and every value it exports is named in the README, and nothing else resolves", async () => {
    const readme = read("README.md").toString("utf8");
    const undocumented = [];
    for (const key of Object.keys(pkg.exports).filter((k) => k !== "./package.json")) {
      const spec = key === "." ? "kaal-core" : `kaal-core/${key.slice(2)}`;
      assert.ok(readme.includes(`"${spec}"`), `the README names the entry point ${spec}`);
      for (const name of Object.keys(await import(spec))) {
        if (!new RegExp(`\\b${name}\\b`).test(readme)) undocumented.push(`${spec}: ${name}`);
      }
    }
    assert.deepEqual(undocumented, [], "every exported value is consumer-visible interface");
    for (const internal of ["kaal-core/dist/engine.js", "kaal-core/src/engine.ts", "kaal-core/payload/KAAL-KERNEL.md"]) {
      await assert.rejects(import(internal), { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" }, `${internal} does not resolve`);
    }
  });

  it("core/T42 [core/N11, core/A17]: Core depends on no discipline: no other KAAL package in any dependency field or import", () => {
    for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      const named = Object.keys(pkg[field] ?? {}).filter(isKaal).filter((n) => !ALLOWED.includes(n));
      assert.deepEqual(named, [], `${field} names no discipline package`);
    }
    const imports = [];
    for (const file of [...files("src"), ...files("test"), ...files("bench")]) {
      const text = read(file).toString("utf8");
      for (const [, name] of text.matchAll(/(?:from\s+|import\s*\(\s*)["']((?:@kaihacksai\/)?kaal-[a-z-]+)/g)) {
        if (isKaal(name) && !ALLOWED.includes(name)) imports.push(`${file}: ${name}`);
      }
    }
    assert.deepEqual(imports, [], "no file of Core's imports a discipline package");
  });
});
