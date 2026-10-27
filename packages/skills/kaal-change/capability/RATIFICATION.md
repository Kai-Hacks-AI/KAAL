---
name: RATIFICATION
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# RATIFICATION

Requirements, Architecture, Test, Intend, Formalized; Implement, Code, And, Test, Its, Outcome, Neat.

RATIFICATION is one of the ways kaal-change offers to manage a Change. A repository that embeds KAAL chooses whether to apply it, and how strictly. It is not a universal pipeline.

Its first half is PLAN, and it makes a Change ratifiable before implementation. PLAN establishes the Intent, the Requirements and the Architecture, each with its corresponding planned tests. It applies RATS!, which aligns Requirements, Architecture and Testing. Its first Test is the entire planned test set. Before implementation that set becomes the acceptance boundary, and it is immutable.

Its second half implements against that unchanged boundary. DO codes; CHECK verifies; they repeat until all planned tests are GREEN. That is its second Test, and it produces evidence. Implementation tests may evolve along the way. DO and CHECK cannot modify any test established by PLAN, whatever the motive. A defect in the plan is handled through ACT and a subsequent PLAN, never by rewriting planned tests within DO or CHECK. This Definition does not define ACT.

GREEN is test evidence. It is not proof that the Intent achieved its Outcome.

RATIFICATION applies RATS! without taking over its parts: Requirements, Architecture and Testing keep their responsibilities. Testing owns what planned tests mean as evidence, and Intent owns the Outcome.
