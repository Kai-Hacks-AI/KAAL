import { test } from "node:test";
import assert from "node:assert/strict";
import { compatibility, named, prefix } from "../src/compat.js";

const skill = (line: string) => `---\nname: x\n${line}\n---\nbody\n`;

test("a declaration is read as the string it decodes to, and a need is a whole prefixed capability name", () => {
  assert.deepEqual(compatibility(skill("compatibility: Needs the kaal-sealing Skill beside it.")), { value: "Needs the kaal-sealing Skill beside it." });
  assert.deepEqual(compatibility(skill("compatibility: Needs Node.js. # kaal-sealing")), { value: "Needs Node.js." });
  assert.deepEqual(named("kaal-sealing and kaal-core and xkaal-other", "kaal-"), ["kaal-sealing"]);
  assert.deepEqual(named("acme-one", prefix("capability-prefix = acme-\n")), ["acme-one"]);
});

test("what cannot be decoded reliably is unreadable, never no declaration", () => {
  for (const line of ['compatibility: "kaal\\u002dsealing"', "compatibility: &a x", "compatibility: !!str x", "compatibility: [x]"]) assert.ok("unreadable" in compatibility(skill(line)), line);
  assert.ok("unreadable" in compatibility("no frontmatter\n"));
});
