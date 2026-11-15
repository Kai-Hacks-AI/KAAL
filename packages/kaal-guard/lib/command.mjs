// A check's command: a program and its arguments, written as words. It has no shell features (no
// pipes, redirection, variables or comments), so it means the same on every platform, or it cannot
// be judged.
import { existsSync } from "node:fs";
import { win32 } from "node:path";

const { extname, isAbsolute, join, resolve } = win32;

/**
 * A command's words: split on whitespace, with "double" or 'single' quotes grouping a word, and a
 * backslash escaping a character inside double quotes. Undefined when a quote is not closed.
 */
export function words(command) {
  const out = [];
  let word;
  let quote;
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    if (quote) {
      if (c === quote) quote = undefined;
      else if (quote === '"' && c === "\\" && i + 1 < command.length) word += command[++i];
      else word += c;
    } else if (c === '"' || c === "'") {
      quote = c;
      word ??= "";
    } else if (/\s/.test(c)) {
      if (word !== undefined) out.push(word);
      word = undefined;
    } else word = (word ?? "") + c;
  }
  if (quote) return undefined;
  if (word !== undefined) out.push(word);
  return out;
}

/** Characters cmd would read as syntax inside a batch program's command line, quoted or not. */
const CMD_SYNTAX = /["&|<>^%!\r\n]/;

/**
 * The Windows program a word names, found as Windows finds it: a path as given (relative to the
 * root), otherwise the first PATH directory holding the name with a PATHEXT extension.
 */
function findOnWindows(program, root, env, exists) {
  const extensions = (env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";").filter(Boolean);
  const candidates = (base) => (extname(base) ? [base] : extensions.map((e) => base + e.toLowerCase()));
  if (/[\\/]/.test(program)) return candidates(isAbsolute(program) ? program : resolve(root, program)).find(exists);
  const path = env.Path ?? env.PATH ?? "";
  for (const dir of path.split(";").filter(Boolean)) {
    const found = candidates(join(dir, program)).find(exists);
    if (found) return found;
  }
  return undefined;
}

/**
 * How to start a command's words on a platform: { file, args, options } for spawnSync, or
 * { problem } when the words cannot keep their meaning there.
 *
 * - Elsewhere than Windows, the program is started directly with its arguments.
 * - On Windows, a program found as .exe or .com, or not found at all (it then cannot start), is
 *   started directly too, and Node quotes its arguments.
 * - On Windows, a .cmd or .bat program (such as npm) runs only under cmd. Its line is built here
 *   with every word in double quotes, and a word holding a character cmd would read as syntax is
 *   refused, so cmd sees no syntax but the program and its plain arguments.
 */
export function plan(list, { root, platform = process.platform, env = process.env, exists = existsSync } = {}) {
  const [program, ...args] = list;
  if (platform !== "win32") return { file: program, args, options: {} };
  const found = findOnWindows(program, root, env, exists);
  if (!found || !/^\.(cmd|bat)$/i.test(extname(found))) return { file: found ?? program, args, options: {} };
  const unsafe = [found, ...args].find((w) => CMD_SYNTAX.test(w));
  if (unsafe !== undefined) return { problem: `"${unsafe}" holds a character cmd would read as syntax, and ${program} runs only under cmd` };
  const line = [found, ...args].map((w) => `"${w}"`).join(" ");
  return { file: env.ComSpec ?? "cmd.exe", args: ["/d", "/s", "/c", `"${line}"`], options: { windowsVerbatimArguments: true } };
}
