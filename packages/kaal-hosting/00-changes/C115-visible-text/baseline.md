# C115 baseline

The baseline is `main` with the C113 generator (collector `kaal/hosting/pr-template-generator`, promoting).

- A declaration holds `type`, `intro`, `chapters` and `raise`. `renderTemplate` writes `intro` and each `guidance` as `<!-- ... -->`; `renderBody` writes only the chapters.
- The HOTFIX template today opens with a visible line, `**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.` It is hand written outside the comment. kaal-change/C14 cannot declare it, because the format has no visible text.
