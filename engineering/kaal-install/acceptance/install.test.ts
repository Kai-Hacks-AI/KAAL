// Self-installation, proven on what the packages actually deliver: the
// installed KAAL is a projection of the packages, never their source; which
// Skills are installed is Core's answer, `installedSkills()`, and the packages
// only supply their bytes; the check can say whether a checkout holds the
// delivery; and `.kaal/changes`, the genuine installed state, survives
// installing and checking. The last tests hold this very repository to it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { core, delivery, nodes, read, SOURCE, KAAL_DIR, HOST_SKILLS } from "../helpers/delivery.js";
import { check, install } from "../helpers/state.js";
import * as changing from "changing-kaal";
import * as engineering from "engineering-kaal-skill";

// Changing KAAL is two Nodes: the one it was born as, and its successor that refers to RATIFICATION.
const SKILLS = ["Changing KAAL", "Changing KAAL", "Engineering Skill"];
// Genesis bootstrap, explicit and boring: deploy Core, then register each capability's contribution through Core.
const bootstrap: [string, () => { kaal: Record<string, string> }][] = [
  ["engineering-kaal-skill", engineering.payload],
  ["changing-kaal", changing.payload],
];
const CAPABILITIES = ["changing-kaal", "engineering-kaal-skill"];
const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");

