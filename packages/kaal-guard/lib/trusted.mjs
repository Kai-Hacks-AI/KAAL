// A trusted checker: the files a check names as `trusted`, taken from the base commit, never from
// the candidate. Exactly these files are trusted. The checker still reads the candidate's tree from
// the repository root as its input, and runs on the interpreter found on PATH.
//
// So that nothing the checker loads comes from elsewhere, Guard takes only JavaScript or TypeScript
// modules whose every import it can see: a Node built-in (node:…) or a relative path inside the
// trusted files. Anything it cannot establish that for is cannot judge.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";

const MODULE = /\.(mjs|cjs|js|mts|cts|ts)$/;

/** Literal module specifiers, and whether any import or require takes a computed one. */
function imports(source) {
  const literal = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*|\bexport\s*\*\s*from\s*)["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
  const computed = /\b(?:import|require)\s*\(\s*(?!["'`][^"'`$]*["'`]\s*\))/.test(source);
  return { literal, computed };
}

/** A repository-relative path that stays inside the repository: no "..", not absolute. */
export const safePath = (path) => typeof path === "string" && path !== "" && !/^([a-zA-Z]:)?[\\/]/.test(path) && !path.split(/[\\/]/).includes("..");

const git = (root, args, encoding) => spawnSync("git", args, { cwd: root, stdio: ["ignore", "pipe", "pipe"], ...(encoding ? { encoding } : {}) });

/**
 * Writes the trusted files, as the base commit holds them, under `into`, at their repository-relative
 * paths. Returns { files } or { problem, todo }.
 */
export function materialize(root, base, trusted, into) {
  const path = trusted.replace(/\\/g, "/").replace(/\/+$/, "");
  const tree = git(root, ["ls-tree", "-r", "-z", "--full-tree", base, "--", path], "utf8");
  if (tree.status !== 0) return { problem: `the base ${base} cannot be read`, todo: "fetch the base commit" };
  const entries = tree.stdout.split("\0").filter(Boolean).map((e) => {
    const [meta, file] = e.split("\t");
    const [mode, type, object] = meta.split(" ");
    return { mode, type, object, file };
  }).filter((e) => e.file === path || e.file.startsWith(`${path}/`));
  if (entries.length === 0) return { problem: `the base ${base} does not hold ${path}`, todo: `add ${path} to the base first` };
  const files = new Map();
  for (const e of entries) {
    if (e.type !== "blob" || e.mode === "120000") return { problem: `${e.file} on the base is not a plain file`, todo: `make ${path} plain files` };
    if (!MODULE.test(e.file)) return { problem: `${e.file} is not a JavaScript or TypeScript module, so what it loads cannot be established`, todo: `make the trusted checker a JavaScript or TypeScript module, or drop trusted` };
    const blob = git(root, ["cat-file", "blob", e.object]);
    if (blob.status !== 0) return { problem: `${e.file} cannot be read from the base`, todo: "fetch the base commit" };
    files.set(e.file, blob.stdout);
  }
  for (const [file, bytes] of files) {
    const { literal, computed } = imports(bytes.toString("utf8"));
    if (computed) return { problem: `${file} imports a module it names at run time, so what it loads cannot be established`, todo: "import only literal specifiers" };
    for (const s of literal) {
      if (s.startsWith("node:")) continue;
      const target = s.startsWith(".") ? posix.normalize(posix.join(posix.dirname(file), s)) : undefined;
      if (target === undefined || !files.has(target)) {
        return { problem: `${file} imports ${s}, which is not among the trusted files`, todo: `import only node: built-ins and files under ${path}, or name a directory as trusted` };
      }
    }
  }
  for (const [file, bytes] of files) {
    mkdirSync(dirname(join(into, file)), { recursive: true });
    writeFileSync(join(into, file), bytes);
  }
  return { files: [...files.keys()] };
}

/**
 * The command's words with every word that names a trusted path pointed at its base copy under
 * `into`. A word names it when it equals the trusted path, or a file under it, written
 * repository-relative. Undefined when no word names it.
 */
export function redirect(list, trusted, into) {
  const path = trusted.replace(/\\/g, "/").replace(/\/+$/, "");
  let named = false;
  const out = list.map((w) => {
    const plain = w.replace(/\\/g, "/").replace(/^\.\//, "");
    if (plain !== path && !plain.startsWith(`${path}/`)) return w;
    named = true;
    return join(into, plain);
  });
  return named ? out : undefined;
}
