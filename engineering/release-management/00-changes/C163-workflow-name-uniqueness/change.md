# release/C163 workflow name uniqueness among other workflows

A HOTFIX. The Case release/T1581 (C160) asserts that the workflow name of the source `change-isolation-plain.yml` is unique over `.github/workflows` and the wiring sources, leaving out only the source itself. The WIRE of that source installs a byte-equal copy under the same file name, so the Case fails on the WIRE's own pull request (#2787, the check 1 detective WIRE), and with it pull/T34 and the Engineering and Workspaces checks. A WIRE must touch `.github` alone, so the Case cannot be repaired there.

The Defect is release/D19. The Case release/T1597 is RED on `main` while T1581 leaves out only the wiring copy. The correction is the Case's own acceptance, unchanged: a name is unique among OTHER workflows, so a file of the same name in either place is the same workflow. Another file that takes the name still fails.

Not in this Change: the same repair of release/T1576 (C157), which sits on its collector and is repaired there before it promotes; any change of a source, a workflow or a ruleset.
