import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** The bootstrap Form: frontmatter of `name`, then optionally `type` as a `{name, id}` pair. */
const FORM = /^---\nname: (.+)\n(?:type:\n {2}name: (.+)\n {2}id: ([0-9a-f]{64})\n)?---\n/;
const SKILL = "Skill";
const CAPABILITY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const sha256 = (bytes: string): string => createHash("sha256").update(bytes).digest("hex");

/** What an installed KAAL carries: its Nodes (name and ID) and the IDs it has sealed. */
function installed(kaal: string): { nodes: { name: string; id: string }[]; sealed: Set<string> } {
  const nodes: { name: string; id: string }[] = [];
  const sealed = new Set<string>();
  for (const path of readdirSync(kaal, { recursive: true, encoding: "utf8" })) {
    const file = join(kaal, path);
    if (!statSync(file).isFile()) continue;
    const normal = path.split("\\").join("/");
    if (normal.startsWith("seals/")) sealed.add(normal.slice("seals/".length));
    else {
      const bytes = readFileSync(file, "utf8");
      const form = FORM.exec(bytes);
      if (form) nodes.push({ name: form[1], id: sha256(bytes) });
    }
  }
  return { nodes, sealed };
}

/**
 * Register a capability's KAAL Skill contribution with an installed KAAL, the
 * directory `payload()` deploys to. The contribution is capability-scoped: its
 * files are placed under `skills/<capability>/` of the KAAL directory, in the
 * paths it carries, and it may hold several Nodes. `contribution` is exactly
 * its Nodes (files keyed by path within the capability) and each Node's own
 * seal marker `seals/<ID>`. Every Node must carry its own seal; at least one
 * must be typed, by name and ID, by the sealed `Skill` Node of the installed
 * KAAL; and every Node's type and every ID it refers to must be sealed in the
 * installed KAAL or in the contribution. Registering adds those files and
 * keeps every Node's bytes, so identities are unchanged. Registering the same
 * contribution again changes nothing, and a registered path is never given
 * other bytes: changed bytes are another Node. All checks run before anything
 * is written; if a write then fails, what was written is removed, and a
 * crash between writes can leave only Nodes without seals, which are not
 * admitted, so registering again completes it. A Node's type is its
 * registration, so no registry is kept. Returns the IDs of the Skills, the
 * Nodes typed by `Skill`.
 */
export function registerSkill(kaal: string, capability: string, contribution: Record<string, string>): string[] {
  if (!CAPABILITY.test(capability)) throw new Error("a capability is named in lowercase letters, digits and single hyphens");
  const paths = Object.keys(contribution);
  for (const path of paths) {
    if (path.startsWith("/") || path.split("/").some((s) => s === ".." || s === "." || s === "")) throw new Error(`${path} is not a path within the capability`);
  }
  const markers = paths.filter((p) => p.startsWith("seals/"));
  const files = paths.filter((p) => !p.startsWith("seals/"));
  if (files.length === 0) throw new Error("a contribution carries at least one Node");

  const mine = files.map((path) => {
    const bytes = contribution[path];
    const form = FORM.exec(bytes);
    if (!form) throw new Error(`${path} is not a Node: a contribution is Nodes and their seals`);
    return { path, bytes, id: sha256(bytes), name: form[1], type: form[2] ? { name: form[2], id: form[3] } : undefined };
  });
  const ids = new Set(mine.map((n) => n.id));
  for (const n of mine) if (!markers.includes(`seals/${n.id}`)) throw new Error(`${n.path} does not carry its own seal: its ID is the SHA-256 of its exact bytes`);
  for (const marker of markers) if (!ids.has(marker.slice("seals/".length)) || contribution[marker] !== "") throw new Error(`${marker} is not an empty seal of a carried Node`);

  const { nodes, sealed } = installed(kaal);
  const known = (id: string): boolean => sealed.has(id) || ids.has(id);
  const skill = nodes.find((n) => n.name === SKILL && sealed.has(n.id));
  const skills = mine.filter((n) => skill && n.type?.name === SKILL && n.type.id === skill.id);
  if (skills.length === 0) throw new Error(`a contribution carries a Node typed by the sealed ${SKILL} Node of this KAAL, by name and ID`);
  for (const n of mine) {
    for (const [ref] of n.bytes.matchAll(/[0-9a-f]{64}/g)) if (ref !== n.id && !known(ref)) throw new Error(`${n.path} refers to ${ref}, which is not sealed`);
  }

  const planned = [
    ...mine.map((n) => ({ file: join(kaal, "skills", capability, n.path), bytes: n.bytes })),
    ...markers.map((m) => ({ file: join(kaal, m), bytes: "" })),
  ];
  for (const { file, bytes } of planned) if (existsSync(file) && readFileSync(file, "utf8") !== bytes) throw new Error(`${file} exists with other bytes: changed bytes are another Node`);

  const created: string[] = [];
  try {
    for (const { file, bytes } of planned) {
      if (existsSync(file)) continue;
      for (let dir = dirname(file); !existsSync(dir); dir = dirname(dir)) created.push(dir);
      mkdirSync(dirname(file), { recursive: true });
      created.push(file);
      writeFileSync(file, bytes);
    }
  } catch (e) {
    for (const path of created) rmSync(path, { recursive: true, force: true });
    throw e;
  }
  return skills.map((n) => n.id);
}
