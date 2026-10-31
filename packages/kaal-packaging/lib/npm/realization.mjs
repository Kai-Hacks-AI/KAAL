// The npm realization (packaging/A5, packaging/A6): asks npm what an npm package artifact
// delivers. npm is the authority on an npm tarball's contents, so Packaging parses no archive
// itself. It runs `npm pack --dry-run --json` on the artifact through Hosting, and checks what npm
// reports (packaging/N4), because npm checks none of it (plan/measurement/npm.md).
//
// npm's time and memory grow with the artifact, and Hosting bounds neither. So this is for
// artifacts of known provenance (packaging/N5).
import { execute, kind, readFile } from "kaal-hosting";

export const ecosystem = "npm";

/** The lowest npm accepted: the first 11.x that refuses a decompression bomb (packaging/N6). */
export const MINIMUM = "11.18.0";

const TARBALL = /\.(tgz|tar\.gz|tar)$/i;

/** Whether this realization reads the artifact at this location. npm reads only these as tarballs. */
export const reads = (artifact) => TARBALL.test(artifact);

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

/** Whether semantic version `a` is below `b`, comparing major, minor and patch. */
function below(a, b) {
  const x = SEMVER.exec(a).slice(1, 4).map(Number);
  const y = SEMVER.exec(b).slice(1, 4).map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i];
  return /-/.test(a.split("+")[0]);
}

const cut = (s) => (s.length > 200 ? `${s.slice(0, 200)}…` : s);

/**
 * The command that runs npm: `npm` through Hosting, or, when the caller gives `script`, the path of
 * a Node script that behaves as npm, run by this Node (packaging/A13). Packaging never finds a tool
 * by platform: how a command starts on a host is Hosting's.
 */
export const command = (script) => (script === undefined ? ["npm", []] : [process.execPath, [script]]);

/** Run npm with `args` in `work`, refusing when it cannot be started. */
async function npm(args, work, script) {
  const [file, prefix] = command(script);
  try {
    return await execute(file, [...prefix, ...args], { cwd: work });
  } catch (e) {
    throw new Error(`npm could not be run: ${cut(e.message)}`);
  }
}

/** The npm version that will describe the artifact, exactly as `npm --version` printed it. */
async function version(work, script) {
  const r = await npm(["--version"], work, script);
  const printed = r.stdout.trim();
  if (r.status !== 0) throw new Error(`npm --version exited ${r.status}`);
  if (!SEMVER.test(printed)) throw new Error(`npm --version printed ${JSON.stringify(cut(printed))}, which is not a semantic version`);
  if (below(printed, MINIMUM)) throw new Error(`npm ${printed} is below ${MINIMUM}, the lowest npm that refuses a decompression bomb`);
  return printed;
}

/** npm's error, when its output carries one: its code and summary. */
function failure(stdout) {
  try {
    const { error } = JSON.parse(stdout);
    if (error && typeof error === "object") return `${error.code ?? "no code"}: ${cut(String(error.summary ?? ""))}`;
  } catch {
    // Not npm's error form.
  }
  return "no error was reported";
}

/** The members a description must have. npm writes others too (`id`, `shasum`, `bundled`…), which Packaging ignores. */
const KEYS = ["entryCount", "files", "name", "size", "unpackedSize", "version"];

/**
 * What npm reports for the tarball at the absolute location `artifact`, run in the directory
 * `work`, within `limits`, by the npm `script` names (default: `npm`): the tool, the package's name and version, the packed size npm read,
 * its entry count and unpacked size, and every file's path and size, as npm stated them.
 */
export async function describe(artifact, work, limits, script) {
  const tool = { name: "npm", version: await version(work, script) };
  const r = await npm(
    ["pack", "--dry-run", "--json", "--ignore-scripts", "--offline", "--cache", `${work}/cache`, "--logs-max=0", "--no-update-notifier", "--userconfig", `${work}/npmrc`, "--", artifact],
    work,
    script,
  );
  if (r.stdout.length > limits.output) throw new Error(`npm ${tool.version} wrote more than the output limit of ${limits.output} characters`);
  if (r.status !== 0) throw new Error(`npm ${tool.version} could not describe the artifact: it exited ${r.status}, ${failure(r.stdout)}`);
  let parsed;
  try {
    parsed = JSON.parse(r.stdout);
  } catch {
    throw new Error(`npm ${tool.version} reported something that is not JSON`);
  }
  const d = Array.isArray(parsed) && parsed.length === 1 ? parsed[0] : null;
  const shaped =
    d !== null &&
    typeof d === "object" &&
    KEYS.every((k) => k in d) &&
    typeof d.name === "string" &&
    typeof d.version === "string" &&
    [d.size, d.unpackedSize, d.entryCount].every(Number.isSafeInteger) &&
    Array.isArray(d.files) &&
    d.files.every((f) => f && typeof f === "object" && typeof f.path === "string" && Number.isSafeInteger(f.size) && f.size >= 0);
  if (!shaped) throw new Error(`npm ${tool.version} reported something that is not a description of one package`);
  return { tool, name: d.name, version: d.version, packed: d.size, entries: d.entryCount, unpacked: d.unpackedSize, files: d.files.map(({ path, size }) => ({ path, size })) };
}

