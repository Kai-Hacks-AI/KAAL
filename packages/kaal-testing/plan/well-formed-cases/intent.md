# Well formed Test Cases: Intent

`testing/C69` is a PLAN Change. It ships no code and changes no Skill. `testing/C70` (DO, not yet authorized) delivers the check and turns the planned Cases GREEN. Ids are provisional and renumbered if another collector lands first.

**What is missing.** A Test Case is the unit KAAL counts, and the first line `// Case <id> tests: <element id>` is the edge that ties it to what it verifies. Today nothing checks that a Test Case is shaped so that edge can be read: a missing or mistyped first line silently drops the Test Case from the control or requirement it was written for, a duplicate id merges two Test Cases into one, and a target that does not exist verifies nothing. The only reader of the edge is a finder in another package, so the rules of the edge live where it is consumed, not where Test Cases are owned.

- **testing/I43**: Testing owns what a well formed Test Case is and checks it. Given Case files and, when the caller has them, the ids of the elements that exist, it reports every Case that is not well formed: where, what is wrong and why. It reports structure only. It reads no prose, so a rewording never changes the result, and it never decides what happens with a finding: a hook or a pipeline reads the list and decides.

Principle: a capability's rules protect that the engineering around it works correctly. Testing writes the rule once, as a check, and every consumer runs the same one.

**Chain.** Testing owns the check. Its package must be deployed (N or N+1, an engineering decision), so its Skill is deployed, and the check is wired into hooks and CI. Testing's part ends at the check, its criterion and the words that say how to run it. Deployment and wiring are asks to engineering (see `architecture.md`, "What Testing needs from others").

**Out of scope.** No renaming of the edge (`tests:` stays, the word is one constant), no judgement of a Test Case's quality or design, no wording rule, no wiring, no deployment, no change to existing exports or to the run command, no publication.
