# Intent

Make KAAL installable into an arbitrary repository without relying on KAAL's own genesis-specific bootstrap.

A fresh repository shall be able to receive Core, select KAAL capabilities, register and project those capabilities through KAAL's existing meanings and machinery, and wire the Agent entrypoint so the resulting repository contains a valid installed KAAL.

The mechanism must not encode knowledge of the first real host. Prove it against the private `Kai-Hacks-AI/Enercon` repository as an external host, using the ordinary organization-member access available to `ChBrain`, not organization-owner privilege.

The Change should resolve the currently explicit gap in `kaal-install`: how a first Skill is selected on a generic fresh checkout.

Do not redesign Changing, Sealing, CASE, or the existing capability model unless the bootstrap requirement exposes a necessary defect in them. The goal is the missing transition:

`non-KAAL repository → installed, composed KAAL`
