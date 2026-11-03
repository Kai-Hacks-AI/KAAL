// A trusted checker: the file or directory a check names as `trusted`, taken from the base revision,
// never from the candidate. Guard establishes Git provenance only: which revision supplied the
// checker's files. The checker then runs in the environment at hand; what it imports from elsewhere,
// its interpreter and the rest of its environment are outside what Guard vouches for.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** A repository-relative path that stays inside the repository: no "..", not absolute. */
export const safePath = (path) => typeof path === "string" && path !== "" && !/^([a-zA-Z]:)?[\\/]/.test(path) && !path.split(/[\\/]/).includes("..");

const git = (root, args, encoding) => spawnSync("git", args, { cwd: root, stdio: ["ignore", "pipe", "pipe"], ...(encoding ? { encoding } : {}) });

/**
 * Writes the trusted files, as the base revision holds them, under `into`, at their
 * repository-relative paths. Returns { commit, files } or { problem, todo }.
 */
export function materialize(root, base, trusted, into) {
  const path = trusted.replace(/\\/g, "/").replace(/\/+$/, "");
  const commit = git(root, ["rev-parse", "--verify", "--quiet", `${base}^{commit}`], "utf8");
  if (commit.status !== 0) return { problem: `the base ${base} is not a commit here`, todo: "fetch the base commit" };
  const sha = commit.stdout.trim();
  const tree = git(root, ["ls-tree", "-r", "-z", "--full-tree", sha, "--", path], "utf8");
  if (tree.status !== 0) return { problem: `the base ${sha} cannot be read`, todo: "fetch the base commit" };
  const entries = tree.stdout.split("\0").filter(Boolean).map((e) => {
    const [meta, file] = e.split("\t");
    const [mode, type, object] = meta.split(" ");
    return { mode, type, object, file };
  }).filter((e) => e.file === path || e.file.startsWith(`${path}/`));
  if (entries.length === 0) return { problem: `the base ${sha} does not hold ${path}`, todo: `add ${path} to the base first` };
  const files = [];
  for (const e of entries) {
    if (e.type !== "blob" || e.mode === "120000") return { problem: `${e.file} on the base ${sha} is not a plain file`, todo: `make ${path} plain files` };
    const blob = git(root, ["cat-file", "blob", e.object]);
    if (blob.status !== 0) return { problem: `${e.file} cannot be read from the base ${sha}`, todo: "fetch the base commit" };
    mkdirSync(dirname(join(into, e.file)), { recursive: true });
    writeFileSync(join(into, e.file), blob.stdout, { mode: e.mode === "100755" ? 0o755 : 0o644 });
    files.push(e.file);
  }
  return { commit: sha, files };
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

/**
 * The text of every `.md` file directly in the repository-relative directory `dir`, as the base revision
 * holds it, by file name. Returns { commit, texts } or { problem, todo }. Only a resolved base without the
 * directory holds none: a base that resolves to no commit here is a problem, never an empty set, since
 * which checks it trusts is then unknown (guard/F7).
 */
export function baseTexts(root, base, dir) {
  const commit = git(root, ["rev-parse", "--verify", "--quiet", `${base}^{commit}`], "utf8");
  if (commit.status !== 0) return { problem: `the base ${base} is not a commit here`, todo: "fetch the base commit, or supply a base that names one" };
  const sha = commit.stdout.trim();
  const listed = git(root, ["ls-tree", "-z", "--full-tree", sha, "--", `${dir}/`], "utf8");
  if (listed.status !== 0) return { problem: `the base ${sha} cannot be read`, todo: "fetch the base commit" };
  const texts = {};
  for (const e of listed.stdout.split("\0").filter(Boolean)) {
    const [meta, file] = e.split("\t");
    const [mode, type, object] = meta.split(" ");
    const name = file.slice(dir.length + 1);
    if (type !== "blob" || mode === "120000" || !name.endsWith(".md") || name.includes("/")) continue;
    const blob = git(root, ["cat-file", "blob", object], "utf8");
    if (blob.status !== 0) return { problem: `${file} cannot be read from the base ${sha}`, todo: "fetch the base commit" };
    texts[name] = blob.stdout;
  }
  return { commit: sha, texts };
}
