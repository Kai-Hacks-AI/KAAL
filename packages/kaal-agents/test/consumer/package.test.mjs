// Consumer cases of what the installed package carries: the Skill, the documents, its files and
// its boundary.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { PACKAGE, pkg, slash } from "./fixture.mjs";

const DOCS = ["intent", "requirements", "architecture", "operations", "limitations", "testing"];

describe("the package", () => {
  it("agents/T10 [agents/F5]: the package carries the Skill, named kaal-agents, and it names orient and PREACH", () => {
    const text = readFileSync(join(PACKAGE, "skills", "kaal-agents", "SKILL.md"), "utf8");
    assert.match(text, /^name: kaal-agents$/m);
    assert.match(text, /kaal-agents orient/);
    assert.match(text, /PREACH/);
  });

  it("agents/T11 [agents/F6]: the package carries the six documents; every identifier the consumer cases cite is defined there, and none cites an Engineering path or a Change", () => {
    for (const d of DOCS) assert.ok(existsSync(join(PACKAGE, "docs", `${d}.md`)), `docs/${d}.md is missing`);
    const docs = DOCS.map((d) => readFileSync(join(PACKAGE, "docs", `${d}.md`), "utf8")).join("\n");
    assert.doesNotMatch(docs, /engineering\//);
    assert.doesNotMatch(docs, /agents\/C\d+/);
    const consumer = join(PACKAGE, "test", "consumer");
    const cases = readdirSync(consumer).filter((f) => f.endsWith(".test.mjs"));
    assert.ok(cases.length > 0, "test/consumer/ has no cases");
    const cited = new Set(cases.flatMap((f) => readFileSync(join(consumer, f), "utf8").match(/agents\/[IFNAT]\d+/g) ?? []));
    for (const id of cited) assert.match(docs, new RegExp(`\\*\\*${id}\\b`), `${id} is not defined in docs/`);
  });

  it("agents/T12 [agents/F8, agents/A1]: files ships bin, lib, skills, docs, capability, test/consumer, test/verify.mjs and test/verify.json, and not test/publisher or test/plan", () => {
    assert.deepEqual([...pkg().files].sort(), ["bin", "capability", "docs", "lib", "skills", "test/consumer", "test/verify.json", "test/verify.mjs"]);
    assert.deepEqual(pkg().bin, { "kaal-agents": "bin/kaal-agents.mjs" });
  });

  it("agents/T14 [agents/N1, agents/N6]: bin/, lib/ and the consumer's verification import only node: built-ins and relative files, and only lib/catalog.mjs names Core's package", () => {
    const sources = ["bin", "lib", "test/consumer"].flatMap((d) => readdirSync(join(PACKAGE, d), { recursive: true }).filter((f) => f.endsWith(".mjs")).map((f) => slash(join(d, f))));
    sources.push("test/verify.mjs");
    for (const f of sources) {
      const text = readFileSync(join(PACKAGE, f), "utf8");
      for (const [, a, b] of text.matchAll(/(?:import|export)\s[^;]*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)) {
        const spec = a ?? b;
        assert.ok(spec.startsWith("node:") || spec.startsWith("."), `${f} imports ${spec}`);
      }
      if (f.startsWith("bin/") || (f.startsWith("lib/") && f !== "lib/catalog.mjs")) assert.doesNotMatch(text, /kaal-core/, `${f} names Core's package`);
    }
  });
});
