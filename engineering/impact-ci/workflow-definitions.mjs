// Shared producer/job definitions only. Each assurance policy owns applicability
// and its explicit required check/OS inventory; this catalog selects no gate.
import anchors from './full-matrix-anchors.json' with { type: 'json' };
const jobs = (id, name, os = 'Linux') => ({ job: id, check: name, os,
  labels: [({ Linux: 'ubuntu-latest', Windows: 'windows-latest', macOS: 'macos-latest' })[os]] });
const hosts = ['Linux', 'Windows', 'macOS'];
const definitions = [
  { file: 'ci.yml', id: 383088175, jobs: [
    ...hosts.map(os => jobs('hosting', `Hosting (${os})`, os)),
    ...hosts.map(os => jobs(os === 'Linux' ? 'lane' : 'acceptance', os === 'Linux' ? 'Acceptance' : `Acceptance (${os})`, os)),
    jobs('lane', 'Workspaces'), jobs('lane', 'Engineering'),
    ...hosts.map(os => jobs(os === 'Linux' ? 'guard' : 'guard-hosts', os === 'Linux' ? 'Guard' : `Guard (${os})`, os)),
  ] },
  { file: 'change-isolation.yml', id: 384218565, jobs: [jobs('change-isolation', 'Change Isolation')] },
  { file: 'lineage-synchronization.yml', id: 384461082, jobs: [jobs('lineage-synchronization', 'Branching')] },
  { file: 'promotion-source.yml', id: 384297776, jobs: [jobs('promotion-source', 'Promotion Source')] },
  { file: 'codeql.yml', id: 386954811, jobs: [jobs('analyze', 'CodeQL (actions)'), jobs('analyze', 'CodeQL (javascript-typescript)')] },
  { file: 'dependency-review.yml', id: 387016191, jobs: [jobs('dependency-review', 'Dependency Review')] },
  { file: 'guard-acceptance-boundary.yml', id: 393958429, jobs: [jobs('acceptance-boundary', 'Guard Acceptance Boundary')] },
  { file: 'branching-audit.yml', id: 389075849, jobs: [jobs('audit', 'Branching audit')] },
];

const events = {
  'ci.yml': ['pull_request', 'push'],
  'change-isolation.yml': ['pull_request_target'],
  'lineage-synchronization.yml': ['pull_request_target'],
  'promotion-source.yml': ['pull_request_target'],
  'codeql.yml': ['pull_request', 'push'],
  'dependency-review.yml': ['pull_request'],
  'guard-acceptance-boundary.yml': ['pull_request'],
  'branching-audit.yml': ['push'],
};
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const workflowDefinitions = freeze(Object.fromEntries(definitions.map(w => [w.file, {
  ...w, path: `.github/workflows/${w.file}`, events: events[w.file],
  sourceDigest: anchors.sources[`.github/workflows/${w.file}`], appId: anchors.appId,
}])));
