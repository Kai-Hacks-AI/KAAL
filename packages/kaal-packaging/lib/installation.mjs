// The installation check (packaging/C26, packaging/F46 to F51, plan/installation-check/plan.md).
// await verifyInstalled(dir, { run, resolve, verifier }) judges ONE installed package folder, in two parts:
//   installation  is what is installed the package that was published, whole and unaltered, with what it needs?
//   self          does the package do what it says? Its own self check, run only on a sound installation.
// The package result is `verified` only when both are. A failed installation means the self check is not run;
// an unknown installation caps the result at unknown. It reads no package name (packaging/N8, T123).
//
//   run       async (command, args, { cwd }) => { status, stdout, stderr }   runs the package's own self check
//             (Hosting's `execute` has this shape; the caller supplies it)
//   resolve   (dir, name) => version | { version, resolved, integrity, link } | undefined   reads the install record for a
//             prerequisite; the object form is also judged for where it came from
//   verifier  optional { dir, version }: a separately installed verifier that must be at the exact pinned
//             version and pass its own installation check before it judges anything
//
// Two profiles, chosen by an explicit marker that survives packing (never by the mere presence of dist/):
//   layout  the manifest dist/test/package-check/manifest.json is present; every listed path is inside dist/
//           or is one of npm's fixed root files
//   legacy  no layout marker, and the legacy manifest test/verify.json is present; files anywhere in the
//           package; the self check is the script package.json declares; its result is adapted
// The manifest is consistency, not provenance (testing/F14): it detects an accidental or partial change,
// not a malicious replacement of both. Trust in the package itself is the registry's integrity and provenance.
//
// Every host operation goes through Hosting (lib/host.mjs, packaging/A1, T6). Hosting has no operation that
// lists a directory without following links, so the listing runs a one-line Node script through Hosting's
// `execute`. That is the same transitional workaround as lib/structure.mjs and is replaced by packaging/C27.
import { execute, readFile, sha256 } from "./host.mjs";

/** `/`-separated join; Hosting accepts it on every host. */
const join = (...parts) => parts.join("/");

/** The fixed files npm delivers from the package root whatever `files` says. */
/** The files npm delivers from the package root whatever `files` says: one predicate for the generator, the checker and the payload check. */
const isRootFile = (path) => !path.includes("/") && (path === "package.json" || /^README(\..*)?$/i.test(path) || /^LICEN[CS]E(\..*)?$/i.test(path));
const LAYOUT_MANIFEST = "dist/test/package-check/manifest.json";
const LAYOUT_MARKER_DIR = "dist/test/package-check";
const LEGACY_MANIFEST = "test/verify.json";
/** An exact version, build metadata included: the same rule as the conformance check. */
const EXACT = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const CODE = /\.(mjs|cjs|js|ts)$/;
/** The one name this module exists to find in another package's code, composed so no package name is a literal here. */
const OWN_NAME = ["kaal", "packaging"].join("-");
const OWN_SPECIFIER = new RegExp(`(^|/)${OWN_NAME}(/|$)`);
/** Splits a source text into words, strings (quotes and template literals kept whole) and punctuation; comments are dropped. */
function tokens(code) {
  const out = [];
  for (let i = 0; i < code.length; ) {
    const c = code[i];
    if (c === "/" && code[i + 1] === "/") {
      while (i < code.length && code[i] !== "\n") i++;
    } else if (c === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      i = end === -1 ? code.length : end + 2;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < code.length && code[j] !== c) j += code[j] === "\\" ? 2 : 1;
      out.push({ type: "string", value: code.slice(i + 1, j) });
      i = j + 1;
    } else if (/[A-Za-z0-9_$]/.test(c)) {
      let j = i;
      while (j < code.length && /[A-Za-z0-9_$]/.test(code[j])) j++;
      out.push({ type: "word", value: code.slice(i, j) });
      i = j;
    } else {
      if (!/\s/.test(c)) out.push({ type: "punct", value: c });
      i++;
    }
  }
  return out;
}
/** The specifier of every static import, dynamic import and require call, read from tokens, never from inside a string. */
function specifiers(code) {
  const t = tokens(code);
  const found = [];
  for (let i = 0; i < t.length; i++) {
    const at = (k) => t[i + k];
    if (at(0).type !== "word") continue;
    const word = at(0).value;
    if (/^(?:from|import)$/.test(word) && at(1)?.type === "string") found.push(at(1).value);
    else if (/^(?:import|require)$/.test(word) && at(1)?.value === "(" && at(2)?.type === "string") found.push(at(2).value);
  }
  return found;
}
/** Only a bare package specifier can name a package: relative and absolute paths never do. */
const packageOf = (specifier) => (specifier.startsWith("@") ? specifier.split("/").slice(0, 2) : specifier.split("/").slice(0, 1)).join("/");
const importsOwn = (code) => specifiers(code).some((x) => !/^[./\\]/.test(x) && !/^[A-Za-z]:/.test(x) && OWN_SPECIFIER.test(packageOf(x)));
/** A registry archive: an http(s) URL under a registry's `/-/` path, as npm records a package it fetched from a registry. */
const REGISTRY_TARBALL = /^https?:\/\/[^\s]+\/-\/[^\s/]+$/;
const NOTE = "consistency, not provenance: the manifest detects an accidental or partial change, not a replaced package";
const EXIT = { verified: 0, failed: 1, unknown: 2 };

