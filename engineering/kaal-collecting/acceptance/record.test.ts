// collect.mjs --keep, challenged through the command an agent runs. The kept
// record is clients/<client>/sightings/, one sighting per attempt, and one stored
// carrier per client and hash in incidents/ and requests/. A client exists there
// exactly when it has a sighting; continuity of a name is asserted, never inferred.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { read, SCRIPTS, scratch } from "../helpers/setup.js";

const SCRIPT = join(SCRIPTS, "collect.mjs");
const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const run = (...args: string[]) => spawnSync("node", [SCRIPT, ...args], { encoding: "utf8" });

const INCIDENT = "happened\n";
const REQUEST = "wanted\n";
const FILES = { "incidents/26/10/07/01.md": INCIDENT, "requests/26/10/07/01.md": REQUEST };

function setup(t: { after: (fn: () => void) => void }, files: Record<string, string> = FILES) {
  const root = scratch(t);
  const record = join(root, "record");
  const exposed = join(root, "exposed");
  mkdirSync(record);
  put(exposed, files);
  return { root, record, exposed };
}
function put(dir: string, files: Record<string, string>) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
}
const begin = (record: string, date: string) => run("begin", record, "--date", date).stdout.trim();
const reached = (record: string, c: string, client: string, from: string, ...extra: string[]) => run("reached", record, c, "--client", client, "--adapter", "a", "--from", from, ...extra);
const unreached = (record: string, c: string, client: string, ...extra: string[]) => run("unreached", record, c, "--client", client, "--adapter", "a", "--reason", "r", ...extra);
const stored = (record: string, place: string, client: string) => (existsSync(join(record, place, client)) ? readdirSync(join(record, place, client)).sort() : []);

test("without --keep nothing but the collection is written, as before", (t) => {
  const { record, exposed } = setup(t);
  const c = begin(record, "2026-10-07");
  assert.equal(reached(record, c, "acme", exposed).status, 0);
  assert.deepEqual(readdirSync(record), ["collections"]);
  assert.equal(run("check-record", record).status, 0, "an empty record checks");
});

test("--keep records a sighting and stores each carrier byte for byte under its hash", (t) => {
  const { record, exposed } = setup(t);
  const c = begin(record, "2026-10-07");
  const r = reached(record, c, "acme", exposed, "--keep");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(stored(record, "incidents", "acme"), [`${sha256(INCIDENT)}.md`]);
  assert.equal(readFileSync(join(record, "incidents/acme", `${sha256(INCIDENT)}.md`), "utf8"), INCIDENT);
  assert.equal(readFileSync(join(record, "requests/acme", `${sha256(REQUEST)}.md`), "utf8"), REQUEST);
  assert.equal(
    readFileSync(join(record, "clients/acme/sightings/26/10/07/01.md"), "utf8"),
    `# acme\n\ncollection: collections/26/10/07/01\nreached\nadapter: a\n\n${sha256(INCIDENT)}  incidents/26/10/07/01.md\n${sha256(REQUEST)}  requests/26/10/07/01.md\n`,
  );
  assert.equal(run("check-record", record).status, 0);
  assert.equal(run("check", record, c).status, 0, "the collection itself is as it was");
});

test("a name that already has a sighting is refused without --continues, and nothing is written", (t) => {
  const { record, exposed } = setup(t);
  reached(record, begin(record, "2026-10-07"), "acme", exposed, "--keep");
  const before = read(record);
  const c = begin(record, "2026-10-08");
  const r = reached(record, c, "acme", exposed, "--keep");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /pass --continues to assert .* not proof/);
  assert.equal(existsSync(join(record, c, "acme")), false);
  const after = read(record);
  assert.deepEqual(Object.keys(after).filter((p) => !(p in before)), []);
});

test("--continues asserts continuity: the sighting says so, and stored carriers are not stored again", (t) => {
  const { record, exposed } = setup(t);
  reached(record, begin(record, "2026-10-07"), "acme", exposed, "--keep");
  const first = readdirSync(join(record, "incidents/acme"));
  const c = begin(record, "2026-10-08");
  const r = reached(record, c, "acme", exposed, "--keep", "--continues");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /0 new stored/);
  assert.deepEqual(readdirSync(join(record, "incidents/acme")), first);
  const text = readFileSync(join(record, "clients/acme/sightings/26/10/08/01.md"), "utf8");
  assert.match(text, /^# acme\n\ncollection: collections\/26\/10\/08\/01\nreached\nadapter: a\ncontinues: asserted\n\n/);
  assert.equal(run("check-record", record).status, 0);
});

test("--continues is refused for a name with no sighting, and without --keep", (t) => {
  const { record, exposed } = setup(t);
  const c = begin(record, "2026-10-07");
  const a = reached(record, c, "acme", exposed, "--keep", "--continues");
  assert.equal(a.status, 1);
  assert.match(a.stderr, /acme has no sighting/);
  assert.equal(existsSync(join(record, c, "acme")), false);
  const b = reached(record, c, "acme", exposed, "--continues");
  assert.equal(b.status, 2);
  assert.equal(existsSync(join(record, c, "acme")), false);
  assert.equal(existsSync(join(record, "clients")), false);
});

