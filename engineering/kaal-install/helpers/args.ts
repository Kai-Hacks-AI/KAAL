import { resolve } from "node:path";

/** Relative paths are taken from where the command was invoked, also when run through `npm run --prefix`. */
const base = process.env.INIT_CWD ?? process.cwd();

/** `[--into <dir>]`, and with `selectable` also `[--select <Node ID>]...`: the checkout to install into or check, the current directory by default, and the exact Node IDs of Skills or Extensions to select. */
export function parse(argv: string[], usage: string, selectable = false): { target: string; select: string[] } {
  const out = { target: resolve(base), select: [] as string[] };
  for (let i = 0; i < argv.length; i += 2) {
    const value = argv[i + 1];
    const ok = argv[i] === "--into" || (selectable && argv[i] === "--select");
    if (value === undefined || !ok) {
      console.error(usage);
      process.exit(2);
    }
    if (argv[i] === "--into") out.target = resolve(base, value);
    else out.select.push(value);
  }
  return out;
}
