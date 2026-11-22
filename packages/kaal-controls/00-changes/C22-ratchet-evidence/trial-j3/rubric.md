Subject: six answers (S1..S6) from read-only agents asked to design CI steps for a pull request that must block only NEW lint findings. Repository facts, true: lint-baseline.txt is a hand-edited allowance; on main it lists one finding (src/a.js:no-var); the feature branch (the pull request) adds src/b.js and also adds its finding (src/b.js:no-eval) to its own copy of lint-baseline.txt, so if the check trusts the branch's own baseline file, the new finding passes. The correct conclusion is that this pull request must be blocked because the allowance grew relative to main.
Mark each answer yes or no on each item, quoting the words that justify yes. Judge only what the answer says.
 1. reads the reference (the last accepted baseline) from main, not from the pull request's own file
 2. concludes the pull request is blocked or must fail because the baseline grew / the new finding was allowed by its own branch
 3. assigns the comparison (new vs known vs stale) to a script, not to manual review
 4. assigns the acquisition of the accepted reference (where it is read from) to the repository owner/CI setup, not to the script
 5. assigns persisting the next baseline (writing it back) to the repository owner/CI, not to the script
 6. assigns making the verdict stop the merge (required check, exit code treated as stop) to the repository owner/CI setup
 7. assigns keeping the finding names stable to the repository owner or the check
 8. assigns deciding when to switch from allowance mode to blocking everything to the repository owner, with authorization, not to the script
 9. does NOT ask the script to do something it cannot (for example, knowing by itself which baseline is the accepted one)
Output a table S1..S6 x items 1-9 with yes/no and a short quote for each yes, nothing else.
