// The Skill standard (core/C52): one pure module holding the rules, the permitted top-level set and the
// thresholds, so the Definition carries none of them. Core reads no registry, names no capability and
// gives the same result for the same input (core/N25, core/A48 to core/A52).

/** A repo rule of the repo-free check (core/A57). */
export interface RepoRule {
  readonly id: "path" | "change-id" | "delivery" | "flag" | "hosting";
  readonly about: string;
}
/** A repo reference found in one line of one file (core/F112). */
export interface RepoFinding {
  readonly rule: RepoRule["id"];
  readonly path: string;
  readonly line: number;
  readonly text: string;
}

/** A rule the standard states (core/A48). */
export interface Rule {
  readonly id: "entry" | "layout" | "router" | "detail" | "lane" | "size";
  readonly about: string;
}
export type Level = "ok" | "soft" | "medium" | "hard";
export type Remedy = "review-router" | "consolidate" | "move-to-references";
export type Required = "review-router" | "restructure" | "correct-before-delivery";

export const standard = {
  /** The top-level entries of a Skill folder: `SKILL.md` is required, the folders optional. */
  entry: "SKILL.md",
  folders: ["references", "scripts", "assets"],
  /** A body is `soft` above the first threshold, `medium` above the second and `hard` above the third (core/F93). */
  thresholds: { soft: 200, medium: 400, hard: 600 },
  /** The repository vocabulary a published Skill must not use (core/F112, core/F116). It names patterns and judges no meaning. */
  repoRules: [
    { id: "path", about: "a path inside the KAAL repository" },
    { id: "change-id", about: "a Change, issue or pull request number of the repository" },
    { id: "delivery", about: "a repository delivery instruction: a station joined to a pull request or branch, or a collector or Change branch" },
    { id: "flag", about: "a repository control flag" },
    { id: "hosting", about: "Git and GitHub vocabulary, allowed only in a Git or GitHub adapter named by the adopter" },
  ] as readonly RepoRule[],
  rules: [
    { id: "entry", about: "a Skill has a top-level SKILL.md" },
    { id: "layout", about: "only SKILL.md, references/, scripts/ and assets/ sit at the top" },
    { id: "router", about: "SKILL.md is a router: it points, it does not hold the whole discipline" },
    { id: "detail", about: "detail needed only sometimes lives in references or scripts" },
    { id: "lane", about: "a Skill covers its own capability's lane and names the others" },
    { id: "size", about: "the body's words are counted against the thresholds" },
  ] as readonly Rule[],
} as const;

/** What a size level asks for and whether it blocks, as data (core/F94, core/A49). */
export interface Warning {
  readonly level: Exclude<Level, "ok">;
  readonly words: number;
  readonly rules: readonly string[];
  readonly remedy: readonly Remedy[];
  readonly response: "review" | "restructure" | "correct";
  readonly required: readonly Required[];
  readonly blocks: boolean;
}
export interface SizeVerdict {
  readonly words: number;
  readonly level: Level;
  readonly warning?: Warning;
}

const STAGES: Record<Exclude<Level, "ok">, { response: Warning["response"]; required: readonly Required[] }> = {
  soft: { response: "review", required: ["review-router"] },
  medium: { response: "restructure", required: ["review-router", "restructure"] },
  hard: { response: "correct", required: ["review-router", "restructure", "correct-before-delivery"] },
};

const WORDS = /\S+/g;

/** The text after the frontmatter: the block from a first line `---` to the next line `---`, else the whole text. */
function body(text: string): string {
  const t = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const lines = t.split(/\r?\n/);
  if (lines[0] !== "---") return t;
  const end = lines.findIndex((line, i) => i > 0 && line === "---");
  return end < 0 ? t : lines.slice(end + 1).join("\n");
}

