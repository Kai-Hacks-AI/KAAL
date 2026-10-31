// The npm realization (packaging/A5, packaging/A6): asks npm what an npm package artifact
// delivers. npm is the authority on an npm tarball's contents, so Packaging parses no archive
// itself. It runs `npm pack --dry-run --json` on the artifact through Hosting, and checks what npm
// reports (packaging/N4), because npm checks none of it (plan/measurement/npm.md).
//
// npm's time and memory grow with the artifact, and Hosting bounds neither. So this is for
// artifacts of known provenance (packaging/N5).
import { execute } from "kaal-hosting";

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

/** npm as the host names it: run by name through Hosting, which resolves it (packaging/A13). */
export const NPM = Object.freeze({ command: "npm", args: Object.freeze([]) });

/** Run npm with `args` in `work`, refusing when it cannot be started. `tool` is the npm to run: a command and the arguments that come before npm's own. */
async function npm(args, work, tool = NPM) {
  try {
    return await execute(tool.command, [...tool.args, ...args], { cwd: work });
  } catch (e) {
    throw new Error(`npm could not be run: ${cut(e.message)}`);
  }
}

/** The npm version that will describe the artifact, exactly as `npm --version` printed it. */
async function version(work, tool) {
  const r = await npm(["--version"], work, tool);
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
 * `work`, within `limits`: the tool, the package's name and version, the packed size npm read,
 * its entry count and unpacked size, and every file's path and size, as npm stated them.
 */
export async function describe(artifact, work, limits, given = NPM) {
  const tool = { name: "npm", version: await version(work, given) };
  const r = await npm(
    ["pack", "--dry-run", "--json", "--ignore-scripts", "--offline", "--cache", `${work}/cache`, "--logs-max=0", "--no-update-notifier", "--userconfig", `${work}/npmrc`, "--", artifact],
    work,
    given,
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
