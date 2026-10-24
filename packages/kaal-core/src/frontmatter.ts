// Deterministic frontmatter (core/C5, core/C6): the generic schema format and validator
// for KAAL's collaborative Markdown artifacts. Each Capability owns its Types and their
// schemas and supplies them as a mapping; Core decides only whether an artifact's
// frontmatter conforms. Reading the YAML is Graph's (kaal-graph/form). Pure: no host access.
import { FormError, isId, isName, readFrontmatter } from "kaal-graph/form";

/** The value kinds a key may have (core/F1). There is no free-text kind. */
export type ValueKind = "id" | "name" | "enum" | "ref" | "path" | "boolean" | "number" | "parameter";

/** One key of a schema: its value kind, and whether it is a list or required. */
export interface KeySchema {
  readonly value: ValueKind;
  readonly list?: boolean;
  readonly required?: boolean;
  /** For `enum`: the values allowed. */
  readonly values?: readonly string[];
  /** For `parameter`: the pattern a value matches. */
  readonly pattern?: string;
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
}

export interface Result {
  readonly verdict: "valid" | "invalid" | "unknown";
  readonly findings: readonly Finding[];
}

/** Keys that carry prose, forbidden in artifacts and schemas alike (core/F3). */
const PROSE = new Set(["description", "summary", "rationale", "instructions", "prompt", "notes", "comment", "explanation"]);
const KINDS = new Set<string>(["id", "name", "enum", "ref", "path", "boolean", "number", "parameter"]);
const KEY_FIELDS = new Set(["value", "list", "required", "values", "pattern"]);
/** A Type name: `<Capability>/<Type>` in the owning Capability's Business Language (core/F6). */
const TYPE_NAME = /^[A-Z][A-Za-z0-9]*\/[A-Z][A-Za-z0-9]*$/;
/** A qualified identifier: `<capability>/<letters><number>`, with an optional lowercase suffix. */
const QUALIFIED_ID = /^[a-z][a-z0-9-]*\/[A-Z]+[0-9]+[a-z]?$/;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const has = (o: object, key: string) => Object.prototype.hasOwnProperty.call(o, key);

/** The first thing wrong with one key's declaration, or undefined. */
function keyProblem(key: string, spec: unknown): string | undefined {
  if (key === "type") return "reserved";
  if (PROSE.has(key)) return "prose";
  if (!isObject(spec)) return "declaration";
  if (Object.keys(spec).some((f) => !KEY_FIELDS.has(f))) return "declaration";
  if (typeof spec.value !== "string" || !KINDS.has(spec.value)) return "value kind";
  for (const f of ["list", "required"]) if (has(spec, f) && typeof spec[f] !== "boolean") return "declaration";
  if (spec.value === "enum") {
    if (!Array.isArray(spec.values) || spec.values.length === 0 || !spec.values.every((v) => typeof v === "string")) return "enum values";
  } else if (has(spec, "values")) return "declaration";
  if (spec.value === "parameter") {
    if (typeof spec.pattern !== "string") return "pattern";
    try {
      new RegExp(spec.pattern, "u");
    } catch {
      return "pattern";
    }
  } else if (has(spec, "pattern")) return "declaration";
  return undefined;
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
    const rule = keyProblem(key, spec);
    if (rule) findings.push({ key, rule });
  }
  return findings;
}

/** Whether one value, not a list, matches its value kind. */
function conforms(spec: KeySchema, v: unknown): boolean {
  switch (spec.value) {
    case "id":
      return typeof v === "string" && QUALIFIED_ID.test(v);
    case "name":
      return isName(v);
    case "enum":
      return typeof v === "string" && (spec.values ?? []).includes(v);
    case "ref":
      return isObject(v) && Object.keys(v).length === 2 && isName(v.name) && isId(v.id);
    case "path":
      // Relative on every host: no backslash, and no `:`, so no Windows drive (`C:/…`) or stream.
      return typeof v === "string" && !/[\\:]/.test(v) && v.split("/").every((s) => s !== "" && s !== "." && s !== "..");
    case "boolean":
      return typeof v === "boolean";
    case "number":
      return typeof v === "number" && Number.isFinite(v);
    case "parameter":
      return typeof v === "string" && new RegExp(spec.pattern ?? "", "u").test(v);
  }
}

/** The rule one key's value breaks, or undefined. */
function valueProblem(spec: KeySchema, v: unknown): string | undefined {
  if (spec.list) return Array.isArray(v) && v.every((item) => conforms(spec, item)) ? undefined : "value";
  if (Array.isArray(v)) return "list";
  return conforms(spec, v) ? undefined : "value";
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
      const rule = valueProblem(keys[key], v);
      if (rule) findings.push({ key, rule });
    }
  }
  for (const [key, spec] of Object.entries(keys)) if (spec.required && !has(frontmatter, key)) findings.push({ key, rule: "required" });
  return { verdict: findings.length ? "invalid" : "valid", findings };
}
