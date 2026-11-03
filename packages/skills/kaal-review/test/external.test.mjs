import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
const SKILL = join(PACKAGE, "skills", "kaal-review");
const text = (...p) => readFileSync(join(SKILL, ...p), "utf8");

const snapshot = (dir) => {
  const out = {};
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else out[relative(dir, p)] = readFileSync(p, "utf8");
    }
  };
  walk(dir);
  return out;
};

describe("the standalone declaration (review/T17: E0, E1, E2, E5)", () => {
  const decl = () => text("references", "standalone.md");

  it("exists and is linked from SKILL.md", () => {
    assert.ok(existsSync(join(SKILL, "references", "standalone.md")));
    assert.match(text("SKILL.md"), /references\/standalone\.md/);
  });

  it("states standing alone and what it needs", () => {
    const d = decl();
    assert.match(d, /stands? alone/i);
    assert.match(d, /needs nothing but a reader/i);
    assert.match(d, /Node 24 or later/);
    assert.match(d, /check-record/);
    assert.match(d, /collect/);
    assert.match(d, /optional/i);
  });

  it("states the intended effects in the three-part vocabulary", () => {
    const d = decl();
    assert.match(d, /knowledge access/i);
    assert.match(d, /intended effects/i);
    assert.match(d, /target authority/i);
    assert.match(d, /read the files they are given and print/i);
    assert.match(d, /authorized agent may (still )?post/i);
    assert.match(d, /grants? no authority/i);
  });

  it("names the version rule and the schema", () => {
    const d = decl();
    assert.match(d, /commit/i);
    assert.match(d, /kaal-review\/1/);
  });

  it("is the only place the declaration is made: README and Nodes do not restate it", () => {
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    assert.match(readme, /standalone\.md/);
    assert.doesNotMatch(readme, /needs nothing but a reader/i);
    for (const f of readdirSync(join(PACKAGE, "payload"))) {
      assert.doesNotMatch(readFileSync(join(PACKAGE, "payload", f), "utf8"), /needs nothing but a reader/i, f);
    }
  });
});

describe("the scripts have no effects beyond output (review/T18: E3)", () => {
  const scripts = join(SKILL, "scripts");

  it("import only node: built-ins and local files", () => {
    for (const f of readdirSync(scripts)) {
      const src = readFileSync(join(scripts, f), "utf8");
      for (const m of src.matchAll(/^\s*import\s[^;]*?from\s+"([^"]+)"/gm)) {
        assert.ok(m[1].startsWith("node:") || m[1].startsWith("./"), `${f} imports ${m[1]}`);
      }
      assert.doesNotMatch(src, /\bimport\(|require\(/, `${f} loads dynamically`);
    }
  });

  it("use no writing or process-spawning API", () => {
    for (const f of readdirSync(scripts)) {
      const src = readFileSync(join(scripts, f), "utf8");
      assert.doesNotMatch(src, /writeFile|appendFile|mkdir|rm\(|rmSync|unlink|rename|copyFile|createWriteStream|child_process|spawn|execSync|execFile|fetch\(|node:net|node:http/, f);
    }
  });

  it("leave a temporary directory unchanged when run on a fixture", () => {
    const dir = mkdtempSync(join(tmpdir(), "review-t18-"));
    cpSync(join(PACKAGE, "test", "fixtures", "record-valid.json"), join(dir, "record.json"));
    const before = snapshot(dir);
    for (const [script, args] of [["check-record.mjs", ["record.json"]], ["collect.mjs", ["record.json"]]]) {
      const r = spawnSync(process.execPath, [join(scripts, script), ...args], { cwd: dir, encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
    }
    assert.deepEqual(snapshot(dir), before);
  });
});

describe("the declaration is true of the package (review/T19: E4, N3)", () => {
  it("every file it names exists in the package", () => {
    const d = text("references", "standalone.md");
    const names = [...d.matchAll(/`((?:references|scripts)\/[^`\s]+|SKILL\.md)`/g)].map((m) => m[1]);
    assert.ok(names.length > 0);
    for (const n of names) assert.ok(existsSync(join(SKILL, n)), n);
  });

  it("keeps SKILL.md under 100 lines and names no capability or role", () => {
    assert.ok(text("SKILL.md").split("\n").length < 100);
    const all = [text("SKILL.md"), text("references", "standalone.md")].join("\n");
    for (const name of ["kaal-packaging", "kaal-hosting", "kaal-testing", "kaal-graph", "kaal-change", "kaal-guard", "kaal-roles", "CPO Advisor", "CTO Advisor"]) {
      assert.equal(all.includes(name), false, name);
    }
  });
});