/** Every entry under `dir`, by `/` path with its type, never following a link. node_modules at the root is not listed. */
async function walk(dir) {
  const script = `
    const out = [];
    const go = (rel) => {
      for (const e of fs.readdirSync(rel === "" ? "." : rel, { withFileTypes: true })) {
        const at = rel === "" ? e.name : rel + "/" + e.name;
        if (rel === "" && e.name === "node_modules") continue;
        if (e.isSymbolicLink()) out.push({ path: at, type: "link" });
        else if (e.isDirectory()) { out.push({ path: at, type: "directory" }); go(at); }
        else if (e.isFile()) out.push({ path: at, type: "file" });
        else out.push({ path: at, type: "other" });
      }
    };
    go("");
    console.log(JSON.stringify(out));`;
  const r = await execute(process.execPath, ["-e", script], { cwd: dir });
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout.trim());
}

const text = async (path) => (await readFile(path)).toString("utf8");
const digest = async (path) => sha256(await readFile(path));

/** A manifest path that is not a plain relative `/` path inside the package. */
const hostile = (p) => typeof p !== "string" || p === "" || p.startsWith("/") || p.includes("\\") || p.split("/").some((s) => s === ".." || s === "." || s === "") || /^[A-Za-z]:/.test(p);

/** The package's own name for the output line: read from its package.json, never matched against a list. */
async function nameOf(dir) {
  try {
    const name = JSON.parse(await text(join(dir, "package.json"))).name;
    return typeof name === "string" && name ? name : "package";
  } catch {
    return "package";
  }
}

