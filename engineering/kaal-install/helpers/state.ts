// Installing the delivery into a checkout, and checking that a checkout holds
// it. Sealed material (everything in the KAAL directory except AGENTS.md) is
// append-only: an installed file with other bytes is refused, as Core's
// registration refuses it. Unsealed derived files (AGENTS.md and the host's
// Agent Skills) are made to match the packages. `changes/` is genuine
// installed state: it is neither read nor written here, and neither are the
// seals of Changes, `seals/changes/`, which belong to it. The bare `seals/<ID>`
// markers remain Node seals and are still judged.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CHANGES, Delivery, Files, HOST_SKILLS, KAAL_DIR, nodes, read } from "./delivery.js";

/** The one derived file of the KAAL directory that is not sealed. */
const UNSEALED = "AGENTS.md";

const CHANGE_SEALS = "seals/changes";
const underChanges = (path: string) => [CHANGES, CHANGE_SEALS].some((dir) => path === dir || path.startsWith(`${dir}/`));

/** The derived files installed in the KAAL directory of `target`, and its host skills of the delivered capabilities. */
function installed(target: string, d: Delivery): { kaal: Files; skills: Files } {
  const dir = join(target, KAAL_DIR);
  const kaal = existsSync(dir) ? Object.fromEntries(Object.entries(read(dir)).filter(([p]) => !underChanges(p))) : {};
  const host = join(target, HOST_SKILLS);
  const all = existsSync(host) ? read(host) : {};
  return { kaal, skills: Object.fromEntries(Object.entries(all).filter(([p]) => d.capabilities.includes(p.split("/")[0]))) };
}

/** What differs between `target` and the delivery; empty means it holds the delivery. Never repairs. */
export function check(target: string, d: Delivery): string[] {
  const problems: string[] = d.unresolved.map((s) => `the installed Skill ${s.name} (${s.id}) is delivered by no package`);
  const have = installed(target, d);
  const compare = (label: string, expected: Files, found: Files) => {
    for (const [path, bytes] of Object.entries(expected)) {
      if (!(path in found)) problems.push(`${label}/${path} is missing`);
      else if (found[path] !== bytes) problems.push(`${label}/${path} differs from what the packages deliver`);
    }
    for (const path of Object.keys(found)) if (!(path in expected)) problems.push(`${label}/${path} is not delivered by any package`);
  };
  compare(KAAL_DIR, d.kaal, have.kaal);
  compare(HOST_SKILLS, d.skills, have.skills);
  if (Object.keys(have.kaal).length > 0) {
    const found = nodes.candidates(have.kaal).length;
    const admitted = nodes.admit(have.kaal);
    if (admitted.length !== found) problems.push(`${KAAL_DIR} holds ${found - admitted.length} Node(s) that are not admitted`);
  }
  return problems;
}

/** Make `target` hold the delivery. Refuses, writing nothing, if sealed material would take other bytes. */
export function install(target: string, d: Delivery): void {
  const dir = join(target, KAAL_DIR);
  for (const [path, bytes] of Object.entries(d.kaal)) {
    const file = join(dir, path);
    if (path !== UNSEALED && existsSync(file) && readFileSync(file, "utf8") !== bytes) throw new Error(`${KAAL_DIR}/${path} exists with other bytes: changed bytes are another Node`);
  }
  const put = (file: string, bytes: string) => {
    if (existsSync(file) && readFileSync(file, "utf8") === bytes) return;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, bytes);
  };
  for (const [path, bytes] of Object.entries(d.kaal)) put(join(dir, path), bytes);
  const host = join(target, HOST_SKILLS);
  for (const path of Object.keys(installed(target, d).skills)) if (!(path in d.skills)) rmSync(join(host, path));
  for (const [path, bytes] of Object.entries(d.skills)) put(join(host, path), bytes);
}
