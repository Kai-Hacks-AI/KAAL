// Engineering's Release engine, its decisions (engineering/C12, engineering/release/README.md).
// Everything here is pure: it judges facts that run.mjs gathers through npm and Hosting, and
// touches no host, registry or file. Results use KAAL's vocabulary: verified, failed, unknown.

/** The repository every released package must name, for npm's provenance check. */
export const REPOSITORY = "git+https://github.com/Kai-Hacks-AI/KAAL.git";
/** The repository and workflow an OIDC provenance attestation must name (F35). */
export const SOURCE = { repository: "https://github.com/Kai-Hacks-AI/KAAL", workflow: ".github/workflows/release.yml" };
export const SCOPE = "@kaihacksai/";
/** Exit statuses, as the workflow acts on them. */
export const EXIT = { verified: 0, failed: 1, unknown: 2 };

const EXACT = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/**
 * F28: the workspace that is `name`, by its npm name, among `workspaces` ([{ name, location }]).
 * A name given as a path, or one no workspace has, is a finding.
 */
export function locate(workspaces, name) {
  if (typeof name !== "string" || !name.startsWith(SCOPE) || /[\\]|\.\./.test(name) || name.split("/").length !== 2)
    return { findings: [`not a package name: ${JSON.stringify(name)} (expected ${SCOPE}<name>)`] };
  const found = workspaces.find((w) => w.name === name);
  return found ? { workspace: found, findings: [] } : { findings: [`${name} is not a workspace of this repository`] };
}

/**
 * F29: readiness, before anything is packed. `manifest` is the package's package.json, `directory`
 * its repository-relative directory, `registry` maps each name asked about to its published
 * versions, or null when npm does not know the name. Returns the findings and the publication
 * path: "first" when the name is not on the registry, otherwise "trusted".
 */
export function readiness({ manifest, directory, registry }) {
  const f = [];
  const { name, version } = manifest;
  if (manifest.private === true) f.push(`${name} is private`);
  if (typeof name !== "string" || !name.startsWith(SCOPE)) f.push(`the name ${JSON.stringify(name)} is not scoped ${SCOPE}`);
  if (typeof version !== "string" || !EXACT.test(version)) f.push(`the version ${JSON.stringify(version)} is not a semantic version`);
  if (manifest.publishConfig?.access !== "public") f.push(`publishConfig.access is not "public"`);
  const repo = manifest.repository;
  if (typeof repo !== "object" || repo === null || repo.url !== REPOSITORY)
    f.push(`repository.url is not ${REPOSITORY}`);
  if (typeof repo !== "object" || repo === null || repo.directory !== directory)
    f.push(`repository.directory is not ${directory}`);
  if (!manifest.license) f.push("license is missing");
  if (!manifest.engines?.node) f.push("engines.node is missing");
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) f.push("files is missing");
  const own = registry[name];
  if (own === undefined) f.push(`the registry was not asked about ${name}`);
  else if (own?.includes(version)) f.push(`${name}@${version} is already on the registry; raise the version`);
  for (const [dep, spec] of Object.entries(manifest.dependencies ?? {}).sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (!EXACT.test(spec)) f.push(`dependency ${dep} is "${spec}", not an exact version`);
    else if (!registry[dep]?.includes(spec)) f.push(`dependency ${dep}@${spec} is not on the registry; release it first`);
  }
  return { findings: f, path: own === null ? "first" : "trusted" };
}

/**
 * F32: the installed verification's result, read from its output. The last non-empty line must be
 * the package's one `<short>-verification {json}` line. Anything else is unknown, never verified.
 */
export function verification(stdout, name) {
  const short = name.split("/").pop();
  const prefix = `${short}-verification `;
  const lines = stdout.split(/\r?\n/).filter((l) => l.trim() !== "");
  const ours = lines.filter((l) => l.startsWith(prefix));
  if (ours.length !== 1) return { result: "unknown", cause: `expected one ${prefix.trim()} line, found ${ours.length}` };
  if (lines.at(-1) !== ours[0]) return { result: "unknown", cause: `the ${prefix.trim()} line is not the last line` };
  let line;
  try {
    line = JSON.parse(ours[0].slice(prefix.length));
  } catch {
    return { result: "unknown", cause: `the ${prefix.trim()} line is not JSON` };
  }
  if (line.result === "verified") return { result: "verified" };
  if (line.result === "failed") return { result: "failed", cause: `${short} reported failed` };
  return { result: "unknown", cause: `${short} reported ${JSON.stringify(line.result)}` };
}

/** The weakest of several results: failed, then unknown, then verified. */
export function weakest(results) {
  if (results.includes("failed")) return "failed";
  if (results.length === 0 || results.includes("unknown")) return "unknown";
  return "verified";
}

/**
 * F31: the release record, bound to its run and commit. `checks` holds the verification results
 * by name, each { result } or { result: "not run", reason }. Never claims acceptance.
 */
export function record({ manifest, commit, run, tarball, sha256, integrity, path, checks }) {
  return {
    package: manifest.name,
    version: manifest.version,
    commit,
    run: String(run),
    tarball,
    sha256,
    integrity,
    path,
    artifact: null,
    checks,
    accepted: false,
    provenance: null,
  };
}

/** F31: binds the uploaded artifact to the record; its digest must be the tarball's SHA-256. */
export function bind(rec, { id, digest }) {
  if (digest !== rec.sha256) return { result: "unknown", cause: `the uploaded artifact (${digest}) is not the tarball packed (${rec.sha256})` };
  return { result: "verified", record: { ...rec, artifact: { id: String(id), digest } } };
}

