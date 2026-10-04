// Self-installation, proven on what the packages actually deliver: the
// installed KAAL is a projection of the packages, never their source; the
// check can say whether a checkout holds it; and `.kaal/changes`, the genuine
// installed state, survives installing and checking. The last tests hold this
// very repository to it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { delivery, read, SOURCE, KAAL_DIR, HOST_SKILLS } from "../helpers/delivery.js";
import { check, install } from "../helpers/state.js";

type Core = { payload(): Record<string, string> };
const core = (await import(pathToFileURL(join(SOURCE, "packages", "kaal-core", "dist", "index.js")).href)) as Core;
const nodes = (await import(pathToFileURL(join(SOURCE, "packages", "kaal-core", "dist", "nodes.js")).href)) as {
  admit(files: Record<string, string>): { name: string; type?: { name: string } }[];
};
const d = await delivery();
const CAPABILITIES = ["changing-kaal", "engineering-kaal-skill"];

function checkout(t: { after: (fn: () => void) => void }): string {
  const dir = mkdtempSync(join(tmpdir(), "kaal-install-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
const installed = (dir: string) => install(dir, d);
const run = (command: string, dir: string, ...args: string[]) => {
  const r = spawnSync("node", [join(SOURCE, "engineering", "kaal-install", "dist", "helpers", `${command}.js`), ...args], { env: { ...process.env, INIT_CWD: dir }, encoding: "utf8" });
  return { code: r.status, err: r.stderr };
};
const put = (file: string, content: string) => (mkdirSync(dirname(file), { recursive: true }), writeFileSync(file, content));

test("the delivery is Core's payload plus each capability registered through Core, and the capabilities are the packages", () => {
  assert.deepEqual(d.capabilities, CAPABILITIES);
  for (const [path, content] of Object.entries(core.payload())) assert.equal(d.kaal[path], content, `Core's ${path}`);
  for (const cap of CAPABILITIES) {
    assert.ok(Object.keys(d.kaal).some((p) => p.startsWith(`skills/${cap}/`) && p.endsWith(".md")), `${cap}'s Node is under skills/${cap}/`);
  }
});

test("installing into an empty checkout gives a valid installed KAAL, and checking agrees", (t) => {
  const dir = checkout(t);
  assert.notEqual(check(dir, d).length, 0, "nothing is installed yet");
  installed(dir);
  assert.deepEqual(check(dir, d), []);
  const kaal = read(join(dir, KAAL_DIR));
  assert.deepEqual(kaal, d.kaal, "the installed KAAL is exactly the delivery");
  for (const [path, content] of Object.entries(core.payload())) assert.equal(kaal[path], content, `Core installed: ${path}`);
  const admitted = nodes.admit(kaal);
  assert.deepEqual(admitted.filter((n) => n.type?.name === "Skill").map((n) => n.name).sort(), ["Changing KAAL", "Engineering Skill"], "both capabilities are registered Skills");
  for (const cap of CAPABILITIES) assert.ok(Object.keys(kaal).some((p) => p.startsWith(`skills/${cap}/`)));
  assert.deepEqual(read(join(dir, HOST_SKILLS)), d.skills, "Agent Skills appear under the host's skills/");
});

test("installing twice changes nothing", (t) => {
  const dir = checkout(t);
  installed(dir);
  const once = JSON.stringify([read(join(dir, KAAL_DIR)), read(join(dir, HOST_SKILLS))]);
  installed(dir);
  assert.equal(JSON.stringify([read(join(dir, KAAL_DIR)), read(join(dir, HOST_SKILLS))]), once);
});

test("the check names what differs from the delivery, and repairs nothing", (t) => {
  const dir = checkout(t);
  installed(dir);
  const node = join(dir, KAAL_DIR, "skills", "changing-kaal", "Changing-KAAL.md");
  const skill = join(dir, HOST_SKILLS, "changing-kaal", "SKILL.md");
  const damage: [string, () => void, RegExp][] = [
    ["a missing Core file", () => rmSync(join(dir, KAAL_DIR, "core", "Core.md")), /core\/Core\.md is missing/],
    ["a changed Node", () => writeFileSync(node, readFileSync(node, "utf8") + " "), /Changing-KAAL\.md differs/],
    ["a missing seal", () => rmSync(join(dir, KAAL_DIR, "seals", readdirSync(join(dir, KAAL_DIR, "seals"))[0])), /is missing/],
    ["a changed Agent Skill", () => writeFileSync(skill, "changed"), /changing-kaal\/SKILL\.md differs/],
    ["a file no package delivers in the KAAL directory", () => put(join(dir, KAAL_DIR, "skills", "other", "X.md"), "x"), /skills\/other\/X\.md is not delivered/],
    ["a file no package delivers in a delivered Agent Skill", () => put(join(dir, HOST_SKILLS, "changing-kaal", "extra.md"), "x"), /extra\.md is not delivered/],
  ];
  for (const [what, harm, expected] of damage) {
    installed(dir);
    harm();
    const before = JSON.stringify([read(join(dir, KAAL_DIR)), read(join(dir, HOST_SKILLS))]);
    assert.match(check(dir, d).join("\n"), expected, what);
    assert.equal(JSON.stringify([read(join(dir, KAAL_DIR)), read(join(dir, HOST_SKILLS))]), before, `${what}: nothing repaired`);
    rmSync(join(dir, KAAL_DIR), { recursive: true, force: true });
    rmSync(join(dir, HOST_SKILLS), { recursive: true, force: true });
  }
});

test("an unsealed derived file is made to match; sealed material with other bytes is refused and nothing is written", (t) => {
  const dir = checkout(t);
  installed(dir);
  writeFileSync(join(dir, KAAL_DIR, "AGENT.md"), "stale");
  writeFileSync(join(dir, HOST_SKILLS, "changing-kaal", "SKILL.md"), "stale");
  put(join(dir, HOST_SKILLS, "changing-kaal", "old.md"), "gone from the package");
  put(join(dir, HOST_SKILLS, "not-ours", "SKILL.md"), "some other host skill");
  installed(dir);
  assert.deepEqual(check(dir, d), [], "AGENT.md and the Agent Skill match again; the stale file is gone");
  assert.equal(readFileSync(join(dir, HOST_SKILLS, "not-ours", "SKILL.md"), "utf8"), "some other host skill", "a skill that is not a delivered capability is not ours to touch");

  const node = join(dir, KAAL_DIR, "core", "Core.md");
  writeFileSync(node, "other bytes");
  writeFileSync(join(dir, KAAL_DIR, "AGENT.md"), "stale again");
  assert.throws(() => install(dir, d), /other bytes: changed bytes are another Node/);
  assert.equal(readFileSync(join(dir, KAAL_DIR, "AGENT.md"), "utf8"), "stale again", "refused before writing anything");
});

test("changes, the genuine installed state, survive installing and are outside the check", (t) => {
  const dir = checkout(t);
  installed(dir);
  const retro = join(dir, KAAL_DIR, "changes", "genesis", "26", "10", "04", "01", "retro.md");
  put(retro, "# Retro\n");
  installed(dir);
  assert.equal(readFileSync(retro, "utf8"), "# Retro\n");
  assert.deepEqual(check(dir, d), [], "changes are not a package's delivery");
  writeFileSync(retro, "# Retro\n\nedited");
  assert.deepEqual(check(dir, d), [], "the check does not judge installed history");
  assert.equal(readFileSync(retro, "utf8"), "# Retro\n\nedited");
  put(join(dir, KAAL_DIR, "changes", "x", "y.md"), "y");
  assert.deepEqual(check(dir, d), []);
});

test("the commands: install, check (exit 1 and never repairs), install again", (t) => {
  const dir = checkout(t);
  assert.equal(run("check-kaal-install", dir).code, 1);
  assert.ok(!existsSync(join(dir, KAAL_DIR)), "check created nothing");
  assert.equal(run("install-kaal", dir).code, 0);
  assert.equal(run("check-kaal-install", dir).code, 0);
  assert.equal(run("check-kaal-install", dir, "--bogus").code, 2);
  writeFileSync(join(dir, KAAL_DIR, "core", "Core.md"), "x");
  const r = run("install-kaal", dir);
  assert.equal(r.code, 1);
  assert.match(r.err, /changed bytes are another Node/);
});

test("the Agent entrypoint is wired by the existing KAAL Agent machinery", (t) => {
  const dir = checkout(t);
  installed(dir);
  const agent = (command: string) => spawnSync("node", [join(SOURCE, "engineering", "kaal-agent", "dist", "helpers", `${command}.js`)], { cwd: dir, env: { ...process.env, INIT_CWD: dir } }).status;
  assert.equal(agent("check-kaal-agent"), 1);
  assert.equal(agent("wire-kaal-agent"), 0);
  assert.equal(agent("check-kaal-agent"), 0, "AGENTS.md points to the installed .kaal/AGENT.md");
});

// This repository, held to the same.

test("this repository holds what its packages deliver, derived and not authored", () => {
  assert.deepEqual(check(SOURCE, d), []);
});

test("this repository's AGENTS.md is wired to its installed .kaal", () => {
  const r = spawnSync("node", [join(SOURCE, "engineering", "kaal-agent", "dist", "helpers", "check-kaal-agent.js")], { cwd: SOURCE, env: { ...process.env, INIT_CWD: SOURCE }, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
});

test("this repository's change records are well formed: allocated in sequence, each closed with a 4L retro.md", () => {
  const changes = read(join(SOURCE, KAAL_DIR, "changes"));
  const paths = Object.keys(changes);
  assert.ok(paths.length > 0, "the self-install change is recorded");
  for (const path of paths) assert.match(path, /^[a-z0-9]+(-[a-z0-9]+)*\/\d\d\/\d\d\/\d\d\/(0[1-9]|[1-9]\d)\/retro\.md$/, path);
  const days = new Map<string, number[]>();
  for (const path of paths) {
    const [name, yy, mm, dd, cc] = path.split("/");
    days.set(`${name}/${yy}/${mm}/${dd}`, [...(days.get(`${name}/${yy}/${mm}/${dd}`) ?? []), Number(cc)]);
  }
  for (const [day, sequence] of days) assert.deepEqual(sequence.sort((a, b) => a - b), sequence.map((_, i) => i + 1), `${day}: 01.. with no gap`);
  assert.ok(days.has("genesis/26/10/04") && changes["genesis/26/10/04/01/retro.md"], "the self-install change is genesis 26/10/04 01");
  for (const [path, text] of Object.entries(changes)) {
    const headings = text.split("\n").filter((l) => l.startsWith("#"));
    assert.deepEqual(headings, ["# Retro", "## Learned", "## Liked", "## Lacked", "## Longed"], `${path}: the 4L form and nothing else`);
    for (const section of text.split(/^## /m).slice(1)) assert.ok(section.split("\n").slice(1).join("").trim().length > 0, `${path}: ${section.split("\n")[0]} says something`);
  }
});
