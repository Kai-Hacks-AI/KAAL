// Composition: given an explicit selection of Node IDs, resolve what the
// Engine must hold, verify it, and install it whole or not at all.
//
// Core decides everything about Nodes: which are Skills or Extensions, whether
// they are admitted, what an Engine holds. Nothing here reads a Node's type or
// seal itself; offers are put into a throwaway KAAL and Core is asked. The
// whole candidate (the Engine as it would be after the install) is staged and
// checked before a single byte is written to the Engine or the host's skills
// directory, which are the only places written, and only when named.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { installedExtensions, installedSkills, payload, registerExtension, registerSkill } from "kaal-core";
import { compatibility, named, prefix } from "./compat.js";
import { read, sha256, type Files } from "./files.js";
import type { Offer } from "./sources.js";

export type Kind = "Skill" | "Extension";
export interface Held {
  kind: Kind;
  name: string;
  id: string;
}

/** The install is refused: nothing was written. */
export class Refusal extends Error {}

const register = { Skill: registerSkill, Extension: registerExtension };
const held = (kaal: string): Held[] => [
  ...installedSkills(kaal).map((r) => ({ kind: "Skill" as const, ...r })),
  ...installedExtensions(kaal).map((r) => ({ kind: "Extension" as const, ...r })),
];

/** What an Engine holds, as Core reports it. A location with no Engine holds nothing. */
export function heldBy(engine: string): Held[] {
  return existsSync(join(engine, "core")) ? held(engine) : [];
}

function seed(dir: string): void {
  for (const [path, bytes] of Object.entries(payload())) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), bytes);
  }
}

/** An offer with what Core says its Skill or Extension Nodes are. */
export interface Staged extends Offer {
  kind?: Kind;
  nodes: { name: string; id: string }[];
  /** Why Core would not take it as a Skill or an Extension. */
  error?: string;
}

/**
 * Put each offer, alone, into a throwaway KAAL seeded from Core's payload and
 * ask Core: the kind that registers is the offer's kind, and the Nodes Core
 * then reports it holds are the ones a selection can name.
 */
