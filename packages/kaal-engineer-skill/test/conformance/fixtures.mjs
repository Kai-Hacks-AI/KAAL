// Writes the shared fixtures to disk, through kaal-hosting, so that both
// validators judge the same bytes, and reads KAAL's verdict the way the
// check-skill entry point reaches it.
import { join } from "node:path";
import { checkSkill } from "kaal-engineer-skill";
import { initialize, read } from "@kaihacksai/kaal-hosting";
import { CASES } from "./cases.mjs";

/** Write every case under `root` as <root>/<case id>/<skill dir>; returns [{ case, dir }]. */
export async function materialize(root) {
  const out = [];
  for (const c of CASES) {
    const files = Object.fromEntries(Object.entries(c.files).map(([path, text]) => [path, Buffer.from(text, "utf8")]));
    const dir = join(root, c.id, c.dir ?? "my-skill");
    await initialize(dir, files);
    out.push({ case: c, dir });
  }
  return out;
}

/** KAAL's verdict on a skill directory, as check-skill reaches it: its findings and their summary. */
export async function kaal(dir, name) {
  const found = checkSkill(name, await read(dir));
  const kinds = ["standard", "kaal"].filter((k) => found[k].length > 0);
  const verdict = kinds.length > 0 ? kinds.join("+") : found.warnings.length > 0 ? "warning" : "ok";
  return { verdict, messages: [...found.standard.map((m) => `standard: ${m}`), ...found.kaal.map((m) => `kaal: ${m}`), ...found.warnings.map((m) => `warning: ${m}`)] };
}
