// Engineering / verify Stages, level 1: do the delivery stages exist in Engineering? (release/C35, release/C37)
// judge({ stages, rulesets, hooks }) -> { kind: "pass" | "fail", findings: [{ check, message }], checks: [job names that fail] }.
// stages is stages.json; rulesets maps a ruleset name (Integrating, Collecting, Hotfixing, Wiring, Promoting, Publishing)
// to its source; hooks holds the facts of the .githooks tree: { files: { <path>: { sha256, mode } }, sources: { <path>: sha256 } }.
// Developing is judged by its own job, verify Stages (Developing), and by no other: the declared .githooks tree is exact.
// stages.json says what Integrating requires (`requires`; Integration challenges Developing once it lists Developing, release/C37). Publishing is reported by the
// Promoting job (a tag ruleset cannot require a check). Anything unreadable fails closed.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const job = (name) => `verify Stages (${name})`;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const heads = (targets) => targets.map((t) => `refs/heads/${t}`);

export function judge(facts) {
  const findings = [];
  const add = (check, message) => findings.push({ check: job(check), message });
  const { stages, rulesets } = facts ?? {};
  if (!stages?.stages || !rulesets) {
    return { kind: "fail", findings: [{ check: "*", message: "the stages or the ruleset sources cannot be read" }], checks: ["*"] };
  }
  const by = (n) => stages.stages.find((s) => s.name === n);
  const integrating = by("Integrating"), promoting = by("Promoting"), publishing = by("Publishing"), developing = by("Developing");
  if (!integrating?.parts || !promoting || !publishing || !developing) {
    return { kind: "fail", findings: [{ check: "*", message: "stages.json does not hold Developing, Integrating, Promoting and Publishing" }], checks: ["*"] };
  }
  const branch = [
    ["Integrating", heads(integrating.targets)],
    ...integrating.parts.map((p) => [p.name, heads([p.target])]),
    ["Promoting", [promoting.target]],
  ];
  for (const [name, include] of branch) {
    const r = rulesets[name];
    if (!r) { add(name, `${name}: no ruleset source`); continue; }
    if (r.name !== name.toLowerCase()) add(name, `${name}: the ruleset is named ${r.name}`);
    if (r.target !== "branch") add(name, `${name}: the target is ${r.target}, not branch`);
    if (!same(r.conditions?.ref_name?.include, include)) add(name, `${name}: the refs are ${JSON.stringify(r.conditions?.ref_name?.include)}, not ${JSON.stringify(include)}`);
    if (!same(r.bypass_actors, [])) add(name, `${name}: the bypass list is not empty`);
    const rules = r.rules ?? [];
    const checks = rules[0]?.parameters;
    const expected = [...(name === "Integrating" ? integrating.requires ?? [name] : [name]).map(job), ...(by(name)?.also ?? [])]; // what stages.json declares: Integrating requires, and `also` of a stage adds checks by their full name (release/C59)
    if (!same(rules.map((x) => x.type), ["required_status_checks"])) add(name, `${name}: the only rule must be required_status_checks`);
    else if (!same((checks.required_status_checks ?? []).map((c) => c.context), expected)) add(name, `${name}: the required checks must be ${expected.join(" and ")}`);
    else if (checks.strict_required_status_checks_policy !== false) add(name, `${name}: "up to date" must not be required`);
  }
  judgeDeveloping(developing, facts.hooks, (m) => add("Developing", `Developing: ${m}`));
  const p = rulesets.Publishing;
  const pub = (m) => add("Promoting", `Publishing: ${m}`);
  if (!p) pub("no ruleset source");
  else {
    if (p.name !== "publishing") pub(`the ruleset is named ${p.name}`);
    if (p.target !== "tag") pub(`the target is ${p.target}, not tag`);
    if (!same(p.conditions?.ref_name?.include, [`refs/tags/${publishing.target}`])) pub("the tag pattern is not the agreed one");
    if (!same(p.bypass_actors, [])) pub("the bypass list is not empty");
    if (!same((p.rules ?? []).map((x) => x.type), [publishing.rule])) pub(`the only rule must be ${publishing.rule}`);
  }
  return { kind: findings.length ? "fail" : "pass", findings, checks: [...new Set(findings.map((f) => f.check))] };
}

// the .githooks tree against what stages.json declares: exactly these files, each with its sha256 (its own or its source's) and mode
function judgeDeveloping(developing, hooks, fail) {
  if (!hooks?.files || !hooks.sources) return fail("the .githooks facts cannot be read");
  const declared = developing.files ?? [];
  if (!declared.length || developing.exact !== true) return fail("stages.json does not declare the exact .githooks tree");
  for (const d of declared) {
    const f = hooks.files[d.path];
    if (!f) { fail(`${d.path} is missing`); continue; }
    const want = d.sha256 ?? (d.source ? hooks.sources[d.source] : undefined);
    if (d.sha256 || d.source) {
      if (!want) fail(`${d.path}: its source ${d.source} cannot be read`);
      else if (f.sha256 !== want) fail(`${d.path} is not the declared ${d.sha256 ? "legacy hook" : "copy of " + d.source}`);
    }
    if (hooks.platform !== "win32" && f.mode !== d.mode) fail(`${d.path} has mode ${f.mode}, not ${d.mode}`);
  }
  const names = new Set(declared.map((d) => d.path));
  for (const path of Object.keys(hooks.files)) if (!names.has(path)) fail(`${path} is not declared`);
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

// the facts of a checkout's .githooks tree: every file, and the sources the declaration names; null when it cannot be read
export function readHooks(root, stages) {
  try {
    const dev = stages.stages.find((s) => s.name === "Developing");
    const base = join(root, ".githooks");
    const files = {};
    for (const f of walk(base)) files[relative(base, f).split("\\").join("/")] = { sha256: sha(f), mode: (statSync(f).mode & 0o777).toString(8) };
    const sources = {};
    for (const d of dev?.files ?? []) {
      try { if (d.source) sources[d.source] = sha(join(root, "engineering/release-management/05-src", d.source)); } catch (e) { if (e.code !== "ENOENT") throw e; }
    }
    return { files, sources, platform: process.platform };
  } catch (e) { return e.code === "ENOENT" ? { files: {}, sources: {}, platform: process.platform } : null; }
}

// reads the sources of a checkout: node judge.mjs <root> <Ruleset>; exit 0 pass, 1 this job fails, 2 cannot judge
export function read(root) {
  const dir = join(root, "engineering/release-management/05-src");
  try {
    const stages = JSON.parse(readFileSync(join(dir, "stages/stages.json"), "utf8"));
    const rulesets = {};
    for (const n of ["Integrating", "Collecting", "Hotfixing", "Wiring", "Promoting", "Publishing"]) {
      try { rulesets[n] = JSON.parse(readFileSync(join(dir, `wiring/rulesets/${n.toLowerCase()}.json`), "utf8")); } catch (e) { if (e.code !== "ENOENT") return null; }
    }
    return { stages, rulesets, hooks: readHooks(root, stages) };
  } catch { return null; }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [root, ruleset] = process.argv.slice(2);
  const facts = root && ruleset ? read(root) : null;
  if (!facts) { console.error("cannot judge: the sources cannot be read"); process.exit(2); }
  const out = judge(facts);
  const mine = out.findings.filter((f) => f.check === job(ruleset) || f.check === "*");
  for (const f of mine) console.error(`${f.check}: ${f.message}`);
  process.exit(mine.length ? (mine.some((f) => f.check === "*") ? 2 : 1) : 0);
}
