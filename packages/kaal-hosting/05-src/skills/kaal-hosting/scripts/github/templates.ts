// Pull request templates and bodies, rendered from the types the owning capabilities declare (hosting/F93 to hosting/F96).
// The declaration is KAAL data with no GitHub word; every GitHub-specific part (the comment form, the declaration line,
// the file name) is here. Everything in this module is pure except `checkTemplates`, which reads through Hosting.
import { kind, read } from "../index.js";

export type PullRequestErrorCode = "INVALID_DECLARATION" | "MISSING_CHAPTER" | "UNKNOWN_CHAPTER" | "RAISE_REFUSED" | "STEP_FAILED";

/** What a refusal or a failed step reports. `rule` and `owner` name the breached rule and where it comes from. */
export class PullRequestError extends Error {
  rule?: string;
  owner?: string;
  steps?: string[];
  failed?: string;
  number?: number;
  url?: string;
  constructor(message: string, readonly code: PullRequestErrorCode, extra: { rule?: string; owner?: string; steps?: string[]; failed?: string; number?: number; url?: string } = {}) {
    super(message);
    this.name = "PullRequestError";
    Object.assign(this, extra);
  }
}

export type AutoMerge = "squash" | "merge" | "rebase" | "none";
export interface Raise {
  head?: string[];
  base?: string[];
  autoMerge?: AutoMerge;
  draft?: boolean;
  title?: { forbid?: string[] };
}
export interface Chapter { name: string; guidance: string }
export interface Declaration { type: string; intro?: string; chapters: Chapter[]; raise?: Raise }

const refuse = (message: string): never => { throw new PullRequestError(message, "INVALID_DECLARATION"); };
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const lf = (s: string) => s.replace(/\r\n?/g, "\n");

function only(o: unknown, allowed: string[], where: string): Record<string, unknown> {
  if (typeof o !== "object" || o === null || Array.isArray(o)) return refuse(`${where} is not an object`);
  for (const k of Object.keys(o)) if (!allowed.includes(k)) refuse(`${where} holds the field ${k}, which the declaration format does not have`);
  return o as Record<string, unknown>;
}
function text(value: unknown, where: string, required = false): string | undefined {
  if (value === undefined && !required) return undefined;
  if (typeof value !== "string" || (required && value.trim() === "")) return refuse(`${where} is not a${required ? " non-empty" : ""} string`);
  if (value.includes("-->")) refuse(`${where} holds "-->", which would close the comment it is written in`);
  return value;
}
function patterns(value: unknown, where: string): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length === 0 || value.some((p) => typeof p !== "string" || p === "")) refuse(`${where} is not a list of branch patterns`);
}

/** Check a declaration and return it typed; any breach is `INVALID_DECLARATION`, naming the field. */
export function validateDeclaration(declaration: unknown): Declaration {
  const d = only(declaration, ["type", "intro", "chapters", "raise"], "the declaration");
  if (typeof d.type !== "string" || !/^[A-Z][A-Z0-9_]*$/.test(d.type)) refuse("type is not an upper-case name");
  if (d.type === "DEFAULT") refuse("type DEFAULT is the fallback, not a type");
  text(d.intro, "intro");
  if (!Array.isArray(d.chapters) || d.chapters.length === 0) refuse("chapters is not a non-empty list");
  const names = new Set<string>();
  for (const [i, c] of (d.chapters as unknown[]).entries()) {
    const chapter = only(c, ["name", "guidance"], `chapters[${i}]`);
    const name = text(chapter.name, `chapters[${i}].name`, true) as string;
    if (names.has(name)) refuse(`the chapter ${name} is declared twice`);
    names.add(name);
    text(chapter.guidance ?? "", `chapters[${i}].guidance`);
  }
  if (d.raise !== undefined) {
    const r = only(d.raise, ["head", "base", "autoMerge", "draft", "title"], "raise");
    patterns(r.head, "raise.head");
    patterns(r.base, "raise.base");
    if (r.autoMerge !== undefined && !["squash", "merge", "rebase", "none"].includes(r.autoMerge as string)) refuse("raise.autoMerge is not squash, merge, rebase or none");
    if (r.draft !== undefined && typeof r.draft !== "boolean") refuse("raise.draft is not true or false");
    if (r.title !== undefined) {
      const t = only(r.title, ["forbid"], "raise.title");
      if (t.forbid !== undefined && (!Array.isArray(t.forbid) || t.forbid.some((p) => typeof p !== "string" || !compiles(p)))) refuse("raise.title.forbid is not a list of patterns");
    }
  }
  return d as unknown as Declaration;
}
function compiles(pattern: string): boolean { try { new RegExp(pattern); return true; } catch { return false; } }

/** The file name of a type's template. */
export const templateName = (type: string): string => `${type.toLowerCase()}.md`;

const comment = (s: string): string => `<!-- ${lf(s).trim()} -->`;

/** The text of one pull request template: the declaration line, the intro, and each chapter with its guidance. */
export function renderTemplate(declaration: unknown): string {
  const d = validateDeclaration(declaration);
  const lines = [`<!-- KAAL-PR-template: ${d.type} -->`, ""];
  if (d.intro !== undefined) lines.push(comment(d.intro), "");
  for (const c of d.chapters) lines.push(`## ${c.name}`, "", comment(c.guidance ?? ""), "");
  return lines.join("\n");
}

/** A pull request body: the given chapter texts under the declared headings, in the declared order. */
export function renderBody(declaration: unknown, chapters: unknown): string {
  const d = validateDeclaration(declaration);
  if (typeof chapters !== "object" || chapters === null || Array.isArray(chapters)) throw new PullRequestError("the chapters are not an object of name to text", "MISSING_CHAPTER");
  const given = chapters as Record<string, unknown>;
  const declared = new Set(d.chapters.map((c) => c.name));
  for (const k of Object.keys(given)) if (!declared.has(k)) throw new PullRequestError(`the chapter ${k} is not declared for ${d.type}`, "UNKNOWN_CHAPTER");
  const sections = d.chapters.map((c) => {
    const body = own(given, c.name) && typeof given[c.name] === "string" ? lf(given[c.name] as string).trim() : "";
    if (body === "") throw new PullRequestError(`the chapter ${c.name} has no text`, "MISSING_CHAPTER");
    return `## ${c.name}\n\n${body}\n`;
  });
  return sections.join("\n");
}

export interface TemplateProblem { file: string; problem: "missing" | "differs" | "undeclared" }

/** Compare the committed templates in `directory` with the render of `declarations`; it writes nothing. */
export async function checkTemplates(declarations: unknown[], directory: string): Promise<{ ok: boolean; problems: TemplateProblem[] }> {
  const wanted = new Map(declarations.map((x) => validateDeclaration(x)).map((d) => [templateName(d.type), renderTemplate(d)] as const));
  const present = (await kind(directory)) === "directory" ? await read(directory) : {};
  const problems: TemplateProblem[] = [];
  for (const [file, expected] of wanted) {
    if (!own(present, file)) problems.push({ file, problem: "missing" });
    else if (present[file]!.toString("utf8") !== expected) problems.push({ file, problem: "differs" });
  }
  for (const file of Object.keys(present)) if (!file.includes("/") && file.endsWith(".md") && !wanted.has(file)) problems.push({ file, problem: "undeclared" });
  problems.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
  return { ok: problems.length === 0, problems };
}
