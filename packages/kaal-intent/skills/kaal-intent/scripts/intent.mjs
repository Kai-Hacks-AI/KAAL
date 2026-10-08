#!/usr/bin/env node
// intent check <file>
// intent identity <file>
// The least that can be said mechanically about an Intent, and its identity.
// An Intent is a text file that begins with the line `# Intent` (it may go on
// after a space, for a title) and says something after it. It is valid UTF-8, has
// no NUL and no carriage return, and ends with a newline, so that its bytes are
// the same wherever it is kept and its identity is stable. Nothing else is
// judged: whether it says what is wanted and why, whether its boundaries are
// clear, whether it has gone into how, and whether it is what the Owner wants,
// are not things a script can show. There is no template and no required part.
// The identity of an Intent is the SHA-256 of its exact bytes, lowercase hex:
// the identity a file has anywhere in KAAL. `check` exits 0 only for an Intent;
// `identity` prints the identity and exits 0 only for an Intent. Nothing here
// writes, and nothing here establishes an Intent: that is the Owner's.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** What is wrong with `bytes` as an Intent, or undefined if nothing is. */
export function problem(bytes) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return "not valid UTF-8";
  }
  if (text.includes("\0")) return "has a NUL";
  if (text.includes("\r")) return "has a carriage return: an Intent's line ends are \\n, so its identity is the same wherever it is kept";
  if (!text.endsWith("\n")) return "does not end with a newline";
  const [head, ...rest] = text.split("\n");
  if (!/^# Intent( .+)?$/.test(head)) return "does not begin with the line '# Intent'";
  if (rest.join("\n").trim() === "") return "says nothing after its head";
  return undefined;
}

/** The identity of an Intent: the SHA-256 of its exact bytes. */
export const identity = (bytes) => createHash("sha256").update(bytes).digest("hex");

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, file, ...rest] = process.argv.slice(2);
  if ((command !== "check" && command !== "identity") || !file || rest.length) {
    console.error("usage: intent check <file> | intent identity <file>");
    process.exitCode = 2;
  } else {
    try {
      const bytes = readFileSync(file);
      const why = problem(bytes);
      if (why) {
        console.error(`${file} is not an Intent: ${why}`);
        process.exitCode = 1;
      } else if (command === "identity") {
        console.log(identity(bytes));
      }
    } catch (e) {
      console.error(e.message);
      process.exitCode = 1;
    }
  }
}