export function stage(offers: Offer[]): Staged[] {
  const scratch = mkdtempSync(join(tmpdir(), "kaal-compose-stage-"));
  try {
    const base = join(scratch, "base");
    seed(base);
    return offers.map((offer, i) => {
      const errors: string[] = [];
      for (const kind of ["Skill", "Extension"] as const) {
        const dir = join(scratch, `${i}-${kind}`);
        cpSync(base, dir, { recursive: true });
        try {
          const ids = new Set(register[kind](dir, offer.delivery, offer.kaal));
          return { ...offer, kind, nodes: held(dir).filter((h) => h.kind === kind && ids.has(h.id)).map(({ name, id }) => ({ name, id })) };
        } catch (e) {
          errors.push(`as a ${kind}: ${(e as Error).message}`);
        }
      }
      return { ...offer, nodes: [], error: errors.join("; ") };
    });
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

export interface Request {
  /** The Engine's location: where the Core, Nodes and Skills are installed. Never derived from anything else. */
  engine: string;
  /** The host's Agent Skills directory: required when a selected package carries an Agent Skill. */
  skills?: string;
  offers: Offer[];
  /** The exact Node IDs to install. Nothing else is installed and no need is added to the selection. */
  select: string[];
}

export interface Installed {
  installed: Held[];
  wrote: string[];
}

/** The Engine must carry the Core this tool does: every file of it, but the instance-owned `core/config`. */
function checkCore(engine: string): void {
  const present = read(engine);
  for (const [path, bytes] of Object.entries(payload())) {
    if (path === "core/config") continue;
    if (present[path] === undefined) throw new Refusal(`engine: ${path} of the Core this tool carries is missing from ${engine}`);
    if (present[path] !== bytes) throw new Refusal(`engine: ${path} differs from the Core this tool carries`);
  }
}

/**
 * Stage the whole candidate and decide. Returns what would be written, or
 * throws a Refusal; either way nothing has been written to the Engine or the
 * skills directory.
 */
function plan(req: Request): { installed: Held[]; kaal: Files; skills: Files } {
  const exists = Object.keys(read(req.engine)).length > 0;
  if (exists) checkCore(req.engine);
  const already = exists ? new Set(held(req.engine).map((h) => h.id)) : new Set<string>();
  const staged = stage(req.offers);

  // Selection is by exact Node ID, and only of what Core took as a Skill or an Extension.
  const chosen = new Map<Staged, Held[]>();
  for (const id of new Set(req.select)) {
    if (already.has(id)) continue;
    const offer = staged.find((s) => s.nodes.some((n) => n.id === id));
    if (!offer) {
      const carried = req.offers.find((o) => Object.keys(o.kaal).some((p) => !p.startsWith("seals/") && sha256(o.kaal[p]) === id));
      throw new Refusal(
        carried
          ? `select: ${id} is a Node of ${carried.origin}, but Core does not take it as a Skill or Extension${staged.find((s) => s.origin === carried.origin)?.error ? ` (${staged.find((s) => s.origin === carried.origin)!.error})` : ""}`
          : `select: no offered package carries a Node with the exact ID ${id}`,
      );
    }
    const node = offer.nodes.find((n) => n.id === id)!;
    chosen.set(offer, [...(chosen.get(offer) ?? []), { kind: offer.kind!, ...node }]);
  }

  const scratch = mkdtempSync(join(tmpdir(), "kaal-compose-candidate-"));
  try {
    const candidate = join(scratch, "engine");
    if (exists) cpSync(req.engine, candidate, { recursive: true });
    else seed(candidate);
    const before = exists ? read(candidate) : {};
    const selected = [...chosen.keys()].sort((a, b) => (a.delivery < b.delivery ? -1 : a.delivery > b.delivery ? 1 : 0));
    for (const offer of selected) {
      try {
        register[offer.kind!](candidate, offer.delivery, offer.kaal);
      } catch (e) {
        throw new Refusal(`${offer.delivery}: Core refuses it in this Engine: ${(e as Error).message}`);
      }
    }

    // A need is met when, in the Engine as it would be, the slot of that name holds a Node Core reports held.
    const after = held(candidate);
    const ids = new Set(after.map((h) => h.id));
    const slotHolds = (need: string) =>
      ["skills", "extensions"].some((dir) => Object.values(read(join(candidate, dir, need))).some((bytes) => ids.has(sha256(bytes))));
    const pre = prefix(read(candidate)["core/config"] ?? payload()["core/config"] ?? "");
    const unmet: string[] = [];
    for (const offer of selected) {
      const declared = compatibility(offer.skills[`${offer.delivery}/SKILL.md`] ?? "");
      if ("unreadable" in declared) {
        unmet.push(`${offer.delivery}'s compatibility declaration is ${declared.unreadable}, which cannot be read reliably here, so what it needs beside it cannot be established: write it as a plain, quoted or block scalar without escapes`);
        continue;
      }
      for (const need of named(declared.value, pre)) {
        if (need === offer.delivery || slotHolds(need)) continue;
        const offered = staged.filter((s) => s.delivery === need).flatMap((s) => s.nodes.map((n) => `${n.name} ${n.id}`));
        unmet.push(
          offered.length
            ? `${offer.delivery} declares that it needs ${need} beside it, which is not installed: select its Node by exact ID (${offered.join(", ")})`
            : `${offer.delivery} declares that it needs ${need} beside it, which is not installed, and no package offered carries a Skill or Extension Node for it: there is no exact Node ID to select`,
        );
      }
    }
    if (unmet.length > 0) throw new Refusal(unmet.join("\n"));

    const files = read(candidate);
    const kaal: Files = {};
    for (const [path, bytes] of Object.entries(files)) if (before[path] === undefined) kaal[path] = bytes;

    const skills: Files = {};
    for (const offer of selected) Object.assign(skills, offer.skills);
    if (Object.keys(skills).length > 0 && !req.skills) throw new Refusal("a selected package carries an Agent Skill: name the host's skills directory");
    for (const [path, bytes] of Object.entries(skills)) {
      const file = join(req.skills!, path);
      if (existsSync(file) && readFileSync(file, "utf8") !== bytes) throw new Refusal(`${file} exists with other bytes: an Agent Skill is not replaced`);
    }
    return { installed: [...chosen.values()].flat(), kaal, skills };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** Install the selection whole or not at all: everything is decided before the first write, and a failing write removes what was written. */
export function install(req: Request): Installed {
  const { installed, kaal, skills } = plan(req);
  const wrote: string[] = [];
  const created: string[] = [];
  const put = (root: string, files: Files) => {
    for (const [path, bytes] of Object.entries(files)) {
      const file = join(root, path);
      if (existsSync(file)) continue;
      for (let dir = dirname(file); !existsSync(dir); dir = dirname(dir)) created.push(dir);
      mkdirSync(dirname(file), { recursive: true });
      created.push(file);
      writeFileSync(file, bytes);
      wrote.push(file);
    }
  };
  try {
    put(req.engine, kaal);
    if (req.skills) put(req.skills, skills);
  } catch (e) {
    for (const path of created) rmSync(path, { recursive: true, force: true });
    throw e;
  }
  return { installed, wrote };
}
