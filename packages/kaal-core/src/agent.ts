// Agent Realization (core/C3, core/C4): the pure plan by which Core makes each installed Skill
// reachable by the agents of every provider a repository declares, from the Skill's one canonical
// source, claiming only what Core itself deployed. Applying a plan is Hosting's (core/A7). Pure:
// no host access (core/N4).
import { FormError, readFrontmatter } from "kaal-graph/form";
import { sha256 } from "./sha256.js";

/** Where a repository declares the providers it enables (core/F16). The consumer declares; Core owns the schema. */
export const declaration = ".kaal/config/core/agents.json";

/** Every Skill's canonical deployment, which every provider in the table reaches or is given a copy of. */
const CANONICAL = ".agents/skills";

/**
 * Core's placement table, its only one (core/N6). It governs Core's own deployments and nothing else.
 * `deploy` is the location a provider discovers Skills in when that is not the canonical one: Core
 * deploys a copy there. Every provider here discovers Skills at a location, so none is reached by
 * instruction and no plan proposes a pointer (core/F20). Entries come from suppliers'
 * documentation, as `guard/N10` records it.
 */
const PLACEMENT: Readonly<Record<string, { readonly deploy?: string }>> = Object.freeze({
  "claude-code": Object.freeze({ deploy: ".claude/skills" }),
  codex: Object.freeze({}),
  copilot: Object.freeze({}),
});

/** A Skill to install: its name and its canonical source files, by path relative to the Skill. */
export interface SkillSource {
  readonly name: string;
  readonly files: { readonly [path: string]: Uint8Array };
}

/** Core's record of what it deployed, or what is present: SHA-256 by repository-relative path. */
export interface Digests {
  readonly [path: string]: string;
}

/** A Skill a Capability's Installation Contract delivers, and whether its canonical asset is already in that Capability's record. */
export interface Contracted {
  readonly skill: string;
  readonly registered: boolean;
}

export interface RealizationInput {
  readonly skills: readonly SkillSource[];
  readonly providers: readonly string[];
  readonly record: Digests;
  readonly present: Digests;
  /** The Skills a contract delivers (core/F36). Their canonical deployment belongs to the Capability's record, never Core's. */
  readonly contracted?: readonly Contracted[];
}

/** A pointer for an instruction file's owner to adopt: it names the Skill's canonical path. */
export interface Pointer {
  readonly provider: string;
  readonly skill: string;
  readonly target: string;
}

/** What a realization does, so whoever applies it can report every outcome (core/F22). */
export interface Plan {
  /** Files to write, with their bytes. */
  readonly write: { readonly path: string; readonly bytes: Uint8Array }[];
  /** Files left in place, each with the reason. */
  readonly keep: { readonly path: string; readonly reason: string }[];
  /** Files Core deployed, unmodified and no longer needed, to remove. */
  readonly prune: string[];
  readonly pointers: Pointer[];
  /** Declared providers the placement table does not know. */
  readonly unknown: string[];
  /** Core's record once the plan is applied. */
  readonly record: Digests;
}

/** A Skill's name, as Core registers one: lowercase letters, digits and single hyphens. */
const SKILL = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** An instruction file, such as `AGENTS.md` or `CLAUDE.md`, which Core never writes, edits or removes (core/F20). */
const isInstruction = (path: string) => /(^|\/)(AGENTS|CLAUDE)\.md$/i.test(path);
/** A relative path written with `/`: no `\` or `:`, and no empty, `.` or `..` segment. */
const isPath = (v: string) => !/[\\:]/.test(v) && v.split("/").every((s) => s !== "" && s !== "." && s !== "..");
const has = (o: object, key: string) => Object.prototype.hasOwnProperty.call(o, key);
const byPath = <T extends { path: string }>(a: T, b: T) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

/** Which lines of a Markdown body are headings: those outside fenced code blocks (``` or ~~~). */
function headings(lines: string[]): boolean[] {
  let fence: string | undefined;
  return lines.map((line) => {
    const open = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence !== undefined) {
      if (open && open[1][0] === fence[0] && open[1].length >= fence.length && line.trim() === open[1]) fence = undefined;
      return false;
    }
    if (open) {
      fence = open[1];
      return false;
    }
    return /^#{1,6} /.test(line);
  });
}

