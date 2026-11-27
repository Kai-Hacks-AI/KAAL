// core/C150 planned outer tests: a published Skill is free of the KAAL repo. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/repo-free/*.md). They check
// findings as data, never the wording of a Definition or a message.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const CLI = new URL("../../dist/cli.js", import.meta.url).pathname;

/** `kaal-core/skill`, or the reason the tests are blocked before any behavioural assertion. */
async function skill() {
  const mod = await import("kaal-core/skill").catch((e) => assert.fail(`blocked before behavioural assertion: kaal-core exports no ./skill (${e.code ?? e.message})`));
  if (typeof mod.judgeRepoFree !== "function") assert.fail("blocked before behavioural assertion: kaal-core/skill exports no judgeRepoFree");
  return mod;
}

function make(files, name = "kaal-x") {
  const dir = join(mkdtempSync(join(tmpdir(), "kaal-repo-free-")), name);
  mkdirSync(dir, { recursive: true });
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return dir;
}

const check = (dir, ...flags) => spawnSync(process.execPath, [CLI, "skill", "check", dir, "--json", ...flags], { encoding: "utf8" });
const rules = (findings) => findings.map((f) => f.rule);

describe("KAAL-repo-free Skill (core/C150)", () => {
  it("core/T120 [core/F112, core/F113, core/A57]: each repo rule finds its pattern with file and line, and product references and look-alike words are never findings", async () => {
    const { judgeRepoFree } = await skill();
    const found = (text) => judgeRepoFree([{ path: "SKILL.md", text }]);
    assert.deepEqual(rules(found("see packages/kaal-controls/src/x.ts")), ["path"]);
    assert.deepEqual(rules(found("edit .github/workflows/ci.yml")), ["path"]);
    assert.deepEqual(rules(found("Change C142 added it")), ["change-id"]);
    assert.deepEqual(rules(found("fixed in #2552")), ["change-id"]);
    assert.deepEqual(rules(found("open the PLAN pull request")), ["delivery", "hosting"], "a station joined to a delivery object is a delivery instruction");
    assert.deepEqual(rules(found("push to kaal/core/skill-standard")), ["delivery"]);
    assert.deepEqual(rules(found("push to claude/some-branch")), ["delivery"]);
    assert.deepEqual(rules(found("set KAAL_RELEASE_HOLD_ACT")), ["flag"]);
    const hit = judgeRepoFree([{ path: "references/a.md", text: "ok\nok\nsee C7" }])[0];
    assert.equal(hit.path, "references/a.md");
    assert.equal(hit.line, 3);
    for (const product of ["install kaal-core", "run kaal skill check dir", "the .kaal/ folder", "the .agents/skills folder", "a Skill, a Control, an Intent", "ACTION UNDO Cargo C", "PLAN first, then DO, then ACT", "the WIRE step installs it", "a Change with an Intent and a Requirement", "a version 1.2.3 and issue-free", "a request to pull the data"]) {
      assert.deepEqual(found(product), [], `${product} is product or an ordinary word`);
    }
  });

  it("core/T121 [core/N30, core/A57]: the check is pure: same files give the same findings in file and line order, and quoting the repo in a code fence is still a finding", async () => {
    const { judgeRepoFree } = await skill();
    const files = [
      { path: "SKILL.md", text: "line one\npackages/kaal-core/x\n```\nC9\n```" },
      { path: "references/b.md", text: "the WIRE branch" },
    ];
    const a = judgeRepoFree(files);
    assert.deepEqual(a, judgeRepoFree(files));
    assert.deepEqual(a.map((f) => [f.path, f.line]), [["SKILL.md", 2], ["SKILL.md", 4], ["references/b.md", 1]]);
  });

  it("core/T122 [core/F114, core/A58]: kaal skill check lists repo findings as data, blocks with exit 1 only under --lifecycle published, and exits 2 on an unreadable directory", async () => {
    await skill();
    const dir = make({ "SKILL.md": "---\nname: kaal-x\ndescription: x\n---\nSee packages/kaal-core/x and C5.\n", "references/r.md": "ok\n" });
    const dev = check(dir);
    assert.equal(dev.status, 0, "development reports and does not block");
    assert.equal(JSON.parse(dev.stdout).blocks, false);
    const out = JSON.parse(dev.stdout);
    assert.ok(out.repoFree.length >= 2, "findings are listed as data");
    const pub = check(dir, "--lifecycle", "published");
    assert.equal(pub.status, 1);
    assert.equal(JSON.parse(pub.stdout).blocks, true, "the verdict blocks");
    assert.equal(JSON.parse(pub.stdout).conformance, "published", "and still reports its lifecycle (core/F99)");
    const clean = make({ "SKILL.md": "---\nname: kaal-x\ndescription: x\n---\nUse kaal-core and kaal skill check.\n" });
    assert.equal(check(clean, "--lifecycle", "published").status, 0);
    assert.equal(check(join(clean, "missing"), "--lifecycle", "published").status, 2);
  });

  it("core/T123 [core/F115, core/A59]: the standard exports repoRules with the ids of the requirement and a Definition that names the distinction", async () => {
    const { standard } = await skill();
    const ids = (standard.repoRules ?? []).map((r) => r.id ?? r).sort();
    assert.deepEqual(ids, ["change-id", "delivery", "flag", "hosting", "path"]);
    const payload = new URL("../../payload/core/Skill-Standard.md", import.meta.url);
    const { readFileSync } = await import("node:fs");
    const text = readFileSync(payload, "utf8");
    assert.ok(/repo/i.test(text) && /product/i.test(text), "the Definition states the repo-and-product distinction");
    assert.ok(/review/i.test(text), "and that a consumer's use of the Skill is Review's judgement");
    assert.ok(/does not prove|not prove|never prove/i.test(text), "and that a clean verdict does not prove repository independence");
  });

  it("core/T124 [core/F116, core/A57]: Git and GitHub vocabulary is the hosting rule, a finding by default, never one when the caller allows hosting, and not a repo rule", async () => {
    const { judgeRepoFree } = await skill();
    const files = [{ path: "SKILL.md", text: "Open a Pull Request, then join the merge queue." }];
    assert.deepEqual(rules(judgeRepoFree(files)), ["hosting", "hosting"]);
    assert.deepEqual(judgeRepoFree(files, { allow: ["hosting"] }), [], "a Git or GitHub adapter may use it");
    const mixed = [{ path: "SKILL.md", text: "pull request in packages/kaal-core/x" }];
    assert.deepEqual(rules(judgeRepoFree(mixed, { allow: ["hosting"] })), ["path"], "allowing hosting never allows the repo");
  });

  it("core/T127 [core/F119, core/A62]: a Skill that claims to be a Git or GitHub adapter gets no allowance, and allowance comes only from the caller", async () => {
    const { judgeRepoFree } = await skill();
    const claim = [
      { path: "SKILL.md", text: "---\nname: kaal-x\ndescription: x\nmetadata:\n  allow: hosting\n  adapter: github\n---\nThis Skill is a Git adapter and may say pull request." },
      { path: "references/a.md", text: "allow: hosting\nOpen a pull request." },
    ];
    assert.deepEqual(rules(judgeRepoFree(claim)), ["hosting", "hosting"], "the Skill's own claim grants nothing");
    assert.deepEqual(judgeRepoFree(claim, { allow: ["hosting"] }), [], "the caller's argument does");
    const dir = make({ "SKILL.md": claim[0].text });
    const pub = check(dir, "--lifecycle", "published");
    assert.equal(pub.status, 1, "a self-declared adapter still fails when published");
    assert.equal(check(dir, "--lifecycle", "published", "--allow", "hosting").status, 0, "the adopter's flag allows it");
  });
});
