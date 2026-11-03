# kaal-defect record definition: Intent

This is `testing/C54` (number provisional), a PLAN Change. It ships no code, export or package. It answers the open point of #914: the Defect record definition (fields, identity, lifecycle), which `kaal-defect` owns and Testing incubates (Owner, 2 Nov; four-way split agreed 3 Nov).

Four owners share the subject, and this PLAN defines only the first:

- **`kaal-defect`, incubated in Testing** owns the concept and what a record must state to be a Defect.
- **Testing** owns RED/GREEN evidence and execution, with its existing three results.
- **Requirements** owns the obligation arising from a Defect and its `Serves` trace (`requirements/F10`, `T11` stand).
- **The raising context** owns each instance, its identity and its lifecycle. **Change** (FAR) owns the Defect Plan and the Regression Plan as Plans; the Defect Plan is an ordinary Plan (confirmed on #929).

The Intents:

- **testing/I25**: A Defect is a statement that an expectation was not met, grounded in evidence. A record states what was expected, what was observed and where, so that anyone can judge it without the raiser.
- **testing/I26**: A Defect is confirmed only by a RED Test Case, and answered only by that Case turning GREEN in a later Run. Reporting, confirming and answering are three different facts, and none stands in for another.
- **testing/I27**: The record defines the shape of a Defect and nothing of its context. It carries no requirement text, no decision to accept the obligation, no gate and no Plan membership. Instances belong to the context that raised them.