/**
 * F33: may Publish publish `bytesSha256`, the downloaded artifact, from run `run` at `commit`?
 * Publish never packs: these bytes are the ones it publishes.
 */
export function publishable(rec, { sha256, run, commit }) {
  if (rec.path !== "trusted") return { result: "failed", cause: `${rec.package} has no version on the registry yet: first publication is the Owner's (F34)` };
  if (rec.run !== String(run)) return { result: "unknown", cause: `the record is from run ${rec.run}, not this run ${run}` };
  if (rec.commit !== commit) return { result: "unknown", cause: `the record is for commit ${rec.commit}, not ${commit}` };
  if (!rec.artifact || rec.artifact.digest !== rec.sha256) return { result: "unknown", cause: "the record is not bound to its uploaded artifact" };
  if (sha256 !== rec.sha256) return { result: "unknown", cause: `the downloaded artifact (${sha256}) is not the tested tarball (${rec.sha256})` };
  if (rec.checks && weakest(Object.values(rec.checks).filter((c) => c.result !== "not run").map((c) => c.result)) !== "verified")
    return { result: "failed", cause: "the tested tarball did not verify" };
  return { result: "verified" };
}

/** F34: the Owner's steps for a first publication, filled in with the run's own values. */
export function firstSteps(rec) {
  const npm = "npx npm@11.21.0";
  return [
    `First publication of ${rec.package}: npm cannot accept this workflow's identity for a name it does not know, so the Owner publishes the tested bytes by hand. Nothing below packs.`,
    "",
    `1. Download the tested tarball: \`gh run download ${rec.run} --repo Kai-Hacks-AI/KAAL --name ${rec.tarball}\`, or from this run's page.`,
    `2. Verify it: \`sha256sum ${rec.tarball}\` must print \`${rec.sha256}\`. Stop if it does not.`,
    `3. Publish those bytes, with 2FA: \`${npm} publish ./${rec.tarball} --access public\`. Never run npm publish in a package directory, which packs again.`,
    `4. Bind Trusted Publishing: \`${npm} trust github ${rec.package} --file release.yml --repo Kai-Hacks-AI/KAAL --env npm --allow-publish\`, or the same setting on npmjs.com.`,
    `5. On npmjs.com, set ${rec.package}'s publishing access to "Require two-factor authentication and disallow tokens".`,
    `6. Accept it: run Release with step \`registry\`, package \`${rec.package}\` and run \`${rec.run}\`.`,
  ].join("\n");
}

/**
 * F35: provenance, never stronger than observed. `statements` are the decoded in-toto statements of
 * the version's attestations, or null when it has none.
 */
export function provenance(rec, statements) {
  if (rec.path === "first") {
    if (statements && statements.length > 0) return { result: "unknown", note: "a first publication by the Owner unexpectedly carries an attestation" };
    return { result: "verified", note: "provenance: none (first publication by the Owner, manual bootstrap); the byte-for-byte match with the tested artifact stands in for it" };
  }
  const slsa = (statements ?? []).filter((s) => String(s?.predicateType).startsWith("https://slsa.dev/provenance/"));
  if (slsa.length === 0) return { result: "failed", note: "provenance: missing on a Trusted Publishing release" };
  for (const s of slsa) {
    const w = s.predicate?.buildDefinition?.externalParameters?.workflow ?? {};
    const commit = (s.predicate?.buildDefinition?.resolvedDependencies ?? []).map((d) => d?.digest?.gitCommit).find(Boolean);
    if (w.repository === SOURCE.repository && w.path === SOURCE.workflow && commit === rec.commit)
      return { result: "verified", note: `provenance: OIDC, ${SOURCE.repository} ${SOURCE.workflow} at ${rec.commit}` };
  }
  return { result: "failed", note: `provenance: no attestation names ${SOURCE.repository}, ${SOURCE.workflow} and ${rec.commit}` };
}

/**
 * F35: registry acceptance. `registry` is what the registry delivered: the downloaded tarball's
 * sha256 and integrity, and its dist.integrity. `installed` is the fresh registry install's
 * verification. A release is accepted only when every part is verified.
 */
export function acceptance(rec, { run, registry, installed, statements }) {
  const findings = [];
  const parts = [];
  if (rec.run !== String(run)) return { result: "unknown", findings: [`the record is from run ${rec.run}, not ${run}`], record: rec };
  if (!rec.artifact || rec.artifact.digest !== rec.sha256) return { result: "unknown", findings: ["the record is not bound to its uploaded artifact"], record: rec };
  const bytes = registry.sha256 === rec.sha256 && registry.integrity === rec.integrity && registry.distIntegrity === rec.integrity;
  if (registry.sha256 !== rec.sha256) findings.push(`the registry tarball's SHA-256 ${registry.sha256} is not the tested ${rec.sha256}`);
  if (registry.integrity !== rec.integrity) findings.push("the registry tarball's sha512 is not the tested artifact's integrity");
  if (registry.distIntegrity !== rec.integrity) findings.push(`the registry's dist.integrity ${registry.distIntegrity} is not the tested ${rec.integrity}`);
  parts.push(bytes ? "verified" : "failed");
  parts.push(installed.result);
  if (installed.result !== "verified") findings.push(`the fresh registry install did not verify: ${installed.cause ?? installed.result}`);
  const p = provenance(rec, statements);
  parts.push(p.result);
  if (p.result !== "verified") findings.push(p.note);
  const result = weakest(parts);
  return { result, findings, record: { ...rec, accepted: result === "verified", provenance: p.note } };
}
