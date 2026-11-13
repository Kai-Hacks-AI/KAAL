# Pull Promotion: the command for this repository

`node run.mjs <owner/repo> declaration.json` reads, through the `gh` command line (read-only GET calls of the REST API), the declared collectors of a repository, runs the Skill's `pull-promotion.mjs` and prints which of them have fulfilled their PDCA, as JSON.

For each collector the declaration lists, in the declared order, it reads: the head of the branch and the newest run of each of its checks; the commits on it since its last delivery (a commit titled `TYPE: description (#number)` is a piece, its Change is its `Driven-by:` trailer); the open pull requests into it; and the pull requests that delivered it into `main`. A collector the host does not have is reported as not judged. A list the host cut at its limit fails the command naming it, never a guess. It exits 0 when it printed a result and 2 naming what it could not read.

- `read.mjs` maps the host's records to the facts the Script judges. Legacy commit statuses are not read, only check runs.
- `declaration.json` is this repository's declaration, reviewed like any other file: the collectors in their promotion order, the piece types of the lifecycle and the names of the Check checks. It is the only source of the order.
- `evidence/` holds the run on the real repository (pull/T14).

Credential: `GH_TOKEN` or `GITHUB_TOKEN`, or an already signed-in `gh`; the command fails naming the credential when there is none.

It reports and decides nothing: a collector qualifies or not, it never says "ready", and promotion stays the Owner's decision. It is run by hand; no hook, workflow or scheduled job names it.
