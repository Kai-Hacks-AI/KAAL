#!/usr/bin/env node
// review write <destination> --of <Name> --identity <id> --outcome findings|converged --reviewer <text|@file> [--findings <text|@file>]
// review check <file>
// review converged <directory> <identity>
// The one definition of a round of review's canonical form, and the only way
// this capability makes one: the reviewer supplies the texts, never the structure.
//
//   # Review
//
//   <Name>: <identity>
//   Result: findings | converged
//
//   ## Reviewer
//
//   <text>
//
//   ## Findings
//
//   <text>
//
// `<Name>` is a capitalised word naming the result reviewed and `<identity>` is
// one token naming it exactly as it stood. A converged round's findings are
// "None."; a round with findings states them, and they are never "None.". The
// Reviewer part comes first and the Findings part follows; any other part the
// reviewer adds, between or after, is the reviewer's own account and is not
// judged, but it cannot redefine either reserved part, and no text may hold a
// line starting with "Result:" or "<Name>:" (a round has exactly one of each).
// `write` creates the file and never replaces one; `check` exits 0 only for a
// round; `converged` exits 0 only when the rounds NN.md in a directory, from 01
// without a gap, end with a round that says converged and names the identity.
// Which result, who reviews, when review is owed and what follows are decided
// by whatever asks for it, not here; nor can this show that the Reviewer's
// statement of authority and independence is true. A text given as `@path` is
// read from that file. Nothing here writes except `write`.
import { existsSync, lstatSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const OUTCOMES = ["findings", "converged"];
export const NONE = "None.";

const clean = (text) => text.replace(/\r\n?/g, "\n").trim();
const NAME = /^[A-Z][A-Za-z]*$/;
const IDENTITY = /^\S+$/;
/** The lines that belong to the round alone: its result and the line naming what was reviewed. A round has exactly one of each. */
const reserved = (of) => new RegExp(`^(Result|${of}):`, "m");

function part(label, raw, of) {
  const text = clean(String(raw ?? ""));
  if (text === "") throw new Error(`${label} is empty`);
  if (reserved(of).test(text)) throw new Error(`${label} has a line starting with 'Result:' or '${of}:': those lines belong to the round alone, so a reader of the round finds exactly one of each; indent it or quote it`);
  if (/^#/m.test(text)) throw new Error(`${label} has a line starting with '#': a round has no headings of its own besides its parts`);
  return text;
}

/** The canonical form of a round. `findings` is required for the outcome findings and refused for converged. */
export function render({ of, identity, outcome, reviewer, findings }) {
  if (typeof of !== "string" || !NAME.test(of) || of === "Result") throw new Error("--of names the result reviewed: one capitalised word, such as Work");
  if (typeof identity !== "string" || !IDENTITY.test(identity)) throw new Error("--identity is the exact identity of the result as reviewed: one token, no spaces");
  if (!OUTCOMES.includes(outcome)) throw new Error(`--outcome is ${OUTCOMES.join(" or ")}`);
  const who = part("the Reviewer statement (under whose authority, in what independence)", reviewer, of);
  let body;
  if (outcome === "converged") {
    if (findings !== undefined) throw new Error("a converged round has no findings: its findings are 'None.'");
    body = NONE;
  } else {
    if (findings === undefined) throw new Error("a round with findings states them: --findings");
    body = part("the findings", findings, of);
    if (body === NONE) throw new Error("a round with findings cannot say 'None.': say converged instead");
  }
  return `# Review\n\n${of}: ${identity}\nResult: ${outcome}\n\n## Reviewer\n\n${who}\n\n## Findings\n\n${body}\n`;
}

/** What a round says, or undefined for anything that is not a round. */
export function parse(content) {
  const m = /^# Review\n\n([A-Z][A-Za-z]*): (\S+)\nResult: (findings|converged)\n\n(## Reviewer\n\n[\s\S]*\n)$/.exec(content);
  if (!m || m[1] === "Result") return undefined;
  const [, of, identity, outcome, rest] = m;
  const lines = content.split("\n");
  if (lines.filter((l) => l.startsWith("Result:")).length !== 1 || lines.filter((l) => l.startsWith(`${of}:`)).length !== 1) return undefined;
  const parts = new Map();
  for (const section of rest.split(/\n(?=## )/)) {
    const h = /^## (.+)\n\n([\s\S]*)$/.exec(section);
    if (!h) return undefined;
    if (h[1] === "Reviewer" || h[1] === "Findings") {
      if (parts.has(h[1])) return undefined; // the reserved parts occur once and cannot be redefined
      parts.set(h[1], h[2].replace(/\n+$/, ""));
    }
  }
  const reviewer = parts.get("Reviewer");
  const findings = parts.get("Findings");
  if (reviewer === undefined || reviewer.trim() === "" || /^#/m.test(reviewer)) return undefined;
  if (findings === undefined || findings.trim() === "") return undefined;
  if (rest.indexOf("## Reviewer\n\n") !== 0 || rest.indexOf("\n## Findings\n\n") < 0) return undefined;
  if ((outcome === "converged") !== (findings === NONE)) return undefined;
  return { of, identity, outcome, reviewer, findings };
}

/** Whether `content` is a round. */
export const isRound = (content) => parse(content) !== undefined;

/** Create a round at `destination`; refuses to replace anything. */
export function write(destination, given) {
  const content = render(given);
  if (existsSync(destination)) throw new Error(`${destination} exists: a round is written once and never replaced`);
  writeFileSync(destination, content, { flag: "wx" });
}

/** The rounds of `directory`, in order, and what is wrong with them. */
export function rounds(directory) {
  const found = [];
  const problems = [];
  if (!existsSync(directory) || !lstatSync(directory).isDirectory()) return { rounds: found, problems: [`${directory} is not a directory of rounds`] };
  const names = readdirSync(directory).sort();
  for (const [i, name] of names.entries()) {
    if (name !== `${String(i + 1).padStart(2, "0")}.md`) { problems.push(`${name} is not the next round: rounds are 01.md, 02.md, … without a gap and with nothing else`); continue; }
    const path = join(directory, name);
    const round = lstatSync(path).isFile() ? parse(readFileSync(path, "utf8")) : undefined;
    if (!round) problems.push(`${name} is not a round`); else found.push({ name, ...round });
  }
  return { rounds: found, problems };
}

/** Whether review has converged on exactly `identity`: no problem, and the latest round says converged and names it. */
export function converged(directory, identity) {
  const { rounds: found, problems } = rounds(directory);
  const latest = found[found.length - 1];
  if (problems.length) return { ok: false, problems };
  if (!latest) return { ok: false, problems: ["there is no round"] };
  if (latest.outcome !== "converged") return { ok: false, problems: [`${latest.name} says ${latest.outcome}`] };
  if (latest.identity !== identity) return { ok: false, problems: [`${latest.name} converged on ${latest.of} ${latest.identity}, not on ${identity}`] };
  return { ok: true, problems: [] };
}

const FLAGS = ["--of", "--identity", "--outcome", "--reviewer", "--findings"];
const REQUIRED = ["--of", "--identity", "--outcome", "--reviewer"];

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, target, ...rest] = process.argv.slice(2);
  const usage = "usage: review write <destination> --of <Name> --identity <id> --outcome findings|converged --reviewer <text|@file> [--findings <text|@file>] | review check <file> | review converged <directory> <identity>";
  try {
    if (command === "check" && target && rest.length === 0) {
      process.exitCode = isRound(readFileSync(target, "utf8")) ? 0 : 1;
    } else if (command === "converged" && target && rest.length === 1) {
      const r = converged(target, rest[0]);
      for (const p of r.problems) console.error(p);
      process.exitCode = r.ok ? 0 : 1;
    } else if (command === "write" && target && rest.length % 2 === 0) {
      const given = {};
      for (let i = 0; i < rest.length; i += 2) {
        if (!FLAGS.includes(rest[i]) || rest[i] in given) throw Object.assign(new Error(usage), { usage: true });
        given[rest[i]] = rest[i + 1].startsWith("@") ? readFileSync(rest[i + 1].slice(1), "utf8") : rest[i + 1];
      }
      if (!REQUIRED.every((f) => f in given)) throw Object.assign(new Error(usage), { usage: true });
      write(target, { of: given["--of"], identity: given["--identity"], outcome: given["--outcome"], reviewer: given["--reviewer"], findings: given["--findings"] });
      console.log(target);
    } else {
      throw Object.assign(new Error(usage), { usage: true });
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = e.usage ? 2 : 1;
  }
}
