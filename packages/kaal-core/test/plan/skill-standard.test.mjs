// core/C52 planned outer tests: the Skill standard. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/skill-standard/*.md). They
// check the stated criterion: levels, data in a warning, findings, exit codes,
// the ratchet's outcomes and the lifecycle.
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
function make(files, name = "kaal-x") {
  const dir = join(mkdtempSync(join(tmpdir(), "kaal-skill-std-")), name);
  mkdirSync(dir, { recursive: true });
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return dir;
}

const check = (dir, ...flags) => spawnSync(process.execPath, [CLI, "skill", "check", dir, ...flags], { encoding: "utf8" });

describe("Skill standard (core/C52)", () => {
  it("core/T103 [core/F93, core/F98, core/A49]: the size levels change exactly at 200, 400 and 600 words of the body, the frontmatter is not counted, and the count is the same with CRLF", async () => {
    const { judgeSize } = await skill();
    const level = (n) => judgeSize(words(n)).level;
    assert.deepEqual([0, 1, 200].map(level), ["ok", "ok", "ok"]);
    assert.deepEqual([201, 400].map(level), ["soft", "soft"]);
    assert.deepEqual([401, 600].map(level), ["medium", "medium"]);
    assert.deepEqual([601, 2000].map(level), ["hard", "hard"]);
    assert.equal(judgeSize(words(300)).words, 300);
    const lines = Array.from({ length: 300 }, (_, i) => `line ${i} here`).join("\n");
    assert.equal(judgeSize(lines).words, judgeSize(lines.replaceAll("\n", "\r\n")).words, "line endings do not change the count");
    const front = "---\nname: x\ndescription: a long description with many words that must not count\n---\n";
    assert.equal(judgeSize(front + words(198)).words, 198, "the frontmatter is not counted");
    assert.equal(judgeSize(front.replaceAll("\n", "\r\n") + words(198)).words, 198, "nor with CRLF");
    assert.equal(judgeSize("\ufeff" + front + words(198)).words, 198, "nor behind a byte order mark");
    assert.equal(judgeSize(front + words(600)).level, "medium", "exactly 600 body words is permitted");
    assert.equal(judgeSize(front + words(601)).level, "hard");
    assert.equal(judgeSize(words(50) + "\n---\nnot: frontmatter\n---\n" + words(10)).words, 50 + 10 + 4, "a block that does not start the file is not frontmatter");
    assert.equal(judgeSize("---\nname: x\n" + words(10)).words, 3 + 10, "an unterminated block counts whole");
  });

  it("core/T104 [core/F94, core/A49, core/N26]: a warning carries rule ids that exist, the three remedies and never trimming, a response that grows by stage, and only hard blocks", async () => {
    const { judgeSize, standard } = await skill();
    const known = new Set(standard.rules.map((r) => r.id ?? r));
    assert.equal(judgeSize(words(100)).warning, undefined, "ok has no warning");
    const stages = [];
    for (const [n, level, blocks] of [[250, "soft", false], [450, "medium", false], [650, "hard", true]]) {
      const w = judgeSize(words(n)).warning;
      assert.ok(w, `${level} has a warning`);
      assert.equal(w.level, level);
      assert.equal(w.blocks, blocks, `${level} ${blocks ? "blocks" : "does not block"}`);
      assert.ok(w.rules.every((r) => known.has(r)), "every rule id exists in the standard");
      for (const rule of ["size", "router", "detail", "lane"]) assert.ok(w.rules.includes(rule), `${rule} is restated at every stage`);
      for (const remedy of ["review-router", "consolidate", "move-to-references"]) assert.ok(w.remedy.includes(remedy), `${remedy} is a remedy`);
      assert.ok(![...w.remedy, ...w.required].some((r) => /trim|shorten|fewer/.test(r)), "trimming words is never asked for");
      assert.ok(w.required.length > 0);
      stages.push(w);
    }
    for (const [lower, higher] of [[0, 1], [1, 2]]) {
      assert.ok(stages[lower].required.every((a) => stages[higher].required.includes(a)), "a higher stage keeps what the lower one required");
      assert.ok(stages[higher].required.length > stages[lower].required.length, "and requires more");
    }
  });

  it("core/T105 [core/F95, core/N27, core/A50]: a Skill needs SKILL.md and nothing else, and nothing but SKILL.md, references/, scripts/ and assets/ sits at the top", async () => {
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
      assert.equal(check(join(tmpdir(), "kaal-no-such-skill-dir")).status, 2, "a directory it cannot judge is unknown, never clean");
      const data = JSON.parse(check(dirs[dirs.length - 1], "--json").stdout);
      assert.equal(data.level, "ok", "--json prints the verdict as data");
      const hard = make({ "SKILL.md": words(650), "x.md": "x" });
      dirs.push(hard);
      const verdict = JSON.parse(check(hard, "--json").stdout);
      assert.equal(verdict.level, "hard");
      assert.equal(verdict.warning.blocks, true);
      assert.deepEqual(verdict.findings.map((f) => f.path), ["x.md"]);
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

  it("core/T108 [core/F97, core/A52, core/N26]: against a baseline keyed by canonical name and owner, a hard Skill is known at its recorded words, grew above them, new without an entry and stale below them; with no baseline it blocks; an unreadable or ownerless baseline is unknown", async () => {
    await skill();
    const made = [];
    const skillDir = (n, name = "kaal-x") => { const d = make({ "SKILL.md": words(n) }, name); made.push(d); return d; };
    const baseline = (obj) => { const d = mkdtempSync(join(tmpdir(), "kaal-skill-baseline-")); made.push(d); const f = join(d, "baseline.json"); writeFileSync(f, typeof obj === "string" ? obj : JSON.stringify(obj)); return f; };
    const run = (dir, file, ...flags) => spawnSync(process.execPath, [CLI, "skill", "check", dir, "--baseline", file, "--json", ...flags], { encoding: "utf8" });
    try {
      const e = (words) => ({ owner: "x", words });
      const at = baseline({ "kaal-x": e(650) });
      assert.equal(run(skillDir(650), at).status, 0, "known: equal to its recorded words");
      assert.equal(JSON.parse(run(skillDir(650), at).stdout).ratchet, "known");
      const grew = run(skillDir(651), at);
      assert.equal(grew.status, 1, "grew: above its recorded words");
      assert.equal(JSON.parse(grew.stdout).ratchet, "grew");
      const stale = run(skillDir(640), at);
      assert.equal(stale.status, 1, "stale: below its recorded words, until the entry is lowered");
      assert.equal(JSON.parse(stale.stdout).ratchet, "stale");
      assert.equal(run(skillDir(640), baseline({ "kaal-x": e(640) })).status, 0, "lowered, it is known again");
      assert.equal(run(skillDir(500), at).status, 1, "no longer hard, the entry is stale and must go");
      assert.equal(run(skillDir(500), baseline({})).status, 0, "removed, it passes");
      const fresh = run(skillDir(650, "kaal-y"), at);
      assert.equal(fresh.status, 1, "new: no entry");
      assert.equal(JSON.parse(fresh.stdout).ratchet, "new");
      assert.equal(check(skillDir(650)).status, 1, "no baseline: hard blocks");
      assert.equal(run(skillDir(650), baseline("not json")).status, 2, "an unreadable baseline is unknown");
      assert.equal(run(skillDir(650), baseline({ "kaal-x": { words: 650 } })).status, 2, "an entry without its owner is unreadable");
      assert.equal(run(skillDir(650), baseline({ "kaal-x": 650 })).status, 2, "a bare number is not an entry");
      assert.equal(run(skillDir(650), join(tmpdir(), "kaal-no-such-baseline.json")).status, 2, "a missing baseline is unknown");
      const copy = (n, name, ...flags) => run(skillDir(n, name), at, "--instance", ...flags);
      assert.equal(copy(650, "kaal-x").status, 0, "a copy at the entry is known");
      assert.equal(copy(300, "kaal-x").status, 0, "a copy below the entry is not stale: only the Skill itself retires an entry");
      assert.equal(copy(651, "kaal-x").status, 1, "a copy above the entry grew: it has no allowance of its own");
      assert.equal(JSON.parse(copy(651, "kaal-x").stdout).ratchet, "grew");
      assert.equal(JSON.parse(copy(650, "kaal-y").stdout).ratchet, "new", "a copy of a Skill with no entry is new, never given an entry of its own");
      assert.equal(copy(650, "kaal-y").status, 1);
    } finally {
      for (const d of made) rmSync(d, { recursive: true, force: true });
    }
  });

  it("core/T109 [core/F99, core/A52, core/I31]: conformance follows the lifecycle: by default the package is held to the ratchet (stale included), a published lifecycle is reported (level, warning and layout) and never blocks, and a shrinking allowance changes only the development verdict", async () => {
    await skill();
    const made = [];
    const mk = (files, name = "kaal-x") => { const d = make(files, name); made.push(d); return d; };
    const baseline = (obj) => { const d = mkdtempSync(join(tmpdir(), "kaal-skill-baseline-")); made.push(d); const f = join(d, "baseline.json"); writeFileSync(f, JSON.stringify(obj)); return f; };
    const run = (dir, file, ...flags) => spawnSync(process.execPath, [CLI, "skill", "check", dir, "--baseline", file, "--json", ...flags], { encoding: "utf8" });
    const out = (r) => JSON.parse(r.stdout);
    try {
      const e = (words) => ({ "kaal-x": { owner: "x", words } });
      const at = baseline(e(650)); const shrunk = baseline(e(640));
      const big = { "SKILL.md": words(700), "junk/x.md": "x\n" };
      const published = run(mk(big), at, "--lifecycle", "published");
      assert.equal(published.status, 0, "a published lifecycle is reported and never blocks");
      assert.equal(out(published).conformance, "published");
      assert.equal(out(published).level, "hard", "its level is reported");
      assert.ok(out(published).findings.length > 0, "and so is its layout");
      assert.ok(out(published).warning, "and its warning");
      assert.equal(out(published).ratchet, undefined, "the ratchet does not read it");
      assert.equal(run(mk(big), shrunk, "--lifecycle", "published").status, 0, "a shrinking allowance does not invalidate it");
      assert.equal(run(mk({ "SKILL.md": words(650) }), shrunk, "--lifecycle", "published").status, 0);
      const dev = run(mk(big), at, "--lifecycle", "development");
      assert.equal(dev.status, 1, "the development lifecycle blocks");
      assert.equal(out(dev).conformance, "development");
      assert.equal(run(mk(big), at).status, 1, "development is the default");
      assert.equal(run(mk({ "SKILL.md": words(650) }), shrunk).status, 1, "the package at N+1 is held to the shrunk allowance");
      assert.equal(out(run(mk({ "SKILL.md": words(630) }), shrunk)).ratchet, "stale", "and judged as the Skill itself, stale included");
      assert.equal(run(mk(big), at, "--lifecycle", "elsewhere").status, 2, "an unknown lifecycle cannot be judged");
    } finally {
      for (const d of made) rmSync(d, { recursive: true, force: true });
    }
  });
});