type After = { after: (fn: () => void) => void };
function checkout(t: After): string {
  const dir = mkdtempSync(join(tmpdir(), "kaal-install-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
/** What the packages deliver for the checkout as it is now. */
const deliver = (dir: string) => delivery(dir);
/** Install the delivery: Core, and the packages' bytes for whatever Skills the checkout has installed. */
const installed = async (dir: string) => install(dir, await deliver(dir));
const problems = async (dir: string) => check(dir, await deliver(dir));
/** A checkout bootstrapped as genesis is: Core installed, both capabilities registered through Core, then projected. */
async function bootstrapped(dir: string, only = bootstrap): Promise<void> {
  await installed(dir);
  for (const [capability, payload] of only) core.registerSkill(join(dir, KAAL_DIR), capability, payload().kaal);
  await installed(dir);
}
const full = async (t: After): Promise<string> => {
  const dir = checkout(t);
  await bootstrapped(dir);
  return dir;
};
const both = (dir: string) => JSON.stringify([read(join(dir, KAAL_DIR)), existsSync(join(dir, HOST_SKILLS)) ? read(join(dir, HOST_SKILLS)) : {}]);
const run = (command: string, dir: string, ...args: string[]) => {
  const r = spawnSync("node", [join(SOURCE, "engineering", "kaal-install", "dist", "helpers", `${command}.js`), ...args], { env: { ...process.env, INIT_CWD: dir }, encoding: "utf8" });
  return { code: r.status, err: r.stderr };
};
const put = (file: string, content: string) => (mkdirSync(dirname(file), { recursive: true }), writeFileSync(file, content));

test("a fresh checkout is delivered Core only: with no installed Skills, no package decides anything", async (t) => {
  const dir = checkout(t);
  const d = await deliver(dir);
  assert.deepEqual(d.capabilities, []);
  assert.deepEqual(d.skills, {});
  assert.deepEqual(d.kaal, core.payload(), "Core's payload and nothing else");
  await installed(dir);
  assert.deepEqual(await problems(dir), []);
  assert.deepEqual(core.installedSkills(join(dir, KAAL_DIR)), []);
  assert.ok(!existsSync(join(dir, HOST_SKILLS)), "no Agent Skills without installed Skills");
});

test("registered through Core, the capabilities are installed Skills: Nodes under skills/<capability>/, seals in seals/, Agent Skills under the host's skills/", async (t) => {
  const dir = await full(t);
  assert.deepEqual(await problems(dir), []);
  const kaal = read(join(dir, KAAL_DIR));
  const d = await deliver(dir);
  assert.deepEqual(d.capabilities, CAPABILITIES, "derived from Core's installed Skills, not from a list");
  assert.deepEqual(kaal, d.kaal, "the installed KAAL is exactly the delivery");
  for (const [path, content] of Object.entries(core.payload())) assert.equal(kaal[path], content, `Core installed: ${path}`);
  const skills = core.installedSkills(join(dir, KAAL_DIR));
  assert.deepEqual(skills.map((s) => s.name), SKILLS, "both are registered Skills");
  for (const skill of skills) assert.ok(skill.id in Object.fromEntries(Object.keys(kaal).filter((p) => p.startsWith("seals/")).map((p) => [p.slice(6), 1])), `${skill.name} is sealed in seals/`);
  for (const cap of CAPABILITIES) {
    assert.ok(Object.keys(kaal).some((p) => p.startsWith(`skills/${cap}/`) && p.endsWith(".md")), `${cap}'s Node is under skills/${cap}/`);
    assert.ok(Object.keys(read(join(dir, HOST_SKILLS))).some((p) => p.startsWith(`${cap}/SKILL.md`)), `${cap}'s Agent Skill is under skills/`);
  }
});

test("what is delivered follows the installed Skills: install one and only it is delivered, whatever other packages exist", async (t) => {
  const dir = checkout(t);
  await bootstrapped(dir, bootstrap.filter(([c]) => c === "changing-kaal"));
  assert.deepEqual((await deliver(dir)).capabilities, ["changing-kaal"]);
  assert.deepEqual(await problems(dir), []);
  assert.ok(!existsSync(join(dir, HOST_SKILLS, "engineering-kaal-skill")), "a package that exists is not thereby installed");
  assert.ok(!Object.keys(read(join(dir, KAAL_DIR))).some((p) => p.startsWith("skills/engineering-kaal-skill/")));
});

test("an installed Skill that no package delivers is named by the check", async (t) => {
  const dir = await full(t);
  // A sealed Skill registered through Core, from no package of this repository.
  const skillNode = nodes.candidates(read(join(dir, KAAL_DIR))).find((n) => n.name === "Skill")!;
  const md = `---\nname: Foreign\ntype:\n  name: Skill\n  id: ${skillNode.id}\n---\n\n# Foreign\n`;
  core.registerSkill(join(dir, KAAL_DIR), "foreign", { "Foreign.md": md, [`seals/${sha256(md)}`]: "" });
  const found = (await problems(dir)).join("\n");
  assert.match(found, new RegExp(`the installed Skill Foreign \\(${sha256(md)}\\) is delivered by no package`));
});

test("installing twice changes nothing", async (t) => {
  const dir = await full(t);
  const once = both(dir);
  await installed(dir);
  assert.equal(both(dir), once);
});

test("the check names what differs from the delivery, and repairs nothing", async (t) => {
  const dir = await full(t);
  const node = join(dir, KAAL_DIR, "skills", "changing-kaal", "Changing-KAAL.md");
  const skill = join(dir, HOST_SKILLS, "changing-kaal", "SKILL.md");
  const damage: [string, () => void, RegExp][] = [
    ["a missing Core file", () => rmSync(join(dir, KAAL_DIR, "core", "Core.md")), /core\/Core\.md is missing/],
    ["a changed Node", () => writeFileSync(node, readFileSync(node, "utf8") + " "), /Changing-KAAL\.md differs from what the packages deliver[\s\S]*1 Node\(s\) that are not admitted/],
    ["a missing seal", () => rmSync(join(dir, KAAL_DIR, "seals", readdirSync(join(dir, KAAL_DIR, "seals"))[0])), /is missing|is not delivered/],
    ["a changed Agent Skill", () => writeFileSync(skill, "changed"), /changing-kaal\/SKILL\.md differs/],
    ["a file no package delivers in the KAAL directory", () => put(join(dir, KAAL_DIR, "skills", "other", "X.md"), "x"), /skills\/other\/X\.md is not delivered/],
    ["a file no package delivers in a delivered Agent Skill", () => put(join(dir, HOST_SKILLS, "changing-kaal", "extra.md"), "x"), /extra\.md is not delivered/],
  ];
  for (const [what, harm, expected] of damage) {
    rmSync(join(dir, KAAL_DIR), { recursive: true, force: true });
    rmSync(join(dir, HOST_SKILLS), { recursive: true, force: true });
    await bootstrapped(dir);
    harm();
    const before = both(dir);
    assert.match((await problems(dir)).join("\n"), expected, what);
    assert.equal(both(dir), before, `${what}: nothing repaired`);
  }
});

test("an unsealed derived file is made to match; sealed material with other bytes is refused and nothing is written", async (t) => {
  const dir = await full(t);
  writeFileSync(join(dir, KAAL_DIR, "AGENTS.md"), "stale");
  writeFileSync(join(dir, HOST_SKILLS, "changing-kaal", "SKILL.md"), "stale");
  put(join(dir, HOST_SKILLS, "changing-kaal", "old.md"), "gone from the package");
  put(join(dir, HOST_SKILLS, "not-ours", "SKILL.md"), "some other host skill");
  await installed(dir);
  assert.deepEqual(await problems(dir), [], "AGENTS.md and the Agent Skill match again; the stale file is gone");
  assert.equal(readFileSync(join(dir, HOST_SKILLS, "not-ours", "SKILL.md"), "utf8"), "some other host skill", "a skill that is not a delivered capability is not ours to touch");

  writeFileSync(join(dir, KAAL_DIR, "core", "Core.md"), "other bytes");
  writeFileSync(join(dir, KAAL_DIR, "AGENTS.md"), "stale again");
  await assert.rejects(() => installed(dir), /other bytes: changed bytes are another Node/);
  assert.equal(readFileSync(join(dir, KAAL_DIR, "AGENTS.md"), "utf8"), "stale again", "refused before writing anything");
});

test("changes, the genuine installed state, survive installing and are outside the check", async (t) => {
  const dir = await full(t);
  const retro = join(dir, KAAL_DIR, "changes", "genesis", "26", "10", "04", "01", "retro.md");
  put(retro, "# Retro\n");
  await installed(dir);
  assert.equal(readFileSync(retro, "utf8"), "# Retro\n");
  assert.deepEqual(await problems(dir), [], "changes are not a package's delivery");
  writeFileSync(retro, "# Retro\n\nedited");
  assert.deepEqual(await problems(dir), [], "the check does not judge installed history");
  assert.equal(readFileSync(retro, "utf8"), "# Retro\n\nedited");
  put(join(dir, KAAL_DIR, "changes", "x", "y.md"), "y");
  assert.deepEqual(await problems(dir), []);
  assert.deepEqual(core.installedSkills(join(dir, KAAL_DIR)).map((s) => s.name), SKILLS, "and installed Skills are unaffected by them");
});

test("Change seals, seals/changes/, are installed state too, while a stray Node-level seal is still refused", async (t) => {
  const dir = await full(t);
  const id = "a".repeat(64);
  put(join(dir, KAAL_DIR, "seals", "changes", id), "");
  await installed(dir);
  assert.ok(existsSync(join(dir, KAAL_DIR, "seals", "changes", id)), "installing leaves it");
  assert.deepEqual(await problems(dir), [], "the check does not judge Change seals");
  put(join(dir, KAAL_DIR, "seals", id), "");
  assert.deepEqual(await problems(dir), [`${KAAL_DIR}/seals/${id} is not delivered by any package`], "a bare seal is a Node seal and nothing delivers it");
});

test("the commands: check (exit 1, never repairs), install Core, register, install again, check; the installer takes no names", async (t) => {
  const dir = checkout(t);
  assert.equal(run("check-kaal-install", dir).code, 1, "no Core installed");
  assert.ok(!existsSync(join(dir, KAAL_DIR)), "check created nothing");
  assert.equal(run("install-kaal", dir).code, 0, "a fresh checkout is installed Core only");
  assert.equal(run("check-kaal-install", dir).code, 0);
  for (const [capability, payload] of bootstrap) core.registerSkill(join(dir, KAAL_DIR), capability, payload().kaal);
  assert.equal(run("check-kaal-install", dir).code, 1, "registered Skills are not yet projected to the host's skills/");
  assert.equal(run("install-kaal", dir).code, 0, "Core knows what is installed: no names");
  assert.equal(run("check-kaal-install", dir).code, 0);
  assert.equal(run("check-kaal-install", dir, "--bogus", "x").code, 2);
  assert.equal(run("install-kaal", dir, "--skill", "Changing KAAL").code, 2, "no name-based selection exists");
  writeFileSync(join(dir, KAAL_DIR, "core", "Core.md"), "x");
  const r = run("install-kaal", dir);
  assert.equal(r.code, 1);
  assert.match(r.err, /changed bytes are another Node/);
});

test("the Agent entrypoint is wired by the existing KAAL Agent machinery", async (t) => {
  const dir = await full(t);
  const agent = (command: string) => spawnSync("node", [join(SOURCE, "engineering", "kaal-agent", "dist", "helpers", `${command}.js`)], { cwd: dir, env: { ...process.env, INIT_CWD: dir } }).status;
  assert.equal(agent("check-kaal-agent"), 1);
  assert.equal(agent("wire-kaal-agent"), 0);
  assert.equal(agent("check-kaal-agent"), 0, "AGENTS.md points to the installed .kaal/AGENTS.md");
});

// This repository, held to the same.

test("this repository holds what its packages deliver for its installed Skills, derived and not authored", async () => {
  assert.deepEqual(await problems(SOURCE), []);
  assert.deepEqual(core.installedSkills(join(SOURCE, KAAL_DIR)).map((s) => s.name), SKILLS, "Engineering KAAL Skill and Changing KAAL are installed Skills");
  assert.deepEqual((await deliver(SOURCE)).capabilities, CAPABILITIES);
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