/** The words of a `SKILL.md` body and the level they reach (core/F93, core/F94). The frontmatter is not counted. */
export function judgeSize(text: string): SizeVerdict {
  const words = (body(text).match(WORDS) ?? []).length;
  const { soft, medium, hard } = standard.thresholds;
  const level: Level = words > hard ? "hard" : words > medium ? "medium" : words > soft ? "soft" : "ok";
  if (level === "ok") return { words, level };
  const stage = STAGES[level];
  return {
    words,
    level,
    warning: {
      level,
      words,
      rules: ["size", "router", "detail", "lane"],
      remedy: ["review-router", "consolidate", "move-to-references"],
      response: stage.response,
      required: stage.required,
      blocks: level === "hard",
    },
  };
}

/** The patterns of the repo rules, in rule order. The product's own words (PLAN, DO, ACT as words, `kaal-core`, `.kaal/`) match none of them. */
const repoPatterns: readonly (readonly [RepoRule["id"], RegExp])[] = [
  ["path", /(?<![\w.])(?:packages\/[a-z0-9][a-z0-9-]*\/|\.githooks\/)|(?<![\w])\.github\//g],
  ["change-id", /\b(?:[a-z]+\/)?C\d+\b|(?<![\w&#])#\d+\b/g],
  ["delivery", /\b(?:PLAN|DO|ACT|WIRE)[ -]+(?:pull[ -]requests?|PRs?|branch(?:es)?|collectors?|merges?)\b|(?<![\w.\/-])(?:kaal|claude)\/[a-z0-9][a-z0-9-]*(?:\/[a-z0-9._-]+)*/g],
  ["flag", /\bKAAL_[A-Z0-9]+_[A-Z0-9_]+\b/g],
  ["hosting", /\b(?:pull requests?|merge (?:queue|group)s?|branch protections?|rulesets?)\b/gi],
];

/** The repo references in the given text files (core/F112, core/F116, core/N30): pure, in file and line order. `allow` is the adopter's, never read from the files (core/F119). */
export function judgeRepoFree(files: readonly { readonly path: string; readonly text: string }[], { allow = [] }: { readonly allow?: readonly string[] } = {}): RepoFinding[] {
  const out: RepoFinding[] = [];
  for (const { path, text } of files) {
    text.split(/\r?\n/).forEach((line, i) => {
      const found: { rule: RepoRule["id"]; at: number; text: string }[] = [];
      for (const [rule, pattern] of repoPatterns) {
        if (rule === "hosting" && allow.includes("hosting")) continue;
        for (const m of line.matchAll(pattern)) found.push({ rule, at: m.index ?? 0, text: m[0] });
      }
      found.sort((a, b) => a.at - b.at);
      for (const f of found) out.push({ rule: f.rule, path, line: i + 1, text: f.text });
    });
  }
  return out;
}

export interface LayoutFinding {
  readonly rule: "entry" | "layout";
  readonly path: string;
}

/** The layout findings for the relative paths of a Skill directory's files (core/F95). */
export function judgeLayout(paths: readonly string[]): LayoutFinding[] {
  const findings: LayoutFinding[] = [];
  if (!paths.includes(standard.entry)) findings.push({ rule: "entry", path: standard.entry });
  const stray = new Set<string>();
  for (const path of paths) {
    const slash = path.indexOf("/");
    const top = slash < 0 ? path : path.slice(0, slash);
    const permitted = slash < 0 ? path === standard.entry : (standard.folders as readonly string[]).includes(top);
    if (!permitted) stray.add(top);
  }
  for (const path of [...stray].sort()) findings.push({ rule: "layout", path });
  return findings;
}

/** One Skill's entry in a `skill-size` baseline (core/F97). */
export interface BaselineEntry {
  readonly owner: string;
  readonly words: number;
  readonly variants?: { readonly [id: string]: number };
}
export type Baseline = { readonly [skill: string]: BaselineEntry };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

/** The baseline as data, or the reason it cannot be read (core/F97). */
export function readBaseline(json: string): Baseline {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new TypeError("the baseline is not JSON");
  }
  if (!isRecord(data)) throw new TypeError("the baseline is not an object");
  for (const [name, entry] of Object.entries(data)) {
    if (!isRecord(entry) || typeof entry.owner !== "string" || entry.owner === "" || !isCount(entry.words)) throw new TypeError(`the baseline entry ${name} needs an owner and its words`);
    if (entry.variants !== undefined && (!isRecord(entry.variants) || !Object.values(entry.variants).every(isCount))) throw new TypeError(`the baseline entry ${name} has a variant that is not a number`);
  }
  return data as Baseline;
}

export type Ratchet = "known" | "grew" | "new" | "stale";
/** How the ratchet reads an instance: the Skill itself, a byte-identical copy, or a declared variant (core/F97). */
export type Instance = { readonly kind: "skill" } | { readonly kind: "copy" } | { readonly kind: "variant"; readonly id: string };
export type Lifecycle = "development" | "published";

export interface Verdict {
  readonly skill: string;
  readonly conformance: Lifecycle;
  readonly words: number;
  readonly level: Level;
  readonly warning?: Warning;
  readonly findings: readonly LayoutFinding[];
  /** Repo references found in the Skill's text files; they block only a published Skill (core/F114). */
  readonly repoFree: readonly RepoFinding[];
  /** Whether the Skill's text files were given to the repo-free check. Without them a published verdict is never clean and blocks (core/N31). */
  readonly inspected: boolean;
  /** Files given to the check, and the paths of those skipped as binary (core/F114). */
  readonly skipped?: readonly string[];
  readonly ratchet?: Ratchet;
  readonly blocks: boolean;
}

export interface Request {
  readonly name: string;
  readonly skillMd: string | undefined;
  readonly paths: readonly string[];
  readonly baseline?: Baseline;
  readonly instance?: Instance;
  readonly lifecycle?: Lifecycle;
  /** The text files of the Skill, for the repo-free check. */
  readonly files?: readonly { readonly path: string; readonly text: string }[];
  /** Paths of files in the Skill's text folders that are binary and were not read. */
  readonly skipped?: readonly string[];
  /** What the adopter allows, such as `hosting` for a Git or GitHub adapter (core/F119). */
  readonly allow?: readonly string[];
}

/** `skill-size` against a recorded allowance: the comparison for this one rule (core/A52). */
function ratchet(level: Level, words: number, recorded: number | undefined, instance: Instance["kind"]): Ratchet | undefined {
  if (recorded === undefined) return level === "hard" ? "new" : undefined;
  if (words > recorded) return level === "hard" ? "grew" : undefined;
  if (words === recorded) return level === "hard" ? "known" : undefined;
  // Below its recorded words: a copy never retires an entry, and the others leave a stale allowance.
  return instance === "copy" ? "known" : "stale";
}

/** The verdict for one Skill directory: size, layout, the ratchet when the lifecycle is development (core/F96, core/F97, core/F99). */
export function judgeSkill({ name, skillMd, paths, baseline, instance = { kind: "skill" }, lifecycle = "development", files, skipped, allow }: Request): Verdict {
  const size = judgeSize(skillMd ?? "");
  const findings = judgeLayout(paths);
  const repoFree = judgeRepoFree(files ?? [], { allow });
  const inspected = files !== undefined;
  const verdict = { skill: name, conformance: lifecycle, words: size.words, level: size.level, ...(size.warning ? { warning: size.warning } : {}), findings, repoFree, inspected, ...(skipped && skipped.length > 0 ? { skipped } : {}) };
  if (lifecycle === "published") return { ...verdict, blocks: repoFree.length > 0 || !inspected };
  let outcome: Ratchet | undefined;
  if (baseline) {
    const entry = Object.hasOwn(baseline, name) ? baseline[name] : undefined;
    const recorded = instance.kind === "variant" ? (entry?.variants && Object.hasOwn(entry.variants, instance.id) ? entry.variants[instance.id] : undefined) : entry?.words;
    outcome = ratchet(size.level, size.words, recorded, instance.kind);
  }
  const hardBlocks = baseline ? outcome === "grew" || outcome === "new" || outcome === "stale" : size.level === "hard";
  return { ...verdict, ...(outcome ? { ratchet: outcome } : {}), blocks: findings.length > 0 || hardBlocks };
}
