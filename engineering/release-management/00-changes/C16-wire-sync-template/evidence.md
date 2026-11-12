# C16 evidence

## Method

The three Cases T116, T117 and T121 are copied over a tree of `main` and called. A second run uses this collector, which holds the installed template and not the capability text. A third run adds `sync-template.md` from release/C9 to this collector.

## Result

| Tree | T116 | T117 | T121 |
| --- | --- | --- | --- |
| `main` | RED: A37 absent | RED: the installed template absent | RED: A37 absent |
| this collector, without the capability text | green | RED: the capability text absent | RED: the capability text absent |
| this collector with `sync-template.md` of release/C9 | green | green | green |
