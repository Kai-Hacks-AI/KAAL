// The one script, through the command as an agent runs it. The expected form is
// spelled out here as literal text, never produced by calling the script twice.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import { REPO, SCRIPTS } from "../helpers/setup.js";

const run = (...args: string[]) => {
  const r = spawnSync("node", [join(SCRIPTS, "retro.mjs"), ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr.trim() };
};
const dir = (t: TestContext) => {
  const d = mkdtempSync(join(tmpdir(), "retro-"));
  t.after(() => rmSync(d, { recursive: true, force: true }));
  return d;
};
const write = (to: string, a = "a", b = "b", c = "c", d = "d") => run("write", to, "--learned", a, "--liked", b, "--lacked", c, "--longed", d);
const canonical = (a: string, b: string, c: string, d: string) =>
  `# Retro\n\n## Learned\n\n${a}\n\n## Liked\n\n${b}\n\n## Lacked\n\n${c}\n\n## Longed\n\n${d}\n`;

test("write creates exactly the canonical form from four texts, in any flag order, and prints the destination", (t) => {
  const to = join(dir(t), "retro-work.md");
  const r = run("write", to, "--longed", "d", "--lacked", "c", "--liked", "b", "--learned", "a");
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out.trim(), to);
  assert.equal(readFileSync(to, "utf8"), canonical("a", "b", "c", "d"));
});

test("a text may be several paragraphs, read from a file with @, with line ends and the edges normalised", (t) => {
  const d = dir(t);
  writeFileSync(join(d, "learned.txt"), "\n  first\r\n\r\nsecond\n\n");
  const to = join(d, "out.md");
  assert.equal(write(to, `@${join(d, "learned.txt")}`).code, 0);
  assert.equal(readFileSync(to, "utf8"), canonical("first\n\nsecond", "b", "c", "d"));
  assert.equal(run("check", to).code, 0, "what it writes it accepts");
});

test("it refuses an empty part, a heading line, a destination that exists, and a missing or repeated part, and writes nothing", (t) => {
  const d = dir(t);
  const refused = (name: string, r: { code: number | null }, code: number) => {
    assert.equal(r.code, code, name);
    assert.deepEqual(readdirSync(d).filter((f) => f !== "taken.md"), [], `${name}: nothing written`);
  };
  writeFileSync(join(d, "taken.md"), "mine");
  refused("an empty part", write(join(d, "e.md"), "a", "  \n ", "c", "d"), 1);
  refused("a heading line", write(join(d, "h.md"), "a", "b\n## Lacked\nx", "c", "d"), 1);
  refused("a title line", write(join(d, "h2.md"), "# Retro", "b", "c", "d"), 1);
  refused("a missing part", run("write", join(d, "m.md"), "--learned", "a", "--liked", "b", "--lacked", "c"), 2);
  refused("a repeated part", run("write", join(d, "r.md"), "--learned", "a", "--learned", "b", "--lacked", "c", "--longed", "d"), 2);
  refused("an unknown flag", run("write", join(d, "u.md"), "--learned", "a", "--liked", "b", "--lacked", "c", "--wished", "d"), 2);
  assert.equal(write(join(d, "taken.md")).code, 1);
  assert.equal(readFileSync(join(d, "taken.md"), "utf8"), "mine", "an existing file is never replaced");
  assert.match(write(join(d, "taken.md")).err, /never replaced/);
});

test("check accepts exactly the canonical form and nothing else", (t) => {
  const d = dir(t);
  const ok = canonical("a", "b\n\nmore", "c", "d");
  const cases: [string, string, number][] = [
    ["the canonical form", ok, 0],
    ["a title one level down", ok.replace("# Retro", "## Observer retro"), 1],
    ["parts one level down", ok.replace(/^## /gm, "### "), 1],
    ["a part missing", ok.replace("## Lacked\n\nc\n\n", ""), 1],
    ["the parts out of order", canonical("a", "b", "c", "d").replace("## Liked", "## Tmp").replace("## Lacked", "## Liked").replace("## Tmp", "## Lacked"), 1],
    ["an empty part", ok.replace("\nc\n", "\n\n"), 1],
    ["a part that holds a heading", ok.replace("\nd\n", "\nd\n\n#### Aside\n\nx\n"), 1],
    ["an extra part after the last", `${ok}\n## Notes\n\nx\n`, 1],
    ["text before the title", `Note\n\n${ok}`, 1],
    ["no final newline", ok.slice(0, -1), 1],
    ["two final newlines", `${ok}\n`, 1],
    ["carriage returns", ok.replace(/\n/g, "\r\n"), 1],
    ["a missing blank line under a heading", ok.replace("## Liked\n\n", "## Liked\n"), 1],
    ["an empty file", "", 1],
  ];
  for (const [name, content, code] of cases) {
    writeFileSync(join(d, "x.md"), content);
    assert.equal(run("check", join(d, "x.md")).code, code, name);
  }
});

test("every retrospective this repository holds, whatever its seat, is in the canonical form", () => {
  const root = join(REPO, ".kaal", "changes");
  const found: string[] = [];
  for (const path of readdirSync(root, { recursive: true, encoding: "utf8" })) {
    if (/(^|\/)retro[^/]*\.md$/.test(path) && statSync(join(root, path)).isFile()) found.push(path);
  }
  assert.ok(found.length > 0);
  for (const path of found) assert.equal(run("check", join(root, path)).code, 0, path);
});

test("usage is refused with exit 2, and check on a missing file is a failure and not a pass", (t) => {
  assert.equal(run().code, 2);
  assert.equal(run("write").code, 2);
  assert.equal(run("check").code, 2);
  assert.equal(run("check", join(dir(t), "nope.md")).code, 1);
  assert.ok(!existsSync(join(dir(t), "nope.md")));
});

test("there is no way to remove or edit: the script offers write and check only", () => {
  assert.equal(run("remove", "x").code, 2);
  assert.equal(run("edit", "x").code, 2);
});
