// Loads and validates a capability's Boundary Test definition: Markdown with YAML front matter, parsed here only
// (engineering/boundary/PLAN.md R2, R8). A definition names a provider and typed tests; it names no target, role, code or regular expression.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { frontMatter } from "../parsers/front-matter.mjs";
import { DETECTORS } from "./detectors/index.mjs";
import { listProblems } from "./scope.mjs";

const COMMON = new Set(["id", "detector", "looks-for", "tests"]);
const NAME = /^[A-Za-z_$][\w$]*$/;
const text = (v) => typeof v === "string" && v.trim() !== "";
const list = (v, ok) => Array.isArray(v) && v.length > 0 && v.every(ok);
const CHECK = {
  "string-list": (v) => list(v, text),
  "name-list": (v) => list(v, (n) => typeof n === "string" && NAME.test(n)),
  window: (v) => Number.isInteger(v) && v >= 0 && v <= 10,
};

/** The problems with a parsed definition, empty when it is well formed. */
export function problems(front) {
  const out = [];
  if (front === null || typeof front !== "object" || Array.isArray(front)) return ["the front matter is not a mapping"];
  for (const key of Object.keys(front)) if (key !== "provider" && key !== "tests" && key !== "not-applicable") out.push(`unknown key ${key}`);
  if (!text(front.provider) || /[\s/]/.test(front.provider)) out.push("provider must be a name without spaces or slashes");
  if ("not-applicable" in front) out.push(...listProblems(front["not-applicable"]).map((m) => `not-applicable: ${m}`));
  if (!Array.isArray(front.tests)) return [...out, "tests must be a list"];
  const ids = new Set();
  front.tests.forEach((test, i) => {
    const at = `tests[${i}]`;
    if (test === null || typeof test !== "object" || Array.isArray(test)) return out.push(`${at} is not a mapping`);
    if (!text(test.id) || /[\s]/.test(test.id)) out.push(`${at}: id must be a name without spaces`);
    else if (ids.has(test.id)) out.push(`${at}: duplicate id ${test.id}`);
    else ids.add(test.id);
    for (const field of ["looks-for", "tests"]) if (!text(test[field])) out.push(`${at}: ${field} must be text`);
    if ("ships" in test) out.push(`${at}: ships is computed from the Architecture and never written in a definition`);
    const detector = DETECTORS.get(test.detector);
    if (!detector) return out.push(`${at}: unknown detector ${JSON.stringify(test.detector)}`);
    for (const key of Object.keys(test)) if (!COMMON.has(key) && !(key in detector.params)) out.push(`${at}: unknown parameter ${key}`);
    for (const [key, kind] of Object.entries(detector.params)) {
      if (!(key in test)) out.push(`${at}: missing parameter ${key}`);
      else if (!CHECK[kind](test[key])) out.push(`${at}: parameter ${key} is not a ${kind}`);
    }
  });
  return out;
}

/** Loads a definition file, or throws an Error whose message lists the problems. */
export function loadDefinition(file) {
  const path = resolve(file);
  const source = readFileSync(path, "utf8");
  const parsed = frontMatter(source);
  if (!parsed) throw new Error(`${file}: no YAML front matter`);
  if (parsed.errors.length > 0) throw new Error(`${file}: front matter is not YAML (${parsed.errors[0]})`);
  const front = parsed.value;
  const found = problems(front);
  if (found.length) throw new Error(`${file}: ${found.join("; ")}`);
  return { provider: front.provider, tests: front.tests, notApplicable: front["not-applicable"] ?? [], dir: dirname(path), file: path };
}
