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
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { contributions, core, delivery, nodes, packages, read, SOURCE, KAAL_DIR, HOST_SKILLS } from "../helpers/delivery.js";
import { check, install } from "../helpers/state.js";
import * as changing from "kaal-changing";
import * as engineering from "kaal-engineering";
import * as retro from "kaal-retro";
import * as sealing from "kaal-sealing";

const SKILLS = ["Changing KAAL", "Engineering Skill", "Retro", "Sealing"];
// Genesis bootstrap, explicit and boring: deploy Core, then register each capability's contribution through Core.
const bootstrap: [string, () => { kaal: Record<string, string> }][] = [
  ["kaal-engineering", engineering.payload],
  ["kaal-changing", changing.payload],
  ["kaal-retro", retro.payload],
  ["kaal-sealing", sealing.payload],
];
const CAPABILITIES = ["kaal-changing", "kaal-engineering", "kaal-retro", "kaal-sealing"];
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
  assert.deepEqual(skills.map((s) => s.name), SKILLS, "all are registered Skills");
  for (const skill of skills) assert.ok(skill.id in Object.fromEntries(Object.keys(kaal).filter((p) => p.startsWith("seals/")).map((p) => [p.slice(6), 1])), `${skill.name} is sealed in seals/`);
  for (const cap of CAPABILITIES) {
    assert.ok(Object.keys(kaal).some((p) => p.startsWith(`skills/${cap}/`) && p.endsWith(".md")), `${cap}'s Node is under skills/${cap}/`);
    assert.ok(Object.keys(read(join(dir, HOST_SKILLS))).some((p) => p.startsWith(`${cap}/SKILL.md`)), `${cap}'s Agent Skill is under skills/`);
  }
});

test("what is delivered follows the installed Skills: install one and only it is delivered, whatever other packages exist", async (t) => {
  const dir = checkout(t);
  await bootstrapped(dir, bootstrap.filter(([c]) => c === "kaal-retro"));
  assert.deepEqual((await deliver(dir)).capabilities, ["kaal-retro"]);
  assert.deepEqual(await problems(dir), []);
  assert.ok(!existsSync(join(dir, HOST_SKILLS, "kaal-engineering")), "a package that exists is not thereby installed");
  assert.ok(!Object.keys(read(join(dir, KAAL_DIR))).some((p) => p.startsWith("skills/kaal-engineering/")));
});

// The transition from a repository that holds no KAAL: a first Skill is selected by the exact ID of its Node.
const nodeId = async (capability: string) => (await packages(join(SOURCE, "packages"))).filter((p) => p.capability === capability).flatMap(contributions)[0].id;
/** A repository that is not KAAL, with a README and an AGENTS.md of its own. */
function host(t: After): string {
  const dir = checkout(t);
  put(join(dir, "README.md"), "# Some host\n");
  put(join(dir, "AGENTS.md"), "# Host agents\n\nBe kind.\n");
  return dir;
}
const whole = (dir: string) => JSON.stringify(read(dir));
const hostFiles = (dir: string) => Object.fromEntries(Object.entries(read(dir)).filter(([p]) => !p.startsWith(`${KAAL_DIR}/`) && !p.startsWith(`${HOST_SKILLS}/`)));

