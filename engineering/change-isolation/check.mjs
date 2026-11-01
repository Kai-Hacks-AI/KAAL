#!/usr/bin/env node
// Change Isolation: two repository engineering controls, decided from changed paths alone.
//
//   1. Core travels alone. A change touching Core contains only Core and the
//      supporting files listed in CORE_SUPPORT.
//   2. .github travels alone. A change touching .github/ contains nothing outside it.
//
// Usage: check.mjs < paths
// Reads the change's repository-relative paths from stdin, NUL- or newline-separated. The caller
// supplies the complete change, both sides of every rename; this file alone defines the rules.
// Exits 0 when the change conforms, 1 with one line per offending path, 2 when it cannot judge.
//
// Limitation: the rules are path-level. An allowed supporting file passes whatever it contains.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Paths that are Core: the package and the Engine files deployed from its payload. */
const CORE = [/^packages\/kaal-core\//, /^\.kaal\/(AGENTS\.md|KAAL-KERNEL\.md|core\/)/];

/** Paths that may travel with Core and nothing else besides. */
const CORE_SUPPORT = [
  /^package\.json$/, // root workspace metadata
  /^package-lock\.json$/, // root lockfile
  /^engineering\/acceptance\/embed\.test\.mjs$/, // Core's own acceptance evidence
];

const GITHUB = /^\.github\//;

const any = (patterns, path) => patterns.some((p) => p.test(path));


/** C16's root-claim policy. Owners and complete inventories are supplied from the
 * trusted target by Core/Testing, never inferred from the candidate's own claim. */
export async function checkRootOwnership({ inventory, claimFiles, owners } = {}) {
  const unresolved = (s) => ({ verdict: 'unresolved', errors: [s] });
  if (!inventory || !Array.isArray(inventory.entries) || !Array.isArray(claimFiles) || !Array.isArray(owners) ||
      !Array.from(owners).every(o => o && typeof o.kind === 'string' && typeof o.name === 'string' &&
        typeof o.id === 'string' && /^[0-9a-f]{64}$/.test(o.id)) ||
      !Array.from(claimFiles).every(f => f && typeof f.path === 'string' && f.bytes instanceof Uint8Array))
    return unresolved('complete target ownership inventory unavailable');
  const admitted = owners.filter(o => o.kind === 'capability' && o.name === 'Engineering');
  if (admitted.length !== 1) return unresolved('Engineering Capability Node not uniquely admitted');
  const { readClaim, attribute, KINDS } = await import('kaal-testing/attribution');
  if (!owners.every(o => KINDS.includes(o.kind))) return unresolved('unknown admitted owner kind');
  const errors = [];
  const root = claimFiles.filter(f => f.path === 'ownership.kaal.json');
  if (root.length !== 1) errors.push('exactly one root ownership.kaal.json is required');
  else {
    const { claim, finding } = readClaim(root[0].path, root[0].bytes);
    if (finding) errors.push(finding.evidence);
    else {
      const owner = admitted[0];
      if (claim.owner.kind !== owner.kind || claim.owner.name !== owner.name || claim.owner.id !== owner.id)
        errors.push('root ownership.kaal.json does not name admitted Engineering exactly');
      if (claim.paths.length !== 2 ||
          [...claim.paths].sort().join('\0') !== 'package-lock.json\0package.json')
        errors.push('root ownership.kaal.json must claim exactly package.json and package-lock.json');
    }
  }
  const attributed = attribute(inventory, claimFiles, owners);
  for (const f of attributed.findings) errors.push(f.subject + ': ' + f.evidence);
  for (const path of ['package.json', 'package-lock.json']) {
    const assigned = attributed.owners.filter(o => o.id === admitted[0].id)
      .some(o => o.entries.some(e => e.path === path));
    if (!assigned) errors.push(path + ' is not uniquely attributed to Engineering');
  }
  return { verdict: errors.length ? 'failed' : 'passed', errors: [...new Set(errors)].sort() };
}

/** C16 root governance for the future trusted C11 caller. No boolean derivation
 * assertion is accepted: npm runs twice from the target lock, never the proposed
 * lock. The existing path-only CLI below is intentionally unchanged until C11.
 *
 * manifests holds exact candidate package.json bytes only, including every
 * literal workspace/local directory dependency. targetRootManifest and
 * targetLockfile must be loaded independently from the immutable trusted base.
 * scratch is a missing/empty caller-owned directory outside the checkout.
 * The caller retains/removes it; neither checkout is modified by this function.
 */
export async function checkRootChange(input, { scratch } = {}) {
  const unresolved = (s) => ({ verdict: 'unresolved', errors: [s] });
  const failed = (s) => ({ verdict: 'failed', errors: [s] });
  const bytes = x => x instanceof Uint8Array;
  const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  if (!input || !Array.isArray(input.paths) || !Array.from(input.paths).every(p => typeof p === 'string') ||
      !Array.isArray(input.scope) || input.scope.length === 0 ||
      !Array.from(input.scope).every(s => typeof s === 'string' && /^[a-z][a-z0-9-]*$/.test(s)) ||
      !bytes(input.targetRootManifest) || !bytes(input.targetLockfile) ||
      !bytes(input.lockfile) || !object(input.manifests) ||
      !bytes(input.manifests['package.json']) || typeof scratch !== 'string' || !scratch)
    return unresolved('trusted root inputs, selected capability scope or fresh scratch directory unavailable');
  // Capture before the first await; a caller mutating a Buffer while npm runs
  // must not change which proposal the derivation proves.
  const paths = [...input.paths], scope = [...input.scope];
  const targetRootManifest = Buffer.from(input.targetRootManifest);
  const targetLockfile = Buffer.from(input.targetLockfile), lockfile = Buffer.from(input.lockfile);
  const snapshot = Object.fromEntries(Object.entries(input.manifests).map(([p, b]) =>
    [p, bytes(b) ? Buffer.from(b) : b]));
  const { posix, join, isAbsolute } = await import('node:path');
  if (!isAbsolute(scratch)) return unresolved('scratch must be an absolute caller-owned path');
  const decode = new TextDecoder('utf-8', { fatal: true });
  const manifests = {};
  try {
    for (const [path, data] of Object.entries(snapshot)) {
      if (!bytes(data) || (path !== 'package.json' && !path.endsWith('/package.json')) ||
          path.split('/').some(s => !s || s === '.' || s === '..' || s === 'node_modules') ||
          /[\\:\x00-\x1f]/.test(path))
        return unresolved('invalid manifest snapshot path: ' + path);
      const manifest = JSON.parse(decode.decode(data));
      if (!object(manifest)) return unresolved('manifest is not an object: ' + path);
      manifests[path] = manifest;
    }
    for (const data of [targetRootManifest, targetLockfile, lockfile])
      if (!object(JSON.parse(decode.decode(data)))) return unresolved('invalid root JSON snapshot');
    if ([targetLockfile, lockfile].some(b => JSON.parse(decode.decode(b)).lockfileVersion !== 3))
      return unresolved('only npm lockfileVersion 3 is supported');
  } catch { return unresolved('root/manifest snapshot is not valid UTF-8 JSON'); }
  const rootChanged = !targetRootManifest.equals(snapshot['package.json']);
  if ((rootChanged || paths.includes('package.json')) && !scope.includes('engineering'))
    return failed('package.json change requires Engineering in selected scope');
  const workspaces = manifests['package.json'].workspaces ?? [];
  if (!Array.isArray(workspaces) || !workspaces.every(p => typeof p === 'string' &&
      Object.hasOwn(manifests, p + '/package.json')))
    return unresolved('complete literal workspace manifest inventory unavailable');
  for (const [path, manifest] of Object.entries(manifests)) {
    for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      if (manifest[field] !== undefined && !object(manifest[field]))
        return unresolved('invalid dependency map: ' + path);
      for (const spec of Object.values(manifest[field] ?? {})) {
        if (typeof spec !== 'string') return unresolved('invalid dependency spec: ' + path);
        if (spec.startsWith('file:')) {
          const dir = posix.normalize(posix.join(posix.dirname(path), spec.slice(5)));
          if (!Object.hasOwn(manifests, dir + '/package.json') || spec.slice(5).startsWith('/'))
            return unresolved('local dependency manifest unavailable: ' + path);
        } else if (!/^[0-9A-Za-z.*^~<>=|+ -]+$/.test(spec))
          return unresolved('unsupported non-registry dependency: ' + path);
      }
    }
    // Overrides and bundled dependencies need a separately governed input model;
    // never let a spec hidden there escape the restrictions above.
    if (manifest.overrides !== undefined || manifest.bundleDependencies !== undefined ||
        manifest.bundledDependencies !== undefined)
      return unresolved('overrides/bundled dependencies not supported: ' + path);
  }
  const { initialize, execute, readFile } = await import('kaal-hosting');
  const { sha256 } = await import('@kaihacksai/kaal-foundation/sha256');
  // Inherited host/credential transport is preserved; npm configuration and Node
  // loaders cannot be supplied by the proposed manifests or inherited npm hooks.
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) =>
    !/^npm_config_/i.test(k) && !['NODE_OPTIONS', 'NODE_PATH'].includes(k)));
  try {
    const files = { 'user.npmrc': Buffer.alloc(0), 'global.npmrc': Buffer.alloc(0) };
    for (const run of ['first', 'second']) {
      for (const [path, data] of Object.entries(snapshot)) files[run + '/' + path] = data;
      files[run + '/package-lock.json'] = targetLockfile;
    }
    await initialize(scratch, files);
    const version = await execute('npm', ['--version'], { cwd: scratch, env });
    if (version.status !== 0) return unresolved('npm version unavailable');
    const results = [];
    for (const run of ['first', 'second']) {
      const r = await execute('npm', ['install', '--package-lock-only', '--ignore-scripts',
        '--offline', '--no-audit', '--no-fund', '--lockfile-version=3',
        '--userconfig=' + join(scratch, 'user.npmrc'),
        '--globalconfig=' + join(scratch, 'global.npmrc')],
        { cwd: join(scratch, run), env });
      if (r.status !== 0) return unresolved('offline npm derivation unavailable (exit ' + r.status + ')');
      results.push(await readFile(join(scratch, run, 'package-lock.json')));
    }
    if (!results[0].equals(results[1])) return unresolved('npm derivation is not deterministic');
    const derivation = { npm: version.stdout.trim(), node: process.versions.node, base: sha256(targetLockfile),
      manifests: Object.fromEntries(Object.entries(snapshot).sort().map(([p, b]) => [p, sha256(b)])),
      candidate: sha256(lockfile), derived: sha256(results[0]) };
    return { verdict: results[0].equals(lockfile) ? 'passed' : 'failed',
      errors: results[0].equals(lockfile) ? [] :
        ['package-lock.json differs from independent npm derivation of candidate manifests'],
      derivation };
  } catch (e) {
    return unresolved('root derivation unavailable: ' + (e.code ?? e.message));
  }
}

/** @param {string[]} paths repository-relative changed paths @returns {string[]} violations */
export function check(paths) {
  const violations = [];
  if (paths.some((p) => any(CORE, p))) {
    for (const p of paths) {
      if (!any(CORE, p) && !any(CORE_SUPPORT, p)) violations.push(`core travels alone: ${p} is not Core or its supporting files`);
    }
  }
  if (paths.some((p) => GITHUB.test(p))) {
    for (const p of paths) if (!GITHUB.test(p)) violations.push(`.github travels alone: ${p} is outside .github/`);
  }
  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const refuse = (message) => {
    console.error(message);
    process.exit(2);
  };
  if (process.argv.length > 2) refuse("usage: check.mjs < paths");
  const input = readFileSync(0, "utf8");
  const paths = input.split(input.includes("\0") ? "\0" : "\n").filter(Boolean);
  const unnormal = paths.find((p) => p.split("/").some((s) => s === "" || s === "." || s === ".."));
  if (unnormal !== undefined) refuse(`not a repository-relative path: ${unnormal}`);
  const violations = check(paths);
  for (const v of violations) console.error(v);
  if (violations.length) process.exit(1);
  console.log(`ok: ${paths.length} changed paths conform`);
}
