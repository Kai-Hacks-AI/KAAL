// Composition, proven end to end on the packages this repository actually
// ships: an explicit selection of Node IDs, taken from a local directory and
// from npm tarballs, is staged whole and installed into an explicitly supplied
// Engine, held capabilities are read back through Core, the External Subject is
// never touched, and every refusal the installer makes is made here, with
// nothing written.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { installedExtensions, installedSkills, payload } from "kaal-core";
import { fromDirectory, fromNpm, heldBy, install, Refusal, stage } from "kaal-compose";
import * as changing from "kaal-changing";
import * as sealing from "kaal-sealing";
import { read } from "../helpers/files.js";

const REPO = fileURLToPath(new URL("../../../../", import.meta.url));
const PACKAGES = join(REPO, "packages");
const CLI = join(PACKAGES, "kaal-compose", "dist", "cli.js");
// The installer's own refusal is the standard the composition is held to; its built helpers are reached by path.
type Installer = { delivery(target: string, root: string, select: string[]): Promise<{ unmet: string[] }> };
const installer: Installer = await import(new URL("../../../kaal-install/dist/helpers/delivery.js", import.meta.url).href);

type After = { after: (fn: () => void) => void };
const tmp = (t: After): string => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-compose-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
};
const whole = (...dirs: string[]) => JSON.stringify(dirs.map((d) => (existsSync(d) ? read(d) : null)));
const offers = fromDirectory(PACKAGES);
const idOf = (delivery: string): string => {
  const ids = stage(offers).find((s) => s.delivery === delivery)!.nodes.map((n) => n.id);
  assert.equal(ids.length, 1, delivery);
  return ids[0];
};
const [CHANGING, SEALING, GITHUB] = ["kaal-changing", "kaal-sealing", "kaal-github"].map(idOf);
const refused = (fn: () => unknown, pattern: RegExp) =>
  assert.throws(fn, (e: Error) => e instanceof Refusal && pattern.test(e.message), `a refusal matching ${pattern}`);

test("an Engine is made from Core's payload alone, where none exists, and holds nothing", (t) => {
  const engine = join(tmp(t), "engine");
  const done = install({ engine, offers, select: [] });
  assert.deepEqual(done.installed, []);
  assert.deepEqual(read(engine), payload());
  assert.deepEqual(heldBy(engine), []);
});

test("a Skill with its dependency and an Extension are installed by exact ID and held through Core", (t) => {
  const dir = tmp(t);
  const [engine, skills] = [join(dir, "engine"), join(dir, "skills")];
  install({ engine, skills, offers, select: [CHANGING, SEALING, GITHUB] });
  assert.deepEqual(
    heldBy(engine).map(({ kind, id }) => [kind, id]).sort(),
    [["Extension", GITHUB], ["Skill", CHANGING], ["Skill", SEALING]].sort(),
  );
  assert.deepEqual(installedExtensions(engine).map((r) => r.id), [GITHUB]);
  assert.deepEqual(installedSkills(engine).map((r) => r.id).sort(), [CHANGING, SEALING].sort());
  assert.deepEqual(readdirSync(skills).sort(), ["kaal-changing", "kaal-sealing"], "Agent Skills only for the Skills; the Extension has none");
  assert.ok(existsSync(join(engine, "extensions", "kaal-github")));
  // Installing again, or installing a held Node, changes nothing.
  const before = whole(engine, skills);
  assert.deepEqual(install({ engine, skills, offers, select: [CHANGING, SEALING, GITHUB] }).wrote, []);
  assert.equal(whole(engine, skills), before);
});

test("a Skill that declares a need is refused alone, naming the exact ID of the offered package, and nothing is written", (t) => {
  const dir = tmp(t);
  const [engine, skills] = [join(dir, "engine"), join(dir, "skills")];
  install({ engine, skills, offers, select: [GITHUB] });
  const before = whole(engine, skills);
  refused(() => install({ engine, skills, offers, select: [CHANGING] }), /kaal-changing declares that it needs kaal-sealing beside it, which is not installed: select its Node by exact ID/);
  try {
    install({ engine, skills, offers, select: [CHANGING] });
  } catch (e) {
    assert.ok((e as Error).message.includes(SEALING), "the exact ID that would select it");
  }
  assert.equal(whole(engine, skills), before);
  // The need is met by what the Engine already holds, with no re-selection.
  install({ engine, skills, offers, select: [SEALING] });
  install({ engine, skills, offers, select: [CHANGING] });
  assert.ok(heldBy(engine).some((h) => h.id === CHANGING));
});

