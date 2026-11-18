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
  // the declaration is the data: each branch ruleset declares its rules and their settings (a status-check rule lists its checks), each traced to a declared control that has an Intent; the judge holds no shape of its own (release/C70)
  const controls = new Map((facts.controls ?? []).map((c) => [c.id, c]));
  const declaredFor = (name) => (name === "Integrating" ? integrating : name === "Promoting" ? promoting : integrating.parts.find((p) => p.name === name))?.rules;
  const traced = (name, what, control) => { const c = controls.get(control); if (!c) add(name, `${name}: ${what} is traced to ${control ?? "no control"}, which is not a declared control`); else if (!(c.has ?? []).length) add(name, `${name}: ${what} is traced to ${control}, which has no Intent`); };
  const sorted = (o) => JSON.stringify(Object.fromEntries(Object.entries(o ?? {}).sort(([a], [b]) => (a < b ? -1 : 1))));
  for (const [name, include] of branch) {
    const r = rulesets[name];
    if (!r) { add(name, `${name}: no ruleset source`); continue; }
    if (r.name !== name.toLowerCase()) add(name, `${name}: the ruleset is named ${r.name}`);
    if (r.target !== "branch") add(name, `${name}: the target is ${r.target}, not branch`);
    if (!same(r.conditions?.ref_name?.include, include)) add(name, `${name}: the refs are ${JSON.stringify(r.conditions?.ref_name?.include)}, not ${JSON.stringify(include)}`);
    if (!same(r.bypass_actors, [])) add(name, `${name}: the bypass list is not empty`);
    const stage = name === "Integrating" ? integrating : name === "Promoting" ? promoting : integrating.parts.find((q) => q.name === name);
    const sg = stage?.standing;
    if (!sg || typeof sg !== "object") add(name, `${name}: the stage declares no standing`);
    else {
      if (r.enforcement !== sg.enforcement) add(name, `${name}: the enforcement is ${JSON.stringify(r.enforcement)}, the declaration says ${JSON.stringify(sg.enforcement)}`);
      if (!same(r.bypass_actors, sg.bypass ?? [])) add(name, `${name}: the bypass list is not the declared one`);
      traced(name, "the standing", sg.control);
    }
    const declared = declaredFor(name);
    if (!Array.isArray(declared) || declared.some((d) => !d || typeof d.type !== "string")) { add(name, `${name}: the stage does not declare its rules as a list`); continue; }
    const have = (r.rules ?? []).map((x) => x.type).sort();
    const want = declared.map((d) => d.type).sort();
    if (!same(have, want)) { add(name, `${name}: the rules are ${have.join(", ") || "none"}, the declaration says ${want.join(", ") || "none"}`); continue; }
    for (const d of declared) {
      traced(name, `the ${d.type} rule`, d.control);
      const { required_status_checks: sourceChecks, ...settings } = r.rules.find((x) => x.type === d.type)?.parameters ?? {};
      for (const k of new Set([...Object.keys(settings), ...Object.keys(d.parameters ?? {})])) if (JSON.stringify(settings[k]) !== JSON.stringify((d.parameters ?? {})[k])) add(name, `${name}: the setting ${k} of ${d.type} is ${JSON.stringify(settings[k])}, the declaration says ${JSON.stringify((d.parameters ?? {})[k])}`);
      if (d.type !== "required_status_checks") continue;
      const checks = Array.isArray(d.checks) ? d.checks : [];
      const key = (c) => `${c.context ?? c.name}#${c.integration_id}`;
      if (!same((sourceChecks ?? []).map(key).sort(), checks.map(key).sort())) add(name, `${name}: the required checks must be ${checks.map((c) => c.name).join(" and ")}`);
      for (const c of checks) traced(name, `the check ${c.name}`, c.control);
    }
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
    const sg = publishing.standing;
    if (!sg || typeof sg !== "object") pub("the stage declares no standing");
    else {
      if (p.enforcement !== sg.enforcement) pub(`the enforcement is ${JSON.stringify(p.enforcement)}, the declaration says ${JSON.stringify(sg.enforcement)}`);
      const c = controls.get(sg.control); if (!c) pub(`the standing is traced to ${sg.control ?? "no control"}, which is not a declared control`); else if (!(c.has ?? []).length) pub(`the standing is traced to ${sg.control}, which has no Intent`);
    }
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

// the controls declared in a checkout: the frontmatter id and has of each 04-controls/CTL<n>-<slug>/CTL<n>.md
function readControls(root) {
  const dir = join(root, "engineering/release-management/04-controls");
  try {
    return readdirSync(dir).flatMap((d) => {
      try {
        const head = readFileSync(join(dir, d, `${d.split("-")[0]}.md`), "utf8").split("---")[1] ?? "";
        const id = head.match(/^id:\s*(\S+)\s*$/m)?.[1];
        const has = (head.match(/^has:\s*\[(.*)\]\s*$/m)?.[1] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
        return id ? [{ id, has }] : [];
      } catch { return []; }
    });
  } catch { return []; }
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
    return { stages, rulesets, hooks: readHooks(root, stages), controls: readControls(root) };
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