test("an unreached attempt kept is a sighting, and follows the same rule", (t) => {
  const { record, exposed } = setup(t);
  const c1 = begin(record, "2026-10-07");
  assert.equal(unreached(record, c1, "acme", "--keep").status, 0);
  assert.equal(readFileSync(join(record, "clients/acme/sightings/26/10/07/01.md"), "utf8"), "# acme\n\ncollection: collections/26/10/07/01\nunreached\nadapter: a\nreason: r\n");
  const c2 = begin(record, "2026-10-08");
  assert.equal(unreached(record, c2, "acme", "--keep").status, 1);
  assert.equal(reached(record, c2, "acme", exposed, "--keep").status, 1);
  assert.equal(reached(record, c2, "acme", exposed, "--keep", "--continues").status, 0);
  assert.equal(unreached(record, begin(record, "2026-10-09"), "acme", "--keep", "--continues").status, 0);
  assert.equal(run("check-record", record).status, 0);
  assert.deepEqual(stored(record, "incidents", "acme").length, 1);
});

test("equal bytes at two paths are stored once, and both source paths stay visible", (t) => {
  const { record, exposed } = setup(t, { "requests/26/10/09/01.md": REQUEST, "requests/26/10/09/02.md": REQUEST });
  reached(record, begin(record, "2026-10-09"), "acme", exposed, "--keep");
  assert.deepEqual(stored(record, "requests", "acme"), [`${sha256(REQUEST)}.md`]);
  const text = readFileSync(join(record, "clients/acme/sightings/26/10/09/01.md"), "utf8");
  assert.match(text, new RegExp(`${sha256(REQUEST)}  requests/26/10/09/01.md\n${sha256(REQUEST)}  requests/26/10/09/02.md\n$`));
  assert.equal(run("check-record", record).status, 0);
});

test("the same bytes from another client are stored again under that client; other bytes at the same path are another stored carrier", (t) => {
  const { record, exposed } = setup(t);
  reached(record, begin(record, "2026-10-07"), "acme", exposed, "--keep");
  reached(record, begin(record, "2026-10-08"), "other", exposed, "--keep");
  assert.deepEqual(stored(record, "incidents", "other"), stored(record, "incidents", "acme"));
  put(exposed, { ...FILES, "incidents/26/10/07/01.md": "changed\n" });
  const c = begin(record, "2026-10-09");
  assert.equal(reached(record, c, "acme", exposed, "--keep", "--continues").status, 0);
  assert.equal(stored(record, "incidents", "acme").length, 2);
  assert.match(readFileSync(join(record, "clients/acme/sightings/26/10/09/01.md"), "utf8"), new RegExp(`${sha256("changed\n")}  incidents/26/10/07/01.md`));
  assert.equal(run("check-record", record).status, 0);
});

test("a refused exposure with --keep writes no sighting and no stored carrier", (t) => {
  const { record, exposed } = setup(t);
  symlinkSync(join(exposed, "nowhere"), join(exposed, "incidents/26/10/07/02.md"));
  const c = begin(record, "2026-10-07");
  const r = reached(record, c, "acme", exposed, "--keep");
  assert.equal(r.status, 1);
  assert.deepEqual(readdirSync(record), ["collections"]);
  assert.equal(existsSync(join(record, c, "acme")), false);
});

test("a stored path holding other bytes is refused before anything is written", (t) => {
  const { record, exposed } = setup(t);
  mkdirSync(join(record, "incidents/acme"), { recursive: true });
  writeFileSync(join(record, "incidents/acme", `${sha256(INCIDENT)}.md`), "not the bytes");
  const c = begin(record, "2026-10-07");
  const r = reached(record, c, "acme", exposed, "--keep");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /is not the bytes it is named for/);
  assert.equal(existsSync(join(record, c, "acme")), false);
  assert.equal(existsSync(join(record, "clients")), false);
});

