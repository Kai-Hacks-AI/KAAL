# Inventory

A recorded Defect is a record in the context where it was born, and the record is authoritative. Discover the records; keep no second list of Defect ids (no register, no membership marker), because a list would be a second source of truth and a second decision on what is recorded. A recorded Defect persists unresolved across Changes and releases until it is `answered`.

Three things stay apart: where a Defect manifests and is recorded; another Defect elsewhere that may explain it (Review may find that one independently and it is born with its own proving Test Case, and neither proves or replaces the other); and where Architecture decides the correction belongs, which is Architecture's `addresses:` relationship to the Defect (see kaal-architecture). A Defect is never moved and carries no field that says where its correction belongs.