/** The canonical body's `## Description` section, as written, without its heading and surrounding blank lines. */
function descriptionOf(body: string): string | undefined {
  const lines = body.split("\n");
  const heading = headings(lines);
  const start = lines.findIndex((l, i) => heading[i] && l.trimEnd() === "## Description");
  if (start < 0) return undefined;
  let end = lines.findIndex((l, i) => i > start && heading[i] && /^#{1,2} /.test(l));
  if (end < 0) end = lines.length;
  const text = lines.slice(start + 1, end).join("\n").trim();
  return text === "" ? undefined : text;
}

/**
 * A supplier `SKILL.md`, rendered from a canonical source (core/F21): frontmatter of exactly `name`
 * and `description`, where `description` is the body's `## Description` section copied verbatim, and
 * the body unchanged. A source without that section, or with no `name`, cannot be rendered.
 */
export function renderSkill(bytes: Uint8Array): Uint8Array {
  let frontmatter;
  try {
    frontmatter = readFrontmatter(bytes);
  } catch (e) {
    if (e instanceof FormError) throw new TypeError(`the canonical source's frontmatter cannot be read: ${e.message}`);
    throw e;
  }
  const text = decoder.decode(bytes);
  const body = text.slice(text.indexOf("\n---\n", 3) + 5);
  if (typeof frontmatter.name !== "string") throw new TypeError("the canonical source names no Skill: its frontmatter has no `name`");
  const description = descriptionOf(body);
  if (description === undefined) throw new TypeError("the canonical source has no `## Description` section to render as `description`");
  return encoder.encode(`---\nname: ${JSON.stringify(frontmatter.name)}\ndescription: ${JSON.stringify(description)}\n---\n${body}`);
}

/**
 * The plan that makes `skills` reachable by the agents of `providers` (core/F16–core/F22). Each Skill
 * is deployed to `.agents/skills/<name>/`, and copied for each provider that discovers Skills only
 * at a location of its own, from the same rendered bytes. Core claims only what its `record` holds:
 * a deployed file still as Core wrote it is rewritten or pruned; a modified one, and anything at a
 * target that Core did not deploy, is kept and reported. Nothing outside the deployments is touched.
 * A change between a file and a directory at one path is kept and reported, the old file included:
 * no plan both removes a path and writes beneath it, or the reverse.
 *
 * A `contracted` Skill's canonical deployment is the Capability's asset (core/F36). Core's record
 * never holds it: the plan writes it only when the Capability's record does not register it yet,
 * for the caller to register there, and otherwise plans nothing for it and deploys for providers only.
 */
export function realize({ skills, providers, record, present, contracted = [] }: RealizationInput): Plan {
  const unknown = [...new Set(providers.filter((p) => !has(PLACEMENT, p)))].sort();
  const roots = [CANONICAL, ...[...new Set(providers)].filter((p) => has(PLACEMENT, p)).flatMap((p) => PLACEMENT[p].deploy ?? [])];
  const names = new Set<string>();
  for (const skill of skills) {
    if (!SKILL.test(skill.name) || names.has(skill.name)) throw new TypeError(`${skill.name} is not a Skill name, or names two Skills: lowercase letters, digits and single hyphens`);
    names.add(skill.name);
    for (const path of Object.keys(skill.files)) {
      if (!isPath(path)) throw new TypeError(`${skill.name}/${path} is not a path within the Skill`);
      if (isInstruction(path)) throw new TypeError(`${skill.name}/${path} is an instruction file, which Core never writes (core/F20)`);
    }
  }
  const owned = new Set<string>();
  const capability = new Set<string>();
  for (const { skill, registered } of contracted) {
    if (!names.has(skill)) throw new TypeError(`${skill} is contracted but is not among the Skills to install`);
    capability.add(`${CANONICAL}/${skill}/`);
    if (registered) owned.add(`${CANONICAL}/${skill}/`);
  }
  const under = (prefixes: Set<string>, path: string) => [...prefixes].some((p) => path.startsWith(p));
  const wanted = new Map<string, Uint8Array>();
  for (const skill of [...skills].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    for (const [path, bytes] of Object.entries(skill.files)) {
      const deployed = path === "SKILL.md" ? renderSkill(bytes) : bytes;
      for (const root of new Set(roots)) if (!under(owned, `${root}/${skill.name}/${path}`)) wanted.set(`${root}/${skill.name}/${path}`, deployed);
    }
  }

  const write: { path: string; bytes: Uint8Array }[] = [];
  const keep: { path: string; reason: string }[] = [];
  const prune: string[] = [];
  const next: Record<string, string> = {};
  for (const path of Object.keys(record)) {
    if (wanted.has(path) || !has(present, path) || under(owned, path)) continue;
    if (isInstruction(path)) keep.push({ path, reason: "an instruction file, which Core never removes" });
    else if (present[path] === record[path]) prune.push(path);
    else {
      keep.push({ path, reason: "changed since Core deployed it, and no longer needed" });
      next[path] = record[path];
    }
  }

  // Hosting realizes no path together with its own descendant, so a file Core would prune where a
  // deployment now needs a directory, or under a target now a file, stays: replacing it needs a
  // file↔directory transition, which is Hosting's to provide, not Core's to orchestrate.
  const nested = (a: string, b: string) => a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
  const transition = new Set(prune.filter((p) => [...wanted.keys()].some((w) => nested(w, p))));
  for (const path of transition) {
    prune.splice(prune.indexOf(path), 1);
    keep.push({ path, reason: "replacing it needs Hosting's file↔directory transition" });
    next[path] = record[path];
  }

  // A file that stays where a deployment needs a directory, or under a target Core would write as
  // a file, blocks that target: writing it would need that file to be removed first.
  const pruned = new Set(prune);
  const staying = Object.keys(present).filter((p) => !pruned.has(p));
  const blocker = (path: string) => staying.find((p) => nested(path, p));
  for (const [path, bytes] of wanted) {
    const digest = sha256(bytes);
    const blocked = blocker(path);
    if (blocked !== undefined) {
      keep.push({ path, reason: transition.has(blocked) ? `${blocked} is in the way, and replacing it needs Hosting's file↔directory transition` : `${blocked} is in the way` });
      if (has(record, path)) next[path] = record[path];
    } else if (has(record, path)) {
      if (has(present, path) && present[path] !== record[path]) {
        keep.push({ path, reason: "changed since Core deployed it" });
        next[path] = record[path];
      } else {
        if (present[path] !== digest) write.push({ path, bytes });
        next[path] = digest;
      }
    } else if (has(present, path)) {
      keep.push({ path, reason: "present, and not deployed by Core" });
    } else {
      write.push({ path, bytes });
      next[path] = digest;
    }
  }
  return {
    write: write.sort(byPath),
    keep: keep.sort(byPath),
    prune: prune.sort(),
    pointers: [],
    unknown,
    record: Object.fromEntries(
      Object.keys(next)
        .filter((p) => !under(capability, p))
        .sort()
        .map((p) => [p, next[p]]),
    ),
  };
}
