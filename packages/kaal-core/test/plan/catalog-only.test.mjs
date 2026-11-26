// core/C156 planned outer test: Core offers one listing, catalog. Immutable to
// DO and CHECK. The title names the contracts it checks (plan/catalog-only/*.md).
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import * as core from "kaal-core";

const node = (name, type, body = `# ${name}\n`) => `---\nname: ${name}\ntype:\n  name: ${type.name}\n  id: ${type.id}\n---\n\n${body}`;

describe("Catalog only (core/C156)", () => {
  it("core/T128 [core/F120, core/A63]: kaal-core exports catalog and no capabilities, and catalog returns the Skills and Exchanges an Engine holds", async () => {
    const f = core.foundation();
    const dir = join(mkdtempSync(join(tmpdir(), "kaal-core-catalog-")), ".kaal");
    await core.bootstrap(dir);
    const skill = node("Greeting", f.skill, "Greet people warmly.\n");
    const exchange = node("Handover", f.exchange, "Giver hands a finding to receiver.\n");
    const s = await core.registerSkill(dir, "greeting", { "Greeting.md": skill });
    const x = await core.registerExchange(dir, "handover", { "Handover.md": exchange });
    const c = await core.catalog(dir);
    assert.deepEqual(c.skills, [{ name: "Greeting", id: s.ids[0] }]);
    assert.deepEqual(c.exchanges, [{ name: "Handover", id: x.ids[0] }]);
    assert.equal("capabilities" in core, false, "kaal-core exports no capabilities function");
    rmSync(dir, { recursive: true, force: true });
  });
});
