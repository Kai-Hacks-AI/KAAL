// core/C22 planned outer tests: Canonical Skill Bytes. Immutable to DO and CHECK;
// core/C23 turns them GREEN. Each title names the contracts it checks
// (plan/skill/*.md). They use kaal-core's public interface only.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** A kaal-core subpath, or the reason the tests are blocked before any behavioural assertion. */
async function subpath(name) {
  try {
    return await import(`kaal-core/${name}`);
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./${name} (${e.code ?? e.message})`);
  }
}

/** A standard SKILL.md as a Capability ships it: prose `description` and `license`. */
const STANDARD = Buffer.from(
  "---\nname: sample\ndescription: Resolve a failing Sample verdict. Use when a Sample check fails.\nlicense: MIT\n---\n\n# sample\n\n## Steps\n\nRun the check again.\n",
);
/** A SKILL.md Core cannot read frontmatter from: Core does not judge it. */
const BARE = Buffer.from("# bare\n\nNo frontmatter here.\n");

describe("Canonical Skill bytes (core/C22)", () => {
  it("core/T19 [core/F21, core/N13, core/A24]: every Skill file Core deploys is the source's bytes unchanged, at the canonical location and in the Claude Code copy", async () => {
    const { realize } = await subpath("agent");
    for (const [name, source] of [
      ["sample", STANDARD],
      ["bare", BARE],
    ]) {
      const files = { "SKILL.md": source, "references/a.md": Buffer.from("A\n") };
      const plan = realize({ skills: [{ name, files }], providers: ["claude-code"], record: {}, present: {} });
      const written = Object.fromEntries(plan.write.map((w) => [w.path, Buffer.from(w.bytes)]));
      for (const root of [".agents/skills", ".claude/skills"])
        for (const [path, bytes] of Object.entries(files)) assert.deepEqual(written[`${root}/${name}/${path}`], bytes, `${root}/${name}/${path} is the source's bytes`);
    }
  });

  it("core/T49 [core/N13, core/A24]: kaal-core/agent offers no renderSkill", async () => {
    const agent = await subpath("agent");
    assert.ok(!("renderSkill" in agent), "Core keeps no Skill-format rendering");
  });
});
