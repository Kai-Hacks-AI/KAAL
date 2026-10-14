// Sealing: the identity of an artifact, Seals that bind it, and verification
// against the intended Seal. Identity and verification are pure: they take an
// artifact's bytes and a Seal's bytes, wherever they were retrieved from.
// Retaining Seals in a KAAL Engine and reading artifacts from the local
// filesystem go through kaal-hosting; whether an Engine holds Sealing is
// decided by kaal-core.
import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { evaluate, KaalError, sha256 } from "kaal-core";
import { read, update } from "kaal-hosting";

/**
 * @typedef {{ named?: boolean, domain?: string }} Form
 *   How an artifact's identity is formed, chosen by the artifact's own domain:
 *   `named` adds the artifact's own name to what is inside it, and `domain`
 *   keeps the identities of different kinds apart.
 * @typedef {{ kind: "file", name?: string, bytes: Uint8Array }
 *   | { kind: "directory", name?: string, files: Record<string, Uint8Array> }} Artifact
 *   An artifact as bytes: a file, or a directory as its files by relative
 *   `/`-separated path. `name` is its own name, used only by the named form.
 * @typedef {{ kind: Artifact["kind"], form: Form, id: string }} Seal
 *   What a Seal binds: an artifact's kind, its form and its identity.
 * @typedef {"ok" | "missing" | "corrupt" | "mismatch"} Status
 * @typedef {{ status: Status, sealed?: string, id?: string }} Verification
 */

const u64 = (n) => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(n));
  return b;
};

function checkName(name, path) {
  if (name === "" || name === "." || name === "..") throw new KaalError(`${path} has an empty, . or .. segment`);
  if (/[\\/\u0000-\u001f\u007f]/.test(name)) throw new KaalError(`${JSON.stringify(path)} has a backslash or control character`);
  if (name !== name.normalize("NFC")) throw new KaalError(`${path} is not NFC-normalised`);
  if (Buffer.from(name, "utf8").toString("utf8") !== name) throw new KaalError(`${path} is not valid UTF-8`);
}

/** A directory's paths in bytewise order of their UTF-8; refuses what could not be stated the same on every platform. */
function orderedPaths(files) {
  const paths = Object.keys(files);
  if (paths.length === 0) throw new KaalError("a directory with no files has no identity");
  const folded = new Map();
  for (const path of paths) {
    for (const segment of path.split("/")) checkName(segment, path);
    const other = folded.get(path.toLowerCase());
    if (other !== undefined) throw new KaalError(`${other} and ${path} differ only by case`);
    folded.set(path.toLowerCase(), path);
  }
  return paths.sort((a, b) => Buffer.compare(Buffer.from(a, "utf8"), Buffer.from(b, "utf8")));
}

/**
 * The identity of an artifact, in one of four forms: {file, directory} by
 * {unnamed, named}. It is computed from the artifact's bytes (and, named, its
 * own name) alone: parent, location and storage never take part.
 *
 * An unnamed file with no domain is the SHA-256 of its exact bytes, which is
 * Core's identity of a Node. Every other form needs a domain and is the
 * SHA-256 of the stream:
 *
 *   "<domain>\n"
 *   (named)      uint64 BE name length in bytes, name (UTF-8)
 *   a file:      uint64 BE content length, content (raw)
 *   a directory: uint64 BE number of files, then for each file, in bytewise
 *                order of its UTF-8 relative path:
 *                  uint64 BE path length, path (UTF-8)
 *                  uint64 BE content length, content (raw)
 *
 * Only files participate; directories are implied by paths. What could not
 * be stated the same on every platform is refused, not normalised: names that
 * are empty, `.` or `..`, not NFC or not valid UTF-8, names with a backslash
 * or control character, and paths differing only by case.
 *
 * @param {Artifact} artifact @param {Form} [form] @returns {string}
 */
export function artifactId(artifact, form = {}) {
  const { named = false, domain } = form;
  if (artifact.kind === "file" && !named && domain === undefined) return sha256(artifact.bytes);
  if (typeof domain !== "string" || domain === "" || /[\n\u0000]/.test(domain))
    throw new KaalError("a domain is a non-empty single line, and every form but an unnamed file needs one");
  const stream = [Buffer.from(`${domain}\n`, "utf8")];
  if (named) {
    if (artifact.name === undefined) throw new KaalError("the named form needs the artifact's own name");
    checkName(artifact.name, artifact.name);
    const name = Buffer.from(artifact.name, "utf8");
    stream.push(u64(name.length), name);
  }
  if (artifact.kind === "file") stream.push(u64(artifact.bytes.length), artifact.bytes);
  else {
    const paths = orderedPaths(artifact.files);
    stream.push(u64(paths.length));
    for (const path of paths) {
      const name = Buffer.from(path, "utf8");
      const bytes = artifact.files[path];
      stream.push(u64(name.length), name, u64(bytes.length), bytes);
    }
  }
  return sha256(Buffer.concat(stream));
}

const RECORD = /^KAAL Seal\nkind: (file|directory)\nnamed: (true|false)\n(?:domain: ([^\n]+)\n)?id: ([0-9a-f]{64})\n$/;
const HEX = /^[0-9a-f]{64}$/;

/** A Seal's canonical bytes. Its ref, the SHA-256 of these bytes, names the intended Seal. @param {Seal} seal */
export function sealBytes(seal) {
  const { named = false, domain } = seal.form;
  return Buffer.from(`KAAL Seal\nkind: ${seal.kind}\nnamed: ${named}\n${domain === undefined ? "" : `domain: ${domain}\n`}id: ${seal.id}\n`, "utf8");
}