test("a non-KAAL repository becomes an installed, composed KAAL: Core, then Skills selected by exact Node ID, then the Agent entrypoint", async (t) => {
  const dir = host(t);
  const before = hostFiles(dir);
  const ids = [await nodeId("kaal-changing"), await nodeId("kaal-sealing")];
  assert.equal(run("install-kaal", dir, "--select", ids[0], "--select", ids[1]).code, 0);
  assert.deepEqual(core.installedSkills(join(dir, KAAL_DIR)).map((s) => s.id).sort(), [...ids].sort(), "registered through Core: Core's answer is the truth");
  assert.deepEqual(await problems(dir), []);
  for (const cap of ["kaal-changing", "kaal-sealing"]) assert.ok(existsSync(join(dir, HOST_SKILLS, cap, "SKILL.md")), `${cap}'s Agent Skill is projected`);
  const wire = spawnSync("npm", ["run", "--silent", "wire-kaal-agent", "--", "--agents", join(dir, "AGENTS.md")], { cwd: SOURCE, encoding: "utf8" });
  assert.equal(wire.status, 0, wire.stderr);
  const agent = spawnSync("npm", ["run", "--silent", "check-kaal-agent", "--", "--agents", join(dir, "AGENTS.md")], { cwd: SOURCE, encoding: "utf8" });
  assert.equal(agent.status, 0, agent.stderr);
  const agents = readFileSync(join(dir, "AGENTS.md"), "utf8");
  assert.ok(agents.startsWith("# Host agents\n\nBe kind.\n"), "the host's own AGENTS.md content is kept");
  assert.deepEqual({ ...hostFiles(dir), "AGENTS.md": "" }, { ...before, "AGENTS.md": "" }, "nothing of the host is written but .kaal, the delivered skills/ and the AGENTS.md wiring");
  // The installed Skill works in the host: its own state command runs there, with its sibling Sealing beside it.
  const change = spawnSync("node", [join(dir, HOST_SKILLS, "kaal-changing", "scripts", "next-change.mjs"), join(dir, KAAL_DIR), "host"], { encoding: "utf8" });
  assert.equal(change.status, 0, change.stderr);
  const rel = change.stdout.trim();
  const state = spawnSync("node", [join(dir, HOST_SKILLS, "kaal-changing", "scripts", "change-state.mjs"), join(dir, KAAL_DIR), rel], { encoding: "utf8" });
  assert.equal(state.status, 0, state.stdout + state.stderr);
});

test("selection is one-time: installing again without it reproduces the same installation, and nothing else remembers it", async (t) => {
  const dir = host(t);
  assert.equal(run("install-kaal", dir, "--select", await nodeId("kaal-retro")).code, 0);
  const first = both(dir);
  assert.equal(run("install-kaal", dir).code, 0);
  assert.equal(both(dir), first);
  assert.equal(run("install-kaal", dir, "--select", await nodeId("kaal-retro")).code, 0, "selecting what is installed is a no-op");
  assert.equal(both(dir), first);
  assert.equal(run("check-kaal-install", dir).code, 0);
  assert.deepEqual(Object.keys(hostFiles(dir)).sort(), ["AGENTS.md", "README.md"], "no list, lock file or registry");
});

test("composition: a Skill that declares a sibling it needs is not installed without it, and the refusal names the exact Node ID that selects it", async (t) => {
  const dir = host(t);
  const before = whole(dir);
  const alone = run("install-kaal", dir, "--select", await nodeId("kaal-changing"));
  assert.equal(alone.code, 1);
  assert.match(alone.err, /kaal-changing declares that it needs kaal-sealing/);
  assert.ok(alone.err.includes(await nodeId("kaal-sealing")), "the dependency's exact Node ID is named");
  assert.equal(whole(dir), before, "nothing was written");
  assert.ok(!existsSync(join(dir, KAAL_DIR)));
  assert.equal(run("install-kaal", dir, "--select", await nodeId("kaal-changing"), "--select", await nodeId("kaal-sealing")).code, 0);
  assert.equal(run("check-kaal-install", dir).code, 0);
});

test("composition: an installation registered by hand without the needed sibling is named by the check, as incomplete", async (t) => {
  const dir = checkout(t);
  await installed(dir);
  core.registerSkill(join(dir, KAAL_DIR), "kaal-changing", changing.payload().kaal);
  const found = (await problems(dir)).join("\n");
  assert.match(found, /kaal-changing declares that it needs kaal-sealing/);
  assert.notEqual(run("check-kaal-install", dir).code, 0);
  assert.notEqual(run("install-kaal", dir).code, 0, "and it is not made to look installed");
});

test("selection is by exact ID and refused otherwise, writing nothing: a name, an unknown ID, a Node that is not a Skill", async (t) => {
  const dir = host(t);
  const before = whole(dir);
  const candidates = (await packages(join(SOURCE, "packages"))).flatMap((p) => p.nodes);
  const other = candidates.find((n) => n.name === "RATIFICATION")!;
  for (const bad of ["kaal-sealing", "Sealing", "0".repeat(64), other.id]) {
    const r = run("install-kaal", dir, "--select", bad);
    assert.equal(r.code, 1, `selecting ${bad}`);
    assert.equal(whole(dir), before);
  }
  assert.match(run("install-kaal", dir, "--select", other.id).err, /not a Skill or Extension Node/);
  assert.match(run("install-kaal", dir, "--select", "kaal-sealing").err, /no package carries a Node with the exact ID/);
});

