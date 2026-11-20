# An installed kaal-testing stands alone: ACT (testing/C65, testing/C66)

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It does not close the Change's open points, and it claims no collector qualification, promotion or publication.

## Liked

Kai's push to test the thing the way a consumer meets it: install the package into an empty folder and see what a stranger does. Each question moved the evidence. "Where was it deployed?" showed that the first trial was discovery by chance, and the answer was a second arm with the Skill in `.claude/skills`, run as real headless sessions instead of my stand-in. The CPO's two comments kept the scope honest: Testing owns testing expertise, execution and evidence, deployment and discovery belong to packaging and WIRE, and the consumer owns the decision. Judging each run in a separate session, with quotes that must be found in the transcript, made the verdicts checkable.

## Learned

An agent finds what the package says about itself. With no pointer, two of three strangers used plain `node --test`; one line in the README and the Skill changed all three. A deployed Skill is picked up by location, and that is a finding for every KAAL capability, not for Testing. A criterion can be unfair to the thing tested: K7 asked the Skill to make an agent not decide, against a prompt that asks for a decision, so it measured the prompt. A rule written as a "don't" gives an agent nothing to do; stating where the work starts and where it stops is clearer. I also wrote a completion condition into the example report ("no result is handed on yet"), which made Testing control the consumer's workflow; the CPO caught it. A fallback is not proof: an agent that ran the `.mjs` file after "Permission denied" did not show the command works, and the cause was real, the bin was committed without its executable bit. A Node 24 test that never settles hangs the run where Node 22 cancels it, so a fixture that stands for "unobserved" has to be an error, not a pending promise.

## Lacked

A way to deploy the Skill into an agent's skill location other than copying it by hand: the second arm used copies I made, and three dry-run sets were on hand-made copies of the tarball, not npm installs. A baseline arm with no Skill and no README (D2), to say what the package adds. A neutral, quality-focused trial: this one only shows that given tests are discovered, run and reported. The whole Testing suite in my sandbox: the workspace was not built there, so CI was the check for anything beyond the Cases.

## Longed For

A Testing Change with a fair trial of test design and quality, kept apart from this one (the CPO asked for it separately). A cross-KAAL lesson in package, WIRE and agent-discovery work that a deployed Skill changes agent behaviour, with Testing not made responsible for installation. A neutral claim-file format instead of `ownership.kaal.json` (D1). The two earlier concerns still stand for the Change that consumes the report: test counts are not Case counts, and RED 0 is not completion.

## Open

Not closed. Testing quality, universal Skill deployment, the baseline arm, the neutral claim file and the consumer's judgement of the report are separate Changes. The recorded trials are small pilots of three sessions each, with abridged transcripts for sets 1 to 3, and the "repositoryReachable" field means no repository is on the working folder's path, not that reading elsewhere was prevented. Collector qualification, promotion and publication are separate decisions.
