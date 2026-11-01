// Deterministic frontmatter (core/C5, core/C6): the generic schema format and validator
// for KAAL's collaborative Markdown artifacts. Each Capability owns its Types and their
// schemas and supplies them as a mapping; Core decides only whether an artifact's
// frontmatter conforms. Reading the YAML is Graph's (its form.mjs, delivered inside kaal-core). Pure: no host access.
import { FormError, isId, isName, readFrontmatter } from "#node/form";

/** The value kinds a key may have (core/F1). There is no free-text kind. */
export type ValueKind = "id" | "name" | "enum" | "ref" | "path" | "boolean" | "number" | "parameter" | "record" | "map" | "either";

/** One key of a schema: its value kind, and whether it is a list or required. */
export interface KeySchema {
  readonly value: ValueKind;
  readonly list?: boolean;
  readonly required?: boolean;
  /** For `enum`: the values allowed. */
  readonly values?: readonly string[];
  /** For `parameter`: the pattern a value matches. */
  readonly pattern?: string;
  readonly fields?: { readonly [f: string]: KeySchema };
  readonly key?: KeySchema;
  readonly of?: KeySchema | readonly KeySchema[];
}

/** A Type's schema: every key the Type allows. `type`, the discriminator, is never declared. */
export interface Schema {
  readonly keys: { readonly [key: string]: KeySchema };
}

/** The Types a caller supplies: Type name, `<Capability>/<Type>`, to its schema. */
export interface Types {
  readonly [type: string]: Schema;
}

/** What is wrong, and where: `key` is null when the whole frontmatter or schema is at fault. */
export interface Finding {
  readonly key: string | null;
  readonly rule: string;
  readonly at?: string;
}

export interface Result {
  readonly verdict: "valid" | "invalid" | "unknown";
  readonly findings: readonly Finding[];
}

