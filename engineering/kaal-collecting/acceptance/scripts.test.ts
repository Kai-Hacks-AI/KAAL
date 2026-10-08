// collect.mjs, challenged through the command an agent runs. It records what
// was tried and what was brought in; it reaches nothing, reads nothing but the
// directory it is given, and never replaces what it wrote.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { read, SCRIPTS, scratch } from "../helpers/setup.js";

const SCRIPT = join(SCRIPTS, "collect.mjs");
const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const run = (...args: string[]) => spawnSync("node", [SCRIPT, ...args], { encoding: "utf8" });

/** A KAAL directory and a directory standing for what an adapter showed of a client. */
function setup(t: { after: (fn: () => void) => void }, files: Record<string, string> = {}) {
  const root = scratch(t);
  const kaal = join(root, "kaal");
  const exposed = join(root, "exposed");
  mkdirSync(kaal);
  mkdirSync(exposed);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(exposed, path)), { recursive: true });
    writeFileSync(join(exposed, path), content);
  }
  return { root, kaal, exposed };
}
const begin = (kaal: string, date = "2026-10-07") => run("begin", kaal, "--date", date).stdout.trim();

test("begin allocates collections/YY/MM/DD/CC as Changes are allocated: highest plus one, per day, never reusing", (t) => {
  const { kaal } = setup(t);
  assert.equal(begin(kaal), "collections/26/10/07/01");
  assert.equal(begin(kaal), "collections/26/10/07/02");
  assert.equal(begin(kaal, "2026-10-08"), "collections/26/10/08/01");
  const day = join(kaal, "collections/26/10/07");
  mkdirSync(join(day, "05"));
  assert.equal(begin(kaal), "collections/26/10/07/06", "a gap is not reused, the number follows the highest");
  mkdirSync(join(day, "99"));
  const full = run("begin", kaal, "--date", "2026-10-07");
  assert.equal(full.status, 1);
  assert.ok(!existsSync(join(day, "100")));
});

test("a reached client keeps each carrier byte for byte, with its identity and the path it was carried at", (t) => {
  const bytes = { "incidents/26/10/07/01.md": "first\n", "requests/26/10/07/01.md": "second \r\né" };
  const { kaal, exposed } = setup(t, bytes);
  const c = begin(kaal);
  const r = run("reached", kaal, c, "--client", "some-client", "--adapter", "a local checkout", "--from", exposed);
  assert.equal(r.status, 0, r.stderr);
  const dir = join(kaal, c, "some-client");
  assert.deepEqual(read(join(dir, "carriers")), bytes);
  assert.equal(
    readFileSync(join(dir, "reach.md"), "utf8"),
    `# some-client\n\nreached\nadapter: a local checkout\n\n${sha256(bytes["incidents/26/10/07/01.md"])}  incidents/26/10/07/01.md\n${sha256(bytes["requests/26/10/07/01.md"])}  requests/26/10/07/01.md\n`,
  );
  assert.equal(run("check", kaal, c).status, 0);
});

test("reached with nothing carried, unreached, and never attempted are three different things", (t) => {
  const { kaal, exposed } = setup(t);
  const c = begin(kaal);
  assert.equal(run("reached", kaal, c, "--client", "bare", "--adapter", "an archive", "--from", exposed).status, 0);
  assert.equal(run("unreached", kaal, c, "--client", "far", "--adapter", "no means in this environment", "--reason", "no way to see it from here").status, 0);
  assert.equal(readFileSync(join(kaal, c, "bare/reach.md"), "utf8"), "# bare\n\nreached\nadapter: an archive\n");
  assert.equal(readFileSync(join(kaal, c, "far/reach.md"), "utf8"), "# far\n\nunreached\nadapter: no means in this environment\nreason: no way to see it from here\n");
  assert.ok(!existsSync(join(kaal, c, "far/carriers")) && !existsSync(join(kaal, c, "bare/carriers")));
  assert.deepEqual(readdirSync(join(kaal, c)).sort(), ["bare", "far"], "a client not attempted leaves no trace, and nothing is a list of clients");
  assert.equal(run("check", kaal, c).status, 0);
});

test("nothing is written outside the collection, and no file other than the carriers is read", (t) => {
  const { kaal, exposed, root } = setup(t, { "incidents/x.md": "x", "core/Node.md": "not exposed", "changes/genesis/r.md": "not exposed", "skills/s/SKILL.md": "not exposed" });
  writeFileSync(join(root, "outside.md"), "not exposed");
  const c = begin(kaal);
  run("reached", kaal, c, "--client", "one", "--adapter", "a", "--from", exposed);
  assert.deepEqual(readdirSync(kaal), ["collections"]);
  assert.deepEqual(Object.keys(read(join(kaal, c))).sort(), ["one/carriers/incidents/x.md", "one/reach.md"]);
});

