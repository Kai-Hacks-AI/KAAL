// What the acceptance cases share. They reach the package under test only by its name, as a
// consumer does, so in an installation they exercise the installed copy, and they write only to
// the operating system's temporary directory.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

/** The package's name, the only way the cases reach it. */
export const NAME = "@kaihacksai/kaal-hosting";

/** The directory of the package under test, as its name resolves. */
export const PACKAGE = dirname(fileURLToPath(import.meta.resolve(`${NAME}/package.json`)));

/** The package's own package.json, as installed. */
export const manifest = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));

/** The SHA-256 of some text or bytes, as lowercase hexadecimal. */
export const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** A fresh directory in the operating system's temporary directory. */
export const tmp = (prefix = "kaal-hosting-acceptance-") => mkdtempSync(join(tmpdir(), prefix));

/** A fresh directory holding `files`, each a `/`-separated path and its text. */
export function tree(files = {}) {
  const root = tmp();
  for (const [path, text] of Object.entries(files)) {
    const at = join(root, ...path.split("/"));
    mkdirSync(dirname(at), { recursive: true });
    writeFileSync(at, text);
  }
  return root;
}

/** Runs Node on `args`, resolving with its exit status and output, never rejecting on a status. */
export async function node(args, options = {}) {
  try {
    const { stdout, stderr } = await promisify(execFile)(process.execPath, args, { encoding: "utf8", ...options });
    return { status: 0, stdout, stderr };
  } catch (e) {
    if (typeof e.code !== "number") throw e;
    return { status: e.code, stdout: e.stdout, stderr: e.stderr };
  }
}

/** The Markdown table between `<!-- <marker> -->` and `<!-- /<marker> -->`, as rows of trimmed cells. */
export function table(text, marker) {
  const from = text.indexOf(`<!-- ${marker} -->`);
  const to = text.indexOf(`<!-- /${marker} -->`);
  if (from < 0 || to < from) throw new Error(`no ${marker} table`);
  return text
    .slice(from, to)
    .split(/\r?\n/)
    .filter((l) => l.startsWith("|") && !/^\|\s*-/.test(l))
    .slice(1)
    .map((l) =>
      l
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim().replace(/^`|`$/g, "")),
    );
}
