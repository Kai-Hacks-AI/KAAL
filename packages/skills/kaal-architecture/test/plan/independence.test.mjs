// architecture/C13 [architecture/G1, architecture/G2, architecture/G3]: planned in
// .kaal/changes/architecture/26/11/03/01/README.md. Written RED first, turned GREEN by the DO.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const node = readFileSync(join(PACKAGE, "payload", "Architecture.md"), "utf8");
const skill = readFileSync(join(PACKAGE, "skills", "kaal-architecture", "SKILL.md"), "utf8");
const section = skill.split(/^## /m).find((s) => s.startsWith("Independence")) ?? "";

describe("kaal-architecture: package independence in placement", () => {
  it("architecture/T9 [architecture/G1, architecture/G2]: the Node says packages stay independently usable and composition is optional enrichment", () => {
    assert.match(node, /independently (usable|deployable)/i);
    assert.match(node, /optional/i);
  });

  it("architecture/T10 [architecture/G1]: the Skill has an Independence section that makes a hard dependency the exception with stated grounds", () => {
    assert.notEqual(section, "", "SKILL.md has a '## Independence' section");
    assert.match(section, /hard dependency/i);
    assert.match(section, /grounds/i);
  });

  it("architecture/T11 [architecture/G2]: the section treats composition as found by name, absent without error, stronger when present", () => {
    assert.match(section, /by name/i);
    assert.match(section, /absent/i);
    assert.match(section, /registry|pinned/i);
  });

  it("architecture/T12 [architecture/G3]: the section forbids silent duplication and requires an explicit Adapt or New record when the owner's answer is not used", () => {
    assert.match(section, /duplicat/i);
    assert.match(section, /Use/);
    assert.match(section, /Adapt or New/);
  });
});
