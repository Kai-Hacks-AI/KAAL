# Id claims: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A69** [core/F133, core/F134, core/F135]: The claim file is the shape of F133 and nothing else. The folder it lives in and the write area that holds it are the adopter's. For this repository it is one folder at the repository root, inside no package, so Release's lane can match it without covering any capability's own files; Engineering confirms it as the write area. Core exports that row as data, `ID_CLAIM_LANE`, from `kaal-core/id-claims`, so the lane's table takes it without copying it. The lane's table row for it is `{ kind: "id claim", roots: [that folder], name: "^[a-z]+-[1-9][0-9]*\\.json$", allow: add only }`, and the uniqueness key is the whole file name, which is the kind and the number and no capability, so two capabilities that claim one number write one path and the second is refused.
- **core/A70** [core/F136, core/F137, core/F138, core/F139, core/F140, core/N34]: `judgeIdClaims` and `nextClaim` are two pure functions in `src/id-claims.ts`, exported as `kaal-core/id-claims`, with the rest of Core's pure judges. They import nothing from a host and read no file.
- **core/A71** [core/F137, core/F138]: The control that runs the judge on a Change is Change's, with the owner of each path from Engineering's ownership data. Core's judge returns the verdict and the findings and is framed as a control by the capability that adopts it.

## Design questions

| Question | Recommendation |
| --- | --- |
| **Q1.** Identities are qualified by their namespace, so why is a number claimed once across namespaces? | **Because a bare number is how branches, folders and people name a thing.** `release/C175` and `controls/C175` are two identities, and the two clashes still cost a renumbering each time, since the folder `C175-…` and "C175" in a thread name both. A claim is of the number, so the file name has no capability in it. The identity of `core/C164` is unchanged by this, and it is the Owner's call whether the number stays one sequence. |
| **Q2.** Where does uniqueness run, since the lane judges names and statuses only? | **In the lane, by the file name.** Two claims of one number are one path, and the second is refused in the merge queue before any content depends on it. Core's judge needs no overlap rule, because a claim is one id. |
| **Q3.** Where do `unclaimed` and `foreign` run? | **In a control over Core's judge, on the content's own pull request**, with the owner of each path from ownership data. It is a detective control until the Owner activates it, and activating it is the Owner's go. |
| **Q4.** What happens before the lane is active? | **The same file, merged as an ordinary small change.** There is no interim shape and no block. Activating the lane makes it faster and changes nothing in the claim or the judge. |
| **Q5.** Who claims the numbers already in use? | **Nobody.** An id below the first claimable number is legacy, which includes every id that exists today. The first claimable numbers are the adopter's and sit above the highest in use on every branch. |
| **Q6.** How is a claim withdrawn or renumbered? | **It is not, on the lane.** A claim is added and never changed. A claim that was never used is a gap. Correcting a claim is an ordinary change outside the lane. |
| **Q7.** Which kinds are claimed? | **Change and Case first, because they clash.** The kind is a word, so another numbered kind joins by one entry of `from` and a name pattern in the lane's row. Defect ids are `<capability>/D<n>` and one holder owns each namespace, so they cannot clash across capabilities today. |

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. One exact claim file for each id, on the fast lane, with a pure judge** (recommended, the Owner's decision) | One file shape, two pure functions, one lane row. | Each capability claims before it uses a number. |
| B. A block of numbers for each capability | A range for each capability, claimed once. | The Owner dropped it: a block is a stopgap, and it holds numbers that are never used. |
| C. One register file that every PLAN appends to | One shared file. | Every collector holds its own copy of the next number, and two appends of one line conflict. |
| D. A scan of all branches for the next free number | A check over the branches. | It needs the branch list, which is Git and Hosting mechanics, and it finds the clash only after two branches carry the number. |

## Effects outside Core

| Change | Owner | Why |
| --- | --- | --- |
| The lane and its judge, a table of `{ kind, roots, name, allow }` entries (release/C191), and the lane's branch kind, ruleset and workflow | Release | Release owns routes and gates. The lane judges names and statuses only. |
| The id-claim row in that table, added as data with its own Cases | Core, in its own DO | The row is this capability's payload shape. Change's draft change/C250 is superseded by this PLAN. |
| The folder and write area for claims, and the first claimable number for each kind | Engineering | The consumer adaptation of this repository. |
| The control that runs Core's judge on a Change, and the Skill guidance to claim before using a number | Change | It owns the Change folder and the guidance that tells a thread what to do first. |
| Putting the control into CI and the required checks | Hosting | Platform mechanics, on the Owner's go. |