/** Only the installation half: { installation, profile, findings, pkg, manifest }. Never runs the package's code. */
async function installation(dir, { resolve }) {
  const findings = [];
  const unknown = (kind, path) => ({ installation: "unknown", findings: [...findings, { kind, path }] });
  let listing;
  try {
    listing = await walk(dir);
  } catch {
    return unknown("unlistable", ".");
  }
  const at = new Map(listing.map((e) => [e.path, e.type]));
  let pkg;
  try {
    pkg = JSON.parse(await text(join(dir, "package.json")));
  } catch {
    return unknown("package-json-unreadable", "package.json");
  }
  // The profile comes from an explicit marker, not from the presence of dist/.
  let profile;
  let manifestPath;
  if (at.get(LAYOUT_MANIFEST) === "file") [profile, manifestPath] = ["layout", LAYOUT_MANIFEST];
  else if (at.get(LAYOUT_MARKER_DIR) === "directory") {
    return { installation: "failed", profile: "layout", findings: [{ kind: "manifest-missing", path: LAYOUT_MANIFEST }], pkg };
  } else if (at.get(LEGACY_MANIFEST) === "file") [profile, manifestPath] = ["legacy", LEGACY_MANIFEST];
  else return { ...unknown("manifest-missing", `${LAYOUT_MANIFEST} or ${LEGACY_MANIFEST}`), pkg };
  let manifest;
  try {
    manifest = JSON.parse(await text(join(dir, manifestPath)));
    if (typeof manifest !== "object" || manifest === null || typeof manifest.files !== "object" || manifest.files === null || Array.isArray(manifest.files)) throw new Error("shape");
  } catch {
    return { ...unknown("manifest-unreadable", manifestPath), profile, pkg };
  }
  let failed = false;
  let observed = true;
  const add = (kind, path) => {
    findings.push({ kind, path });
    failed = true;
  };
  // Listed paths: well formed, and inside the delivered payload.
  const listed = Object.entries(manifest.files);
  for (const [path] of listed) {
    if (hostile(path) || (profile === "layout" && !path.startsWith("dist/") && !isRootFile(path))) add("refused-path", String(path));
  }
  const accepted = listed.filter(([path]) => !hostile(path) && (profile === "legacy" || path.startsWith("dist/") || isRootFile(path)));
  const wanted = new Set(accepted.map(([path]) => path));
  for (const [path, expected] of accepted) {
    const type = at.get(path);
    if (type === undefined) add("missing", path);
    else if (type === "link") add("link", path);
    else if (type !== "file") add("not-a-file", path);
    else {
      try {
        if ((await digest(join(dir, path))) !== expected) add("changed", path);
      } catch {
        observed = false;
        findings.push({ kind: "unreadable", path });
      }
    }
  }
  // The inventory is the delivered payload: the manifest itself and root node_modules are the only exceptions.
  for (const e of listing) {
    if (e.type === "directory") continue;
    if (e.path === manifestPath || wanted.has(e.path)) continue;
    add(e.type === "link" ? "link" : "unlisted", e.path);
  }
  // Prerequisites: exact versions only (F7), read from the install record.
  // An optional or peer dependency the install did not record may simply be absent (the same rule as the conformance
  // check); when it is present it must be at the exact version. A dependency that is absent cannot be judged.
  for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) {
    for (const [name, spec] of Object.entries(pkg[field] ?? {})) {
      if (typeof spec !== "string" || !EXACT.test(spec)) {
        add("prerequisite-not-exact", name);
        continue;
      }
      const have = await resolve(dir, name);
      if (have === undefined) {
        if (field === "dependencies") {
          observed = false;
          findings.push({ kind: "prerequisite-unresolved", path: name });
        }
      } else {
        // A bare version is the install record's version only. A record object also carries where it came from and
        // is judged by the same rules as the conformance check (packaging/F19): a registry tarball with an integrity.
        const record = typeof have === "object" && have !== null ? have : { version: have };
        if (record.version !== spec) add("prerequisite-version", name);
        else if (typeof have === "object") {
          if (record.link === true || (typeof record.resolved === "string" && !REGISTRY_TARBALL.test(record.resolved))) add("prerequisite-not-registry", name);
          else if (typeof record.resolved !== "string" || typeof record.integrity !== "string" || record.integrity === "") {
            observed = false;
            findings.push({ kind: "prerequisite-origin-unknown", path: name });
          }
        }
      }
    }
  }
  // Packaging may refer to itself; only another package importing Packaging is a boundary finding.
  const selfPackaging = OWN_SPECIFIER.test(String(pkg.name ?? ""));
  // A package that imports Packaging in its own code is a boundary finding (packaging/A26).
  for (const [path] of accepted) {
    if (!CODE.test(path) || at.get(path) !== "file") continue;
    try {
      const code = await text(join(dir, path));
      if (!selfPackaging && importsOwn(code)) add("imports-packaging", path);
    } catch {
      // Already reported as unreadable above.
    }
  }
  const result = failed ? "failed" : observed ? "verified" : "unknown";
  return { installation: result, profile, findings, pkg, manifest };
}

/** The self check's command and arguments, from the Package Check record (layout) or package.json (legacy). */
function declaredSelf(profile, pkg, manifest) {
  if (profile === "layout") {
    const s = manifest?.self;
    if (!s || typeof s.command !== "string") return undefined;
    return { command: s.command === "node" ? process.execPath : s.command, args: Array.isArray(s.args) ? s.args.map(String) : [] };
  }
  // Legacy: the script the package declares, when it is a plain `node <file>` (no shell is chosen).
  const script = pkg?.scripts?.["test:embedded"] ?? pkg?.scripts?.test;
  const m = typeof script === "string" ? /^node\s+(\S+)$/.exec(script) : null;
  return m ? { command: process.execPath, args: [m[1]] } : undefined;
}

/** Reads one self-check output: the exit status and the printed verdict must agree; zero cases is never verified. */
function readSelf(name, execution) {
  const exit = Object.entries(EXIT).find(([, code]) => code === execution.status)?.[0];
  if (exit === undefined) return { self: "unknown", why: "no result exit code" };
  let printed;
  let evidence = false;
  for (const line of String(execution.stdout).split(/\r?\n/)) {
    const j = /^(\S+)-verification (\{.*\})$/.exec(line);
    if (j && (j[1] === name || j[1] === name.split("/").pop())) {
      try {
        const body = JSON.parse(j[2]);
        printed = body.result;
        // `cases` is a count, an array of outcomes, or a summary object ({ executed, passed, failed, ... }) depending on the
        // verifier; in every shape, no executed case is zero, and a shape that says nothing about execution is not verified.
        const c = body.cases;
        const ran = Array.isArray(c) ? c.filter((x) => x?.outcome === "pass" || x?.outcome === "fail").length : c !== null && typeof c === "object" ? (typeof c.executed === "number" ? c.executed : Number(c.passed ?? 0) + Number(c.failed ?? 0)) : c;
        // Evidence that a case ran: a positive executed count, and no zero count anywhere.
        evidence = typeof ran === "number" && ran > 0 && body.executed !== 0;
      } catch {
        printed = undefined;
      }
      continue;
    }
    const legacy = /^(\S+): (verified|failed|unknown): .*?(?:(\d+) declared, (\d+) executed)?$/.exec(line);
    if (legacy && legacy[1] === name) {
      printed = legacy[2];
      evidence = legacy[4] !== undefined && Number(legacy[4]) > 0;
    }
  }
  if (printed === undefined) return { self: "unknown", why: "no result line" };
  if (printed !== exit) return { self: "unknown", why: "exit status and printed verdict disagree" };
  // Only a verified verdict needs evidence that a case ran; a failed or unknown verdict stands on its own.
  if (exit === "verified" && !evidence) return { self: "unknown", why: "no evidence that a case ran" };
  return { self: exit };
}