/** Read a Seal from its exact bytes, or undefined if they are not a Seal. @param {Uint8Array} bytes @returns {Seal | undefined} */
export function parseSeal(bytes) {
  const m = RECORD.exec(Buffer.from(bytes).toString("utf8"));
  if (!m) return undefined;
  const [, kind, named, domain, id] = m;
  /** @type {Seal} */
  const seal = { kind, form: { named: named === "true", ...(domain === undefined ? {} : { domain }) }, id };
  return sealBytes(seal).equals(Buffer.from(bytes)) ? seal : undefined;
}

/** Seal an artifact as it now is: the Seal's bytes and its ref. @param {Artifact} artifact @param {Form} [form] */
export function sealOf(artifact, form = {}) {
  const bytes = sealBytes({ kind: artifact.kind, form, id: artifactId(artifact, form) });
  return { ref: sha256(bytes), bytes };
}

/**
 * Verify an artifact against the intended Seal, named by its ref, given the
 * bytes retrieved for that Seal (undefined when none were found). The form
 * comes from the Seal. This is integrity against a trusted ref, not
 * authenticity: nothing here proves who made the Seal or that the ref is the
 * right one.
 *
 * @param {Artifact} artifact @param {string} ref @param {Uint8Array | undefined} retrieved
 * @returns {Verification}
 */
export function verifyAgainst(artifact, ref, retrieved) {
  if (!HEX.test(ref)) throw new KaalError(`${ref} is not a Seal ref: 64 lowercase hex digits`);
  if (retrieved === undefined) return { status: "missing" };
  const seal = sha256(retrieved) === ref ? parseSeal(retrieved) : undefined;
  if (!seal) return { status: "corrupt" };
  if (seal.kind !== artifact.kind) return { status: "mismatch", sealed: seal.id };
  const id = artifactId(artifact, seal.form);
  return { status: id === seal.id ? "ok" : "mismatch", sealed: seal.id, id };
}

// --- A KAAL Engine as the Seal store ----------------------------------------

/** Where an Engine retains each Seal: `seals/<ref>/seal`. */
const sealPath = (ref) => `seals/${ref}/seal`;

/**
 * The Sealing Node, by name and id: this package's `payload/Sealing.md`, as
 * Core identifies it. Pinned here so the Agent Skill works wherever a host
 * places it; the package's tests hold it equal to the payload.
 */
export const SEALING = Object.freeze({ name: "Sealing", id: "7e11545db96d8035be5a9052b8c9f4511dd4be7bdcaf8794d080e889492e86bc" });

/** Sealing operates only on an Engine that holds its Node, as Core admits it. */
function requireSealing(engine, files) {
  const ref = SEALING;
  try {
    evaluate(files).resolve(ref);
  } catch {
    throw new KaalError(`${engine} does not hold ${ref.name} (${ref.id}): register it with kaal register skill kaal-sealing <payload>`);
  }
}

/**
 * Seal an artifact as it now is, in the form its domain defines, and retain
 * the Seal in the Engine. Returns the Seal ref. Sealing the same artifact in
 * the same form again changes nothing; a Seal is never replaced, and Hosting
 * publishes it whole or not at all, never through a link.
 *
 * @param {string} engine @param {Artifact} artifact @param {Form} [form] @returns {Promise<string>}
 */
export async function seal(engine, artifact, form = {}) {
  const { ref, bytes } = sealOf(artifact, form);
  await update(engine, async (files) => {
    requireSealing(engine, files);
    const present = files[sealPath(ref)];
    if (present?.equals(bytes)) return undefined;
    if (Object.keys(files).some((p) => p.startsWith(`seals/${ref}/`)))
      throw new KaalError(`seals/${ref} in ${engine} holds other bytes: nothing was written`);
    return { prefix: `seals/${ref}`, files: { seal: bytes } };
  });
  return ref;
}

/**
 * Verify an artifact against the Seal the Engine retains under `ref`.
 * @param {string} engine @param {Artifact} artifact @param {string} ref @returns {Promise<Verification>}
 */
export async function verifySeal(engine, artifact, ref) {
  const files = await read(engine);
  requireSealing(engine, files);
  return verifyAgainst(artifact, ref, files[sealPath(ref)]);
}

/** The refs of the intact Seals the Engine retains, in order. @param {string} engine @returns {Promise<string[]>} */
export async function sealed(engine) {
  const files = await read(engine);
  requireSealing(engine, files);
  return Object.entries(files)
    .map(([path, bytes]) => [/^seals\/([0-9a-f]{64})\/seal$/.exec(path)?.[1], bytes])
    .filter(([ref, bytes]) => ref !== undefined && sha256(bytes) === ref && parseSeal(bytes) !== undefined)
    .map(([ref]) => ref)
    .sort();
}

// --- The local filesystem as an artifact source -----------------------------

/**
 * Read an artifact from the local filesystem. A directory is read through
 * kaal-hosting, which decides how links are treated and refuses a link to a
 * directory. Its own name is its last path segment; where it lies is not read.
 *
 * @param {string} path @returns {Promise<Artifact>}
 */
export async function readArtifact(path) {
  const name = basename(resolve(path));
  if ((await stat(path)).isDirectory()) return { kind: "directory", name, files: await read(path) };
  return { kind: "file", name, bytes: await readFile(path) };
}
