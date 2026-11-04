# BRITTLE: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F72** [testing/I19]: **The term.** BRITTLE, Be Right Improving Testing Targets Learned Experience, is Testing's term and concern. A Test Case is brittle when its verdict follows something other than its target:
  - a **false RED** rejects a change the target permits, such as an extension its Architecture authorizes;
  - a **false GREEN** accepts a real violation of the target.

  Either is a defect of the Test Case, not of its subject. A false RED blocks legitimate work. A false GREEN hides a violation, which is the worse failure, because no run reveals it.
- **testing/F73** [testing/I19]: **Designing a Case that challenges its target.**
  - **The target's authority.** Take each expectation from the target the Case traces to, and from the authority that states it, outside the candidate. Never take it from a snapshot of the candidate's own current shape.
  - **What the target fixes.** Assert exactly what the target fixes. Use equality where the target states exactness, and containment or a property where it states a minimum, a closed set with an extension point, or a rule.
  - **Closed vocabularies.** Read a closed vocabulary strictly, such as a status, a kind or a result word. An unknown or misspelled value is a finding, never a default and never optional.
  - **Discrimination.** Pair the Case's positive with a discriminating negative for each way the target can be violated, and with a positive for each extension the target authorizes. A negative that the unchanged candidate would also fail discriminates nothing.
- **testing/F74** [testing/I19]: **Learning from a lesson.** An observed false RED or false GREEN is a lesson. The Change that corrects it records it with:
  - the Case;
  - its kind, false RED or false GREEN;
  - the target the Case traces to;
  - the incidental detail it froze, or the violation it missed;
  - the correction.

  The correction is a new version of the Case, or a new Case, that traces to the same target (testing/F24, testing/F25). So no Run of the brittle version stands for it any longer (testing/F40). A false GREEN that let a real violation through is also a Defect: a durable prohibited behaviour, traced by a Case that tests it. A later GREEN evidences the correction and never erases the Defect. Each lesson informs the next PLAN's Test Case design ("Inform Next Generation").
- **testing/F75** [testing/I19]: **Who owns what.**
  - Testing owns the term, the design checks and the shape of a lesson. That is verification.
  - Review owns the judgment of whether a change is a legitimate extension, and whether a Case is brittle where no check decides it. That is validation. Review may consume BRITTLE in its own guidance.
  - Each capability owns its Cases, corrects them, and records its own lessons where its PLAN lives.

## Nonfunctional

- **testing/N15** [testing/I19]: BRITTLE adds no runtime code, no model kind and no registry. Testing keeps no registry of tests, findings or lessons. A lesson lives in the owning capability's PLAN, and its correction lives in that capability's model and tests.

## Not in this Change

- Hosting's correction of hosting/T21 and hosting/T24 and its recorded lesson. They are Hosting's (`hosting/C15`, #664).
- Review's validation guidance that consumes BRITTLE. That is Review's.
- Revisiting other capabilities' existing Cases. Each owner applies BRITTLE in its own Changes.