test("check-record catches a stored carrier altered or missing, an orphan, a missing or altered sighting, and a missing assertion or founding", (t) => {
  const { record, exposed } = setup(t);
  reached(record, begin(record, "2026-10-07"), "acme", exposed, "--keep");
  reached(record, begin(record, "2026-10-08"), "acme", exposed, "--keep", "--continues");
  assert.equal(run("check-record", record).status, 0);
  const incident = join(record, "incidents/acme", `${sha256(INCIDENT)}.md`);
  const request = join(record, "requests/acme", `${sha256(REQUEST)}.md`);
  const second = join(record, "clients/acme/sightings/26/10/08/01.md");
  const original = readFileSync(second, "utf8");

  writeFileSync(incident, "altered");
  assert.match(run("check-record", record).stderr, /incidents\/acme\/.* no longer matches its name/);
  writeFileSync(incident, INCIDENT);
  rmSync(request);
  assert.match(run("check-record", record).stderr, /requests\/26\/10\/07\/01.md .* has no stored carrier/);
  writeFileSync(request, REQUEST);
  writeFileSync(join(record, "requests/acme", `${sha256("x")}.md`), "x");
  assert.match(run("check-record", record).stderr, /is stored but no sighting lists it/);
  rmSync(join(record, "requests/acme", `${sha256("x")}.md`));

  writeFileSync(second, original.replace("continues: asserted\n", ""));
  assert.match(run("check-record", record).stderr, /2 founding sightings/);
  writeFileSync(second, original.replace("adapter: a", "adapter: b"));
  assert.match(run("check-record", record).stderr, /does not match the attempt it names/);
  writeFileSync(second, original);
  rmSync(join(record, "collections/26/10/08/01/acme"), { recursive: true });
  assert.match(run("check-record", record).stderr, /holds no record of this attempt/);
  assert.equal(run("check-record", record).status, 1);
});

test("a client directory with no founding sighting is refused", (t) => {
  const { record, exposed } = setup(t);
  reached(record, begin(record, "2026-10-07"), "acme", exposed, "--keep");
  const founding = join(record, "clients/acme/sightings/26/10/07/01.md");
  const text = readFileSync(founding, "utf8");
  writeFileSync(founding, text.replace("adapter: a\n", "adapter: a\ncontinues: asserted\n"));
  assert.match(run("check-record", record).stderr, /0 founding sightings/);
});

test("--keep refuses a destination reached through a link, and leaves the attempt, the sighting and the stored carriers unwritten", (t) => {
  const { root, record, exposed } = setup(t);
  const outside = join(root, "outside");
  mkdirSync(outside);
  const c = begin(record, "2026-10-07");
  for (const [link, where] of [
    ["clients", "the sighting"],
    ["incidents", "a stored carrier"],
    ["requests", "a stored carrier"],
  ] as const) {
    symlinkSync(outside, join(record, link));
    const r = reached(record, c, "acme", exposed, "--keep");
    assert.equal(r.status, 1, where);
    assert.match(r.stderr, /is not a plain directory of this record/);
    assert.equal(existsSync(join(record, c, "acme")), false, "no raw attempt is left");
    assert.deepEqual(readdirSync(outside), [], "nothing is written outside the record");
    rmSync(join(record, link));
  }
  mkdirSync(join(record, "incidents"));
  symlinkSync(outside, join(record, "incidents/acme"));
  assert.equal(reached(record, c, "acme", exposed, "--keep").status, 1);
  assert.deepEqual(readdirSync(outside), []);
  assert.equal(existsSync(join(record, "clients")), false);
  rmSync(join(record, "incidents/acme"));
  mkdirSync(join(record, "clients/acme"), { recursive: true });
  symlinkSync(outside, join(record, "clients/acme/sightings"));
  assert.equal(unreached(record, c, "acme", "--keep").status, 1);
  assert.deepEqual(readdirSync(outside), []);
  assert.equal(existsSync(join(record, c, "acme")), false);
});

test("check-record reports stored carriers whose client record is gone, and a client record with no sighting", (t) => {
  const { record, exposed } = setup(t);
  reached(record, begin(record, "2026-10-07"), "acme", exposed, "--keep");
  rmSync(join(record, "clients/acme"), { recursive: true });
  const lost = run("check-record", record);
  assert.equal(lost.status, 1);
  assert.match(lost.stderr, /requests\/acme\/.* is stored but no sighting lists it, and there is no record of this client/);
  assert.match(lost.stderr, /incidents\/acme\/.* is stored but no sighting lists it/);
  mkdirSync(join(record, "clients/acme/sightings"), { recursive: true });
  const empty = run("check-record", record);
  assert.equal(empty.status, 1);
  assert.match(empty.stderr, /acme: has 0 founding sightings/);
  rmSync(join(record, "clients"), { recursive: true });
  mkdirSync(join(record, "clients/ghost/sightings"), { recursive: true });
  assert.match(run("check-record", record).stderr, /ghost: has 0 founding sightings/);
});

test("a Record that also holds locally authored dated carriers is checked without mistaking them for stored ones", (t) => {
  const { record, exposed } = setup(t);
  for (const place of ["incidents", "requests"]) {
    mkdirSync(join(record, place, "26/10/07"), { recursive: true });
    writeFileSync(join(record, place, "26/10/07/01.md"), "ours\n");
  }
  reached(record, begin(record, "2026-10-07"), "acme", exposed, "--keep");
  const r = run("check-record", record);
  assert.equal(r.status, 0, r.stderr);
  writeFileSync(join(record, "requests/acme", `${sha256("y")}.md`), "y");
  assert.match(run("check-record", record).stderr, /is stored but no sighting lists it/);
});