test("list-kaal-capabilities lists what can be selected, with exact IDs, and selects nothing", async (t) => {
  const dir = host(t);
  const before = whole(dir);
  const r = spawnSync("node", [join(SOURCE, "engineering", "kaal-install", "dist", "helpers", "list-kaal-capabilities.js"), "--into", dir], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes(await nodeId("kaal-sealing")) && r.stdout.includes("not installed"));
  assert.equal(whole(dir), before);
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

test("core/config is instance-owned: written when absent, then never overwritten, and a human edit is not drift", async (t) => {
  const dir = checkout(t);
  const d = await deliver(dir);
  const withConfig = { ...d, kaal: { ...d.kaal, "core/config": "# default\n" } };
  install(dir, withConfig);
  const file = join(dir, KAAL_DIR, "core", "config");
  assert.equal(readFileSync(file, "utf8"), "# default\n", "born from what Core delivers");
  assert.deepEqual(check(dir, withConfig), []);
  writeFileSync(file, "capability-prefix = acme-\n");
  assert.deepEqual(check(dir, withConfig), [], "an edit is not drift");
  install(dir, withConfig);
  assert.equal(readFileSync(file, "utf8"), "capability-prefix = acme-\n", "installing never overwrites it");
  rmSync(file);
  assert.match(check(dir, withConfig).join("\n"), /core\/config is missing/, "a delivered file that is absent is named");
  const { "core/config": _, ...without } = d.kaal;
  assert.deepEqual(check(dir, { ...d, kaal: without }).filter((p) => /config/.test(p)), [], "a delivery that carries none expects none, whether or not Core delivers one");
});

test("installing twice changes nothing", async (t) => {
  const dir = await full(t);
  const once = whole(dir);
  await installed(dir);
  assert.equal(whole(dir), once);
});

test("the check names what differs from the delivery, and repairs nothing", async (t) => {
  const dir = await full(t);
  const node = join(dir, KAAL_DIR, "skills", "kaal-changing", "Changing-KAAL.md");
  const skill = join(dir, HOST_SKILLS, "kaal-changing", "SKILL.md");
  const damage: [string, () => void, RegExp][] = [
    ["a missing Core file", () => rmSync(join(dir, KAAL_DIR, "core", "Core.md")), /core\/Core\.md is missing/],
    ["a changed Node", () => writeFileSync(node, readFileSync(node, "utf8") + " "), /Changing-KAAL\.md is not delivered by any package[\s\S]*1 Node\(s\) that are not admitted/],
    ["a missing seal", () => rmSync(join(dir, KAAL_DIR, "seals", readdirSync(join(dir, KAAL_DIR, "seals"))[0])), /is missing|is not delivered/],
    ["a changed Agent Skill", () => writeFileSync(skill, "changed"), /kaal-changing\/SKILL\.md differs/],
    ["a file no package delivers in the KAAL directory", () => put(join(dir, KAAL_DIR, "skills", "other", "X.md"), "x"), /skills\/other\/X\.md is not delivered/],
    ["a file no package delivers in a delivered Agent Skill", () => put(join(dir, HOST_SKILLS, "kaal-changing", "extra.md"), "x"), /extra\.md is not delivered/],
  ];
  for (const [what, harm, expected] of damage) {
    rmSync(join(dir, KAAL_DIR), { recursive: true, force: true });
    rmSync(join(dir, HOST_SKILLS), { recursive: true, force: true });
    await bootstrapped(dir);
    harm();
    const before = whole(dir);
    assert.match((await problems(dir)).join("\n"), expected, what);
    assert.equal(whole(dir), before, `${what}: nothing repaired`);
  }
});

test("an unsealed derived file is made to match; sealed material with other bytes is refused and nothing is written", async (t) => {
  const dir = await full(t);
  writeFileSync(join(dir, KAAL_DIR, "AGENTS.md"), "stale");
  writeFileSync(join(dir, HOST_SKILLS, "kaal-changing", "SKILL.md"), "stale");
  put(join(dir, HOST_SKILLS, "kaal-changing", "old.md"), "gone from the package");
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

test("Change and named-tree seals, seals/changes/ and seals/trees/, are installed state too, while a stray Node-level seal is still refused", async (t) => {
  const dir = await full(t);
  const id = "a".repeat(64);
  put(join(dir, KAAL_DIR, "seals", "changes", id), "");
  put(join(dir, KAAL_DIR, "seals", "trees", id), "");
  await installed(dir);
  assert.ok(existsSync(join(dir, KAAL_DIR, "seals", "changes", id)), "installing leaves it");
  assert.ok(existsSync(join(dir, KAAL_DIR, "seals", "trees", id)), "and a named-tree seal");
  assert.deepEqual(await problems(dir), [], "the check does not judge Change or named-tree seals");
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

// Extensions: delivered the way Skills are, found by Core's typing alone. No
// package of this repository is an Extension yet, so the delivery is proven
// over a throwaway package root holding real, sealed Extension Nodes.

const typeLine = (name: string, id: string) => `---\nname: ${name}\ntype:\n  name: Extension\n  id: ${id}\n---\n\n# ${name}\n\nAn Extension.\n`;
/** A throwaway package root with one package per entry, each a real built payload() of the given KAAL files and optional Agent Skills. */
function packageRoot(t: After, packages: Record<string, { kaal: Record<string, string>; skills?: Record<string, string> }>): string {
  const root = checkout(t);
  for (const [name, payload] of Object.entries(packages)) {
    const dist = join(root, name, "dist");
    mkdirSync(dist, { recursive: true });
    writeFileSync(join(root, name, "package.json"), '{ "type": "module" }');
    // The payload is data, read back as data: no code is constructed from it.
    writeFileSync(join(dist, "payload.json"), JSON.stringify(payload));
    writeFileSync(join(dist, "index.js"), 'import { readFileSync } from "node:fs";\nconst data = JSON.parse(readFileSync(new URL("./payload.json", import.meta.url), "utf8"));\nexport const payload = () => data;\n');
  }
  return root;
}
const extensionNode = (name: string): { md: string; files: Record<string, string> } => {
  const id = core.payload()["core/Extension.md"] === undefined ? "" : sha256(core.payload()["core/Extension.md"]);
  const md = typeLine(name, id);
  return { md, files: { [`${name}.md`]: md, [`seals/${sha256(md)}`]: "" } };
};

test("an installed Extension is delivered by the package carrying its Node, with no Agent Skill and under its package's own name", async (t) => {
  const hosting = extensionNode("Hosting");
  const root = packageRoot(t, { "kaal-hosting": { kaal: hosting.files }, "kaal-idle": { kaal: extensionNode("Idle").files } });
  const dir = checkout(t);
  await installed(dir);
  assert.deepEqual((await delivery(dir, root)).capabilities, [], "no installed Extension, so no package is delivered");
  core.registerExtension(join(dir, KAAL_DIR), "kaal-hosting", hosting.files);
  const d = await delivery(dir, root);
  assert.deepEqual(d.capabilities, ["kaal-hosting"], "only the package whose Node is installed");
  assert.deepEqual(d.unresolved, []);
  assert.deepEqual(d.skills, {}, "an Extension delivers no Agent Skill");
  assert.equal(d.kaal["extensions/kaal-hosting/Hosting.md"], hosting.md);
  assert.deepEqual(check(dir, d), [], "the registered projection is the delivery");
  install(dir, d);
  assert.deepEqual(check(dir, d), []);
  assert.ok(!existsSync(join(dir, HOST_SKILLS)), "no host Agent Skills");
  const before = whole(dir);
  install(dir, await delivery(dir, root));
  assert.equal(whole(dir), before, "installing twice changes nothing");
});

test("a stale Extension projection is advanced by installing, and never rewritten", async (t) => {
  // The capability's Extension, and a second Node of it typed by that Extension, as a capability may carry.
  const hosting = extensionNode("Hosting");
  const notesMd = `---\nname: Hosting Notes\ntype:\n  name: Hosting\n  id: ${sha256(hosting.md)}\n---\n\n# Hosting Notes\n`;
  const kaal = { ...hosting.files, "Hosting Notes.md": notesMd, [`seals/${sha256(notesMd)}`]: "" };
  const root = packageRoot(t, { "kaal-hosting": { kaal } });
  const dir = checkout(t);
  await installed(dir);
  core.registerExtension(join(dir, KAAL_DIR), "kaal-hosting", kaal);
  assert.deepEqual(check(dir, await delivery(dir, root)), []);
  rmSync(join(dir, KAAL_DIR, "extensions", "kaal-hosting", "Hosting Notes.md"));
  rmSync(join(dir, KAAL_DIR, "seals", sha256(notesMd)));
  assert.match(check(dir, await delivery(dir, root)).join("\n"), /extensions\/kaal-hosting\/Hosting Notes\.md is missing/);
  install(dir, await delivery(dir, root));
  assert.deepEqual(check(dir, await delivery(dir, root)), []);
  writeFileSync(join(dir, KAAL_DIR, "extensions", "kaal-hosting", "Hosting Notes.md"), `${notesMd}Changed.\n`);
  await assert.rejects(async () => install(dir, await delivery(dir, root)), /changed bytes are another Node/);
});

test("an installed Extension that no package delivers is named as an Extension", async (t) => {
  const hosting = extensionNode("Hosting");
  const root = packageRoot(t, {});
  const dir = checkout(t);
  await installed(dir);
  core.registerExtension(join(dir, KAAL_DIR), "kaal-hosting", hosting.files);
  const found = check(dir, await delivery(dir, root)).join("\n");
  assert.match(found, new RegExp(`the installed Extension Hosting \\(${sha256(hosting.md)}\\) is delivered by no package`));
});

test("Skills and Extensions are delivered side by side, each by its own registration", async (t) => {
  const hosting = extensionNode("Hosting");
  const root = packageRoot(t, { "kaal-hosting": { kaal: hosting.files } });
  const dir = await full(t);
  core.registerExtension(join(dir, KAAL_DIR), "kaal-hosting", hosting.files);
  const d = await delivery(dir, root);
  assert.deepEqual(d.unresolved.map((u) => u.kind), ["Skill", "Skill", "Skill", "Skill"], "the repository's own packages are not at this root, so its installed Skills are unresolved there");
  const own = await delivery(dir);
  assert.deepEqual(own.capabilities, CAPABILITIES, "with this repository's packages, the Skills are delivered as before");
  assert.ok(!Object.keys(own.kaal).some((p) => p.startsWith("extensions/")), "an Extension no package here delivers adds nothing");
});

test("package delivery rule: a package delivers a Skill contribution or an Extension contribution, never both", async (t) => {
  const hosting = extensionNode("Hosting");
  const skillMd = `---\nname: Both\ntype:\n  name: Skill\n  id: ${sha256(core.payload()["core/Skill.md"])}\n---\n\n# Both\n`;
  const files = { ...hosting.files, "Both.md": skillMd, [`seals/${sha256(skillMd)}`]: "" };
  const root = packageRoot(t, { "kaal-both": { kaal: files } });
  const dir = checkout(t);
  await installed(dir);
  core.registerExtension(join(dir, KAAL_DIR), "kaal-both", files);
  core.registerSkill(join(dir, KAAL_DIR), "kaal-both", files);
  await assert.rejects(delivery(dir, root), /both a Skill and an Extension.*two independently selectable packages/);
});

// This repository, held to the same.

/**
 * A scratch copy of this repository's checked-in projection and host delivery:
 * the installed KAAL and the host's Agent Skills, without the installed
 * history (`changes` and the seals that belong to it), which the check does
 * not judge. The checked-in files themselves are never touched.
 */
function scratchProjection(t: After, remove: (scratch: string) => void = () => {}): string {
  const dir = checkout(t);
  const history = [CHANGES_DIR, join("seals", "changes"), join("seals", "trees")].map((p) => join(SOURCE, KAAL_DIR, p));
  cpSync(join(SOURCE, KAAL_DIR), join(dir, KAAL_DIR), { recursive: true, filter: (src) => !history.includes(src) });
  if (existsSync(join(SOURCE, HOST_SKILLS))) cpSync(join(SOURCE, HOST_SKILLS), join(dir, HOST_SKILLS), { recursive: true });
  remove(dir);
  return dir;
}
const CHANGES_DIR = "changes";

// The candidate packages are always this repository's, so the question the
// repository is held to is not whether the checked-in projection happens to
// be current (a change confined to a package cannot also update `.kaal`) but
// whether the candidate's delivery can be installed over it, legally and
// completely: installing must succeed, which refuses any sealed byte that
// would change, and the full check must then hold, with no exceptions.
test("this repository's candidate delivery installs over its checked-in projection, completely and without changing sealed material", async (t) => {
  const dir = scratchProjection(t);
  await installed(dir);
  assert.deepEqual(await problems(dir), []);
  assert.deepEqual(core.installedSkills(join(dir, KAAL_DIR)).map((s) => s.name), SKILLS, "Engineering KAAL Skill, Changing KAAL, Retro and Sealing are installed Skills");
  assert.deepEqual(core.installedExtensions(join(dir, KAAL_DIR)).map((e) => e.name), ["GitHub"], "GitHub is an installed Extension");
  assert.deepEqual((await deliver(dir)).capabilities, [...CAPABILITIES, "kaal-github"].sort(), "Skills and the Extension are delivered together");
});

test("the candidate-installation check advances a projection that lags the packages, and still refuses what it must", async (t) => {
  // A projection that lacks something the packages now deliver (a Core Node and its seal, as when a Core change precedes its installation) is advanced by installing, and the full check then holds.
  const lagging = scratchProjection(t, (scratch) => {
    const node = readdirSync(join(scratch, KAAL_DIR, "core")).find((n) => n === "Skill.md")!;
    const id = sha256(readFileSync(join(scratch, KAAL_DIR, "core", node), "utf8"));
    rmSync(join(scratch, KAAL_DIR, "core", node));
    rmSync(join(scratch, KAAL_DIR, "seals", id));
  });
  assert.match((await problems(lagging)).join("\n"), /core\/Skill\.md is missing/, "it is stale before installing");
  await installed(lagging);
  assert.deepEqual(await problems(lagging), [], "installing completes it, and the full check holds");
  // A projection whose sealed bytes disagree with the packages cannot be advanced: installing refuses, and nothing is excused.
  const altered = scratchProjection(t, (scratch) => writeFileSync(join(scratch, KAAL_DIR, "core", "Core.md"), "x"));
  await assert.rejects(installed(altered), /changed bytes are another Node/);
});

test("this repository's AGENTS.md is wired to its installed .kaal", () => {
  const r = spawnSync("node", [join(SOURCE, "engineering", "kaal-agent", "dist", "helpers", "check-kaal-agent.js")], { cwd: SOURCE, env: { ...process.env, INIT_CWD: SOURCE }, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
});

test("this repository's change records are well formed: allocated in sequence, work/, review rounds and retros only where the process puts them, each retro the 4L form", () => {
  const changes = read(join(SOURCE, KAAL_DIR, "changes"));
  const paths = Object.keys(changes);
  assert.ok(paths.length > 0, "the self-install change is recorded");
  for (const path of paths) assert.match(path, /^[a-z0-9]+(-[a-z0-9]+)*\/\d\d\/\d\d\/\d\d\/(0[1-9]|[1-9]\d)\/(retro(-work|-observe|-review|-owner)?\.md|work\/.+|review\/(0[1-9]|[1-9]\d)\.md)$/, path);
  const days = new Map<string, Set<number>>();
  for (const path of paths) {
    const [name, yy, mm, dd, cc] = path.split("/");
    const day = `${name}/${yy}/${mm}/${dd}`;
    days.set(day, (days.get(day) ?? new Set()).add(Number(cc)));
  }
  for (const [day, sequence] of days) assert.deepEqual([...sequence].sort((a, b) => a - b), [...sequence].map((_, i) => i + 1), `${day}: 01.. with no gap`);
  assert.ok(days.has("genesis/26/10/04") && changes["genesis/26/10/04/01/retro.md"], "the self-install change is genesis 26/10/04 01");
  for (const [path, text] of Object.entries(changes).filter(([p]) => /\/retro(-work|-observe|-review|-owner)?\.md$/.test(p))) {
    const headings = text.split("\n").filter((l) => l.startsWith("#"));
    assert.deepEqual(headings, ["# Retro", "## Learned", "## Liked", "## Lacked", "## Longed"], `${path}: the 4L form and nothing else`);
    for (const section of text.split(/^## /m).slice(1)) assert.ok(section.split("\n").slice(1).join("").trim().length > 0, `${path}: ${section.split("\n")[0]} says something`);
  }
});

// Delivery names are configuration, not identity: the capability directories were renamed to the Core
// capability-prefix, and the semantic Nodes are the very bytes they were born as, still sealed.
test("this repository's delivery names changed and no Node identity did", () => {
  const born: Record<string, [string, string][]> = {
    "kaal-changing": [
      ["Changing-KAAL.md", "7b2470732033e9ca6e916cf1ff7d73629bd203737aaf1894a9d621b517e896c2"],
      ["RATIFICATION.md", "ff114bfe71e7780df04c290e142c002fe985046d2635b46c78ff3d1e464b9a77"],
      ["ROWING.md", "c553c94e84718f8cb660f38c7da22154a309c1925d8428d094d97c6c9196fdd1"],
    ],
    "kaal-engineering": [["Engineering-Skill.md", "fa393cb5ac37237c944e62874b8b8cc328d3ef93450a18a79421761d8e2de200"]],
  };
  for (const [capability, files] of Object.entries(born)) {
    for (const [file, id] of files) {
      const path = join(SOURCE, KAAL_DIR, "skills", capability, file);
      assert.equal(sha256(readFileSync(path, "utf8")), id, `${capability}/${file} keeps its bytes`);
      assert.ok(existsSync(join(SOURCE, KAAL_DIR, "seals", id)), `${capability}/${file} keeps its seal`);
    }
  }
  assert.deepEqual(readdirSync(join(SOURCE, KAAL_DIR, "skills")).sort(), CAPABILITIES);
});

// The declaration is read as the scalar it is, and a need that cannot be satisfied stays a need.
const changingIn = (skills: Record<string, string>, extra: Record<string, { kaal: Record<string, string>; skills?: Record<string, string> }> = {}) => ({
  "kaal-changing": { kaal: changing.payload().kaal, skills },
  ...extra,
});
const declaration = (skills: Record<string, string>, to: (line: string) => string) =>
  Object.fromEntries(Object.entries(skills).map(([p, b]) => [p, p === "kaal-changing/SKILL.md" ? b.replace(/^compatibility: (.*)$/m, (_, v) => to(v)) : b]));
const changingSkills = (changing as unknown as { payload(): { skills: Record<string, string> } }).payload().skills;

for (const [label, to] of [
  ["folded scalar", (v: string) => `compatibility: >-\n  ${v}`],
  ["literal scalar", (v: string) => `compatibility: |\n  ${v}`],
  ["quoted scalar", (v: string) => `compatibility: "${v.replace(/"/g, "'")}"`],
  ["scalar over several lines", (v: string) => `compatibility: ${v.slice(0, 20)}\n  ${v.slice(20)}`],
] as [string, (v: string) => string][]) {
  test(`composition cannot be bypassed by the same declaration written as a ${label}`, async (t) => {
    const root = packageRoot(t, changingIn(declaration(changingSkills, to), { "kaal-sealing": { kaal: sealing.payload().kaal, skills: (sealing as unknown as { payload(): { skills: Record<string, string> } }).payload().skills } }));
    const dir = host(t);
    const before = whole(dir);
    const d = await delivery(dir, root, [await nodeId("kaal-changing")]);
    assert.equal(d.unmet.length, 1, d.unmet.join("\n"));
    assert.match(d.unmet[0], /kaal-changing declares that it needs kaal-sealing/);
    assert.throws(() => install(dir, d), /nothing was written/);
    assert.equal(whole(dir), before);
    const both = await delivery(dir, root, [await nodeId("kaal-changing"), await nodeId("kaal-sealing")]);
    assert.deepEqual(both.unmet, []);
  });
}

test("a declared need whose delivery is unavailable stays unmet: refused before any write, and named by the check", async (t) => {
  for (const sibling of [{}, { "kaal-sealing": null }]) {
    const root = packageRoot(t, changingIn(changingSkills));
    // A sibling directory with no built payload is skipped by the package scan, as an absent one is.
    if ("kaal-sealing" in sibling) mkdirSync(join(root, "kaal-sealing"), { recursive: true });
    const dir = host(t);
    const before = whole(dir);
    const d = await delivery(dir, root, [await nodeId("kaal-changing")]);
    assert.equal(d.unmet.length, 1);
    assert.match(d.unmet[0], /needs kaal-sealing beside it, which is not installed, and no package of this delivery carries a Skill or Extension Node for it: there is no exact Node ID to select/);
    assert.throws(() => install(dir, d), /nothing was written/);
    assert.equal(whole(dir), before);
    // Registered by hand into a KAAL that holds Core, the check still names it.
    await installed(dir);
    core.registerSkill(join(dir, KAAL_DIR), "kaal-changing", changing.payload().kaal);
    assert.match((check(dir, await delivery(dir, root))).join("\n"), /needs kaal-sealing beside it/);
  }
});

test("a declaration naming Core's own package, or nothing, needs nothing", async (t) => {
  const dir = host(t);
  assert.deepEqual((await delivery(dir, join(SOURCE, "packages"), [await nodeId("kaal-engineering")])).unmet, []);
  assert.deepEqual((await delivery(dir, join(SOURCE, "packages"), [await nodeId("kaal-retro")])).unmet, []);
});
