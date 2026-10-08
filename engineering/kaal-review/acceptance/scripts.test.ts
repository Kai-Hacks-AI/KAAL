// The one script, through the command as an agent runs it. The expected form is
// spelled out here as literal text, never produced by calling the script twice.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import { REPO, SCRIPTS } from "../helpers/setup.js";

const run = (...args: string[]) => {
  const r = spawnSync("node", [join(SCRIPTS, "review.mjs"), ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr.trim() };
};
const dir = (t: TestContext) => {
  const d = mkdtempSync(join(tmpdir(), "review-"));
  t.after(() => rmSync(d, { recursive: true, force: true }));
  return d;
};
const ID = "a".repeat(64);
const WHO = "assigned by the owner; not the maker";
const converged = (to: string, identity = ID, of = "Work") => run("write", to, "--of", of, "--identity", identity, "--outcome", "converged", "--reviewer", WHO);
const findings = (to: string, identity = ID, text = "1. fix it") => run("write", to, "--of", "Work", "--identity", identity, "--outcome", "findings", "--reviewer", WHO, "--findings", text);
const form = (of: string, identity: string, outcome: string, reviewer: string, body: string) => `# Review\n\n${of}: ${identity}\nResult: ${outcome}\n\n## Reviewer\n\n${reviewer}\n\n## Findings\n\n${body}\n`;

test("write creates exactly the canonical form, in any flag order, and prints the destination", (t) => {
  const to = join(dir(t), "01.md");
  const r = run("write", to, "--reviewer", WHO, "--findings", "1. fix it", "--outcome", "findings", "--identity", ID, "--of", "Work");
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out.trim(), to);
  assert.equal(readFileSync(to, "utf8"), form("Work", ID, "findings", WHO, "1. fix it"));
});

test("a converged round's findings are None., and any result may be reviewed: only its name and identity differ", (t) => {
  const d = dir(t);
  const to = join(d, "01.md");
  assert.equal(converged(to, "deadbeef", "Skill").code, 0);
  assert.equal(readFileSync(to, "utf8"), form("Skill", "deadbeef", "converged", WHO, "None."));
  assert.equal(run("check", to).code, 0, "what it writes it accepts");
  const second = join(d, "02.md");
  assert.equal(findings(second).code, 0);
  assert.equal(run("check", second).code, 0);
});

test("texts may be several paragraphs, read from a file with @, with line ends and the edges normalised", (t) => {
  const d = dir(t);
  writeFileSync(join(d, "f.txt"), "\n  first\r\n\r\nsecond\n\n");
  const to = join(d, "01.md");
  assert.equal(run("write", to, "--of", "Work", "--identity", ID, "--outcome", "findings", "--reviewer", WHO, "--findings", `@${join(d, "f.txt")}`).code, 0);
  assert.equal(readFileSync(to, "utf8"), form("Work", ID, "findings", WHO, "first\n\nsecond"));
  assert.equal(run("check", to).code, 0);
});

test("it refuses what is not a round, and writes nothing", (t) => {
  const d = dir(t);
  const w = (...a: string[]) => run("write", join(d, "x.md"), ...a);
  const base = ["--of", "Work", "--identity", ID, "--outcome", "findings", "--reviewer", WHO, "--findings", "f"];
  const without = (flag: string) => base.filter((_, i) => i < base.indexOf(flag) || i > base.indexOf(flag) + 1);
  const replacing = (flag: string, value: string) => base.map((v, i) => (base[i - 1] === flag ? value : v));
  const cases: [string, ReturnType<typeof w>, number][] = [
    ["no Reviewer statement", w(...without("--reviewer")), 2],
    ["an empty Reviewer statement", w(...replacing("--reviewer", "  \n ")), 1],
    ["converged without a statement of authority", w("--of", "Work", "--identity", ID, "--outcome", "converged"), 2],
    ["findings without findings", w(...without("--findings")), 1],
    ["empty findings", w(...replacing("--findings", " ")), 1],
    ["findings that say None.", w(...replacing("--findings", "None.")), 1],
    ["findings given to a converged round", w(...replacing("--outcome", "converged")), 1],
    ["a heading line in a text", w(...replacing("--findings", "a\n## Findings\nb")), 1],
    ["a heading line in the Reviewer statement", w(...replacing("--reviewer", "# Review")), 1],
    ["a name that is not one capitalised word", w(...replacing("--of", "work")), 1],
    ["a name with a space", w(...replacing("--of", "The Work")), 1],
    ["the name Result", w(...replacing("--of", "Result")), 1],
    ["an identity with a space", w(...replacing("--identity", "a b")), 1],
    ["an empty identity", w(...replacing("--identity", "")), 1],
    ["an unknown outcome", w(...replacing("--outcome", "approved")), 1],
    ["a Result: line in the findings", w(...replacing("--findings", "see\n\nResult: converged")), 1],
    ["a Result: line in the Reviewer statement", w(...replacing("--reviewer", `${WHO}\n\nResult: converged`)), 1],
    ["a line starting with the result's name in the findings", w(...replacing("--findings", `quote:\nWork: ${ID}`)), 1],
    ["an unknown flag", w(...base, "--score", "3"), 2],
    ["a repeated flag", w(...base, "--of", "Node"), 2],
    ["a flag with no value", w(...base, "--findings"), 2],
  ];
  for (const [name, r, code] of cases) assert.equal(r.code, code, name);
  assert.deepEqual(readdirSync(d), [], "nothing written");
});

