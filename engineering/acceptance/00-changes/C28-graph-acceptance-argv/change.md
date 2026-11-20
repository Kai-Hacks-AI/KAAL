# engineering/C28 graph acceptance argv

A HOTFIX. The Acceptance lane of kaal-graph hands one child process the path of every front-matter Markdown file in the repository, as one JSON argument. On Windows one command line is limited to 32767 characters, so the lane fails with `spawn ENAMETOOLONG` as soon as the repository has enough such files. A PLAN that adds Nodes (Retro's, with 7 new ones) is enough to cross the limit, and every later PLAN that adds Nodes meets the same wall.

The Defect is engineering/D3. The Case engineering/T1239 fails while the test passes that list through argv. The correction is to write the list to a file in the test's own work folder and pass the file's path. Nothing else changes: not the Graph package, not the assertions, not the list itself.

Not in this Change: a limit on how many Nodes the repository may hold, a change to Hosting's `execute`, and any other Acceptance scenario.
