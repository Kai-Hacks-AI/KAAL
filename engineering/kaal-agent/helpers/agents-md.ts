// The first adapter of Agent: wire KAAL onto `AGENTS.md`.
// AGENTS.md only points into KAAL; the meaning stays in KAAL's artifacts. The
// wiring is one KAAL-owned fragment between two marker lines. Nothing else in
// the file is read, understood or touched.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

export const BEGIN = "<!-- kaal:begin -->";
export const END = "<!-- kaal:end -->";
export const DEFAULT_AGENTS_FILE = "AGENTS.md";
/** `.kaal` is only the default name of the KAAL directory. */
export const DEFAULT_KAAL_DIR = ".kaal";

/** The KAAL-owned fragment. `kaalDir` is relative to the directory holding AGENTS.md. */
export function fragment(kaalDir: string): string {
  return `${BEGIN}\nKAAL is present in \`${kaalDir}/\`. Load its agent instructions from there.\n${END}`;
}

type Located = { start: number; end: number } | undefined | Error;

function locate(text: string): Located {
  const begins = [...text.matchAll(new RegExp(BEGIN, "g"))].map((m) => m.index!);
  const ends = [...text.matchAll(new RegExp(END, "g"))].map((m) => m.index!);
  if (begins.length === 0 && ends.length === 0) return undefined;
  if (begins.length !== 1 || ends.length !== 1 || ends[0] < begins[0]) {
    return new Error(`expected exactly one ${BEGIN} followed by one ${END}, found ${begins.length} and ${ends.length}`);
  }
  return { start: begins[0], end: ends[0] + END.length };
}

/** Problems with the wiring in `agentsFile`; empty means wired as Agent requires. Never repairs. */
export function checkWiring(agentsFile: string, text: string | undefined, kaalDir: string): string[] {
  if (text === undefined) return [`${agentsFile} does not exist`];
  const found = locate(text);
  if (found === undefined) return [`${agentsFile} has no KAAL wiring`];
  if (found instanceof Error) return [`${agentsFile}: ${found.message}`];
  const problems: string[] = [];
  if (text.slice(found.start, found.end) !== fragment(kaalDir)) problems.push(`${agentsFile}: the KAAL fragment is not the expected wiring to ${kaalDir}/`);
  if (!existsSync(join(dirname(agentsFile), kaalDir, "core", "KERNEL.md"))) problems.push(`${kaalDir}/ is not a KAAL directory next to ${agentsFile}`);
  return problems;
}

/** `text` with the KAAL wiring established; undefined `text` means no file yet. Throws on a malformed fragment. */
export function wireText(agentsFile: string, text: string | undefined, kaalDir: string): string {
  const block = fragment(kaalDir);
  if (text === undefined || text.trim() === "") return `${block}\n`;
  const found = locate(text);
  if (found instanceof Error) throw new Error(`${agentsFile}: ${found.message}; not touched`);
  if (found) return text.slice(0, found.start) + block + text.slice(found.end);
  return `${text.replace(/\s*$/, "")}\n\n${block}\n`;
}
