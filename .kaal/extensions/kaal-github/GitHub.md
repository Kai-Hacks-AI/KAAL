---
name: GitHub
type:
  name: Extension
  id: b2bf7b53f7f5a29776ce457af85dcebd7213cf963981f046174c253a0794d68a
---

# GitHub

The GitHub Extension is the Node through which GitHub, as the host that runs a repository, joins KAAL without becoming Core. It is the Extension step of CASE 6cffa01b750f77878b45ffc568824518711a1da10a579e8650b6847f357ebf60 for that host: a Node is a KAAL Extension exactly when its type refers, by name and ID, to the Extension definition, and this Node does.

What the Extension means to KAAL is one direction of dependence. A host workflow invokes the Extension; the Extension reads from Git what the host's checks need, a baseline and what differs from it, and asks KAAL's own operations, over a baseline KAAL and a candidate KAAL, whether the candidate holds; it reports what KAAL answers and decides none of it. KAAL knows nothing of Git or GitHub, the Extension imports nothing of KAAL, and it carries no meaning of what KAAL's artifacts, seals or changes are.

The only rule the Extension holds of its own is a rule of the host's repository: which paths may only be changed alone. That is where a repository's protected parts are, and it is configuration of the Extension, not of KAAL.
