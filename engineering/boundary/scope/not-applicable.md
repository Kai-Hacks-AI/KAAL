---
not-applicable:
  - name: LICENSE
    reason: a licence text, no executable content
  - extension: .gitignore
    reason: ignore patterns, no executable content
  - extension: .gitattributes
    reason: attribute patterns, no executable content
  - name: CODEOWNERS
    reason: ownership patterns, no executable content
  - name: .git
    reason: a pointer to the git directory, no executable content
---
# The global list

Files that never hold code the Boundary Engine's code detectors could read, in any package. The Engine decides applicability itself,
by file kind (`parse.mjs`); this list only gives the reason. It holds exact names and extensions, each with a reason: no glob, no path,
no target, no role, and never a kind that has a parser, because a parse failure must show. A change to it is an Engineering Change.
A capability's own list sits in its Boundary definition under `not-applicable:`.
