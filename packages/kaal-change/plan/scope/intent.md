# What a Change Changes, and Its Selected Scope: Intent

This is `change/C9`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

Engineering's Change Isolation by reverse traceability (`engineering/C11`, #716, the Owner's Option B) judges a Change that touches more than one capability's location against two statements the Change makes about itself:
- what it changes;
- which capabilities it selects.

Engineering reads both and defines neither. Their shape is Change's, and the PLAN names this as prerequisite P1 (`engineering/change-isolation/traceability.md`). Today a Change Node states what it succeeds, what it delivers and what it requires (`change/C1`), but not what it changes or where.

- **change/I16.** **A Change states what it changes.** These are the elements it alters, each by its owner's identity, such as `hosting/F31`: an Intent, a Requirement, an Architecture element, or another element its owner identifies. It is the Change's own outgoing statement, beside `delivers` and `requires`.
  - What an element means, and whether it exists, is its owner's to say.
  - What else the change reaches is computed by whoever follows the traces, never stated by the Change.
- **change/I17.** **A Change selects its scope.** These are the capabilities it will change, each by name, never by path and never by pull request.
  - The selection is an authority someone else judges against. So Change gives it exactly as stated, or not at all.
  - Whether the selection is justified, and which paths it admits, is Engineering's to judge from each capability's ownership claim.
- **change/I18.** **Both are optional and additive.** A Change Node that states neither behaves exactly as today. A Change that states no scope has stated none: neither Change nor its exchange invents one, and Engineering's defaults apply (`engineering/N13`).
