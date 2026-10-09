# Retro

## Learned

That collaboration becomes much simpler once authority boundaries are separated from process transitions. The important shape is now clearer: the human and Owner co-work to describe the Intent, then Worker and Reviewer can carry the Work between them, and the human and Owner return when the finished Work must be judged against what was wanted.

The six-D progression also emerged from using the process rather than designing it in advance: Describe Intent, Define Requirements, Design Architecture, Develop Code, Do It, Detect Defects. They describe kinds of Work, not permission gates, and we have deliberately not fixed where Review belongs among them.

## Liked

That the smallest solution was mostly removing false stops rather than adding machinery. No handoff artifact, permission model, status mechanism or new Node was needed.

I also liked that this Change exercised the collaboration model while changing it. Once the Intent was handed over, Worker and Reviewer were able to iterate through findings and convergence without requiring Owner judgment about the substance of the Work.

## Lacked

The collaboration was still not completely in flow. Current agent and host boundaries meant that some Worker/Reviewer transitions still needed routing or explicit permission even though KAAL itself did not require an Owner decision there.

We also nearly turned convenient current representations into semantics: first by binding the described Intent to a particular filename, and then by treating Intent as solely an Owner act. Both were caught while Work was still open. That reinforced the distinction between the meaning of a process act and how Work happens to represent it.

## Longed

For ordinary Changes to exercise this model without being about collaboration itself: human and Owner describe the Intent, Worker and Reviewer carry the middle, and human and Owner return to judge the sealed Work and learn from it.

Those Changes should also teach us where Review actually belongs within the six-D progression. That should be learned from where Review adds value, rather than fixed now as another piece of ceremony.
