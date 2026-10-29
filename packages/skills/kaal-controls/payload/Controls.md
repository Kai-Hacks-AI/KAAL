---
name: Controls
type:
  name: KAAL Capability
  id: 56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e
---

# Controls

Controls is the capability for understanding controls and for claiming no more assurance from a control than the evidence supports. Its scope is that alone. Which controls a capability needs, and what they must achieve, belong to that capability.

A control is a measure taken toward an objective. Reasoning about a control keeps five analytical distinctions apart, and none is inferred from another. They are distinctions for reasoning and for claims, not a schema every control must fill in:

- **Objective**: what must hold or must not happen. It belongs to the capability that owns the governed behaviour.
- **Type**: what the control is designed to do about a violation. KAAL's initial vocabulary has four types. A **directive** control states the required behaviour, which may or may not be followed. A **preventive** control blocks a prohibited action within a specified actor or interface and enforcement boundary. A **detective** control reveals deviations. A **corrective** control restores the desired state. This is an initial vocabulary, not a closed taxonomy: it is not claimed to exhaust established control frameworks, and further types are added to it deliberately.
- **Mechanism**: what realizes the control, such as written instruction, human review, an automated check, or enforcement by the system that performs the action. Type and mechanism are independent. A check that reports a violation is detective; a gate that requires that check to pass before a particular action takes effect prevents that action.
- **Evidence**: what has actually been observed, such as the configuration of the system that enforces a control, a result produced for the specific subject, or an approval. Evidence that a control is configured is not evidence that it operated.
- **Effectiveness**: whether the control, operating as designed, achieves its objective, within its stated limits.

Type is a matter of design, distinct from assurance. A directive is directive by design, and a preventive design remains preventive while its operation is unobserved; only what is claimed about it changes. An assurance claim is no stronger than the evidence observed. Evidence that a control is configured is not evidence that it operated, and operating once does not show it is effective. What verification and validation are, what a finding is, and what a clean result does and does not show are Testing's: a detective control that reports nothing gives a clean result, which never shows that nothing is there, and a fact about a control that was not observed stays unknown. A preventive claim names the action it prevents, the actor or interface it applies to, and the enforcement boundary within which it holds. It never promises that the action is impossible: whoever acts outside that boundary, such as an administrator able to bypass it, is not covered.

Independent controls stay independent when a gate combines them. A review, an automated check, a sign-off and the execution of the governed action are distinct, and evidence of one never stands in for another. A sign-off is a decision by whoever is accountable, not a type of control. A review or a verification is independent only when whoever performed it is not whoever did the work, and distinct accounts are evidence of distinct credentials, not of distinct people.

A specific control is documented as a Node typed by `Control`, by the capability that owns the governed behaviour. Its Edges typed by `Realized by` point to where it is realized. Such an Edge is traceability, not evidence: it shows where a control is claimed to be realized, never that the mechanism operates or that the control is effective.

Controls is semantic and behavioural only. It keeps no registry or catalogue of controls: documented controls stay with the capabilities that own them. It maps to no compliance framework, assesses no system and enforces nothing.
