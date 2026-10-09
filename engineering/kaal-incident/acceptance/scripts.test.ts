// The one script, through the command as an agent runs it. The expected form is
// spelled out here as literal text, never produced by calling the script twice.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import { SCRIPTS } from "../helpers/setup.js";

const run = (...args: string[]) => {
  const r = spawnSync("node", [join(SCRIPTS, "incident.mjs"), ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr.trim() };
};
/** A directory that is a KAAL directory as far as the script is concerned: it has core/. */
const kaal = (t: TestContext) => {
  const d = mkdtempSync(join(tmpdir(), "incident-"));
  t.after(() => rmSync(d, { recursive: true, force: true }));
  mkdirSync(join(d, "core"));
  return d;
};
const everything = (d: string) => readdirSync(d, { recursive: true, encoding: "utf8" }).sort();
const write = (to: string, a = "a", b = "b", ...more: string[]) => run("write", to, "--happened", a, "--expected", b, ...more);
const canonical = (a: string, b: string) => `# KAAL Incident\n\n## Happened\n\n${a}\n\n## Expected\n\n${b}\n`;

test("write creates exactly the canonical form from two texts, in any flag order, where the day's carriers are kept, and prints that path", (t) => {
  const d = kaal(t);
  const r = run("write", d, "--expected", "b", "--happened", "a", "--date", "2026-10-07");
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out.trim(), "incidents/26/10/07/01.md", "the path relative to the KAAL directory");
  assert.equal(readFileSync(join(d, "incidents/26/10/07/01.md"), "utf8"), canonical("a", "b"));
  assert.deepEqual(everything(d), ["core", "incidents", "incidents/26", "incidents/26/10", "incidents/26/10/07", "incidents/26/10/07/01.md"].sort(), "nothing else is written");
});

test("carriers are numbered one after the highest of their day, a gap is never reused, a day has 99, and another day starts again", (t) => {
  const d = kaal(t);
  const on = (date: string) => write(d, "a", "b", "--date", date);
  assert.equal(on("2026-10-07").out.trim(), "incidents/26/10/07/01.md");
  assert.equal(on("2026-10-07").out.trim(), "incidents/26/10/07/02.md");
  rmSync(join(d, "incidents/26/10/07/01.md"));
  assert.equal(on("2026-10-07").out.trim(), "incidents/26/10/07/03.md", "the number of a removed carrier is not given again");
  assert.equal(on("2026-10-08").out.trim(), "incidents/26/10/08/01.md");
  assert.equal(on("2027-01-02").out.trim(), "incidents/27/01/02/01.md");
  writeFileSync(join(d, "incidents/26/10/07/99.md"), "x");
  const full = on("2026-10-07");
  assert.equal(full.code, 1);
  assert.match(full.err, /full/);
  assert.ok(!existsSync(join(d, "incidents/26/10/07/100.md")));
});

test("without a date it is dated today in UTC", (t) => {
  const d = kaal(t);
  const day = () => new Date().toISOString().slice(2, 10).split("-").join("/");
  const before = day();
  const r = write(d);
  const after = day();
  assert.equal(r.code, 0, r.err);
  assert.ok([before, after].some((today) => r.out.trim() === `incidents/${today}/01.md`), r.out);
});

test("a text may be several paragraphs, read from a file with @, with line ends and the edges normalised", (t) => {
  const d = kaal(t);
  const f = join(d, "text.txt");
  writeFileSync(f, "\n  first\r\n\r\nsecond\n\n");
  const r = write(d, `@${f}`, "b", "--date", "2026-10-07");
  assert.equal(r.code, 0, r.err);
  assert.equal(readFileSync(join(d, r.out.trim()), "utf8"), canonical("first\n\nsecond", "b"));
  assert.equal(run("check", join(d, r.out.trim())).code, 0, "what it writes it accepts");
});

test("it refuses an empty part, a heading line, a bad date, a directory that is not a KAAL directory, and a missing, repeated or unknown flag, and writes nothing", (t) => {
  const d = kaal(t);
  const refused = (name: string, r: { code: number | null }, code: number) => {
    assert.equal(r.code, code, name);
    assert.deepEqual(everything(d), ["core"], `${name}: nothing written`);
  };
  refused("an empty part", write(d, "a", "  \n "), 1);
  refused("a heading line", write(d, "a", "b\n## Happened\nx"), 1);
  refused("a title line", write(d, "# KAAL Incident", "b"), 1);
  refused("a bad date", write(d, "a", "b", "--date", "2026-02-30"), 1);
  refused("a date in another form", write(d, "a", "b", "--date", "7.10.2026"), 1);
  refused("a missing part", run("write", d, "--happened", "a"), 2);
  refused("a repeated part", run("write", d, "--happened", "a", "--happened", "b", "--expected", "c"), 2);
  refused("a repeated date", run("write", d, "--happened", "a", "--expected", "b", "--date", "2026-10-07", "--date", "2026-10-07"), 2);
  refused("an unknown flag", run("write", d, "--happened", "a", "--other", "b"), 2);
  const bare = mkdtempSync(join(tmpdir(), "incident-"));
  t.after(() => rmSync(bare, { recursive: true, force: true }));
  assert.equal(write(bare).code, 1, "a directory with no core/ is not a KAAL directory");
  assert.match(write(bare).err, /not a KAAL directory/);
  assert.deepEqual(everything(bare), [], "and nothing is made in it");
  assert.equal(write(join(bare, "missing")).code, 1);
});

