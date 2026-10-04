import { resolve } from "node:path";

/** Relative paths are taken from where the command was invoked, also when run through `npm run --prefix`. */
const base = process.env.INIT_CWD ?? process.cwd();

/** `[--into <dir>] [--skill <Node name>]...`: the checkout to install into or check (the current directory by default), and Skills to install by Node name. */
export function parse(argv: string[], usage: string, allowSkills = false): { target: string; skills: string[] } {
  const out = { target: resolve(base), skills: [] as string[] };
  for (let i = 0; i < argv.length; i += 2) {
    const value = argv[i + 1];
    if (value === undefined || (argv[i] !== "--into" && !(allowSkills && argv[i] === "--skill"))) {
      console.error(usage);
      process.exit(2);
    }
    if (argv[i] === "--into") out.target = resolve(base, value);
    else out.skills.push(value);
  }
  return out;
}