test("it refuses what it must not collect, and then writes nothing", (t) => {
  const { kaal, exposed, root } = setup(t, { "incidents/ok.md": "fine" });
  const c = begin(kaal);
  writeFileSync(join(root, "target"), "secret");
  symlinkSync(join(root, "target"), join(exposed, "incidents/link.md"));
  const link = run("reached", kaal, c, "--client", "linked", "--adapter", "a", "--from", exposed);
  assert.equal(link.status, 1);
  assert.match(link.stderr, /not a plain file/);
  mkdirSync(join(exposed, "incidents/d"));
  symlinkSync(root, join(exposed, "incidents/d", "up"));
  assert.equal(run("reached", kaal, c, "--client", "linked", "--adapter", "a", "--from", exposed).status, 1);
  assert.deepEqual(readdirSync(join(kaal, c)), [], "a refused attempt leaves no record");
});

test("it refuses names that are not stated the same on every platform, and case collisions", (t) => {
  const { kaal, exposed } = setup(t, { "incidents/A.md": "1", "incidents/a.md": "2" });
  const c = begin(kaal);
  const r = run("reached", kaal, c, "--client", "case", "--adapter", "a", "--from", exposed);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /differs only by case/);
  assert.deepEqual(readdirSync(join(kaal, c)), []);
});

test("a client already recorded in a collection is never replaced; a later attempt is a new collection", (t) => {
  const { kaal, exposed } = setup(t, { "incidents/a.md": "one" });
  const c = begin(kaal);
  assert.equal(run("reached", kaal, c, "--client", "same", "--adapter", "a", "--from", exposed).status, 0);
  const before = read(join(kaal, c));
  writeFileSync(join(exposed, "incidents/a.md"), "changed");
  for (const args of [
    ["reached", kaal, c, "--client", "same", "--adapter", "b", "--from", exposed],
    ["unreached", kaal, c, "--client", "same", "--adapter", "b", "--reason", "r"],
  ]) {
    const r = run(...args);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /never replaced/);
  }
  assert.deepEqual(read(join(kaal, c)), before);
  const next = begin(kaal);
  assert.equal(run("reached", kaal, next, "--client", "same", "--adapter", "b", "--from", exposed).status, 0);
  assert.deepEqual(read(join(kaal, c)), before, "the earlier collection is untouched");
});

test("a client name is a name: it cannot be a path or a location, and the usage is checked", (t) => {
  const { kaal, exposed } = setup(t);
  const c = begin(kaal);
  for (const client of ["Owner/Repo", "../x", "has space", "UPPER", "a--b", "", "https://host/x"]) {
    assert.equal(run("reached", kaal, c, "--client", client, "--adapter", "a", "--from", exposed).status, 1, client);
  }
  assert.equal(run("unreached", kaal, c, "--client", "ok", "--adapter", "a", "--reason", "").status, 1, "a reason is required");
  assert.equal(run("unreached", kaal, c, "--client", "ok", "--adapter", "two\nlines", "--reason", "r").status, 1, "adapter is one line");
  assert.equal(run("reached", kaal, "collections/../x", "--client", "ok", "--adapter", "a", "--from", exposed).status, 1);
  assert.equal(run("reached", kaal, "collections/26/10/07/09", "--client", "ok", "--adapter", "a", "--from", exposed).status, 1, "an unknown collection");
  assert.equal(run("reached", kaal, c, "--client", "ok", "--adapter", "a").status, 2);
  assert.equal(run("reached", kaal, c, "--client", "ok", "--client", "again", "--adapter", "a", "--from", exposed).status, 2);
  assert.equal(run("nonsense").status, 2);
  assert.deepEqual(readdirSync(join(kaal, c)), []);
});

test("check catches an altered, a missing and an unrecorded carrier, and a record that is not in its form", (t) => {
  const { kaal, exposed } = setup(t, { "incidents/a.md": "one", "incidents/b.md": "two" });
  const c = begin(kaal);
  run("reached", kaal, c, "--client", "cl", "--adapter", "a", "--from", exposed);
  const carriers = join(kaal, c, "cl/carriers");
  assert.equal(run("check", kaal, c).status, 0);
  writeFileSync(join(carriers, "incidents/a.md"), "altered");
  assert.match(run("check", kaal, c).stderr, /no longer matches/);
  writeFileSync(join(carriers, "incidents/a.md"), "one");
  writeFileSync(join(carriers, "incidents/extra.md"), "x");
  assert.match(run("check", kaal, c).stderr, /collected but not recorded/);
  writeFileSync(join(carriers, "incidents/extra.md"), "x");
  const record = join(kaal, c, "cl/reach.md");
  const text = readFileSync(record, "utf8");
  writeFileSync(record, text.replace("reached", "reached\n"));
  assert.match(run("check", kaal, c).stderr, /not in the form/);
  writeFileSync(record, text);
  assert.equal(run("check", kaal, c).status, 1, "the unrecorded carrier is still there");
});