test("a need no offered package can meet is refused saying there is no exact ID to select", (t) => {
  const dir = tmp(t);
  const only = fromDirectory(join(PACKAGES, "kaal-changing"));
  refused(() => install({ engine: join(dir, "e"), skills: join(dir, "s"), offers: only, select: [CHANGING] }), /no package offered carries a Skill or Extension Node for it: there is no exact Node ID to select/);
  assert.ok(!existsSync(join(dir, "e")) && !existsSync(join(dir, "s")), "not even the Engine was created");
});

test("selection is by exact ID and refused whole: a name, an unknown ID, a changed Node, and one bad ID among good ones write nothing", (t) => {
  const dir = tmp(t);
  const [engine, skills] = [join(dir, "engine"), join(dir, "skills")];
  install({ engine, skills, offers, select: [] });
  const before = whole(engine, skills);
  refused(() => install({ engine, skills, offers, select: ["kaal-sealing"] }), /no offered package carries a Node with the exact ID kaal-sealing/);
  refused(() => install({ engine, skills, offers, select: ["0".repeat(64)] }), /exact ID 0{64}/);
  refused(() => install({ engine, skills, offers, select: [CHANGING, SEALING, "0".repeat(64)] }), /exact ID 0{64}/);
  // A package whose Node bytes were changed is another Node, and its seal does not follow: it is not offered under the old ID.
  const copy = join(dir, "tampered");
  cpSync(join(PACKAGES, "kaal-sealing"), join(copy, "kaal-sealing"), { recursive: true, filter: (s) => !s.includes("node_modules") });
  const node = readdirSync(join(copy, "kaal-sealing", "kaal")).find((f) => f.endsWith(".md"))!;
  writeFileSync(join(copy, "kaal-sealing", "kaal", node), read(join(PACKAGES, "kaal-sealing", "kaal"))[node] + "\ntampered\n");
  refused(() => install({ engine, skills, offers: fromDirectory(copy), select: [SEALING] }), /no offered package carries a Node with the exact ID/);
  // The same Node, unsealed, is carried but not taken by Core.
  const unsealed = join(dir, "unsealed");
  cpSync(join(PACKAGES, "kaal-sealing"), join(unsealed, "kaal-sealing"), { recursive: true, filter: (s) => !s.includes("node_modules") });
  rmSync(join(unsealed, "kaal-sealing", "kaal", "seals", SEALING), { force: true });
  refused(() => install({ engine, skills, offers: fromDirectory(unsealed), select: [SEALING] }), /Core does not take it as a Skill or Extension/);
  assert.equal(whole(engine, skills), before);
});

