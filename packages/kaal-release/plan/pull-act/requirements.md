# Pull Promotion: the collector-level concluding ACT (target)

Scoped `pull/` (ids are global). Adds to pull/F28; nothing of pull/F25 to F33 is relaxed.

**Why.** A collector that carries several Changes holds one retrospective per Change (the history of how each Change went). The Owner's direction for collector qualification is to keep those as Change history and add **one concluding collector-level retrospective**, the qualification retrospective for the whole collected work. pull/F28 counts every file that matches `act.files` as an ACT, so the Change-history retrospectives would make a collector with a concluding one ambiguous.

- **pull/F34. The concluding ACT is told apart from the Change-history retrospectives by the declaration.** The declaration's `act` may carry `history`, a list of path patterns naming the **Change-history retrospectives** (for example `plan/<change>/00-changes.md` and `00-changes/<change>/act.md`), while `act.files` names the **concluding collector-level ACT** (for example a file named `concluding-act.md` inside the scope). With `history` declared:
  - a delta file that matches a `history` pattern is a Change-history retrospective: it is never an ACT candidate, is not counted, and its text is not read, so any number of them neither qualify a collector nor make it ambiguous; a file that matches both lists is a history file;
  - the delta files that match `act.files` and are not history files, and whose text holds all four headings, are the candidates, and exactly one of them concludes the work as pull/F28 says (none or two or more: does not qualify, naming them; an unread candidate: not judged);
  - the concluding ACT must also come **after every Change-history retrospective**, by the position in the `history` of the commits and never by a time: a history retrospective changed in a commit after the last commit that changed the concluding ACT means it does not qualify, naming that file; a history retrospective the history never places is not judged, naming it.
  Without `history`, pull/F28 applies exactly as approved. The declaration naming the right shapes is the declaration's review, as pull/F33 says.
