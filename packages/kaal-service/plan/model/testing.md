# Service Management Model: Testing

The planned outer tests live in `packages/kaal-service/test/plan/model.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `service/C2` turns them GREEN and adds them to Service's `npm test`.

| Test | Checks | Loop |
| --- | --- | --- |
| service/T1: `Agreement`, `composes`, `covers` and `underpins` are in Form, typed by Core's KAAL Definition, and admitted with Service's contribution | service/F2, service/F3, service/F4, service/A1 | Architecture |
| service/T2: a Service's owner is a declared role label, not an Edge and not resolved, and independent of the Capability that provides it | service/F1, service/I1 | Intent |
| service/T3: Graph derives what a supporting Service supports, across two levels, from the `composes` Edges the composed Services carry | service/F2, service/I2 | Requirements |
| service/T4: an SLA covers a Service, and an OLA and a UC underpin it, each with its kind and parties as declared; Graph derives each target's Agreements | service/F3, service/F4, service/I3 | Requirements |
| service/T5: no text Service delivers or plans names a customer organization or a tool realization, checked by hashed words so the names never enter KAAL | service/N1 | Architecture |

What stays validation: whether the Definitions say what the Owner meant, whether a declared owner label names the right role, and whether an Agreement's declared kind is right for its parties. No test checks that an owner label resolves, because S3a promises none (service/I1).

## RED evidence

The tests run with `npm run build -w kaal-core -w kaal-hosting && node --test packages/kaal-service/test/plan/model.test.mjs`, outside Service's `npm test` until `service/C2`. At `service/C1`:
- **service/T1 to service/T4 are RED**, blocked before behavioural assertion, because `capability/Agreement.md` does not exist. This is planning evidence that the tests run and wait on the DO, not discriminating behavioural RED. It establishes nothing about the model.
- **Discriminating evidence is `service/C2`'s.** With the Definitions present, its CHECK shows each of T2 to T4 failing against a wrong model and passing against the planned one: the owner carried as an Edge or the provider read from the owner (T2), a supporting Service listing what it supports (T3), and an Agreement whose kind or `covers` target differs from its declaration (T4).
- **service/T5 is GREEN.** It guards the boundary from the start.
