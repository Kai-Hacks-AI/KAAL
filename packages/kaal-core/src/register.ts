import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** The bootstrap Form: frontmatter of `name`, then optionally `type` as a `{name, id}` pair. */
const FORM = /^---\nname: (.+)\n(?:type:\n {2}name: (.+)\n {2}id: ([0-9a-f]{64})\n)?---\n/;
const SKILL = "Skill";

const sha256 = (bytes: string): string => createHash("sha256").update(bytes).digest("hex");

/** The Nodes an installed KAAL carries, with the IDs it has sealed. */
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
 * Register a KAAL Skill with an installed KAAL, the directory `payload()`
 * deploys to. `skill` is what the Skill arrives as: files keyed by path, being
 * exactly its Node and that Node's own seal marker `seals/<ID>`. The Node must
 * be typed, by name and ID, by the sealed `Skill` Node of the installed KAAL,
 * and every ID it refers to must be sealed there. Registering is only adding
 * those two files: the Node's bytes are kept as they are, so its ID is
 * unchanged, and registering it again changes nothing. A Node's type is its
 * registration, so no registry is kept. Returns the Skill's ID.
 */
export function registerSkill(kaal: string, skill: Record<string, string>): string {
  const paths = Object.keys(skill);
  const markers = paths.filter((p) => p.startsWith("seals/"));
  const files = paths.filter((p) => !p.startsWith("seals/"));
  if (files.length !== 1 || markers.length !== 1) throw new Error("a Skill is exactly one Node and its seal");
  const bytes = skill[files[0]];
  const form = FORM.exec(bytes);
  if (!form) throw new Error("a Skill is a Node: it declares the Form");
  const [, name, typeName, typeId] = form;
  const id = sha256(bytes);
  if (markers[0] !== `seals/${id}`) throw new Error("the seal is not this Node's own: its ID is the SHA-256 of its exact bytes");

  const { nodes, sealed } = installed(kaal);
  if (typeName !== SKILL || !nodes.some((n) => n.name === SKILL && n.id === typeId && sealed.has(n.id))) {
    throw new Error(`a Skill is typed by the sealed ${SKILL} Node of this KAAL, by name and ID`);
  }
  for (const [ref] of bytes.matchAll(/[0-9a-f]{64}/g)) {
    if (ref !== id && !sealed.has(ref)) throw new Error(`refers to ${ref}, which is not sealed in this KAAL`);
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(name)) throw new Error("a Skill's name is letters, digits, spaces and hyphens");

  const node = join(kaal, "skills", `${name.split(" ").join("-")}.md`);
  if (existsSync(node) && readFileSync(node, "utf8") !== bytes) throw new Error(`${name} is already registered as other bytes: changed bytes are another Node`);
  mkdirSync(dirname(node), { recursive: true });
  writeFileSync(node, bytes);
  mkdirSync(join(kaal, "seals"), { recursive: true });
  writeFileSync(join(kaal, "seals", id), "");
  return id;
}
