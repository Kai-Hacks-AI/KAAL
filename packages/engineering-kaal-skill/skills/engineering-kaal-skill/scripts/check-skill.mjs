#!/usr/bin/env node
// check-skill <repo-root> <capability>
// Checks a KAAL Skill capability against the conventions that bytes and
// layout can decide: one capability per package, packages/<capability>/ with
// engineering/<capability>/, an Agent Skills-conformant skill in the package,
// and a seal for every KAAL file of the capability. Exits 0 if all hold, 1
// otherwise, and never repairs. Whether the Node is a valid Skill Node of an
// installed KAAL is Core's to decide: use register-skill --check.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const [root, capability, ...extra] = process.argv.slice(2);
if (!root || !capability || extra.length > 0) {
  console.error("usage: check-skill <repo-root> <capability>");
  process.exit(2);
}
const problems = [];
const pkg = join(root, "packages", capability);
const eng = join(root, "engineering", capability);
const skillDir = join(pkg, "skills", capability);
const kaalDir = join(pkg, "kaal");

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(capability) || capability.length > 64) problems.push("the capability is a valid Agent Skills name: 1-64 lowercase letters, digits and single hyphens");
if (!existsSync(pkg)) problems.push(`packages/${capability}/ is missing`);
if (!existsSync(eng)) problems.push(`engineering/${capability}/ is missing`);

const skills = existsSync(join(pkg, "skills")) ? readdirSync(join(pkg, "skills")) : [];
if (skills.length !== 1 || skills[0] !== capability) problems.push(`the package realizes exactly one skill, skills/${capability}/ (found: ${skills.join(", ") || "none"})`);

const manifest = join(skillDir, "SKILL.md");
if (!existsSync(manifest)) problems.push(`skills/${capability}/SKILL.md is missing`);
else checkManifest(readFileSync(manifest, "utf8"));

if (!existsSync(kaalDir)) problems.push("kaal/ is missing: the capability's KAAL contribution");
else checkSeals();

for (const problem of problems) console.error(problem);
process.exit(problems.length === 0 ? 0 : 1);

function checkManifest(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return void problems.push("SKILL.md begins with YAML frontmatter");
  const fields = {};
  let current;
  for (const line of match[1].split("\n")) {
    const top = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (top) fields[(current = top[1])] = top[2];
    else if (!/^\s+\S/.test(line) || !current) problems.push(`SKILL.md frontmatter line is not understood: ${line}`);
  }
  const allowed = ["name", "description", "license", "compatibility", "metadata", "allowed-tools"];
  for (const key of Object.keys(fields)) if (!allowed.includes(key)) problems.push(`SKILL.md frontmatter field ${key} is not in the Agent Skills standard`);
  const { name, description, compatibility } = fields;
  if (name !== capability) problems.push("SKILL.md name is the capability and its directory name");
  if (!description) problems.push("SKILL.md has a description");
  else if (description.length > 1024) problems.push("SKILL.md description is at most 1024 characters");
  if (compatibility !== undefined && (compatibility.length === 0 || compatibility.length > 500)) problems.push("SKILL.md compatibility is 1-500 characters");
  if (text.split("\n").length > 500) problems.push("SKILL.md is under 500 lines: move detail to references/");
}

function checkSeals() {
  const files = [];
  const sealed = [];
  for (const path of readdirSync(kaalDir, { recursive: true, encoding: "utf8" })) {
    if (!statSync(join(kaalDir, path)).isFile()) continue;
    const normal = path.split("\\").join("/");
    if (normal.startsWith("seals/")) sealed.push(normal.slice("seals/".length));
    else files.push(normal);
  }
  if (files.length === 0) problems.push("kaal/ carries at least one Node");
  const ids = files.map((f) => createHash("sha256").update(readFileSync(join(kaalDir, f))).digest("hex"));
  files.forEach((f, i) => { if (!sealed.includes(ids[i])) problems.push(`kaal/${f} is not sealed: its ID ${ids[i]} has no marker`); });
  for (const id of sealed) if (!ids.includes(id)) problems.push(`kaal/seals/${id} seals no file of kaal/`);
}
