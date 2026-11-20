// core/C51 planned outer tests: Exchange replaces Extension in CASE. Immutable
// to DO and CHECK. Each title names the contracts it checks (plan/exchange/*.md).
// They check what Core carries, registers, lists and refuses, never the wording
// of a Definition.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import * as core from "kaal-core";
import { identify } from "kaal-graph";

const node = (name, type, body = `# ${name}\n`) => `---\nname: ${name}\ntype:\n  name: ${type.name}\n  id: ${type.id}\n---\n\n${body}`;

async function engine() {
  const dir = join(mkdtempSync(join(tmpdir(), "kaal-core-exchange-")), ".kaal");
  await core.bootstrap(dir);
  return dir;
}

/** The Exchange reference Core names, or the reason the test is blocked before any behavioural assertion. */
function exchange() {
  const f = core.foundation();
  if (!f.exchange) assert.fail("blocked before behavioural assertion: foundation() names no exchange");
  return f.exchange;
}

describe("Exchange replaces Extension (core/C51)", () => {
  it("core/T98 [core/F89, core/A45]: the payload carries a KAAL Exchange Definition typed by KAAL Definition, and no KAAL Extension", () => {
    const x = exchange();
    const files = core.payload();
    const bytes = files["core/KAAL-Exchange.md"];
    assert.ok(bytes, "the payload carries core/KAAL-Exchange.md");
    const id = identify(bytes);
    assert.equal(id.name, "KAAL Exchange");
    assert.deepEqual({ name: id.name, id: id.id }, x, "foundation() names the Node the payload carries");
    assert.deepEqual(id.type, core.foundation().definition, "typed by KAAL Definition");
    for (const [path, b] of Object.entries(files).filter(([p]) => p.startsWith("core/"))) assert.doesNotMatch(Buffer.from(b).toString("utf8"), /^name: KAAL Extension$/m, `${path} is no KAAL Extension`);
    assert.equal("extension" in core.foundation(), false, "foundation() names no extension");
  });

  it("core/T99 [core/F90, core/A46]: an Exchange contribution registers and is listed as exchanges; extension is not a kind; an Exchange and a Skill do not mix", async () => {
    const x = exchange();
    const f = core.foundation();
    const dir = await engine();
    const handover = node("Handover", x, "Giver hands a finding to receiver.\n");
    assert.equal(typeof core.registerExchange, "function", "kaal-core exports registerExchange");
    assert.equal("registerExtension" in core, false, "kaal-core exports no registerExtension");
    const r = await core.registerExchange(dir, "handover", { "Handover.md": handover });
    assert.equal(r.written, true);
    const c = await core.catalog(dir);
    assert.deepEqual(c.exchanges, [{ name: "Handover", id: r.ids[0] }]);
    assert.equal("extensions" in c, false, "the catalog lists no extensions");
    await assert.rejects(() => core.register(dir, "extension", "other", { "Handover.md": handover }), /not a kind/);
    const skill = node("Greeting", f.skill, "Greet people warmly.\n");
    await assert.rejects(() => core.registerSkill(dir, "mixed", { "a.md": skill, "b.md": handover }), /carries no KAAL Exchange/);
    await assert.rejects(() => core.registerExchange(dir, "mixed", { "a.md": handover, "b.md": skill }), /carries no KAAL Skill/);
    rmSync(dir, { recursive: true, force: true });
  });

  it("core/T100 [core/F91, core/A45]: the kinds Core registers are exactly the four CASE Definitions, each typed by KAAL Definition", async () => {
    exchange();
    const f = core.foundation();
    assert.deepEqual(Object.keys(f).sort(), ["agent", "capability", "definition", "exchange", "kernel", "node", "skill"]);
    const dir = await engine();
    const e = await core.loadEngine(dir);
    const g = new Map(e.nodes.map((n) => [n.id, n]));
    for (const kind of ["capability", "agent", "skill", "exchange"]) {
      assert.deepEqual(g.get(f[kind].id)?.type, f.definition, `${kind} is typed by KAAL Definition`);
      const body = node("Probe", f[kind], "A probe.\n");
      const r = await core.register(dir, kind, `probe-${kind}`, { "Probe.md": body });
      assert.equal(r.written, true, `${kind} registers`);
    }
    rmSync(dir, { recursive: true, force: true });
  });

  it("core/T101 [core/N24, core/A47]: an Exchange registers whatever its body says, and registering it again is a no-op", async () => {
    const x = exchange();
    const dir = await engine();
    for (const [i, body] of ["", "No handover is stated here.\n", "# \n\n- a: b\n- c: d\n"].entries()) {
      const bytes = node(`Any${i}`, x, body);
      const first = await core.registerExchange(dir, `any-${i}`, { "Any.md": bytes });
      assert.equal(first.written, true);
      const again = await core.registerExchange(dir, `any-${i}`, { "Any.md": bytes });
      assert.deepEqual(again, { ids: first.ids, written: false });
    }
    rmSync(dir, { recursive: true, force: true });
  });

  it("core/T102 [core/F91, core/A45]: an Engine without the KAAL Exchange Definition does not verify", async () => {
    exchange();
    const { unlinkSync } = await import("node:fs");
    const dir = await engine();
    assert.ok((await core.verify(dir)).ok, "a fresh Engine verifies");
    unlinkSync(join(dir, "core", "KAAL-Exchange.md"));
    assert.equal((await core.verify(dir)).ok, false);
    rmSync(dir, { recursive: true, force: true });
  });
});
