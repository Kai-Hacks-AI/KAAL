# Hosting 0.0.1 SYNC candidate — resolution ledger

Status: **preparation only; not a resolved merge candidate**. Owner authorized preparation, not integration.

Baseline (revalidate before implementation):
- main: `be3a2d09a386967bd5a1cd4a850f389951bc0796`
- kaal/hosting: `dc2a2354088d585a34e7c0c47f813c3f04590350`
- common ancestor: `f0d1eb94b5196b290044764832cba4ddd22ed408`

## Decisions to implement

| Area | Main | Hosting | Resolution | Owner |
| --- | --- | --- | --- | --- |
| Root scripts | comprehensive Engineering lane, expanded suites | scoped Hosting references | comprehensive lane and suites with scoped Hosting workspace references | Engineering + Hosting |
| Workspaces lane | suites() fail-closed missing tests | scoped import and exclusion | retain both; never --if-present | Engineering + Hosting |
| Core bootstrap | Admitted + registration assembly | scoped Hosting import, older Graph resolution | preserve main semantics and scope Hosting import | Core + Hosting |
| Embedded acceptance | new Core registration cases | scoped consumer paths | retain both assertion sets | Core + Hosting |
| Root lockfile | main workspace metadata | scoped Hosting package | regenerate from reconciled manifests | Engineering |

## Required evidence before Owner review

- Actual three-way merge conflict markers / hunk inventory; do not equate overlapping file diffs with conflicts.
- Every conflict resolution and resulting changed-file list, including owner attribution.
- Validate scoped Hosting API imports against exports.
- Run all required checks including Linux, macOS, Windows and Guard C136 optimization.
- npm pack manifest and clean external consumer verification.
- Exclude #751, #694, #759 unless demonstrated dependency.

No SYNC merge, promotion or publication is authorized.
