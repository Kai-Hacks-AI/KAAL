#!/usr/bin/env node
// incident write <kaal-dir> --happened <text> --expected <text> [--date YYYY-MM-DD]
// incident check <file>
// The one definition of a KAAL Incident carrier's canonical form, and the only way
// this capability makes one: the writer supplies two texts, never the structure.
//
//   # KAAL Incident
//
//   ## Happened
//
//   <text>
//
//   ## Expected
//
//   <text>
//
// each text non-empty, newlines as "\n", one final newline, no other heading,
// nothing before or after. `write` creates the next file, `incidents/YY/MM/DD/CC.md`
// inside the KAAL directory (dated in UTC; CC is 01 to 99, one after the highest
// of that day, no gap reused), and never replaces one; `check` exits 0 only for
// exactly this form. Whether, how or when a carrier leaves the client is not
// decided here. A text given as `@path` is read from that file.
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const TITLE = "KAAL Incident";
export const DIRECTORY = "incidents";
export const PARTS = ["Happened","Expected"];

const clean = (text) => text.replace(/\r\n?/g, "\n").trim();

/** The canonical form of a carrier whose parts are `texts`, in the order of PARTS. */
export function render(texts) {
  if (!Array.isArray(texts) || texts.length !== PARTS.length) throw new Error(`a carrier has exactly ${PARTS.length} parts: ${PARTS.join(", ")}`);
  const body = texts.map((raw, i) => {
    const text = clean(String(raw));
    if (text === "") throw new Error(`${PARTS[i]} is empty: say what you know, plainly, rather than leave it blank`);
    if (/^#/m.test(text)) throw new Error(`${PARTS[i]} has a line starting with '#': a carrier has no headings of its own besides its parts`);
    return `## ${PARTS[i]}\n\n${text}\n`;
  });
  return `# ${TITLE}\n\n${body.join("\n")}`;
}

/** The texts of a carrier in canonical form, or undefined for anything else. */
export function parse(content) {
  const head = `# ${TITLE}\n\n`;
  if (!content.startsWith(head)) return undefined;
  const texts = [];
  let rest = content.slice(head.length);
  for (const [i, part] of PARTS.entries()) {
    const mark = `## ${part}\n\n`;
    if (!rest.startsWith(mark)) return undefined;
    rest = rest.slice(mark.length);
    const last = i + 1 === PARTS.length;
    const next = last ? rest.length : rest.indexOf(`\n## ${PARTS[i + 1]}\n\n`);
    if (next < 0) return undefined;
    texts.push(rest.slice(0, next).replace(/\n$/, ""));
    rest = rest.slice(next + (last ? 0 : 1));
  }
  if (rest !== "") return undefined;
  try {
    return render(texts) === content ? texts : undefined;
  } catch {
    return undefined;
  }
}

/** Whether `content` is exactly a carrier in canonical form. */
export const isCarrier = (content) => parse(content) !== undefined;

/** A real directory: a symbolic link is not one, so nothing is ever written through a link. */
const isDirectory = (path) => existsSync(path) && lstatSync(path).isDirectory();

/** Today in UTC, or `date` if given, as [YY, MM, DD]. */
function day(date) {
  const text = date ?? new Date().toISOString().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m || new Date(`${text}T00:00:00Z`).toISOString().slice(0, 10) !== text) throw new Error(`${text} is not a date, YYYY-MM-DD`);
  return [m[1].slice(2), m[2], m[3]];
}

/** Create the next carrier in `kaalDir`; returns its path relative to it. Refuses to replace anything. */
export function write(kaalDir, texts, date) {
  if (!isDirectory(join(kaalDir, "core"))) throw new Error(`${kaalDir} is not a KAAL directory: it has no core/`);
  const content = render(texts);
  const parts = [DIRECTORY, ...day(date)];
  const relative = join(...parts);
  const folder = join(kaalDir, relative);
  for (let i = 1; i <= parts.length; i++) {
    const step = join(kaalDir, ...parts.slice(0, i));
    if (lstatSync(step, { throwIfNoEntry: false }) && !isDirectory(step)) throw new Error(`${join(...parts.slice(0, i))} is not a directory of the KAAL directory itself (a link, or not a directory): nothing is written`);
  }
  const taken = isDirectory(folder) ? readdirSync(folder).map((f) => /^(\d{2})\.md$/.exec(f)).filter(Boolean).map((m) => Number(m[1])) : [];
  const next = Math.max(0, ...taken) + 1;
  if (next > 99) throw new Error(`${relative} already holds 99 carriers: that day is full`);
  mkdirSync(folder, { recursive: true });
  const name = `${String(next).padStart(2, "0")}.md`;
  writeFileSync(join(folder, name), content, { flag: "wx" });
  return join(relative, name);
}

const FLAGS = PARTS.map((p) => `--${p.toLowerCase()}`);
const usage = `usage: incident write <kaal-dir> ${FLAGS.map((f) => `${f} <text|@file>`).join(" ")} [--date YYYY-MM-DD] | incident check <file>`;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, target, ...rest] = process.argv.slice(2);
  try {
    if (command === "check" && target && rest.length === 0) {
      process.exitCode = isCarrier(readFileSync(target, "utf8")) ? 0 : 1;
    } else if (command === "write" && target && (rest.length === FLAGS.length * 2 || rest.length === FLAGS.length * 2 + 2)) {
      const given = {};
      for (let i = 0; i < rest.length; i += 2) {
        if (!(FLAGS.includes(rest[i]) || rest[i] === "--date") || rest[i] in given) throw Object.assign(new Error(usage), { usage: true });
        given[rest[i]] = rest[i] !== "--date" && rest[i + 1].startsWith("@") ? readFileSync(rest[i + 1].slice(1), "utf8") : rest[i + 1];
      }
      if (FLAGS.some((f) => !(f in given))) throw Object.assign(new Error(usage), { usage: true });
      console.log(write(target, FLAGS.map((f) => given[f]), given["--date"]));
    } else {
      throw Object.assign(new Error(usage), { usage: true });
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = e.usage ? 2 : 1;
  }
}