test("the script itself reaches nothing: it makes no network access and starts no process", () => {
  const source = readFileSync(SCRIPT, "utf8");
  assert.doesNotMatch(source, /from "node:(net|http|https|http2|dns|tls|child_process|dgram)"|\bfetch\(|\brequire\(/);
});

test("begin refuses impossible and out-of-range dates and creates nothing", (t) => {
  const { kaal } = setup(t);
  for (const date of ["2026-02-31", "1999-01-01", "2100-01-01", "26-10-07", "2026-13-01"]) assert.equal(run("begin", kaal, "--date", date).status, 1, date);
  assert.ok(!existsSync(join(kaal, "collections")));
});

test("concurrent collections never share a number", async (t) => {
  const { kaal } = setup(t);
  const runs = await Promise.all(Array.from({ length: 6 }, () => new Promise<string>((resolve) => {
    const child = spawn("node", [SCRIPT, "begin", kaal, "--date", "2026-10-07"]);
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("close", () => resolve(out.trim()));
  })));
  assert.equal(new Set(runs).size, 6);
  assert.deepEqual(readdirSync(join(kaal, "collections/26/10/07")).sort(), ["01", "02", "03", "04", "05", "06"]);
});

test("a refused attempt on an existing client never removes that client's record", (t) => {
  const { kaal, exposed } = setup(t, { "incidents/a.md": "one" });
  const c = begin(kaal);
  run("reached", kaal, c, "--client", "same", "--adapter", "a", "--from", exposed);
  const before = read(join(kaal, c));
  assert.equal(run("unreached", kaal, c, "--client", "same", "--adapter", "b", "--reason", "r").status, 1);
  assert.deepEqual(read(join(kaal, c)), before);
});

test("names Git cannot carry faithfully are refused", (t) => {
  for (const name of ["incidents/.git/config", "incidents/.gitignore", "requests/sub/.gitattributes"]) {
    const { kaal, exposed } = setup(t, { [name]: "x" });
    const c = begin(kaal);
    const r = run("reached", kaal, c, "--client", "cl", "--adapter", "a", "--from", exposed);
    assert.equal(r.status, 1, name);
    assert.deepEqual(readdirSync(join(kaal, c)), []);
  }
});

test("check refuses a symlinked carrier, a stray file, and a carrier recorded twice", (t) => {
  const { kaal, exposed, root } = setup(t, { "incidents/a.md": "one" });
  const c = begin(kaal);
  run("reached", kaal, c, "--client", "cl", "--adapter", "a", "--from", exposed);
  const base = join(kaal, c, "cl");
  writeFileSync(join(base, "stray.md"), "x");
  assert.match(run("check", kaal, c).stderr, /stray\.md is not part of the record/);
  rmSync(join(base, "stray.md"));
  writeFileSync(join(root, "outside"), "one");
  rmSync(join(base, "carriers/incidents/a.md"));
  symlinkSync(join(root, "outside"), join(base, "carriers/incidents/a.md"));
  assert.match(run("check", kaal, c).stderr, /not a plain file|recorded but missing/);
  rmSync(join(base, "carriers/incidents/a.md"));
  writeFileSync(join(base, "carriers/incidents/a.md"), "one");
  const record = join(base, "reach.md");
  const line = `${sha256("one")}  incidents/a.md\n`;
  writeFileSync(record, readFileSync(record, "utf8") + line);
  assert.match(run("check", kaal, c).stderr, /recorded twice|not in the form/);
});

test("only incidents/ and requests/ are read: anything else of the client's KAAL directory is neither read nor refused", (t) => {
  const { kaal, exposed, root } = setup(t, { "incidents/a.md": "one" });
  writeFileSync(join(root, "target"), "x");
  symlinkSync(join(root, "target"), join(exposed, "unrelated-link"));
  mkdirSync(join(exposed, "core"));
  symlinkSync(join(root, "target"), join(exposed, "core/linked"));
  const c = begin(kaal);
  const r = run("reached", kaal, c, "--client", "cl", "--adapter", "a", "--from", exposed);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(Object.keys(read(join(kaal, c, "cl/carriers"))), ["incidents/a.md"]);
});

test("a carried place that is itself a link or a file is refused", (t) => {
  const { kaal, exposed, root } = setup(t);
  writeFileSync(join(root, "target"), "x");
  symlinkSync(root, join(exposed, "incidents"));
  writeFileSync(join(exposed, "requests"), "a file");
  const c = begin(kaal);
  assert.equal(run("reached", kaal, c, "--client", "cl", "--adapter", "a", "--from", exposed).status, 1);
  rmSync(join(exposed, "incidents"));
  assert.equal(run("reached", kaal, c, "--client", "cl", "--adapter", "a", "--from", exposed).status, 1);
  assert.deepEqual(readdirSync(join(kaal, c)), []);
});

test("a client's KAAL directory carrying nothing addressed to KAAL is recorded as reached with nothing", (t) => {
  const { kaal, exposed } = setup(t, { "core/Node.md": "not exposed" });
  const c = begin(kaal);
  assert.equal(run("reached", kaal, c, "--client", "bare", "--adapter", "a", "--from", exposed).status, 0);
  assert.equal(readFileSync(join(kaal, c, "bare/reach.md"), "utf8"), "# bare\n\nreached\nadapter: a\n");
});
