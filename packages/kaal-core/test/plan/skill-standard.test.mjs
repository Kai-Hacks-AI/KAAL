// core/C52 planned outer tests: the Skill standard. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/skill-standard/*.md). They
// check the stated criterion: levels, data in a warning, findings, exit codes.
// None reads the wording of a Definition or of a warning message.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { identify } from "kaal-graph";

const CLI = new URL("../../dist/cli.js", import.meta.url).pathname;

/** `kaal-core/skill`, or the reason the tests are blocked before any behavioural assertion. */
async function skill() {
  try {
    return await import("kaal-core/skill");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./skill (${e.code ?? e.message})`);
  }
}

const words = (n, eol = "\n") => Array.from({ length: n }, (_, i) => `w${i}`).join(" ").concat(eol);

/** A Skill directory with the given files, returned with its path. */
function make(files) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-skill-std-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return dir;
}

const check = (dir) => spawnSync(process.execPath, [CLI, "skill", "check", dir], { encoding: "utf8" });

describe("Skill standard (core/C52)", () => {
  it("core/T103 [core/F93, core/A49]: the size levels change exactly at 200, 400 and 600 words, and the count is the same with CRLF", async () => {
    const { judgeSize } = await skill();
    const level = (n, text = words(n)) => judgeSize(text).level;
    assert.deepEqual([0, 1, 200].map((n) => level(n)), ["ok", "ok", "ok"]);
    assert.deepEqual([201, 400].map((n) => level(n)), ["soft", "soft"]);
    assert.deepEqual([401, 600].map((n) => level(n)), ["medium", "medium"]);
    assert.deepEqual([601, 2000].map((n) => level(n)), ["hard", "hard"]);
    assert.equal(judgeSize(words(300)).words, 300);
    const lines = Array.from({ length: 300 }, (_, i) => `line ${i} here`).join("\n"); // 900 words over lines
    assert.equal(judgeSize(lines).words, judgeSize(lines.replaceAll("\n", "\r\n")).words, "line endings do not change the count");
    assert.equal(judgeSize("---\nname: x\n---\n" + words(198)).words, judgeSize(words(198)).words + 4, "frontmatter is counted as the file gives it");
  });

  it("core/T104 [core/F94, core/A49, core/N26]: a warning carries rule ids that exist, always the three remedies and never trimming, and only hard blocks", async () => {
    const { judgeSize, standard } = await skill();
    const known = new Set(standard.rules.map((r) => r.id ?? r));
    assert.equal(judgeSize(words(100)).warning, undefined, "ok has no warning");
    for (const [n, level, blocks] of [[250, "soft", false], [450, "medium", false], [650, "hard", true]]) {
      const w = judgeSize(words(n)).warning;
      assert.ok(w, `${level} has a warning`);
      assert.equal(w.level, level);
      assert.equal(w.blocks, blocks, `${level} ${blocks ? "blocks" : "does not block"}`);
      assert.ok(w.rules.length > 0 && w.rules.every((r) => known.has(r)), "every rule id exists in the standard");
      assert.ok(w.rules.includes("size"), "the size rule is always named");
      for (const remedy of ["review-router", "consolidate", "move-to-references"]) assert.ok(w.remedy.includes(remedy), `${remedy} is a remedy`);
      assert.ok(!w.remedy.some((r) => /trim|shorten|fewer/.test(r)), "trimming words is never a remedy");
    }
  });

  it("core/T105 [core/F95, core/A50]: a Skill needs one top-level entry, and nothing but SKILL.md, references/, scripts/ and assets/ sits at the top", async () => {
    const { judgeLayout } = await skill();
    assert.deepEqual(judgeLayout(["SKILL.md"]), []);
    assert.deepEqual(judgeLayout(["SKILL.md", "references/a.md", "references/deep/b.md", "scripts/run.mjs", "assets/x.png"]), [], "anything below the permitted folders is free");
    const missing = judgeLayout(["references/a.md"]);
    assert.ok(missing.some((f) => f.rule === "entry"), "no SKILL.md is an entry finding");
    const extra = judgeLayout(["SKILL.md", "README.md", "notes/n.md"]);
    assert.deepEqual(extra.map((f) => f.path).sort(), ["README.md", "notes"], "each stray top-level entry is named once");
    assert.ok(extra.every((f) => f.rule === "layout"));
    assert.deepEqual(judgeLayout(["SKILL.md", "skill.md"]).filter((f) => f.rule === "layout").map((f) => f.path), ["skill.md"], "the entry point is exactly SKILL.md");
  });

  it("core/T106 [core/F96, core/A51, core/N25]: kaal skill check exits 1 on hard or a layout finding and 0 on the other levels, and judges the same files alike wherever they come from", async () => {
    await skill();
    const dirs = [];
    const run = (files) => { const d = make(files); dirs.push(d); return check(d); };
    try {
      assert.equal(run({ "SKILL.md": words(50) }).status, 0);
      for (const n of [250, 450, 600]) assert.equal(run({ "SKILL.md": words(n) }).status, 0, `${n} words warns and passes`);
      const soft = run({ "SKILL.md": words(250) });
      assert.ok((soft.stdout + soft.stderr).trim().length > 0, "a warning is shown");
      assert.equal(run({ "SKILL.md": words(601) }).status, 1, "hard blocks");
      assert.equal(run({ "SKILL.md": words(50), "README.md": "x" }).status, 1, "a layout finding blocks");
      assert.equal(run({ "references/a.md": "x" }).status, 1, "no entry blocks");
      const a = run({ "SKILL.md": words(450), "references/r.md": "r" });
      const b = run({ "SKILL.md": words(450), "references/r.md": "r" });
      assert.equal(a.status, b.status);
      assert.equal(a.stdout.replaceAll(dirs[dirs.length - 2], "<dir>"), b.stdout.replaceAll(dirs[dirs.length - 1], "<dir>"), "the same files give the same report wherever they sit");
    } finally {
      for (const d of dirs) rmSync(d, { recursive: true, force: true });
    }
  });

  it("core/T107 [core/F92, core/A48]: the payload carries a Skill Standard Definition typed by KAAL Definition, and the foundational Nodes are unchanged", async () => {
    const core = await import("kaal-core");
    const bytes = core.payload()["core/Skill-Standard.md"];
    assert.ok(bytes, "blocked before behavioural assertion: the payload carries no core/Skill-Standard.md");
    const id = identify(bytes);
    assert.equal(id.name, "Skill Standard");
    assert.deepEqual(id.type, core.foundation().definition, "typed by KAAL Definition");
    assert.ok(!Object.keys(core.foundation()).some((k) => /skill.?standard/i.test(k)), "it is no foundational Node: the Kernel and every foundational id stay as they are");
  });
});
