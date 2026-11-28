---
id: review/RT3
format: 4L
reflects: [review/C6]
---
Account of: I am the Review agent who planned `review/C6` (`#2604`), carried its DO (`#2850`) and its PLAN amendment (`#2851`) on collector `kaal/review/inspector-app`, and wrote this retrospective; Kai is the Owner, the CTO and the CPO are delegated roles whose calls shaped the Change, and this is my own account.

## Liked
- subject: keeping the Case material as plain files that load nothing from the delivered package until they run, so each Case is RED by assertion and never by a load error
  keeps: when the Owner changed the name of the secret and Hosting asked for one more ability, the DO needed no change to how Cases run, and the amendment touched only constants, a fixture and one list.
- subject: reading Hosting's declaration code on its own collector before confirming that an ability change leaves the installation unchanged
  keeps: the claim that `read-checks` with `post-checks` is still exactly Checks write was checked against the mapping, and the CPO approved the amendment without a question on it.

## Learned
- subject: how Hosting maps abilities to GitHub permissions
  searched: I read `app-declaration.ts` on `kaal/hosting/github-app-adapter` and found that each ability maps to one permission at one level and the highest level of each permission is taken, which is why two abilities on checks give one Checks write.

## Lacked
- subject: the Owner's naming scheme for the secrets of the Apps (`KAAL_APP_<NAME>_KEY`), settled before I wrote the workflow fixture and the Case that pins the key
  decision-point: writing the fixture and T1537 in the PLAN, where I named the secret `INSPECTOR_PRIVATE_KEY`.
  cost: the Owner named it differently after the DO was raised, the CPO held the DO, and a second PLAN amendment and a second branch were needed before the DO could take the name; the same change of name was then made in the Cases, the fixture and the judgement.
  findable: no
  address: Skill
- subject: the list of what a review on the Inspector's token reads, known when its abilities were written
  decision-point: writing the exact list of abilities in F32.
  cost: Hosting found later that a merge-queue review reads check runs, so `read-checks` was added by amendment to F32, the PLAN and two Cases.
  findable: no
  address: Case

## Longed For
- subject: one place where the Owner's conventions for Apps (names of secrets, abilities and ids) are written down, so that a PLAN can follow them from the start
  worked-anyway: I asked the coordinator for each convention as it was decided and amended the Cases when it changed, and nothing was lost.

Decisions: none made, the owner decides.
