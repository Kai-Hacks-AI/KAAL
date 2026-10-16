---
name: kaal-controls
description: Classify controls as directive, preventive, detective or corrective, and state only the assurance the evidence supports. Use when writing, reviewing or reporting on a rule, policy, check, gate, review or safeguard, or when saying that something is enforced, prevented, guaranteed, protected or verified.
license: MIT
---

# Working with controls

What Controls means is stated by the `Controls` Node in a KAAL Engine: read it there, starting from the Engine's `AGENTS.md`. This file tells you how to do the work.

## Keep five facts apart

For any control you describe, know each of these separately. Never infer one from another.

1. **Objective**: what must hold or must not happen. Take it from the capability that owns the behaviour; do not invent or restate it.
2. **Type**: what the control is designed to do; one of four.
   - **Directive**: states the required behaviour, which may or may not be followed. A written rule, policy or instruction is directive, however firmly it is worded.
   - **Preventive**: blocks a prohibited action within a specified actor or interface and enforcement boundary.
   - **Detective**: reveals deviations. A scanner, a test, a report or a reviewer reading a proposal detects.
   - **Corrective**: restores the desired state.
   These four are KAAL's minimal working vocabulary, not a complete account of every framework. Do not add types; describe what is left over in plain words.
3. **Mechanism**: what realizes it: written instruction, human review, an automated check, or enforcement by the system that performs the action. The same check can serve different types: run on its own it detects, and a gate that requires it to pass prevents the action the gate governs. A check that can be skipped, or that runs only where someone installed it, stays detective.
4. **Evidence**: what you have actually observed, such as the enforcing system's configuration, a result for this exact subject, or an approval. Note whether it shows the control is configured or that it operated.
5. **Effectiveness**: whether, operating as designed, it achieves the objective, and its stated limits.

## Calibrate every claim

Classify by design; claim by evidence. The type says what a control is designed to do and does not change with what you have observed. A preventive design you have not seen operate is still preventive: its prevention is unverified. Claim no more than the evidence you have observed supports.

- **Documented is not enforced.** A description of a control is not evidence that it operates. For a directive, say "the rule requires", not "it is impossible to". For a preventive design you only know from its description, say what it is designed to block and that you have not observed it operating.
- **Configured is not operating.** Having seen a setting shows design. To say it operates, cite a result it produced for the subject in question.
- **Operating once is not effective.** One result shows that the control ran, not that it achieves its objective.
- **Nothing found is not nothing there.** When a detective control reports no findings, say that it reported none, within its limits; do not say the problem is absent.
- **Unverified is said.** When you cannot observe a fact, for example because you lack access, say it is unverified. Do not fill the gap from defaults or from what is usual.

## Scope every preventive claim

A preventive claim names three things:

- **the action** that is stopped,
- **the actor or interface** it applies to,
- **the enforcement boundary** within which it holds.

Write "writes through this interface are rejected for a credential without write permission", not "writes are impossible". Write "integration is refused unless the required checks pass on the exact proposed state", not "broken work cannot get in". Anything outside the named boundary, such as another interface, an exempted actor or an administrator able to bypass it, is not covered by the claim. Never promise that an action is impossible. If you do not know the boundary, you cannot make the preventive claim: state what you have observed, and that the boundary is unknown.

## What this Skill does not do

It does not decide which controls a capability needs, keep a list of controls, map them to compliance frameworks, assess a system or enforce anything. When you describe a control that belongs to another capability, keep that capability's objective and wording, and add only the classification and the calibrated claim.
