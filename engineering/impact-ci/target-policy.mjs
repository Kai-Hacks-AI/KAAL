// C762: target-branch assurance policy. Branch target, not source or changed paths,
// determines whether selective CI is even eligible.
export function assuranceForTarget(context) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) return 'unresolved';
  const { event, baseRef } = context;
  if (event === 'push' && baseRef === 'main') return 'full-assurance';
  if (event !== 'pull_request' || typeof baseRef !== 'string')
    return 'unresolved';
  if (baseRef === 'main') return 'full-assurance';
  if (baseRef.startsWith('kaal/') && baseRef.length > 'kaal/'.length)
    return 'impact-aware';
  return 'unresolved';
}