test("it never writes through a link: a linked carrier directory, dated directory, or core/ is refused, and nothing lands at the target", (t) => {
  const outside = mkdtempSync(join(tmpdir(), "incident-out-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  const target = () => readdirSync(outside, { recursive: true, encoding: "utf8" });
  const linked = kaal(t);
  symlinkSync(outside, join(linked, "incidents"));
  assert.equal(write(linked, "a", "b", "--date", "2026-10-07").code, 1);
  assert.deepEqual(target(), []);
  const dated = kaal(t);
  mkdirSync(join(dated, "incidents/26"), { recursive: true });
  symlinkSync(outside, join(dated, "incidents/26/10"));
  const r = write(dated, "a", "b", "--date", "2026-10-07");
  assert.equal(r.code, 1);
  assert.match(r.err, /not a directory of the KAAL directory itself/);
  assert.deepEqual(target(), []);
  const dangling = kaal(t);
  symlinkSync(join(outside, "missing"), join(dangling, "incidents"));
  const d = write(dangling, "a", "b");
  assert.equal(d.code, 1);
  assert.match(d.err, /not a directory of the KAAL directory itself/);
  const core = mkdtempSync(join(tmpdir(), "incident-"));
  t.after(() => rmSync(core, { recursive: true, force: true }));
  symlinkSync(outside, join(core, "core"));
  assert.equal(write(core).code, 1);
  assert.match(write(core).err, /not a KAAL directory/);
  assert.deepEqual(target(), []);
  // The KAAL directory itself may not be a link, with or without a trailing slash.
  const home = mkdtempSync(join(tmpdir(), "incident-home-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  mkdirSync(join(home, "real/core"), { recursive: true });
  symlinkSync(join(home, "real"), join(home, "link"));
  for (const via of [join(home, "link"), join(home, "link") + "/"]) {
    const l = write(via, "a", "b", "--date", "2026-10-07");
    assert.equal(l.code, 1, via);
    assert.match(l.err, /not a KAAL directory/);
  }
  assert.deepEqual(readdirSync(join(home, "real")), ["core"], "nothing lands behind the link");
  assert.equal(write(join(home, "real") + "/", "a", "b", "--date", "2026-10-07").code, 0, "a real directory is fine with a trailing slash");
});

test("it never writes through a link in an ancestor of the KAAL directory either, however the path is spelled", (t) => {
  const home = mkdtempSync(join(tmpdir(), "incident-anc-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  mkdirSync(join(home, "outside/.kaal/core"), { recursive: true });
  mkdirSync(join(home, "outside/deeper/.kaal/core"), { recursive: true });
  symlinkSync(join(home, "outside"), join(home, "alias"));
  const args = ["--happened", "a", "--expected", "b", "--date", "2026-10-07"];
  const here = (cwd: string, kaalDir: string) => {
    const r = spawnSync("node", [join(SCRIPTS, "incident.mjs"), "write", kaalDir, ...args], { encoding: "utf8", cwd });
    return { code: r.status, err: r.stderr.trim() };
  };
  for (const [name, cwd, dir] of [
    ["absolute", home, join(home, "alias/.kaal")],
    ["absolute with a trailing slash", home, join(home, "alias/.kaal") + "/"],
    ["relative", home, "alias/.kaal"],
    ["relative with a dot", home, "./alias/./.kaal/"],
    ["a link further up", home, join(home, "alias/deeper/.kaal")],
  ] as const) {
    const r = here(cwd, dir);
    assert.equal(r.code, 1, name);
    assert.match(r.err, /not a KAAL directory/, name);
  }
  assert.deepEqual(readdirSync(join(home, "outside/.kaal")), ["core"], "nothing lands behind the link");
  assert.deepEqual(readdirSync(join(home, "outside/deeper/.kaal")), ["core"]);
  assert.equal(here(home, "outside/.kaal").code, 0, "the same directory by its real path is fine");
});

test("a link is seen before a later .. can erase it, and ordinary .. through real directories still works", (t) => {
  const home = mkdtempSync(join(tmpdir(), "incident-dots-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  mkdirSync(join(home, "outside/deeper"), { recursive: true });
  mkdirSync(join(home, "outside/.kaal/core"), { recursive: true });
  mkdirSync(join(home, ".kaal/core"), { recursive: true });
  symlinkSync(join(home, "outside/deeper"), join(home, "alias"));
  const here = (kaalDir: string) => {
    const r = spawnSync("node", [join(SCRIPTS, "incident.mjs"), "write", kaalDir, "--happened", "a", "--expected", "b", "--date", "2026-10-07"], { encoding: "utf8", cwd: home });
    return { code: r.status, err: r.stderr.trim() };
  };
  for (const dir of ["alias/../.kaal", "alias/../.kaal/", "./alias/../.kaal", join(home, "alias") + "/../.kaal", join(home, "alias") + "/../.kaal/"]) {
    const r = here(dir);
    assert.equal(r.code, 1, dir);
    assert.match(r.err, /not a KAAL directory/, dir);
  }
  assert.deepEqual(readdirSync(join(home, ".kaal")), ["core"], "nothing lands in the other instance");
  assert.deepEqual(readdirSync(join(home, "outside/.kaal")), ["core"], "nor in the one the link would reach");
  assert.equal(here("outside/deeper/../.kaal").code, 0, ".. through real directories is ordinary navigation");
  assert.deepEqual(readdirSync(join(home, "outside/.kaal")).sort(), ["core", "incidents"], "and it names the directory the system does");
  assert.deepEqual(readdirSync(join(home, ".kaal")), ["core"]);
  assert.equal(here("..").code, 1, "the parent of the working directory is not a KAAL directory");
});

test("a missing or non-directory component is refused before a later .. can erase it", (t) => {
  const home = mkdtempSync(join(tmpdir(), "incident-bad-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  mkdirSync(join(home, ".kaal/core"), { recursive: true });
  mkdirSync(join(home, "real"));
  writeFileSync(join(home, "plain-file"), "x");
  const here = (kaalDir: string) => {
    const r = spawnSync("node", [join(SCRIPTS, "incident.mjs"), "write", kaalDir, "--happened", "a", "--expected", "b", "--date", "2026-10-07"], { encoding: "utf8", cwd: home });
    return { code: r.status, err: r.stderr.trim() };
  };
  for (const dir of ["missing/../.kaal", "plain-file/../.kaal", "./missing/../.kaal/", join(home, "missing") + "/../.kaal", join(home, "plain-file") + "/../.kaal/", "real/missing/../../.kaal", "plain-file", "missing"]) {
    const r = here(dir);
    assert.equal(r.code, 1, dir);
    assert.match(r.err, /not a KAAL directory/, dir);
  }
  assert.deepEqual(readdirSync(join(home, ".kaal")), ["core"], "no carrier directory was made");
  assert.deepEqual(readdirSync(home).sort(), [".kaal", "plain-file", "real"], "and nothing else was");
  assert.equal(here("real/../.kaal").code, 0, ".. through real directories is still ordinary navigation");
  assert.ok(existsSync(join(home, ".kaal/incidents/26/10/07/01.md")));
});

test("check accepts exactly the canonical form and nothing else", (t) => {
  const d = kaal(t);
  const ok = canonical("a", "b\n\nmore");
  const cases: [string, string, number][] = [
    ["the canonical form", ok, 0],
    ["a title one level down", ok.replace("# KAAL Incident", "## KAAL Incident"), 1],
    ["another carrier's title", ok.replace("# KAAL Incident", "# KAAL Request"), 1],
    ["parts one level down", ok.replace(/^## /gm, "### "), 1],
    ["a part missing", ok.replace("\n## Expected\n\nb\n\nmore\n", ""), 1],
    ["the parts out of order", `# KAAL Incident\n\n## Expected\n\nb\n\n## Happened\n\na\n`, 1],
    ["an empty part", ok.replace("\na\n", "\n\n"), 1],
    ["a part that holds a heading", ok.replace("\na\n", "\na\n\n#### Aside\n\nx\n"), 1],
    ["an extra part after the last", `${ok}\n## Notes\n\nx\n`, 1],
    ["text before the title", `Note\n\n${ok}`, 1],
    ["no final newline", ok.slice(0, -1), 1],
    ["two final newlines", `${ok}\n`, 1],
    ["carriage returns", ok.replace(/\n/g, "\r\n"), 1],
    ["a missing blank line under a heading", ok.replace("## Expected\n\n", "## Expected\n"), 1],
    ["an empty file", "", 1],
  ];
  for (const [name, content, code] of cases) {
    writeFileSync(join(d, "x.md"), content);
    assert.equal(run("check", join(d, "x.md")).code, code, name);
  }
});

test("usage is refused with exit 2, and check on a missing file is a failure and not a pass", (t) => {
  assert.equal(run().code, 2);
  assert.equal(run("write").code, 2);
  assert.equal(run("check").code, 2);
  assert.equal(run("check", join(kaal(t), "nope.md")).code, 1);
});

test("there is no way to remove, edit, send or collect: the script offers write and check only", () => {
  for (const verb of ["remove", "edit", "send", "submit", "collect", "list"]) assert.equal(run(verb, "x").code, 2, verb);
});

test("the script is a node script and reads nothing but the files it is given", () => {
  assert.ok(statSync(join(SCRIPTS, "incident.mjs")).isFile());
  assert.match(readFileSync(join(SCRIPTS, "incident.mjs"), "utf8"), /^#!\/usr\/bin\/env node\n/);
});
