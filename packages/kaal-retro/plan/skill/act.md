Method: 4L
Subject: Delivering the standalone kaal-retro Skill (retro/C1), PLAN through DO.
Participants: the delivering agent only. The CPO's reviews are cited where they changed the work; the Owner's and any consumer's views are missing.

## Liked
- Observation: The CPO's two corrections to the PLAN each removed something I had added without a demonstrated need: first the record schema and checker, then the zero-lookup rule.
- Observation: Running the Skill-only trial and the baseline on the same subjects gave an observable accounting instead of a claim of lower cost.
- Potential improvement: When a PLAN adds a mechanism beyond the smallest useful move, state the requirement that demands it, or leave it out.

## Learned
- Observation: The first trial attempt was void because the Skill text was not expanded in the prompt, and one agent said so.
- Interpretation: A trial whose input is not inspected can look like a result; the agent's remark was the only thing that exposed it.
- Observation: Two of three Skill-only records raised `unlabeled-entry`, appending text to `None raised.`; the record challenge was not changed to pass them.
- Interpretation: The Skill's wording allows the variation, so the finding may belong to the Skill, not the agents; one run per cell cannot say how often it happens.
- Observation: The Skill-only arm saved 1,000 to 2,400 tokens per run, because the Skill text is in its prompt.
- Interpretation: The saving that matters is in lookups and tool calls, not in the context total.

## Lacked
- Observation: Evidence lookups were never exercised; every subject was given inline.
- Observation: The collector `kaal/retro/skill` has a capability segment that does not match the provisional Learning ownership claim.
- Observation: Instruction lookups were counted by each baseline agent in its own way (two, two and five).
- Potential improvement: Run a trial where the subject requires inspecting records, so evidence lookups show up in both arms.
- Potential improvement: Have the Owner settle the capability that owns the package, then name the collector for it.
- Potential improvement: Count lookups from the transcript, not from the agent's own report.

## Longed For
- Observation: A way to tell whether `None raised.` should be one exact line, from more runs than three.
- Potential improvement: Repeat the Skill-only arm several times per subject before deciding whether to tighten the 4L reference or relax the record challenge.

Decisions: None made. The Owner and CPO decide ownership, collector naming and any change to the Skill or the challenge.