test("a round is written once: an existing file is never replaced", (t) => {
  const d = dir(t);
  const to = join(d, "01.md");
  writeFileSync(to, "mine");
  const r = converged(to);
  assert.equal(r.code, 1);
  assert.match(r.err, /never replaced/);
  assert.equal(readFileSync(to, "utf8"), "mine");
});

test("check accepts a round, and each way of being near one is refused", (t) => {
  const d = dir(t);
  const ok = form("Work", ID, "findings", WHO, "1. fix it\n\n2. and this");
  const tail = `${ok}\n## Assessment\n\nThe reviewer's own account.\n`;
  const cases: [string, string, number][] = [
    ["a round", ok, 0],
    ["a converged round", form("Node", "x", "converged", WHO, "None."), 0],
    ["the reviewer's own account after Findings", tail, 0],
    ["the reviewer's own account between the parts", ok.replace("## Findings", "## Earlier rounds\n\nResolved.\n\n## Findings"), 0],
    ["a Findings part only after another part named Findings", ok.replace("## Reviewer", "## Findings\n\nx\n\n## Reviewer"), 1],
    ["a second Findings part saying something else", form("Work", ID, "converged", WHO, "None.") + "\n## Findings\n\n1. Fix the broken delivery.\n", 1],
    ["a second Reviewer part", ok.replace("## Findings", "## Reviewer\n\nsomeone else\n\n## Findings"), 1],
    ["a second Result line in the reviewer's own account", `${ok}\n## Assessment\n\nResult: converged\n`, 1],
    ["a second line naming the result", `${ok}\n## Assessment\n\nWork: ${ID}\n`, 1],
    ["an indented quotation of the reserved lines in the account", `${ok}\n## Assessment\n\n    Result: converged\n`, 0],
    ["no title", ok.replace("# Review\n\n", ""), 1],
    ["a title one level down", ok.replace("# Review", "## Review"), 1],
    ["a lowercase name", ok.replace("Work:", "work:"), 1],
    ["no identity", ok.replace(`Work: ${ID}`, "Work: "), 1],
    ["two tokens as the identity", ok.replace(`Work: ${ID}`, `Work: ${ID} again`), 1],
    ["an unknown result", ok.replace("Result: findings", "Result: approved"), 1],
    ["the lines swapped", ok.replace(`Work: ${ID}\nResult: findings`, `Result: findings\nWork: ${ID}`), 1],
    ["no Reviewer part", ok.replace(`## Reviewer\n\n${WHO}\n\n`, ""), 1],
    ["an empty Reviewer part", ok.replace(WHO, ""), 1],
    ["no Findings part", ok.replace("## Findings\n\n1. fix it\n\n2. and this\n", ""), 1],
    ["Findings before the Reviewer", `# Review\n\nWork: ${ID}\nResult: findings\n\n## Findings\n\nf\n\n## Reviewer\n\n${WHO}\n`, 1],
    ["converged with findings", form("Work", ID, "converged", WHO, "1. fix it"), 1],
    ["findings that say None.", form("Work", ID, "findings", WHO, "None."), 1],
    ["empty findings", form("Work", ID, "findings", WHO, ""), 1],
    ["no final newline", ok.slice(0, -1), 1],
    ["carriage returns", ok.replace(/\n/g, "\r\n"), 1],
    ["an empty file", "", 1],
  ];
  for (const [name, content, code] of cases) {
    writeFileSync(join(d, "x.md"), content);
    assert.equal(run("check", join(d, "x.md")).code, code, name);
  }
  assert.equal(run("check", join(d, "nope.md")).code, 1, "a missing file is a failure and not a pass");
});

