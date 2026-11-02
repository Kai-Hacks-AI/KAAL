// The BASS procedure step (plan/bass-procedure): the Skill's procedure links one contained
// decision reference. Observations are structural: the reference is delivered, resolves from
// wherever the Skill is placed, and is not masked by a source-tree fallback. Whether the guidance
// is sound is independent validation, not this test. The copy sits inside the package so the checker still resolves its dependencies.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = join(PACKAGE, "skills", "kaal-engineer-skill");
const REFERENCE = "references/bass-decisions.md";

const check = (dir) => spawnSync(process.execPath, [join(SKILL, "scripts", "check-skill.mjs"), dir], { encoding: "utf8" });

describe("the BASS procedure step", () => {
  it("is linked from SKILL.md by a relative path to a delivered reference", () => {
    assert.ok(readFileSync(join(SKILL, "SKILL.md"), "utf8").includes(`](${REFERENCE})`));
    assert.ok(existsSync(join(SKILL, REFERENCE)));
  });

  it("keeps judgment visible and rejects a blanket move-everything rule", () => {
    const text = readFileSync(join(SKILL, REFERENCE), "utf8");
    assert.match(text, /does not decide whether the step was adequate/);
    assert.match(text, /stays in its owning package/);
    assert.match(text, /stays with the context that owns it|stays outside/i);
    assert.doesNotMatch(text, /every (script|executable) (must|belongs)/i);
  });

  it("passes the unchanged structural checker where it ships", () => {
    const r = check(SKILL);
    assert.equal(r.status, 0, r.stdout + r.stderr);
  });

  it("resolves the reference from another location, without a source-tree fallback", () => {
    const root = mkdtempSync(join(PACKAGE, ".kaal-bass-"));
    try {
      const moved = join(root, "elsewhere", "kaal-engineer-skill");
      cpSync(SKILL, moved, { recursive: true });
      const ok = check(moved);
      assert.equal(ok.status, 0, ok.stdout + ok.stderr);
      rmSync(join(moved, REFERENCE));
      const missing = check(moved);
      assert.equal(missing.status, 1, "a missing linked reference must fail, not fall back to the source tree");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