/** Keys that carry prose, forbidden in artifacts and schemas alike (core/F3). */
const PROSE = new Set(["description", "summary", "rationale", "instructions", "prompt", "notes", "comment", "explanation"]);
const KINDS = new Set<string>(["id", "name", "enum", "ref", "path", "boolean", "number", "parameter", "record", "map", "either"]);
const KEY_FIELDS = new Set(["value", "list", "required", "values", "pattern", "fields", "key", "of"]);
const ptr = (s: string) => "/" + s.replace(/~/g, "~0").replace(/\//g, "~1");
/** A Type name: `<Capability>/<Type>` in the owning Capability's Business Language (core/F6). */
const TYPE_NAME = /^[A-Z][A-Za-z0-9]*\/[A-Z][A-Za-z0-9]*$/;
/** A qualified identifier: `<capability>/<letters><number>`, with an optional lowercase suffix. */
const QUALIFIED_ID = /^[a-z][a-z0-9-]*\/[A-Z]+[0-9]+[a-z]?$/;

/** Whether `v` is a Type name, `<Capability>/<Type>` (core/F6): what makes a file a typed artifact (core/F23). */
export const isTypeName = (v: unknown): v is string => typeof v === "string" && TYPE_NAME.test(v);

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const has = (o: object, key: string) => Object.prototype.hasOwnProperty.call(o, key);

/** The first thing wrong with one declaration, with where, or undefined. */
function declProblem(spec: unknown, top: boolean, inRecord: boolean): { rule: string; at?: string } | undefined {
  if (!isObject(spec)) return { rule: "declaration" };
  if (Object.keys(spec).some((f) => !KEY_FIELDS.has(f))) return { rule: "declaration" };
  if (typeof spec.value !== "string" || !KINDS.has(spec.value)) return { rule: "value kind" };
  for (const f of ["list", "required"]) if (has(spec, f) && typeof spec[f] !== "boolean") return { rule: "declaration" };
  if (has(spec, "required") && !top && !inRecord) return { rule: "declaration" };
  if (spec.value === "enum") {
    if (!Array.isArray(spec.values) || spec.values.length === 0 || !spec.values.every((v) => typeof v === "string")) return { rule: "enum values" };
  } else if (has(spec, "values")) return { rule: "declaration" };
  if (spec.value === "parameter") {
    if (typeof spec.pattern !== "string") return { rule: "pattern" };
    try {
      new RegExp(spec.pattern, "u");
    } catch {
      return { rule: "pattern" };
    }
  } else if (has(spec, "pattern")) return { rule: "declaration" };
  if (spec.value === "record") {
    if (!isObject(spec.fields) || Object.keys(spec.fields).length === 0) return { rule: "fields", at: "/fields" };
    for (const [f, d] of Object.entries(spec.fields)) {
      if (PROSE.has(f)) return { rule: "prose", at: `/fields${ptr(f)}` };
      const p = declProblem(d, false, true);
      if (p) return { rule: p.rule, at: `/fields${ptr(f)}${p.at ?? ""}` };
    }
  } else if (has(spec, "fields")) return { rule: "declaration" };
  if (spec.value === "map") {
    if (!has(spec, "key")) return { rule: "key", at: "/key" };
    const k = declProblem(spec.key, false, false);
    if (k) return { rule: k.rule, at: `/key${k.at ?? ""}` };
    if ((spec.key as KeySchema).value !== "parameter" || (spec.key as KeySchema).list) return { rule: "key", at: "/key" };
    if (!has(spec, "of")) return { rule: "of", at: "/of" };
    const o = declProblem(spec.of, false, false);
    if (o) return { rule: o.rule, at: `/of${o.at ?? ""}` };
  } else if (spec.value === "either") {
    if (has(spec, "key")) return { rule: "declaration" };
    if (!Array.isArray(spec.of) || spec.of.length < 2) return { rule: "of", at: "/of" };
    for (const [i, d] of spec.of.entries()) {
      const p = declProblem(d, false, false);
      if (p) return { rule: p.rule, at: `/of/${i}${p.at ?? ""}` };
    }
  } else if (has(spec, "key") || has(spec, "of")) return { rule: "declaration" };
  return undefined;
}

function keyProblem(key: string, spec: unknown): { rule: string; at?: string } | undefined {
  if (key === "type") return { rule: "reserved" };
  if (PROSE.has(key)) return { rule: "prose" };
  return declProblem(spec, true, false);
}

/** The findings for one Type and its schema, empty when both are valid (core/F1, core/F3, core/F6). */
export function checkSchema(type: string, schema: Schema): Finding[] {
  const findings: Finding[] = [];
  if (typeof type !== "string" || !TYPE_NAME.test(type)) findings.push({ key: "type", rule: "type name" });
  if (!isObject(schema) || !isObject(schema.keys) || Object.keys(schema).some((f) => f !== "keys")) {
    findings.push({ key: null, rule: "schema" });
    return findings;
  }
  for (const [key, spec] of Object.entries(schema.keys)) {
    const p = keyProblem(key, spec);
    if (p) findings.push(p.at === undefined ? { key, rule: p.rule } : { key, rule: p.rule, at: p.at });
  }
  return findings;
}

/** Whether one value, not a list, matches its value kind. */
function scalar(spec: KeySchema, v: unknown): boolean {
  switch (spec.value) {
    case "id":
      return typeof v === "string" && QUALIFIED_ID.test(v);
    case "name":
      return isName(v);
    case "enum":
      return typeof v === "string" && (spec.values ?? []).includes(v);
    case "ref":
      return isObject(v) && Object.keys(v).sort().join() === "id,name" && isName(v.name) && isId(v.id);
    case "path":
      // Relative on every host: no backslash, and no `:`, so no Windows drive (`C:/…`) or stream.
      return typeof v === "string" && !/[\\:]/.test(v) && v.split("/").every((s) => s !== "" && s !== "." && s !== "..");
    case "boolean":
      return typeof v === "boolean";
    case "number":
      return typeof v === "number" && Number.isFinite(v);
    case "parameter":
      return typeof v === "string" && new RegExp(spec.pattern ?? "", "u").test(v);
    default:
      return false;
  }
}

type Problem = { rule: string; at?: string };
const STRUCTURED = new Set(["record", "map", "either"]);
/** The problems of one value against its declaration, ignoring `list`. */
function one(spec: KeySchema, v: unknown): Problem[] {
  if (spec.value === "record") {
    if (!isObject(v)) return [{ rule: "value" }];
    const out: Problem[] = [];
    const fields = spec.fields ?? {};
    for (const [f, fv] of Object.entries(v)) {
      if (PROSE.has(f)) out.push({ rule: "prose", at: ptr(f) });
      else if (!has(fields, f)) out.push({ rule: "undeclared", at: ptr(f) });
      else for (const p of problems(fields[f], fv)) out.push({ rule: p.rule, at: ptr(f) + (p.at ?? "") });
    }
    for (const [f, d] of Object.entries(fields)) if (d.required && !has(v, f)) out.push({ rule: "required", at: ptr(f) });
    return out;
  }
  if (spec.value === "map") {
    if (!isObject(v)) return [{ rule: "value" }];
    const out: Problem[] = [];
    for (const [k, kv] of Object.entries(v)) {
      if (!scalar(spec.key as KeySchema, k)) {
        out.push({ rule: "key", at: ptr(k) });
        continue;
      }
      for (const p of problems(spec.of as KeySchema, kv)) out.push({ rule: p.rule, at: ptr(k) + (p.at ?? "") });
    }
    return out;
  }
  if (spec.value === "either") return (spec.of as KeySchema[]).some((d) => problems(d, v).length === 0) ? [] : [{ rule: "value" }];
  return scalar(spec, v) ? [] : [{ rule: "value" }];
}

/** The problems of one value against its declaration, `list` included. */
function problems(spec: KeySchema, v: unknown): Problem[] {
  if (spec.list) {
    if (!Array.isArray(v)) return [{ rule: "value" }];
    if (!STRUCTURED.has(spec.value)) return v.every((item) => one(spec, item).length === 0) ? [] : [{ rule: "value" }];
    return v.flatMap((item, i) => one(spec, item).map((p) => ({ rule: p.rule, at: `/${i}${p.at ?? ""}` })));
  }
  if (Array.isArray(v) && spec.value !== "either") return [{ rule: "list" }];
  return one(spec, v);
}

/**
 * Validate an artifact's frontmatter against the Types supplied: `valid`, `invalid` with
 * findings, or `unknown` when it names no Type the mapping holds. Only the frontmatter is
 * read; the body never changes the result (core/F5). Throws a TypeError if a supplied
 * Type or schema is itself invalid, since the mapping is the caller's machine contract.
 */
export function validate(bytes: Uint8Array, types: Types): Result {
  for (const [type, schema] of Object.entries(types)) {
    const problems = checkSchema(type, schema);
    if (problems.length) throw new TypeError(`invalid Type ${type}: ${problems.map((p) => `${p.key ?? "schema"} (${p.rule})`).join(", ")}`);
  }
  let frontmatter;
  try {
    frontmatter = readFrontmatter(bytes);
  } catch (e) {
    if (e instanceof FormError) return { verdict: "invalid", findings: [{ key: null, rule: "form" }] };
    throw e;
  }
  const type = frontmatter.type;
  if (typeof type !== "string" || !has(types, type)) return { verdict: "unknown", findings: [{ key: "type", rule: has(frontmatter, "type") ? "unknown type" : "missing" }] };
  const { keys } = types[type];
  const findings: Finding[] = [];
  for (const [key, v] of Object.entries(frontmatter)) {
    if (key === "type") continue;
    if (PROSE.has(key)) findings.push({ key, rule: "prose" });
    else if (!has(keys, key)) findings.push({ key, rule: "undeclared" });
    else {
      for (const p of problems(keys[key], v)) findings.push(p.at === undefined ? { key, rule: p.rule } : { key, rule: p.rule, at: p.at });
    }
  }
  for (const [key, spec] of Object.entries(keys)) if (spec.required && !has(frontmatter, key)) findings.push({ key, rule: "required" });
  return { verdict: findings.length ? "invalid" : "valid", findings };
}