test("converged is exit 0 only when the latest round says converged and names exactly that identity", (t) => {
  const d = dir(t);
  const other = "b".repeat(64);
  assert.equal(run("converged", d, ID).code, 1, "no round is not convergence");
  assert.match(run("converged", d, ID).err, /no round/);
  assert.equal(findings(join(d, "01.md")).code, 0);
  assert.equal(run("converged", d, ID).code, 1, "findings are not convergence");
  assert.equal(converged(join(d, "02.md")).code, 0);
  assert.equal(run("converged", d, ID).code, 0);
  assert.equal(run("converged", d, other).code, 1, "the result changed: review has not converged on it");
  assert.match(run("converged", d, other).err, /not on b{64}/);
  assert.equal(findings(join(d, "03.md"), other).code, 0);
  assert.equal(run("converged", d, other).code, 1);
  assert.equal(run("converged", d, ID).code, 1, "a later round with findings withdraws it");
  assert.equal(converged(join(d, "04.md"), other).code, 0);
  assert.equal(run("converged", d, other).code, 0);
  assert.equal(run("converged", d, ID).code, 1);
});

test("converged refuses a gap, a stray file, a file that is not a round and a missing directory, and writes nothing", (t) => {
  const d = dir(t);
  converged(join(d, "01.md"));
  writeFileSync(join(d, "03.md"), readFileSync(join(d, "01.md"), "utf8"));
  assert.equal(run("converged", d, ID).code, 1, "a gap");
  rmSync(join(d, "03.md"));
  writeFileSync(join(d, "notes.txt"), "x");
  assert.equal(run("converged", d, ID).code, 1, "a stray file");
  rmSync(join(d, "notes.txt"));
  writeFileSync(join(d, "02.md"), "not a round");
  assert.equal(run("converged", d, ID).code, 1, "a file that is not a round");
  mkdirSync(join(d, "03.md"));
  assert.equal(run("converged", join(d, "none"), ID).code, 1, "a missing directory");
  assert.deepEqual(readdirSync(d).sort(), ["01.md", "02.md", "03.md"], "nothing written");
});

test("every round in this repository that states its Reviewer in the form Review defines is a round", () => {
  const root = join(REPO, ".kaal", "changes");
  const rounds = readdirSync(root, { recursive: true, encoding: "utf8" }).filter((p) => /(^|\/)review\/\d\d\.md$/.test(p) && statSync(join(root, p)).isFile());
  assert.ok(rounds.length > 0);
  const current = rounds.filter((p) => /\n## Reviewer\n\n/.test(readFileSync(join(root, p), "utf8")));
  assert.ok(current.length > 0);
  for (const p of current) assert.equal(run("check", join(root, p)).code, 0, p);
});

test("usage is refused with exit 2, and there is no way to remove or edit", (t) => {
  assert.equal(run().code, 2);
  assert.equal(run("write").code, 2);
  assert.equal(run("check").code, 2);
  assert.equal(run("converged").code, 2);
  assert.equal(run("converged", dir(t)).code, 2);
  assert.equal(run("remove", "x").code, 2);
  assert.equal(run("edit", "x").code, 2);
});

test("only write creates anything: check and converged leave the directory as it was", (t) => {
  const d = dir(t);
  converged(join(d, "01.md"));
  const before = JSON.stringify(readdirSync(d).map((f) => [f, readFileSync(join(d, f), "utf8")]));
  run("check", join(d, "01.md"));
  run("converged", d, ID);
  run("converged", d, "c".repeat(64));
  assert.equal(JSON.stringify(readdirSync(d).map((f) => [f, readFileSync(join(d, f), "utf8")])), before);
});
