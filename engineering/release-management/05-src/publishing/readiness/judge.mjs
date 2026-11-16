// release/CTL3 readiness before pack: the judge (release/C50). Pure: it judges facts handed to it and
// touches no host, registry or file. The scope and the repository come from the declaration.
const EXACT = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export function judgeReadiness({ manifest, directory, registry }, declaration) {
  const findings = [];
  const add = (rule, message, kind = 'failed') => findings.push({ rule, kind, message });
  const { name, version } = manifest;
  if (manifest.private === true) add('private', `${name} is private`);
  if (typeof name !== 'string' || !name.startsWith(declaration.scope)) add('scope', `the name ${JSON.stringify(name)} is not scoped ${declaration.scope}`);
  if (typeof version !== 'string' || !EXACT.test(version)) add('version', `the version ${JSON.stringify(version)} is not a semantic version`);
  if (manifest.publishConfig?.access !== 'public') add('access', 'publishConfig.access is not "public"');
  const repo = manifest.repository;
  const named = typeof repo === 'object' && repo !== null;
  if (!named || repo.url !== declaration.repository) add('repository-url', `repository.url is not ${declaration.repository}`);
  if (!named || repo.directory !== directory) add('repository-directory', `repository.directory is not ${directory}`);
  if (!manifest.license) add('license', 'license is missing');
  if (!manifest.engines?.node) add('engines', 'engines.node is missing');
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) add('files', 'files is missing');
  const own = registry[name];
  if (own === undefined) add('registry-not-asked', `the registry was not asked about ${name}`, 'unknown');
  else if (own !== null && own.includes(version)) add('own-version-published', `${name}@${version} is already on the registry; raise the version`);
  for (const [dep, spec] of Object.entries(manifest.dependencies ?? {}).sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (!EXACT.test(spec)) add('dependency-exact', `dependency ${dep} is "${spec}", not an exact version`);
    else if (registry[dep] === undefined) add('registry-not-asked', `the registry was not asked about ${dep}`, 'unknown');
    else if (!registry[dep]?.includes(spec)) add('dependency-not-published', `dependency ${dep}@${spec} is not on the registry; release it first`);
  }
  const result = findings.some((f) => f.kind === 'failed') ? 'failed' : findings.length ? 'unknown' : 'verified';
  const path = own === undefined ? undefined : own === null ? 'first' : 'trusted';
  const out = { result, findings };
  if (path !== undefined) out.path = path;
  return out;
}
