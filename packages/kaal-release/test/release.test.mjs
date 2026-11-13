// The DO of release/C1: Cases release/T1 to release/T13 (plan/release/testing.md).
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { Parser } from "commonmark";
import { foundation } from "kaal-core";
import { checkSkill } from "kaal-engineer-skill";
import { identify } from "kaal-graph";
import { read } from "@kaihacksai/kaal-hosting";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = resolve(PACKAGE, "..", "..");
const SKILL_DIR = join(PACKAGE, "skills", "kaal-release");
const SKILL = readFileSync(join(SKILL_DIR, "SKILL.md"), "utf8");
const NPM = readFileSync(join(SKILL_DIR, "references", "npm.md"), "utf8");
const README = readFileSync(join(PACKAGE, "README.md"), "utf8");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
/** The files this package ships: its Nodes, its Skill and its README. */
const shipped = () => [...walk(join(PACKAGE, "payload")), ...walk(join(PACKAGE, "skills")), join(PACKAGE, "README.md")].map((path) => ({ path, text: readFileSync(path, "utf8") }));

/** The headings of a Markdown text, read by CommonMark: [level, text]. */
function headings(markdown) {
  const out = [];
  const walker = new Parser().parse(markdown).walker();
  for (let e = walker.next(); e; e = walker.next()) {
    if (!e.entering || e.node.type !== "heading") continue;
    let text = "";
    for (let c = e.node.firstChild; c; c = c.next) text += c.literal ?? "";
    out.push([e.node.level, text]);
  }
  return out;
}
/** The text under each level-3 heading of the loop. */
function sections(markdown, marker = "### ") {
  const parts = markdown.split(new RegExp(`^${marker}`, "m")).slice(1);
  return parts.map((p) => ({ title: p.split("\n")[0], body: p.split("\n").slice(1).join("\n").split(/^#{1,2} /m)[0] }));
}

// T5: the KAAL-specific identities are sourced, never typed here.
/** Control names of the Delivery target, when it is present, e.g. `approve Publishing`. */
function deliveryTargetNames(root) {
  const dir = join(root, "engineering", "release-management", "03-architecture");
  if (!existsSync(dir)) return [];
  const names = new Set();
  for (const file of walk(dir).filter((f) => f.endsWith(".md"))) {
    for (const m of readFileSync(file, "utf8").matchAll(/`([a-z]+ [A-Z][a-z]+)`/g)) names.add(m[1]);
  }
  return [...names];
}
/** Names of the repository's workflows and jobs that read as a proper name of two or more capitalized words. */
function workflowNames(root) {
  const dir = join(root, ".github", "workflows");
  if (!existsSync(dir)) return [];
  const names = new Set();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".yml"))) {
    for (const m of readFileSync(join(dir, file), "utf8").matchAll(/^\s*name:\s*(.+)$/gm)) {
      const name = m[1].replace(/\(.*$/, "").replace(/\$\{\{.*?\}\}/g, "").trim();
      if (/^[A-Z][A-Za-z]+( [A-Z][A-Za-z]+)+$/.test(name)) names.add(name);
    }
  }
  return [...names];
}
const kaalIdentities = (root) => [...new Set([...deliveryTargetNames(root), ...workflowNames(root)])];
/** Findings naming each KAAL-specific identity found in a file. The one pointer to the Delivery folder is allowed. */
function foreignIdentities(files, identities) {
  const found = [];
  for (const { path, text } of files) {
    const body = text.replaceAll("`engineering/release-management/`", "");
    for (const id of identities) if (body.includes(id)) found.push(`${path}: ${id}`);
    for (const m of body.matchAll(/\bkaal\/[a-z][\w/-]*/g)) found.push(`${path}: ${m[0]}`);
    for (const m of body.matchAll(/\bgate \((integration|promotion)\)/g)) found.push(`${path}: ${m[0]}`);
    for (const m of body.matchAll(/engineering\/release-management\/[\w./-]*\w/g)) found.push(`${path}: ${m[0]}`);
  }
  return found;
}

// T6: a mnemonic is named only if its Node exists.
const AGREED = ["CARGO", "DISCO", "DRUMS", "GUITAR", "SINGER", "BAND"];
/** Names of the KAAL Definition Nodes in the repository. */
function definitionNodes(root) {
  const names = new Set();
  const dirs = [join(root, "engineering"), ...readdirSync(join(root, "packages")).map((p) => join(root, "packages", p, "payload"))].filter(existsSync);
  for (const dir of dirs) {
    for (const file of walk(dir).filter((f) => f.endsWith(".md"))) {
      const text = readFileSync(file, "utf8");
      const name = /^---\nname: (.+)\ntype:\n  name: KAAL Definition\n/.exec(text);
      if (name) names.add(name[1]);
    }
  }
  return names;
}
/** Findings for mnemonics named in a text that have no Node, or that are defined or used as a control. */
function mnemonicFindings(text, nodes) {
  const found = [];
  for (const word of AGREED) {
    if (!new RegExp(`\\b${word}\\b`).test(text)) continue;
    if (!nodes.has(word)) found.push(`${word} is named but has no Node`);
    if (new RegExp(`\\b${word}\\b\\s*(=|:|stands for|means)`).test(text)) found.push(`${word} is defined in a shipped file`);
    if (new RegExp(`\\b${word}\\b\\s+(gate|control|check)\\b|\\b(gate|control|check)\\s+${word}\\b`, "i").test(text)) found.push(`${word} is used as a gate or control`);
  }
  return found;
}

// T11 and T13: the roles are named, and defined by no one but their owner.
const PROTECTIVE = [/\bverdicts?\b/i, /\brunners?\b/i, /\brulesets?\b/i, /\brequired checks?\b/i, /\bbranch protection\b/i, /\b(pin|pins|pinned|pinning)\b/i, /\bgates?\b/i, /\b(how|by) (to )?(run|running|pinning|pin)\b[^.]*\bcheck/i];
const ROLES = ["implementation", "protecting", "verification", "validation", "execution"];
const roleFindings = (text) => PROTECTIVE.filter((re) => re.test(text)).map((re) => `defines ${re}`);
const COVERAGE = [/coverage (is|are|shall be) measured/i, /measures? (the )?coverage/i, /coverage (threshold|percentage|measure)/i, /acceptance criteri(on|a)\b/i, /release (itself )?(judges|validates)/i];
const coverageFindings = (text) => COVERAGE.filter((re) => re.test(text)).map((re) => `defines ${re}`);

const THE_NINE = ["Assess the context", "Choose the identity of the release", "Establish readiness", "Choose the controls and the authority", "Preserve the identity of the artifact", "Promote or publish", "Verify what arrived", "Announce", "Recover"];

describe("kaal-release", () => {
  it("release/T1 (release/F1): one Skill, one Node typed KAAL Skill, and the Node states meaning and scope only", () => {
    const node = identify(readFileSync(join(PACKAGE, "payload", "Release.md")));
    assert.equal(node.name, "Release");
    assert.deepEqual(node.type, foundation().skill);
    assert.deepEqual(readdirSync(join(PACKAGE, "payload")), ["Release.md"]);
    assert.deepEqual(readdirSync(join(PACKAGE, "skills")), ["kaal-release"]);
    const body = readFileSync(join(PACKAGE, "payload", "Release.md"), "utf8").split("---\n")[2];
    assert.doesNotMatch(body, /`|\/|npm|\.mjs/, "the Node names a path, a command or an implementation");
  });

  it("release/T2 (release/F2): the Skill's headings contain the nine loop steps in order", () => {
    const steps = headings(SKILL).filter(([level]) => level === 3).map(([, text]) => text.replace(/^\d+\.\s*/, ""));
    assert.deepEqual(steps, THE_NINE);
    assert.equal(THE_NINE.length, 9);
  });

  it("release/T3 (release/F3): each step names its decision and options, and the Skill tells the agent to read the repository's record first", () => {
    const loop = sections(SKILL);
    assert.equal(loop.length, 9);
    for (const { title, body } of loop) assert.match(body, /Options:/, `step ${title} lists no options`);
    for (const { title, body } of loop.slice(0, 3)) assert.match(body, /[Dd]ecide/, `step ${title} names no decision`);
    assert.match(SKILL, /Read the record first/);
    assert.match(SKILL, /read the repository's own record of its release decisions/);
    assert.match(SKILL, /ask the Owner/);
    assert.ok(SKILL.indexOf("Read the record first") < SKILL.indexOf("## The loop"), "the record is not read before the loop");
  });

  it("release/T4 (release/F4): the npm example exists; the Skill body names no registry or tool, and the npm file may", () => {
    assert.match(NPM, /trusted publishing/);
    assert.match(NPM, /provenance/);
    assert.match(NPM, /npm pack/);
    assert.match(NPM, /npm view/);
    assert.match(NPM, /npm deprecate/);
    assert.doesNotMatch(SKILL.replace(/\]\([^)]*\)/g, "]"), /\b(npm|npx|pnpm|yarn|pypi|pip|maven|nuget|rubygems|crates\.io|docker|github|gitlab|jenkins)\b/i);
  });

  it("release/T5 (release/F5): shipped files contain none of the KAAL-specific identities sourced from the repository; generic words stay allowed", () => {
    const identities = kaalIdentities(REPO);
    assert.ok(identities.length > 0, "no KAAL-specific identity could be sourced, so T5 would pass vacuously");
    assert.deepEqual(foreignIdentities(shipped(), identities), []);
    // generic words are never forbidden alone
    const generic = [{ path: "positive", text: "A person approves the publication; a gate may block promotion of the candidate." }];
    assert.deepEqual(foreignIdentities(generic, identities), []);
    // the same paragraph with a KAAL identity fails, naming the term and the file
    const named = [{ path: "negative", text: `${generic[0].text} The ${identities[0]} control is required.` }];
    assert.deepEqual(foreignIdentities(named, identities), [`negative: ${identities[0]}`]);
    assert.deepEqual(foreignIdentities([{ path: "n2", text: "Promotion goes through gate (promotion)." }], identities), ["n2: gate (promotion)"]);
    assert.deepEqual(foreignIdentities([{ path: "n3", text: "Merge into kaal/hosting first." }], identities), ["n3: kaal/hosting"]);
    // the one pointer names the folder and nothing from inside it
    assert.deepEqual(foreignIdentities([{ path: "p", text: "Read `engineering/release-management/`." }], identities), []);
    assert.deepEqual(foreignIdentities([{ path: "p2", text: "Read engineering/release-management/03-architecture/architecture.md." }], identities), ["p2: engineering/release-management/03-architecture/architecture.md"]);
  });

  it("release/T6 (release/F6): every mnemonic the shipped files name exists as a Node on main; none is redefined", () => {
    const nodes = definitionNodes(REPO);
    for (const { path, text } of shipped()) assert.deepEqual(mnemonicFindings(text, nodes), [], path);
    // CARGO named while no CARGO Node exists fails; the same sentence passes once the Node exists
    const sentence = "CARGO says change authorization releases guarded outcomes.";
    assert.deepEqual(mnemonicFindings(sentence, new Set(["BASS"])), ["CARGO is named but has no Node"]);
    assert.deepEqual(mnemonicFindings(sentence, new Set(["BASS", "CARGO"])), []);
    // a plain-words statement of the same division passes in both states
    const plain = "Change authorizes, Release drives, Guard protects what must remain true.";
    assert.deepEqual(mnemonicFindings(plain, new Set()), []);
    assert.deepEqual(mnemonicFindings(plain, new Set(["CARGO"])), []);
    // redefining a mnemonic, or using it as a gate or control, fails
    assert.deepEqual(mnemonicFindings("CARGO = Change Authorization.", new Set(["CARGO"])), ["CARGO is defined in a shipped file"]);
    assert.deepEqual(mnemonicFindings("The CARGO gate must pass.", new Set(["CARGO"])), ["CARGO is used as a gate or control"]);
  });

  it("release/T7 (release/N1): kaal-engineer-skill's checker reports no standard or kaal finding", async () => {
    const found = checkSkill("kaal-release", await read(SKILL_DIR));
    assert.deepEqual([found.standard, found.kaal], [[], []]);
  });

  it("release/T8 (release/N2): no KAAL runtime dependency, and every file the Skill names resolves inside the skill directory", () => {
    const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.equal(pkg.dependencies, undefined);
    assert.equal(pkg.peerDependencies, undefined);
    const targets = [...SKILL.matchAll(/\]\(([^)#]+)\)/g)].map((m) => m[1]).filter((t) => !/^[a-z]+:/.test(t));
    assert.ok(targets.length > 0);
    for (const target of targets) {
      const path = resolve(SKILL_DIR, target);
      assert.ok(path.startsWith(SKILL_DIR), `${target} leaves the skill directory`);
      assert.ok(existsSync(path), `${target} does not resolve`);
    }
  });

  it("release/T9 (release/N3): the README states Skill-level guidance with the hosted read-only Scripts, and no verification of anyone's release", () => {
    assert.match(README, /Skill-level guidance with two read-only Scripts, `show-wip\.mjs` and `pull-promotion\.mjs`, hosted inside the Skill/);
    assert.match(README, /recommends only, and verifies and authorizes nothing/);
    assert.match(README, /does not verify anyone's release/);
  });

  it("release/T10 (release/F7): two consumers reach complete, different decisions from one Skill, without a KAAL identity, and npm only where the target is a registry", () => {
    const consumers = { branch: readFileSync(join(PACKAGE, "test", "consumers", "branch-promotion.md"), "utf8"), registry: readFileSync(join(PACKAGE, "test", "consumers", "registry-publication.md"), "utf8") };
    const decisions = Object.fromEntries(Object.entries(consumers).map(([k, v]) => [k, sections(v, "## ")]));
    // (a) a complete decision for every F2 step
    for (const [name, list] of Object.entries(decisions)) {
      assert.deepEqual(list.map((s) => s.title.replace(/^\d+\.\s*/, "")), THE_NINE, name);
      for (const { title, body } of list) assert.ok(body.trim().length > 40, `${name}: step ${title} has no decision`);
    }
    // (b) the decisions differ where the contexts differ
    const differing = decisions.branch.filter((s, i) => s.body.trim() !== decisions.registry[i].body.trim());
    assert.ok(differing.length >= 8, "the two consumers do not reach different decisions");
    for (const i of [1, 3, 4, 5, 6, 8]) assert.notEqual(decisions.branch[i].body.trim(), decisions.registry[i].body.trim(), `step ${i + 1} is the same for both`);
    // (c) no KAAL-specific identity in the Skill or in either decision text
    const files = [...shipped(), ...Object.entries(consumers).map(([path, text]) => ({ path, text }))];
    assert.deepEqual(foreignIdentities(files, kaalIdentities(REPO)), []);
    // (d) the npm-only mechanisms appear only in the registry scenario
    assert.doesNotMatch(consumers.branch, /\b(npm|registry tarball|provenance|OIDC)\b/);
    assert.match(consumers.registry, /npm pack/);
  });

  it("release/T11 (release/F8, release/I9): each delegated role is named as a step, and the Skill defines no protective rule, check, runner, verdict vocabulary or gate", () => {
    const delegated = SKILL.split("## Delegated roles")[1].split("## Designing the process")[0];
    for (const role of ROLES) assert.match(delegated, new RegExp(role, "i"), `the role ${role} is not named`);
    assert.deepEqual(roleFindings(SKILL), []);
    assert.deepEqual(roleFindings(NPM), []);
    // positive fixture: requiring evidence passes; negative fixtures: defining how to run or pin a check fail
    assert.deepEqual(roleFindings("Require evidence that change isolation holds before promotion."), []);
    assert.notDeepEqual(roleFindings("Run the check by pinning it to the default branch."), []);
    assert.notDeepEqual(roleFindings("The verdict is held when the runner is red."), []);
  });

  it("release/T12 (release/F9): the Skill covers one owner per control, one orchestration layer, distinct execution contexts and proof of replacement coverage", () => {
    const design = SKILL.split("## Designing the process")[1];
    assert.match(design, /exactly one authoritative owner/);
    assert.match(design, /one orchestration layer/);
    assert.match(design, /distinct contexts of execution/);
    assert.match(design, /before retiring a control, show that its replacement covers what it covered/);
  });

  it("release/T13 (release/I10, release/F10): readiness and outcome verification require both verification and validation; no coverage measure or acceptance criterion is defined", () => {
    const loop = sections(SKILL);
    const readiness = loop[2].body;
    assert.match(readiness, /verification evidence/);
    assert.match(readiness, /validation of the result/);
    assert.match(loop[6].body, /validates/);
    assert.deepEqual(coverageFindings(SKILL), []);
    // positive and negative fixtures
    assert.deepEqual(coverageFindings("Require verification evidence and a validation of the result."), []);
    assert.notDeepEqual(coverageFindings("Coverage is measured as the share of lines executed."), []);
    assert.notDeepEqual(coverageFindings("Release itself judges the result."), []);
  });
});
