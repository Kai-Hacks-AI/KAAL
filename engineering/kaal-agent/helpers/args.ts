import { resolve } from "node:path";
import { DEFAULT_AGENTS_FILE, DEFAULT_KAAL_DIR } from "./agents-md.js";

/** Relative paths are taken from where the command was invoked, also when run through `npm run --prefix`. */
const base = process.env.INIT_CWD ?? process.cwd();

/** `[--agents <file>] [--kaal <dir>]`; the KAAL dir is relative to the AGENTS.md file's directory. */
export function parse(argv: string[], usage: string): { agentsFile: string; kaalDir: string } {
  const out = { agentsFile: resolve(base, DEFAULT_AGENTS_FILE), kaalDir: DEFAULT_KAAL_DIR };
  for (let i = 0; i < argv.length; i += 2) {
    const value = argv[i + 1];
    if (value === undefined || (argv[i] !== "--agents" && argv[i] !== "--kaal")) {
      console.error(usage);
      process.exit(2);
    }
    if (argv[i] === "--agents") out.agentsFile = resolve(base, value);
    else out.kaalDir = value.replace(/\/+$/, "");
  }
  return out;
}
