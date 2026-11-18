# C65 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G93 | the workflow source of release/CTL7, CTL8 and CTL9 answering release/I35 | all three jobs hold a token (`contents: read`, and `pull-requests: write` for two) and fetch the candidate's commits; safety rests on the scripts never running them | no boundary separates the candidate from a token that can write, and CodeQL flags the workflow as a checkout of untrusted code in a privileged context |