/** Packages the combined result and its one output line. */
function finish(name, parts) {
  const result = parts.installation === "failed" ? "failed" : parts.installation === "unknown" || parts.self === "unknown" ? "unknown" : parts.self === "failed" ? "failed" : "verified";
  const body = { result, installation: parts.installation, self: parts.self, profile: parts.profile, findings: parts.findings, note: NOTE };
  if (parts.self === "not run") body.selfNote = "not run: installation failed";
  if (parts.why) body.selfNote = parts.why;
  return { result, installation: parts.installation, self: parts.self, profile: parts.profile, findings: parts.findings, line: `${name}-verification ${JSON.stringify(body)}`, exitCode: EXIT[result] };
}

/** True when the named verifier folder is at the exact pinned version and passes its own installation check. */
async function trusted(verifier, ctx) {
  if (!verifier || typeof verifier.version !== "string" || !EXACT.test(verifier.version)) return false;
  const own = await installation(verifier.dir, ctx);
  return own.installation === "verified" && own.pkg?.version === verifier.version;
}

export async function verifyInstalled(dir, { run, resolve = () => undefined, verifier } = {}) {
  const name = await nameOf(dir);
  if (verifier && !(await trusted(verifier, { resolve }))) {
    return finish(name, { installation: "unknown", self: "not run", findings: [{ kind: "verifier-untrusted", path: String(verifier.dir) }], why: "the verifier is not at its exact pinned version or is not itself sound" });
  }
  const found = await installation(dir, { resolve });
  if (found.installation === "failed") return finish(name, { ...found, self: "not run" });
  const how = declaredSelf(found.profile, found.pkg, found.manifest);
  if (found.installation === "unknown" && how === undefined && found.profile === undefined) return finish(name, { ...found, self: "not run" });
  if (how === undefined) return finish(name, { ...found, self: "unknown", findings: [...found.findings, { kind: "self-check-undeclared", path: found.profile === "layout" ? LAYOUT_MANIFEST : "package.json" }] });
  let execution;
  try {
    execution = await run(how.command, how.args, { cwd: dir });
  } catch {
    return finish(name, { ...found, self: "unknown", why: "the self check could not be run" });
  }
  return finish(name, { ...found, ...readSelf(name, execution) });
}

/** The manifest the generator writes for an installed-layout package: dist/ and npm's fixed root files, sorted, with the declared self check kept. */
export async function generateManifest(dir) {
  const listing = (await walk(dir)).filter((e) => e.type === "file" && (e.path.startsWith("dist/") || isRootFile(e.path)) && e.path !== LAYOUT_MANIFEST);
  const files = {};
  for (const e of listing.sort((a, b) => (a.path < b.path ? -1 : 1))) files[e.path] = await digest(join(dir, e.path));
  let self;
  try {
    self = JSON.parse(await text(join(dir, LAYOUT_MANIFEST))).self;
  } catch {
    self = undefined;
  }
  return JSON.stringify(self === undefined ? { files } : { files, self }, null, 2) + "\n";
}

/** The publisher-side files that never ship (packaging/C22, C23, C24 stay repository-only). */
const PUBLISHER_SIDE = /(^|\/)(registry-match|boundary-check|structure)(\.|\/|$)/;

/** Judges the file list `npm pack` would deliver: only dist/ and npm's fixed root files, and no publisher-side file. */
export function checkShippedPayload(packed) {
  const findings = [];
  for (const path of packed) {
    const root = isRootFile(path);
    if (!root && !path.startsWith("dist/")) findings.push({ kind: "outside-dist", path });
    else if (PUBLISHER_SIDE.test(path)) findings.push({ kind: "publisher-side", path });
  }
  return { result: findings.length ? "failed" : "verified", findings };
}
