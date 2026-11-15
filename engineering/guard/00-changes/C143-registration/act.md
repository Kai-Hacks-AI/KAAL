# C143 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Owner's design arrived in small agreed steps, and each one removed code instead of adding it: the installed copy, the namespace amendment and the two-origin fields all went, and the RED Cases got shorter and truer. The CPO's blocking review on the DO found a real gap in what my Case asserted, and the regression Case that answered it (T216, both listing orders) is the one I now trust most.

## Learned

A Case that checks what ran but not what must not run cannot catch a wrong precedence: T209 excluded the enclosing package from its assertion, so a selection bug could have hidden in it. I read the CPO's line as correct and still shipped without proof; the proof was the inverted comparison failing the new Case. The disable and re-enable of auto-merge to re-run Branching left two red Branching runs that are not the PR's. A bot review requested by mistake added three threads that blocked the merge until resolved, and nothing in the PR said so.

## Lacked

A way to read why a PR is blocked from the session: the required rules, and whether unresolved threads count. A built Hosting in the checkout, so the package's own acceptance suite runs locally; the verification entry still reports cannot verify from a source checkout. A rule for what a shipped test may hash with when the package may not import Foundation.

## Longed For

The unowned-file policy decided, so Guard can say what a changed file with no `kaal-guard.json` means beyond selecting nothing. The deployment Change: Guard running from its `.kaal/` copy, its assets moved under `.kaal/`, and T213's dropped assertion restored there. A repository check that runs a selection Case against every listing order of the files it reads.
