# Change isolation: Intent

- **change/I19.** A proposed Change can be bounded and explained through the
  concerns it alters: Intent, functional/nonfunctional Requirements, relevant
  Defects, Architecture, interfaces, Test Cases and realizations, while each
  concern retains its owner.
- **change/I20.** Work inside that boundary can be developed test-first with
  controlled outside collaborators, while boundary compatibility remains a
  separately verified obligation.
- **change/I21.** A focused Change-isolation product can be delivered to main
  without importing unrelated unfinished Change features or claiming complete
  repository assurance from a controlled example.

These are iterative engineering concerns, not a mandatory waterfall sequence.
A changed Requirement or Defect can lead back to Intent or Architecture, and
RED/GREEN/refactoring can revise the proposed isolation.
