// The six template sources and their installed targets (release/C25).
// source (relative to engineering/release-management) -> installed file (relative to the repository root, the WIRE target)
export const PAIRS = [
  ['05-src/wiring/templates/plan.md', '.github/PULL_REQUEST_TEMPLATE/plan.md'],
  ['05-src/wiring/templates/do.md', '.github/PULL_REQUEST_TEMPLATE/do.md'],
  ['05-src/wiring/templates/act.md', '.github/PULL_REQUEST_TEMPLATE/act.md'],
  ['03-architecture/A34-sync-template/sync-template.md', '.github/PULL_REQUEST_TEMPLATE/sync.md'],
  ['05-src/wiring/templates/promotion.md', '.github/PULL_REQUEST_TEMPLATE/promotion.md'],
  ['05-src/wiring/templates/default.md', '.github/pull_request_template.md'],
];
