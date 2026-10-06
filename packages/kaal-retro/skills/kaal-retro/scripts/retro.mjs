#!/usr/bin/env node
// retro write <destination> --learned <text> --liked <text> --lacked <text> --longed <text>
// retro check <file>
// The one definition of a retrospective's canonical form, and the only way this
// capability makes one: the writer supplies four texts, never the structure.
//
//   # Retro
//
//   ## Learned
//
//   <text>
//
//   ## Liked
//   ...
//
// in that order, each text non-empty, newlines as "\n", one final newline, no
// other heading, nothing before or after. `write` creates the file and never
// replaces one; `check` exits 0 only for exactly this form. Whose retrospective
// it is, when one is owed and what it is about are decided by whatever asks for
// it, not here. A text given as `@path` is read from that file.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const PARTS = ["Learned", "Liked", "Lacked", "Longed"];

const clean = (text) => text.replace(/\r\n?/g, "\n").trim();

/** The canonical form of a retrospective whose four parts are `texts`, in the order of PARTS. */
export function render(texts) {
  if (!Array.isArray(texts) || texts.length !== PARTS.length) throw new Error(`a retrospective has exactly ${PARTS.length} parts: ${PARTS.join(", ")}`);
  const body = texts.map((raw, i) => {
    const text = clean(String(raw));
    if (text === "") throw new Error(`${PARTS[i]} is empty: say plainly that there is nothing honest to say, rather than leave it blank`);
    if (/^#/m.test(text)) throw new Error(`${PARTS[i]} has a line starting with '#': a retrospective has no headings of its own besides its parts`);
    return `## ${PARTS[i]}\n\n${text}\n`;
  });
  return `# Retro\n\n${body.join("\n")}`;
}

/** The four texts of a retrospective in canonical form, or undefined for anything else. */
export function parse(content) {
  const head = "# Retro\n\n";
  if (!content.startsWith(head)) return undefined;
  const texts = [];
  let rest = content.slice(head.length);
  for (const [i, part] of PARTS.entries()) {
    const mark = `## ${part}\n\n`;
    if (!rest.startsWith(mark)) return undefined;
    rest = rest.slice(mark.length);
    const next = i + 1 < PARTS.length ? rest.indexOf(`\n## ${PARTS[i + 1]}\n\n`) : rest.length;
    if (next < 0) return undefined;
    texts.push(rest.slice(0, next).replace(/\n$/, ""));
    rest = rest.slice(next + (i + 1 < PARTS.length ? 1 : 0));
  }
  if (rest !== "") return undefined;
  try {
    return render(texts) === content ? texts : undefined;
  } catch {
    return undefined;
  }
}

/** Whether `content` is exactly a retrospective in canonical form. */
export const isRetro = (content) => parse(content) !== undefined;

/** Create a retrospective at `destination`; refuses to replace anything. */
export function write(destination, texts) {
  const content = render(texts);
  if (existsSync(destination)) throw new Error(`${destination} exists: a retrospective is written once and never replaced`);
  writeFileSync(destination, content, { flag: "wx" });
}

const FLAGS = PARTS.map((p) => `--${p.toLowerCase()}`);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, target, ...rest] = process.argv.slice(2);
  const usage = `usage: retro write <destination> ${FLAGS.map((f) => `${f} <text|@file>`).join(" ")} | retro check <file>`;
  try {
    if (command === "check" && target && rest.length === 0) {
      process.exitCode = isRetro(readFileSync(target, "utf8")) ? 0 : 1;
    } else if (command === "write" && target && rest.length === FLAGS.length * 2) {
      const given = {};
      for (let i = 0; i < rest.length; i += 2) {
        if (!FLAGS.includes(rest[i]) || rest[i] in given) throw Object.assign(new Error(usage), { usage: true });
        given[rest[i]] = rest[i + 1].startsWith("@") ? readFileSync(rest[i + 1].slice(1), "utf8") : rest[i + 1];
      }
      write(target, FLAGS.map((f) => given[f]));
      console.log(target);
    } else {
      throw Object.assign(new Error(usage), { usage: true });
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = e.usage ? 2 : 1;
  }
}
