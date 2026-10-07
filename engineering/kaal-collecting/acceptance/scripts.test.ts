// collect.mjs, challenged through the command an agent runs. It records what
// was tried and what was brought in; it reaches nothing, reads nothing but the
// directory it is given, and never replaces what it wrote.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
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
  const bytes = { "a.md": "first\n", "sub/b.md": "second \r\né" };
  const { kaal, exposed } = setup(t, bytes);
  const c = begin(kaal);
  const r = run("reached", kaal, c, "--client", "some-client", "--adapter", "a local checkout", "--from", exposed);
  assert.equal(r.status, 0, r.stderr);
  const dir = join(kaal, c, "some-client");
  assert.deepEqual(read(join(dir, "carriers")), bytes);
  assert.equal(
    readFileSync(join(dir, "reach.md"), "utf8"),
    `# some-client\n\nreached\nadapter: a local checkout\n\n${sha256(bytes["a.md"])}  a.md\n${sha256(bytes["sub/b.md"])}  sub/b.md\n`,
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
  const { kaal, exposed, root } = setup(t, { "x.md": "x" });
  writeFileSync(join(root, "outside.md"), "not exposed");
  const c = begin(kaal);
  run("reached", kaal, c, "--client", "one", "--adapter", "a", "--from", exposed);
  assert.deepEqual(readdirSync(kaal), ["collections"]);
  assert.deepEqual(Object.keys(read(join(kaal, c))).sort(), ["one/carriers/x.md", "one/reach.md"]);
});

test("it refuses what it must not collect, and then writes nothing", (t) => {
  const { kaal, exposed, root } = setup(t, { "ok.md": "fine" });
  const c = begin(kaal);
  writeFileSync(join(root, "target"), "secret");
  symlinkSync(join(root, "target"), join(exposed, "link.md"));
  const link = run("reached", kaal, c, "--client", "linked", "--adapter", "a", "--from", exposed);
  assert.equal(link.status, 1);
  assert.match(link.stderr, /not a plain file/);
  mkdirSync(join(exposed, "d"));
  symlinkSync(root, join(exposed, "d", "up"));
  assert.equal(run("reached", kaal, c, "--client", "linked", "--adapter", "a", "--from", exposed).status, 1);
  assert.deepEqual(readdirSync(join(kaal, c)), [], "a refused attempt leaves no record");
});

test("it refuses names that are not stated the same on every platform, and case collisions", (t) => {
  const { kaal, exposed } = setup(t, { "A.md": "1", "a.md": "2" });
  const c = begin(kaal);
  const r = run("reached", kaal, c, "--client", "case", "--adapter", "a", "--from", exposed);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /differs only by case/);
  assert.deepEqual(readdirSync(join(kaal, c)), []);
});

test("a client already recorded in a collection is never replaced; a later attempt is a new collection", (t) => {
  const { kaal, exposed } = setup(t, { "a.md": "one" });
  const c = begin(kaal);
  assert.equal(run("reached", kaal, c, "--client", "same", "--adapter", "a", "--from", exposed).status, 0);
  const before = read(join(kaal, c));
  writeFileSync(join(exposed, "a.md"), "changed");
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
  const { kaal, exposed } = setup(t, { "a.md": "one", "b.md": "two" });
  const c = begin(kaal);
  run("reached", kaal, c, "--client", "cl", "--adapter", "a", "--from", exposed);
  const carriers = join(kaal, c, "cl/carriers");
  assert.equal(run("check", kaal, c).status, 0);
  writeFileSync(join(carriers, "a.md"), "altered");
  assert.match(run("check", kaal, c).stderr, /no longer matches/);
  writeFileSync(join(carriers, "a.md"), "one");
  writeFileSync(join(carriers, "extra.md"), "x");
  assert.match(run("check", kaal, c).stderr, /collected but not recorded/);
  writeFileSync(join(carriers, "extra.md"), "x");
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
