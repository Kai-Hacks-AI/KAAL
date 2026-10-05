// Core configuration, proven from what is deployed and on hand-written
// fixtures that do not use the checker's own helpers: a fresh realization
// carries `core/config` as self-documenting defaults, the instance owns it, and
// the checker, run as the command, judges the target instance by it, never
// the package. It observes and reports: nothing is renamed or repaired, and a
// delivery name is outside every Node's identity.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { installedSkills, payload, registerSkill } from "kaal-core";
import { readNodes } from "../helpers/nodes.js";
import { sha256 } from "../helpers/seal.js";
import { deploy } from "./setup.js";

const COMMAND = fileURLToPath(new URL("../helpers/check-kaal-config.js", import.meta.url));
const run = (dir: string, ...extra: string[]) => {
  const r = spawnSync("node", [COMMAND, dir, ...extra], { encoding: "utf8" });
  return { code: r.status, out: r.stderr };
};
const tree = (dir: string) => JSON.stringify(readdirSync(dir, { recursive: true }).sort());
const put = (file: string, content: string) => (mkdirSync(dirname(file), { recursive: true }), writeFileSync(file, content));

/** A hand-built KAAL directory: only a config (or none) and delivery directories. */
function instance(t: { after: (fn: () => void) => void }, dirs: string[], config?: string): string {
  const dir = mkdtempSync(join(tmpdir(), "kaal-config-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const d of dirs) mkdirSync(join(dir, "skills", d), { recursive: true });
  if (config !== undefined) put(join(dir, "core", "config"), config);
  return dir;
}

test("a fresh Core realization carries core/config: self-documenting, every setting commented out, and not a Node", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const text = readFileSync(join(dir, "core", "config"), "utf8");
  assert.equal(text, payload()["core/config"]);
  assert.match(text, /^# .*\n/, "it explains itself");
  assert.match(text, /^# capability-prefix = kaal-$/m, "the default is shown, commented out");
  assert.ok(text.split("\n").every((l) => l === "" || l.startsWith("#")), "nothing is set: the defaults apply");
  assert.ok(!readNodes(dir).some((n) => n.path === "core/config"), "not a Node");
  assert.ok(!Object.keys(payload()).some((p) => p.startsWith("seals/") && p.slice(6) === sha256(text)), "not sealed");
  assert.equal(run(dir).code, 0, "a fresh realization conforms");
});

test("the Core default is kaal-: a missing file, and a commented setting, judge alike", (t) => {
  const dirs = ["kaal-sealing", "kaal-whatever", "changing-kaal", "engineering-kaal-skill", "x-kaal"];
  for (const config of [undefined, "", "# capability-prefix = kaal-\n", "# capability-prefix = acme-\n"]) {
    const r = run(instance(t, dirs, config));
    assert.equal(r.code, 1);
    assert.deepEqual(r.out.trim().split("\n").map((l) => l.split(" ")[0]), ["skills/changing-kaal", "skills/engineering-kaal-skill", "skills/x-kaal"], JSON.stringify(config));
    assert.match(r.out, /skills\/changing-kaal is not a conformant delivery name: it must start with the capability-prefix "kaal-" \(Core default\)/);
  }
  assert.equal(run(instance(t, ["kaal-sealing", "kaal-changing", "kaal-whatever"])).code, 0, "structurally conformant is accepted in this first iteration");
});

test("an uncommented value overrides the default for that instance, and only the config decides", (t) => {
  const dirs = ["kaal-sealing", "acme-sealing"];
  const acme = run(instance(t, dirs, "# note\ncapability-prefix = acme-\n"));
  assert.equal(acme.code, 1);
  assert.match(acme.out, /skills\/kaal-sealing is not a conformant delivery name: it must start with the capability-prefix "acme-" \(core\/config\)/);
  assert.doesNotMatch(acme.out, /acme-sealing/);
  assert.equal(run(instance(t, ["acme-sealing"], "capability-prefix = acme-\n")).code, 0);
  assert.equal(run(instance(t, ["acme-sealing"], "capability-prefix = kaal-\n")).code, 1, "the same directory is judged by the instance's value");
});

test("the checker reads the target instance, not the package: changing the instance's config changes the verdict, and nothing is renamed", (t) => {
  const dir = instance(t, ["kaal-sealing"]);
  assert.equal(run(dir).code, 0);
  const before = tree(dir);
  put(join(dir, "core", "config"), "capability-prefix = acme-\n");
  const after = tree(dir);
  assert.equal(run(dir).code, 1, "the instance moved on; the package default did not");
  assert.equal(tree(dir), after, "checking renamed and repaired nothing");
  assert.deepEqual(JSON.parse(after).filter((p: string) => p.startsWith("skills")), JSON.parse(before).filter((p: string) => p.startsWith("skills")), "changing the config renamed nothing");
  assert.equal(run(dir, "extra").code, 2, "usage: at most the KAAL directory");
  assert.equal(run(join(dir, "nowhere")).code, 2, "no such KAAL directory");
});

test("the config is read strictly: unknown, repeated, invalid and malformed lines are named, never ignored", (t) => {
  const cases: [string, RegExp][] = [
    ["capability-suffix = -kaal\n", /core\/config:1: capability-suffix is not a Core setting/],
    ["capability-prefix = a-\ncapability-prefix = b-\n", /core\/config:2: capability-prefix is set more than once/],
    ["capability-prefix = Kaal-\n", /core\/config:1: capability-prefix must be lowercase letters, digits and hyphens, ending in a hyphen, not "Kaal-"/],
    ["capability-prefix = kaal\n", /ending in a hyphen, not "kaal"/],
    ["capability-prefix =\n", /not a comment or a "key = value" line/],
    ["capability-prefix=kaal-\n", /not a comment or a "key = value" line/],
    ["  # indented\n", /core\/config:1: not a comment/],
    ["# fine\nnonsense\n", /core\/config:2: not a comment/],
  ];
  for (const [config, expected] of cases) {
    const r = run(instance(t, ["kaal-sealing"], config));
    assert.equal(r.code, 1, config);
    assert.match(r.out, expected, config);
  }
});

test("a delivery name is outside Node identity: renaming the directory leaves a Skill's bytes, ID and seal unchanged", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const skill = readNodes(dir).find((n) => n.name === "Skill")!;
  const md = `---\nname: Legacy\ntype:\n  name: Skill\n  id: ${skill.id}\n---\n\n# Legacy\n`;
  registerSkill(dir, "legacy-name", { "Legacy.md": md, [`seals/${sha256(md)}`]: "" });
  const registered = installedSkills(dir);
  assert.deepEqual(registered.map((s) => s.id), [sha256(md)]);
  const red = run(dir);
  assert.equal(red.code, 1);
  assert.match(red.out, /skills\/legacy-name is not a conformant delivery name/);
  renameSync(join(dir, "skills", "legacy-name"), join(dir, "skills", "kaal-legacy"));
  assert.equal(readFileSync(join(dir, "skills", "kaal-legacy", "Legacy.md"), "utf8"), md, "same bytes");
  assert.deepEqual(installedSkills(dir), registered, "same ID, still admitted and sealed");
  assert.ok(readdirSync(join(dir, "seals")).includes(sha256(md)), "same seal");
  assert.equal(run(dir).code, 0, "red, an explicit rename, green");
});
