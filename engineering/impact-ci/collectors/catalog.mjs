// Repository-owned descriptive groups. Required membership remains in #790.
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const ci = '.github/workflows/ci.yml';
export const collectorCatalog = freeze({ schema: 'kaal.collector-catalog/v1', version: '1.0.0', groups: [
  {id: 'capabilities', name: 'Capabilities', children: ['hosting', 'acceptance', 'workspaces', 'engineering', 'guard']},
  {id: 'hosting', name: 'Hosting', dimension: 'mixed', selectors: [{workflow: ci, jobKeys: ['hosting']}]},
  {id: 'acceptance', name: 'Acceptance', dimension: 'mixed', selectors: [{workflow: ci, jobKeys: ['acceptance']}, {workflow: ci, checks: ['Acceptance']}]},
  {id: 'workspaces', name: 'Workspaces', dimension: 'mixed', selectors: [{workflow: ci, checks: ['Workspaces']}]},
  {id: 'engineering', name: 'Engineering', dimension: 'mixed', selectors: [{workflow: ci, checks: ['Engineering']}]},
  {id: 'guard', name: 'Guard', dimension: 'mixed', selectors: [{workflow: ci, jobKeys: ['guard', 'guard-hosts']}]},
  {id: 'governance', name: 'Governance', children: ['branching', 'change-isolation', 'promotion-source', 'guard-boundary']},
  {id: 'branching', name: 'Branching Delivery', dimension: 'engine', selectors: [
    {workflow: '.github/workflows/lineage-synchronization.yml'}, {workflow: '.github/workflows/branching-audit.yml'}]},
  {id: 'change-isolation', name: 'Change Isolation Delivery', dimension: 'engine', allowEmpty: true,
    selectors: [{workflow: '.github/workflows/change-isolation.yml'}]},
  {id: 'promotion-source', name: 'Promotion Source Delivery', dimension: 'engine', allowEmpty: true,
    selectors: [{workflow: '.github/workflows/promotion-source.yml'}]},
  {id: 'guard-boundary', name: 'Guard Acceptance Boundary Delivery', dimension: 'engine', allowEmpty: true,
    selectors: [{workflow: '.github/workflows/guard-acceptance-boundary.yml'}]},
  {id: 'security', name: 'Security', children: ['codeql', 'dependency-review']},
  {id: 'codeql', name: 'CodeQL analyses', dimension: 'cross-cutting', selectors: [{workflow: '.github/workflows/codeql.yml'}]},
  {id: 'dependency-review', name: 'Dependency Review', dimension: 'cross-cutting', allowEmpty: true,
    selectors: [{workflow: '.github/workflows/dependency-review.yml'}]},
]});

// Independent report profiles reference, and never replace, the approved policies.
// These labels are not published GitHub check identities or new admission rules.
export const releaseReports = freeze([
  {id: 'kaal', version: '1.0.0', gate: 'KAAL', policyId: 'kaal-main', policyVersion: '1.0.0',
    profiles: ['main-pr', 'main-push'], roots: ['capabilities', 'governance', 'security'], mode: 'full-assurance'},
  {id: 'kaal-capability', version: '1.0.0', gate: 'KAAL Capability', policyId: 'kaal-lineage', policyVersion: '1.0.0',
    profiles: ['lineage-pr', 'lineage-guard-pr'], roots: ['capabilities', 'governance', 'security'], mode: 'full-assurance'},
]);
