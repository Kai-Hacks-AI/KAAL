import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { admit, candidates, sha256, type Ref } from "./nodes.js";
import { payload } from "./payload.js";

/**
 * What makes a Node a Skill and what makes it an Extension is the same
 * typing, by name and ID, and the same registration, over a different Core
 * Node. `id` is the identity of Core's own Node of that name: the SHA-256 of
 * the exact bytes this package carries for it. A Node merely named `Skill`
 * or `Extension` is not it; only these bytes are, so the anchor of the typing
 * is Core's and nothing admitted alongside it can take its place. `dir` is
 * where a capability's contribution is placed within the KAAL directory.
 */
interface Kind {
  name: string;
  id: string;
  dir: string;
}
const SKILL: Kind = { name: "Skill", id: sha256(payload()["core/Skill.md"]), dir: "skills" };
const EXTENSION: Kind = { name: "Extension", id: sha256(payload()["core/Extension.md"]), dir: "extensions" };
const CAPABILITY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** The files of an installed KAAL, keyed by path relative to its directory. */
function read(kaal: string): Record<string, Uint8Array> {
  const files: Record<string, Uint8Array> = {};
  for (const path of readdirSync(kaal, { recursive: true, encoding: "utf8" })) {
    if (statSync(join(kaal, path)).isFile()) files[path.split("\\").join("/")] = readFileSync(join(kaal, path));
  }
  return files;
}

/**
 * The Skills installed in a KAAL directory: the admitted Nodes whose type is
 * exactly `{ name: Skill, id: <Core's Skill ID> }`, as `{ name, id }`
 * references in name then ID order. This is the same typing registration is,
 * so nothing is looked up: no registry, no path, no package layout is
 * consulted, and a Node is found wherever its files store it. A KAAL in which
 * Core's `Skill` Node is not admitted has no Skills.
 */
export function installedSkills(kaal: string): Ref[] {
  return installed(kaal, SKILL);
}

/**
 * The Extensions installed in a KAAL directory, found the way Skills are and
 * by Core's own `Extension` Node: the admitted Nodes whose type is exactly
 * `{ name: Extension, id: <Core's Extension ID> }`, as `{ name, id }`
 * references in name then ID order. A KAAL in which Core's `Extension` Node
 * is not admitted has no Extensions.
 */
export function installedExtensions(kaal: string): Ref[] {
  return installed(kaal, EXTENSION);
}

function installed(kaal: string, kind: Kind): Ref[] {
  return admit(read(kaal))
    .filter((n) => n.type?.name === kind.name && n.type.id === kind.id)
    .map(({ name, id }) => ({ name, id }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : 1));
}

/**
 * Register a capability's KAAL Skill contribution with an installed KAAL, the
 * directory `payload()` deploys to. The contribution is capability-scoped: its
 * files are placed under `skills/<capability>/` of the KAAL directory, in the
 * paths it carries, and it may hold several Nodes. `contribution` is exactly
 * its Nodes (files keyed by path within the capability) and each Node's own
 * seal marker `seals/<ID>`.
 *
 * What a Node is, its identity, its seal and its admission are the Node
 * machinery's (`admit`); this only decides what a Skill contribution is: every
 * carried Node is typed and admitted into the installed KAAL together with
 * the contribution, and at least one is typed, by name and ID, by the
 * installed KAAL's admitted `Skill` Node. Registering keeps every Node's
 * bytes, so identities are unchanged; registering the same contribution again
 * changes nothing, and a registered path is never given other bytes: changed
 * bytes are another Node. All checks run before anything is written; if a
 * write then fails, what was written is removed, and a crash between writes
 * can leave only Nodes without seals, which are not admitted, so registering
 * again completes it. A Node's type is its registration, so no registry is
 * kept. Returns the IDs of the Skills, the Nodes typed by `Skill`.
 */
export function registerSkill(kaal: string, capability: string, contribution: Record<string, string>): string[] {
  return register(kaal, SKILL, capability, contribution);
}

/**
 * Register a capability's KAAL Extension contribution with an installed KAAL
 * directory, exactly as `registerSkill` registers a Skill's, but typed by
 * Core's `Extension` Node and placed under `extensions/<capability>/`. Every
 * rule of `registerSkill` holds: nothing is registered unless every carried
 * Node is typed and admitted and at least one is typed, by name and ID, by
 * the installed KAAL's admitted `Extension` Node. Returns the IDs of the
 * Extensions, the Nodes typed by `Extension`.
 */
export function registerExtension(kaal: string, capability: string, contribution: Record<string, string>): string[] {
  return register(kaal, EXTENSION, capability, contribution);
}

function register(kaal: string, kind: Kind, capability: string, contribution: Record<string, string>): string[] {
  if (!CAPABILITY.test(capability)) throw new Error("a capability is named in lowercase letters, digits and single hyphens");
  const paths = Object.keys(contribution);
  for (const path of paths) {
    if (path.startsWith("/") || path.split("/").some((s) => s === ".." || s === "." || s === "")) throw new Error(`${path} is not a path within the capability`);
  }
  const markers = paths.filter((p) => p.startsWith("seals/"));
  const files = paths.filter((p) => !p.startsWith("seals/"));
  if (files.length === 0) throw new Error("a contribution carries at least one Node");

  const nodes = candidates(contribution);
  const own = new Set(nodes.map((n) => n.id));
  if (nodes.length !== files.length) throw new Error("a contribution is Nodes and their seals, nothing else");
  for (const marker of markers) if (!own.has(marker.slice("seals/".length)) || contribution[marker] !== "") throw new Error(`${marker} is not an empty seal of a carried Node`);

  const target = (path: string): string => `${kind.dir}/${capability}/${path}`;
  const present = read(kaal);
  const anchor = admit(present).find((n) => n.id === kind.id);
  const admitted = new Set(
    admit({
      ...present,
      ...Object.fromEntries(files.map((p) => [target(p), contribution[p]])),
      ...Object.fromEntries(markers.map((m) => [m, ""])),
    }).map((n) => n.id),
  );
  for (const n of nodes) {
    if (!n.type) throw new Error(`${n.path} declares no type: only a genesis Node does`);
    if (!admitted.has(n.id)) throw new Error(`${n.path} is not admitted: it is unsealed, or its type does not resolve, by name and ID, to an admitted Node`);
  }
  const typed = nodes.filter((n) => anchor && n.type?.name === kind.name && n.type.id === anchor.id);
  if (typed.length === 0) throw new Error(`a contribution carries a Node typed by the admitted ${kind.name} Node of this KAAL, by name and ID`);

  const planned = [
    ...files.map((p) => ({ file: join(kaal, target(p)), bytes: contribution[p] })),
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
  return typed.map((n) => n.id);
}
