// The consumer's smoke test of the installed kaal-process, shipped with it:
// `npm explore kaal-process -- npm run verify`. It needs no KAAL source
// checkout, only Node and an installed kaal-core, which admits the Nodes.
// It checks that the delivered Nodes are the published bytes (test/nodes.json),
// that Core admits them as one Capability contribution into a fresh Engine of
// its own, and that the delivered Process contract says what it promises.
// It is not the publisher's assurance (test/process.test.mjs, not shipped), and
// Core's admission alone does not test the contract.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
const NODES = JSON.parse(readFileSync(join(PACKAGE, "test/nodes.json"), "utf8"));
const text = (path) => readFileSync(join(PACKAGE, path), "utf8");

/** kaal-core as installed beside this package, or why the smoke test cannot verify. */
async function core() {
  try {
    return await import("kaal-core");
  } catch (e) {
    assert.fail(`cannot verify: kaal-core is not installed beside kaal-process (npm install kaal-core) (${e.code ?? e.message})`);
  }
}

describe("the installed kaal-process", () => {
  const work = mkdtempSync(join(tmpdir(), "kaal-process-verify-"));
  after(() => rmSync(work, { recursive: true, force: true }));

  it("delivers exactly the published Nodes, byte for byte", () => {
    for (const [path, { id }] of Object.entries(NODES)) {
      assert.equal(createHash("sha256").update(readFileSync(join(PACKAGE, path))).digest("hex"), id, path);
    }
  });

  it("is admitted by Core alone, as one Capability contribution, into a fresh Engine", async () => {
    const { bootstrap, catalog, loadEngine, readContribution, register, verify } = await core();
    const engine = join(work, "engine");
    await bootstrap(engine);
    await register(engine, "capability", "process", await readContribution(join(PACKAGE, "capability")));
    const capability = NODES["capability/Process.md"];
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: capability.name, id: capability.id }]);
    const admitted = new Map((await loadEngine(engine)).nodes.map((n) => [n.id, n]));
    for (const [path, { name, type, id }] of Object.entries(NODES)) {
      assert.equal(admitted.get(id)?.name, name, `${path} is admitted`);
      assert.equal(admitted.get(id)?.type?.name, type, `${path} is typed by ${type}`);
    }
    assert.equal((await verify(engine)).ok, true);
  });

  it("states Process's scope: the metamodel and Process Templates, with each specific process left to its owner", () => {
    const capability = text("capability/Process.md");
    assert.match(capability, /each specific process, and each instance of it, remains owned by the capability whose process it is/);
    assert.match(capability, /It is not an instantiated process of any capability and not a universal mandatory workflow/);
    assert.match(capability, /A capability that adopts a template owns its particular process/);
    assert.match(capability, /Process keeps no registry of processes/);
  });

  it("defines the metamodel's concepts, a Role apart from the actor fulfilling it", () => {
    const definition = text("capability/Process-Definition.md");
    for (const concept of ["Activity", "Role", "State and Transition", "Ordering", "Entry and Exit conditions"]) {
      assert.match(definition, new RegExp(`^- \\*\\*${concept}\\*\\*: `, "m"), concept);
    }
    assert.match(definition, /A Role is not an Agent/);
  });

  it("delivers PDCA as a recursive Process Template that mandates nothing", () => {
    const pdca = text("capability/PDCA.md");
    assert.match(pdca, /^PDCA: Plan, Do, Check, Act\. PDCA is a Process Template/m);
    for (const phase of ["Plan", "Do", "Check", "Act"]) assert.match(pdca, new RegExp(`^- \\*\\*${phase}\\*\\*: `, "m"), phase);
    assert.match(pdca, /An inner cycle contributes its results and evidence to the enclosing Check and never substitutes for it/);
    assert.match(pdca, /Act changes nothing by itself/);
    assert.match(pdca, /Describing work as PDCA makes nothing mandatory/);
  });
});
