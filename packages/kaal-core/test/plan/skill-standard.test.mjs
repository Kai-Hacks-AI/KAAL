// core/C52 planned outer tests: the Skill standard. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/skill-standard/*.md). They
// check the stated criterion: levels, data in a warning, findings, exit codes,
// the ratchet's outcomes and the instances of a Skill.
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
    } finally {
      for (const d of made) rmSync(d, { recursive: true, force: true });
    }
  });

  /** Shared set-up for the instance Cases: a baseline, a runner, and directories removed afterwards. */
  const instances = () => {
    const made = [];
    const mk = (files, name = "kaal-x") => { const d = make(files, name); made.push(d); return d; };
    const json = (obj) => { const d = mkdtempSync(join(tmpdir(), "kaal-skill-json-")); made.push(d); const f = join(d, "f.json"); writeFileSync(f, JSON.stringify(obj)); return f; };
    const at = json({ "kaal-x": { owner: "x", words: 650 } });
    const run = (dir, ...flags) => spawnSync(process.execPath, [CLI, "skill", "check", dir, ...(flags.includes("--baseline") ? [] : ["--baseline", at]), "--json", ...flags], { encoding: "utf8" });
    return { mk, json, run, done: () => { for (const d of made) rmSync(d, { recursive: true, force: true }); } };
  };

  const out = (r) => JSON.parse(r.stdout);

  it("core/T109 [core/F99, core/F100, core/F103, core/A53]: a deployed or Engineering copy is aligned when identical to its source and a differs finding naming the paths otherwise, a finding that exits 0 and exits 1 only with --enforce alignment; a variant is declared only when the owner's declaration lists it, unauthorized when another owner declared it and undeclared when its id is missing; an instance never declares itself; a missing option is unknown", async () => {
    await skill();
    const { mk, json, run, done } = instances();
    try {
      const source = mk({ "SKILL.md": words(300), "references/a.md": "a\n" });
      const copy = (files, ...flags) => run(mk(files), "--as", "deployed", "--from", "engineering", "--of", source, "--version", "1.1.0", "--source", "engineering@abc", ...flags);
      const same = copy({ "SKILL.md": words(300), "references/a.md": "a\n" });
      assert.equal(same.status, 0);
      assert.equal(out(same).alignment.status, "aligned");
      const drift = { "SKILL.md": words(300), "references/a.md": "changed\n" };
      const differs = copy(drift);
      assert.equal(differs.status, 0, "a discrepancy is a finding, not a veto");
      assert.equal(out(differs).alignment.status, "differs");
      assert.deepEqual(out(differs).alignment.differs, ["references/a.md"], "the differing paths are data");
      assert.equal(copy(drift, "--enforce", "alignment").status, 1, "preventive only when enforced");
      assert.equal(out(copy({ "SKILL.md": words(300, "\r\n"), "references/a.md": "a\n" })).alignment.status, "differs", "exact bytes: line endings count");

      const declared = json({ "kaal-x": { owner: "x", variants: { external: { transformation: "External wording" } } } });
      const other = json({ "kaal-x": { owner: "y", variants: { external: { transformation: "External wording" } } } });
      const variant = (d, id = "external", ...flags) => copy(drift, "--owner", "x", "--declared", d, "--id", id, "--enforce", "alignment", ...flags);
      const ok = variant(declared);
      assert.equal(ok.status, 0, "an owner-declared variant is no finding, even when enforced");
      assert.equal(out(ok).alignment.variant, "declared");
      const foreign = variant(other);
      assert.equal(out(foreign).alignment.variant, "unauthorized", "a declaration by another capability is not the owner's");
      assert.equal(foreign.status, 1, "and a finding, which exits 1 when enforced");
      assert.equal(out(variant(declared, "elsewhere")).alignment.variant, "undeclared", "an id the owner did not declare");
      const self = copy({ "SKILL.md": words(300), "variant.json": "{}" }, "--owner", "x", "--declared", declared, "--id", "external");
      assert.equal(self.status, 1, "a file in the instance is a layout finding of the standard, never a declaration");
      assert.equal(copy(drift, "--owner", "x", "--id", "external").status, 2, "no declaration: cannot be judged");
      assert.equal(copy(drift, "--declared", declared).status, 2, "no owner: cannot be judged");
      assert.equal(run(mk({ "SKILL.md": words(300) }), "--as", "deployed", "--of", source, "--version", "1", "--source", "e").status, 2, "no source kind: cannot be judged");
      assert.equal(run(mk({ "SKILL.md": words(300) }), "--as", "deployed", "--from", "engineering").status, 2, "no source: cannot be judged");
      assert.equal(run(mk({ "SKILL.md": words(300) }), "--as", "deployed", "--from", "engineering", "--of", join(tmpdir(), "kaal-no-such-source"), "--version", "1", "--source", "e").status, 2, "a missing source cannot be judged");
      const over = copy({ "SKILL.md": words(651) });
      assert.equal(over.status, 1, "an instance from Engineering is held to the canonical's entry as a ceiling");
      assert.equal(out(over).ratchet, "grew");
    } finally { done(); }
  });

  it("core/T110 [core/F101, core/A54]: content under .kaal/ is installed content: it is compared with the npmjs artifact of the given version and that artifact with its Git tag, each as aligned or differs with the paths and the version, a finding exiting 0 (1 with --enforce alignment); it cannot be judged without the artifact or its version or under another role", async () => {
    await skill();
    const { mk, run, done } = instances();
    const root = mkdtempSync(join(tmpdir(), "kaal-skill-installed-"));
    const installed = (files) => { const d = join(root, ".kaal", "kaal-x"); rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }); for (const [path, text] of Object.entries(files)) { mkdirSync(join(d, path, ".."), { recursive: true }); writeFileSync(join(d, path), text); } return d; };
    const v1 = { "SKILL.md": words(300), "references/a.md": "one\n" };
    try {
      const artifact = mk(v1); const v2 = mk({ ...v1, "references/a.md": "two\n" });
      const tagged = mk(v1); const retagged = mk({ ...v1, "references/a.md": "tag\n" });
      const dir = installed(v1);
      const good = run(dir, "--as", "installed", "--of", artifact, "--version", "1.0.0", "--tag", "v1.0.0", "--tag-of", tagged);
      assert.equal(good.status, 0);
      assert.equal(out(good).alignment.status, "aligned");
      assert.equal(out(good).alignment.reference.version, "1.0.0", "the result names the version compared");
      assert.equal(out(good).alignment.tag.status, "aligned");
      assert.equal(out(good).alignment.tag.name, "v1.0.0");
      const bad = run(dir, "--as", "installed", "--of", artifact, "--version", "1.0.0", "--tag", "v1.0.0", "--tag-of", retagged);
      assert.equal(out(bad).alignment.tag.status, "differs", "the artifact is checked against its tag");
      assert.deepEqual(out(bad).alignment.tag.differs, ["references/a.md"]);
      assert.equal(bad.status, 0, "a finding, not a veto");
      const wrong = run(dir, "--as", "installed", "--of", v2, "--version", "2.0.0");
      assert.equal(out(wrong).alignment.status, "differs", "compared with another version it is not that version");
      assert.deepEqual(out(wrong).alignment.differs, ["references/a.md"]);
      const altered = installed({ ...v1, "references/extra.md": "local\n" });
      const found = run(altered, "--as", "installed", "--of", artifact, "--version", "1.0.0");
      assert.equal(found.status, 0, "untraceable content is a detective finding for now");
      assert.deepEqual(out(found).alignment.differs, ["references/extra.md"]);
      assert.equal(run(altered, "--as", "installed", "--of", artifact, "--version", "1.0.0", "--enforce", "alignment").status, 1, "and a veto once the Owner makes it preventive");
      installed(v1);
      assert.equal(run(dir, "--of", artifact, "--version", "1.0.0").status, 0, "under .kaal/ the role is installed without being named");
      assert.equal(run(dir).status, 2, "no artifact: cannot be judged, never clean");
      assert.equal(run(dir, "--of", artifact).status, 2, "no version: cannot be judged");
      assert.equal(run(dir, "--as", "engineering", "--of", artifact, "--version", "1.0.0", "--source", "engineering@abc").status, 2, ".kaal/ is never Engineering");
    } finally { done(); rmSync(root, { recursive: true, force: true }); }
  });

  it("core/T111 [core/F102, core/A53]: Engineering's copy is compared with the current owning package and both sources and versions are named, never with a published version unless that is the source given", async () => {
    await skill();
    const { mk, run, done } = instances();
    try {
      const pkg = mk({ "SKILL.md": words(300), "references/a.md": "pkg\n" });
      const eng = mk({ "SKILL.md": words(300), "references/a.md": "eng\n" });
      const r = run(eng, "--as", "engineering", "--of", pkg, "--version", "1.1.0", "--source", "engineering@abc");
      assert.equal(r.status, 0, "a difference alone is no violation");
      const a = out(r).alignment;
      assert.equal(a.status, "differs");
      assert.equal(a.source, "engineering@abc", "the development source is named");
      assert.equal(a.reference.version, "1.1.0", "and the package version it is compared with");
      assert.deepEqual(a.differs, ["references/a.md"], "the differences are data");
      assert.equal(run(eng, "--as", "engineering", "--of", pkg, "--source", "engineering@abc").status, 2, "no package version: cannot be judged");
      assert.equal(run(eng, "--as", "engineering", "--of", pkg, "--version", "1.1.0").status, 2, "no source: cannot be judged");
      assert.equal(run(eng, "--as", "engineering").status, 2, "no package: cannot be judged");
      assert.equal(run(eng, "--of", pkg, "--version", "1.1.0", "--source", "x").status, 2, "alignment options without a role cannot be judged");
    } finally { done(); }
  });

  it("core/T112 [core/F104, core/A54, core/I35]: conformance follows the lifecycle: the package and an Engineering copy are held to the ratchet (the package stale included), installed content and a deployment from .kaal/ are reported as published and never block, and a shrinking allowance changes only the development verdict", async () => {
    await skill();
    const { mk, json, run, done } = instances();
    const root = mkdtempSync(join(tmpdir(), "kaal-skill-lifecycle-"));
    const installed = (files) => { const d = join(root, ".kaal", "kaal-x"); rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }); for (const [path, text] of Object.entries(files)) { mkdirSync(join(d, path, ".."), { recursive: true }); writeFileSync(join(d, path), text); } return d; };
    try {
      const big = { "SKILL.md": words(700), "junk/x.md": "x\n" };
      const artifact = mk(big);
      const dir = installed(big);
      const published = run(dir, "--as", "installed", "--of", artifact, "--version", "1.0.0");
      assert.equal(published.status, 0, "a legitimately published version is not a violation");
      assert.equal(out(published).conformance, "published");
      assert.equal(out(published).level, "hard", "its level is reported");
      assert.ok(out(published).findings.length > 0, "and so is its layout, which does not block");
      assert.equal(out(published).ratchet, undefined, "the ratchet does not read it");
      const shrunk = json({ "kaal-x": { owner: "x", words: 640 } });
      assert.equal(run(dir, "--baseline", shrunk, "--as", "installed", "--of", artifact, "--version", "1.0.0").status, 0, "a shrinking allowance does not invalidate a published version");
      const fromKaal = run(mk(big), "--as", "deployed", "--from", "kaal", "--of", artifact, "--version", "1.0.0", "--source", "kaal");
      assert.equal(fromKaal.status, 0, "a deployment from .kaal/ is as published");
      assert.equal(out(fromKaal).conformance, "published");
      const fromEng = run(mk(big), "--as", "deployed", "--from", "engineering", "--of", artifact, "--version", "1.1.0", "--source", "engineering@abc");
      assert.equal(fromEng.status, 1, "a deployment from Engineering is of the development lifecycle");
      assert.equal(out(fromEng).conformance, "development");
      assert.equal(run(mk(big), "--as", "engineering", "--of", artifact, "--version", "1.1.0", "--source", "engineering@abc").status, 1, "an Engineering copy is held to the ratchet");
      const pkg = mk({ "SKILL.md": words(650) });
      assert.equal(run(pkg, "--baseline", shrunk).status, 1, "the package at N+1 is held to the shrunk allowance");
      assert.equal(out(run(mk({ "SKILL.md": words(630) }), "--baseline", shrunk)).ratchet, "stale", "and judged as the canonical, stale included");
    } finally { done(); rmSync(root, { recursive: true, force: true }); }
  });
});