test("an Engine whose Core is not the Core this tool carries is refused, and so is an Agent Skill that would be replaced", (t) => {
  const dir = tmp(t);
  const [engine, skills] = [join(dir, "engine"), join(dir, "skills")];
  install({ engine, skills, offers, select: [] });
  const core = readdirSync(join(engine, "core")).find((f) => f.endsWith(".md"))!;
  writeFileSync(join(engine, "core", core), "other bytes");
  const before = whole(engine, skills);
  refused(() => install({ engine, skills, offers, select: [GITHUB] }), /engine: core\/.* differs from the Core this tool carries/);
  assert.equal(whole(engine, skills), before);
  // An Agent Skill is not replaced, and the Engine is not written either.
  const other = join(dir, "other");
  install({ engine: other, offers, select: [] });
  mkdirSync(join(skills, "kaal-sealing"), { recursive: true });
  writeFileSync(join(skills, "kaal-sealing", "SKILL.md"), "mine");
  const [b2, b3] = [whole(other), whole(skills)];
  refused(() => install({ engine: other, skills, offers, select: [SEALING] }), /an Agent Skill is not replaced/);
  assert.equal(whole(other), b2);
  assert.equal(whole(skills), b3);
  refused(() => install({ engine: other, offers, select: [SEALING] }), /name the host's skills directory/);
  assert.equal(whole(other), b2);
});

// Every refusal the installer makes about a declaration, made the same way here.
const front = (skill: string) => {
  const end = skill.indexOf("\n---", 4);
  return { head: skill.slice(0, 4), body: skill.slice(4, end), tail: skill.slice(end) };
};
const declare = (to: (v: string) => string) => (s: string) => s.replace(/^compatibility: (.*)$/m, (_, v) => to(v));
const variants: [string, (skill: string) => string][] = [
  ["a folded scalar", declare((v) => `compatibility: >-\n  ${v}`)],
  ["a literal scalar", declare((v) => `compatibility: |\n  ${v}`)],
  ["a quoted scalar", declare((v) => `compatibility: "${v.replace(/"/g, "'")}"`)],
  ["a scalar over several lines", declare((v) => `compatibility: ${v.slice(0, 20)}\n  ${v.slice(20)}`)],
  ["an escape", declare((v) => `compatibility: "${v.replace("kaal-sealing", "kaal\\u002dsealing")}"`)],
  ["an anchor", declare((v) => `compatibility: &needs ${v}`)],
  ["a tag", declare((v) => `compatibility: !!str ${v}`)],
  ["a flow collection", declare((v) => `compatibility: [${v}]`)],
  ["a comment-only key line then the value", declare((v) => `compatibility: # note\n  ${v}`)],
  ["an empty key line then an escape", declare((v) => `compatibility:\n  "${v.replace("kaal-sealing", "kaal\\u002dsealing")}"`)],
  ["a comment that names it", declare(() => "compatibility: Needs Node.js 20 or later. # kaal-sealing")],
  ["a doubled quote", declare((v) => `compatibility: 'It''s needed: ${v}'`)],
  ["a trailing comment", declare((v) => `compatibility: ${v} # a comment`)],
  ["a block with a hash", declare((v) => `compatibility: |\n  Needs Node.js. # ${v}`)],
  ["a quoted key", (s) => s.replace(/^compatibility:/m, '"compatibility":')],
  ["every mapping line indented", (s) => { const f = front(s); return f.head + f.body.split("\n").map((l) => `  ${l}`).join("\n") + f.tail; }],
  ["a repeated key", (s) => s.replace(/^compatibility: (.*)$/m, "compatibility: $1\ncompatibility: $1")],
  ["a flow mapping", (s) => { const f = front(s); return `---\n{ ${f.body.split("\n").join(", ")} }${f.tail}`; }],
  ["a tab-indented continuation", (s) => s.replace(/^compatibility: (.*)$/m, "compatibility:\n\t$1")],
  ["no closing delimiter", (s) => s.replace("\n---", "\n--")],
  ["no frontmatter", (s) => s.replace(/^---\n[\s\S]*?\n---\n/, "")],
];

test("parity: the same declaration is refused or accepted here exactly as the installer does, with nothing written", async (t) => {
  const dir = tmp(t);
  const outcomes = new Set<boolean>();
  for (const [label, rewrite] of variants) {
    const root = join(dir, label.replace(/\W+/g, "-"));
    for (const [name, pkg] of [["kaal-changing", changing], ["kaal-sealing", sealing]] as const) {
      const p = pkg.payload() as { kaal: Record<string, string>; skills: Record<string, string> };
      for (const [path, bytes] of Object.entries(p.kaal)) (mkdirSync(dirname(join(root, name, "kaal", path)), { recursive: true }), writeFileSync(join(root, name, "kaal", path), bytes));
      const skillsOf = Object.fromEntries(Object.entries(p.skills).map(([path, bytes]) => [path, path === "kaal-changing/SKILL.md" ? rewrite(bytes) : bytes]));
      for (const [path, bytes] of Object.entries(skillsOf)) (mkdirSync(dirname(join(root, name, "skills", path)), { recursive: true }), writeFileSync(join(root, name, "skills", path), bytes));
      // The installer reads a package through its built payload(); the same bytes, as data.
      mkdirSync(join(root, name, "dist"), { recursive: true });
      writeFileSync(join(root, name, "package.json"), '{ "type": "module" }');
      writeFileSync(join(root, name, "dist", "payload.json"), JSON.stringify({ kaal: p.kaal, skills: skillsOf }));
      writeFileSync(join(root, name, "dist", "index.js"), 'import { readFileSync } from "node:fs";\nconst data = JSON.parse(readFileSync(new URL("./payload.json", import.meta.url), "utf8"));\nexport const payload = () => data;\n');
    }
    const [engine, skills] = [join(dir, `${label}-engine`), join(dir, `${label}-skills`)];
    const host = join(dir, `${label}-host`);
    mkdirSync(host);
    const expected = (await installer.delivery(host, root, [CHANGING])).unmet.length > 0;
    const before = whole(engine, skills);
    let got = false;
    try {
      install({ engine, skills, offers: fromDirectory(root), select: [CHANGING] });
    } catch (e) {
      assert.ok(e instanceof Refusal, `${label}: ${(e as Error).message}`);
      got = true;
    }
    outcomes.add(got);
    assert.equal(got, expected, `${label}: refused here ${got}, by the installer ${expected}`);
    if (got) assert.equal(whole(engine, skills), before, `${label}: nothing written`);
    // With the sibling selected too, the unreadable declarations are still refused alike.
    const both = (await installer.delivery(host, root, [CHANGING, SEALING])).unmet.length > 0;
    let gotBoth = false;
    try {
      install({ engine: `${engine}-both`, skills: `${skills}-both`, offers: fromDirectory(root), select: [CHANGING, SEALING] });
    } catch (e) {
      assert.ok(e instanceof Refusal);
      gotBoth = true;
    }
    assert.equal(gotBoth, both, `${label} with both`);
  }
  assert.deepEqual([...outcomes].sort(), [false, true], "the variants include declarations that are refused and ones that are read as needing nothing");
});

test("npm is one source: packed tarballs install the same, offline, and package names or versions are never identity", (t) => {
  const dir = tmp(t);
  const tarballs = ["kaal-changing", "kaal-sealing", "kaal-github"].map((name) => {
    const r = spawnSync("npm", ["pack", "--ignore-scripts", "--pack-destination", dir, join(PACKAGES, name)], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    return join(dir, r.stdout.trim().split("\n").pop()!);
  });
  const previous = process.env.npm_config_offline;
  process.env.npm_config_offline = "true";
  t.after(() => (previous === undefined ? delete process.env.npm_config_offline : (process.env.npm_config_offline = previous)));
  const npm = fromNpm(tarballs);
  t.after(npm.dispose);
  assert.deepEqual(npm.offers.map((o) => o.delivery).sort(), ["kaal-changing", "kaal-github", "kaal-sealing"]);
  const [local, viaNpm] = [join(dir, "local"), join(dir, "npm")];
  install({ engine: local, skills: join(dir, "ls"), offers, select: [CHANGING, SEALING, GITHUB] });
  install({ engine: viaNpm, skills: join(dir, "ns"), offers: npm.offers, select: [CHANGING, SEALING, GITHUB] });
  assert.equal(whole(viaNpm, join(dir, "ns")), whole(local, join(dir, "ls")), "the same bytes, whichever source");
  // A package that npm cannot obtain is an error, not a partial install.
  assert.throws(() => fromNpm([join(dir, "no-such.tgz")]), /npm could not obtain/);
});

test("the External Subject is byte-identical: installing writes only the Engine and the skills directory it is given", (t) => {
  const dir = tmp(t);
  const subject = join(dir, "subject");
  mkdirSync(join(subject, "src"), { recursive: true });
  writeFileSync(join(subject, "src", "a.txt"), "the Subject");
  writeFileSync(join(subject, "AGENTS.md"), "not wired by this");
  const before = whole(subject);
  install({ engine: join(dir, "engine"), skills: join(dir, "skills"), offers, select: [CHANGING, SEALING, GITHUB] });
  assert.equal(whole(subject), before);
  assert.deepEqual(readdirSync(dir).sort(), ["engine", "skills", "subject"]);
});

test("the command: held, offers and install, with exit 0 done, 1 refused with nothing written, 2 usage", (t) => {
  const dir = tmp(t);
  const [engine, skills] = [join(dir, "engine"), join(dir, "skills")];
  const cli = (...args: string[]) => spawnSync("node", [CLI, ...args], { encoding: "utf8" });
  const listed = cli("offers", "--source", PACKAGES);
  assert.equal(listed.status, 0, listed.stderr);
  assert.ok(listed.stdout.includes(`Extension\tGitHub\t${GITHUB}\tkaal-github`));
  const alone = cli("install", "--source", PACKAGES, "--kaal", engine, "--skills", skills, "--select", CHANGING);
  assert.equal(alone.status, 1);
  assert.match(alone.stderr, /^refused: kaal-changing declares that it needs kaal-sealing/);
  assert.ok(!existsSync(engine) && !existsSync(skills));
  const done = cli("install", "--source", PACKAGES, "--kaal", engine, "--skills", skills, "--select", CHANGING, "--select", SEALING, "--select", GITHUB);
  assert.equal(done.status, 0, done.stderr);
  const held = cli("held", "--kaal", engine).stdout.trim().split("\n").map((l) => l.split("\t")[2]).sort();
  assert.deepEqual(held, [CHANGING, SEALING, GITHUB].sort());
  assert.match(cli("offers", "--source", PACKAGES, "--kaal", engine).stdout, new RegExp(`${GITHUB}\\tkaal-github\\theld`));
  for (const bad of [[], ["frobnicate"], ["held"], ["install", "--kaal", engine, "--select", CHANGING, "--bogus", "x"], ["offers"]]) assert.equal(cli(...bad).status, 2, bad.join(" "));
});
