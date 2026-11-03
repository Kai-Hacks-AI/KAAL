// Consumer boundary (foundation/F22, foundation/F23, foundation/N13, foundation/N14). Outer loop only: it reads a
// consumer's package.json, resolves Foundation by Node's own module resolution, and reads the files a digest list
// names. It never imports, runs or judges the consumer's code. Digests are this package's own sha256. It imports only
// node: modules and ./sha256.mjs.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { sha256 } from "./sha256.mjs";

const NAME = "@kaihacksai/kaal-foundation";
const EXIT = { verified: 0, failed: 1, "cannot verify": 2 };
const LINE = /^([0-9a-f]{64}) {2}(.+)$/;
const CERTIFY = "This shows only the observations above. It does not certify the consumer, that it uses Foundation in its code, or that the lists cover every digest it states.";

const combine = (observed) => (observed.includes("failed") ? "failed" : observed.every((r) => r === "verified") ? "verified" : "cannot verify");

/**
 * foundation/F22. `lists` is [{ name, text }] with text already read, or { name, error } when a list could not be
 * read. Each line is `<digest>  <file>`; a file is resolved against `cwd`.
 */
export function check(lists, cwd) {
  const causes = [];
  let checked = 0;
  let read = 0;
  for (const list of lists) {
    if (list.error !== undefined) {
      causes.push({ file: list.name, cause: "unreadable" });
      continue;
    }
    for (const raw of list.text.split(/\r?\n/)) {
      if (raw.trim() === "") continue;
      read++;
      const m = LINE.exec(raw);
      if (!m) {
        causes.push({ file: raw.length > 80 ? `${raw.slice(0, 80)}…` : raw, cause: "malformed" });
        continue;
      }
      let bytes;
      try {
        bytes = readFileSync(resolve(cwd, m[2]));
      } catch {
        causes.push({ file: m[2], cause: "unreadable" });
        continue;
      }
      checked++;
      if (sha256(bytes) !== m[1]) causes.push({ file: m[2], cause: "differs" });
    }
  }
  const result = causes.some((c) => c.cause === "differs") ? "failed" : causes.length === 0 && read > 0 ? "verified" : "cannot verify";
  return { result, exit: EXIT[result], checked, causes };
}

/** The result of the resolved copy's own `verify`, taken from its last line, or null. */
function resolvedVerification(directory) {
  const run = spawnSync(process.execPath, [join(directory, "bin", "kaal-foundation.mjs"), "verify"], { cwd: directory, encoding: "utf8" });
  const lines = (run.stdout ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const prefix = "kaal-foundation-verification ";
  const last = lines.at(-1) ?? "";
  if (!last.startsWith(prefix)) return null;
  try {
    const { result } = JSON.parse(last.slice(prefix.length));
    return result in EXIT ? { result, causes: JSON.parse(last.slice(prefix.length)).causes ?? [] } : null;
  } catch {
    return null;
  }
}

/** foundation/F23. `lists` as for check; the digest observation runs in the consumer's directory. */
export function boundary(consumerDirectory, lists) {
  const directory = resolve(consumerDirectory);
  const report = { result: "cannot verify", exit: 2, scope: ["resolution"], observations: { resolution: "cannot verify", digests: "not checked" }, consumer: null, resolved: null, check: null, causes: [] };
  const stop = (cause) => {
    report.causes.push(cause);
    return report;
  };

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  } catch (e) {
    return stop({ cause: "unreadable", detail: `package.json: ${e?.code ?? "not JSON"}` });
  }
  report.consumer = { name: manifest.name ?? null, version: manifest.version ?? null };
  if (!manifest.dependencies || typeof manifest.dependencies !== "object" || !(NAME in manifest.dependencies)) return stop({ cause: "not a consumer", detail: `${NAME} is not in dependencies` });

  let manifestPath;
  try {
    manifestPath = createRequire(join(directory, "package.json")).resolve(`${NAME}/package.json`);
  } catch {
    return stop({ cause: "unresolved", detail: `${NAME} does not resolve from the consumer` });
  }
  const resolvedDirectory = dirname(manifestPath);
  let version = null;
  try {
    version = JSON.parse(readFileSync(manifestPath, "utf8")).version ?? null;
  } catch {
    // the resolved copy's own verification names a damaged package.json
  }
  report.resolved = { version, directory: relative(directory, resolvedDirectory) || "." };

  const verified = resolvedVerification(resolvedDirectory);
  if (!verified) report.causes.push({ cause: "unverifiable", detail: "the resolved copy ended without a verification line" });
  else {
    report.observations.resolution = verified.result;
    for (const cause of verified.causes) report.causes.push({ cause: "resolved copy", detail: cause });
  }

  const observed = [report.observations.resolution];
  if (lists.length) {
    report.scope = ["resolution", "digests"];
    report.check = check(lists, directory);
    report.observations.digests = report.check.result;
    observed.push(report.check.result);
    for (const cause of report.check.causes) report.causes.push({ cause: `digest list: ${cause.cause}`, detail: cause.file });
  }
  report.result = combine(observed);
  report.exit = EXIT[report.result];
  return report;
}

/** The human lines above the JSON line; they never claim more than the observations made (foundation/F23). */
export function summary(report) {
  return [
    `boundary: ${report.result}`,
    `resolution: ${report.observations.resolution}`,
    `digest agreement: ${report.observations.digests}`,
    CERTIFY,
  ];
}
