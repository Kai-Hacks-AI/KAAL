import { resolve } from "node:path";

/** Relative paths are taken from where the command was invoked, also when run through `npm run --prefix`. */
const base = process.env.INIT_CWD ?? process.cwd();

/** `[--into <dir>]`: the checkout to install into or check; the current directory by default. */
export function parse(argv: string[], usage: string): { target: string } {
  if (argv.length === 0) return { target: resolve(base) };
  if (argv.length !== 2 || argv[0] !== "--into") {
    console.error(usage);
    process.exit(2);
  }
  return { target: resolve(base, argv[1]) };
}