/** A registry tarball: an http(s) URL to a `.tgz`, as npm records a package it fetched from a registry. */
const REGISTRY_TARBALL = /^https?:\/\/[^\s]+\.tgz$/;

/** `p` without the separators it ends with. A loop, not a regular expression, so its time stays linear in `p`. */
function trimmed(p) {
  let end = p.length;
  while (end > 0 && (p[end - 1] === "/" || p[end - 1] === "\\")) end--;
  return p.slice(0, end);
}

/** `path` under `dir`, whatever separators `dir` ends with. */
const under = (dir, path) => `${trimmed(dir)}/${path}`;

/** The consumer's install record: npm's hidden lockfile, else the project's lockfile; null when neither is readable. */
async function installRecord(root) {
  for (const path of ["node_modules/.package-lock.json", "package-lock.json"]) {
    const at = under(root, path);
    if ((await kind(at)) !== "file") continue;
    try {
      const lock = JSON.parse((await readFile(at)).toString("utf8"));
      if (lock && typeof lock.packages === "object" && lock.packages !== null) return lock.packages;
    } catch {
      // An unreadable lockfile records nothing; the next one may.
    }
  }
  return null;
}

/** The install record's key for the package at `dir` inside `root`, such as `node_modules/kaal-x`; null when it is not inside. */
function keyOf(dir, root) {
  const slashed = (p) => trimmed(p).split("\\").join("/");
  const d = slashed(dir);
  const r = slashed(root);
  return d.startsWith(`${r}/`) ? d.slice(r.length + 1) : null;
}

/** The record of `dep` as the package keyed `key` loads it: nested first, then each enclosing node_modules, as Node resolves. */
function recordOf(packages, key, dep) {
  const bases = [key];
  for (let base = key, i = base.lastIndexOf("/node_modules/"); i >= 0; i = base.lastIndexOf("/node_modules/")) bases.push((base = base.slice(0, i)));
  for (const base of bases) if (`${base}/node_modules/${dep}` in packages) return packages[`${base}/node_modules/${dep}`];
  return packages[`node_modules/${dep}`];
}

/**
 * packaging/F19: where the consumer's install at `root` shows that the package at `dir` got its
 * dependency `name`, pinned at `spec`. It is `verified` only for a registry tarball with an
 * integrity at that version; a `file:`, link, Git or path resolution is `failed`; what the install
 * does not record is `unknown` (`absent` when it records no entry at all).
 */
export async function resolution(root, dir, name, spec) {
  const packages = await installRecord(root);
  if (packages === null) return { result: "unknown", cause: `the consumer has no install record (node_modules/.package-lock.json or package-lock.json), so where ${name} came from cannot be told` };
  const key = keyOf(dir, root);
  if (key === null) return { result: "unknown", cause: `the package is not installed inside the consumer, so where ${name} came from cannot be read` };
  const r = recordOf(packages, key, name);
  if (r === undefined || r === null || typeof r !== "object") return { result: "unknown", absent: true, cause: `the install records no resolution for ${name}` };
  if (r.link === true) return { result: "failed", cause: `${name} is linked to ${JSON.stringify(r.resolved ?? "a local directory")}, not installed from a registry` };
  if (typeof r.resolved !== "string") return { result: "unknown", cause: `the install records ${name} with no resolved location` };
  if (!REGISTRY_TARBALL.test(r.resolved)) return { result: "failed", cause: `${name} resolved from ${JSON.stringify(r.resolved)}, not from a registry` };
  if (typeof r.integrity !== "string" || r.integrity === "") return { result: "unknown", cause: `${name} resolved from ${r.resolved} with no integrity recorded` };
  if (r.version !== spec) return { result: "failed", cause: `${name} installed at ${JSON.stringify(r.version)}, not ${spec}` };
  return { result: "verified", cause: `${name}@${spec} resolved from a registry` };
}
