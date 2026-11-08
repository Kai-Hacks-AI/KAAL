// The CHAOS Definition, decided mechanically: its Form and type, admission,
// and its key statements as written. Whether it says the right thing is
// validation, by independent Agent or human review.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, foundation, readContribution, register, verify } from "kaal-core";
import { identify } from "kaal-graph";

const CAPABILITY = fileURLToPath(new URL("../capability/", import.meta.url));
const text = readFileSync(join(CAPABILITY, "CHAOS.md"), "utf8");

describe("the CHAOS Definition", () => {
  it("is typed by Core's KAAL Definition and provided by the Capability Node", () => {
    const node = identify(readFileSync(join(CAPABILITY, "CHAOS.md")));
    assert.equal(node.name, "CHAOS");
    assert.deepEqual(node.type, foundation().definition);
    assert.match(readFileSync(join(CAPABILITY, "Change.md"), "utf8"), /the CHAOS Definition\./);
  });

  it("is admitted with the capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-chaos-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "change", await readContribution(CAPABILITY));
    assert.ok(r.ids.includes(identify(readFileSync(join(CAPABILITY, "Change.md"))).id));
    assert.equal((await verify(engine)).ok, true);
  });

  it("carries its expansion and its play on Order versus Chaos", () => {
    assert.match(text, /^CHAOS, Changes Help Agents Organize Systematically, plays deliberately on Order versus Chaos/m);
    assert.match(text, /become governable through bounded, identifiable Changes\./);
  });

  it("leaves strictness to the embedding repository and adds no rule of its own", () => {
    assert.match(text, /a repository embedding KAAL chooses how strictly it applies them\./);
    assert.match(text, /CHAOS adds no state, step or rule beyond the Change, Change Record and Change Lifecycle Definitions\./);
    assert.doesNotMatch(text, /\b(must|always|required)\b/i);
  });

  it("holds no routing order, which is CCCC's", () => {
    for (const routing of [/open conversation/i, /direct chat/i, /last resort/i]) assert.doesNotMatch(text, routing);
  });

  it("keeps its provenance: coined on #92, its routing meaning now CCCC's through #254", () => {
    assert.match(text, /^## Provenance$/m);
    assert.match(text, /KAAL #92 on 2026-10-16/);
    assert.match(text, /"Changes Helping Agent Orders Systematically"/);
    assert.match(text, /That meaning is now CCCC's, through KAAL #254, and this Definition deliberately does not carry it\./);
  });
});
