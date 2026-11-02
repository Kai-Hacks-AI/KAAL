# Refresh Foundation C12 after C15 PLAN integration

Capability owner: Foundation. This is the existing #749 C12 Change refreshed
onto kaal/foundation d1d3cbb948b988ec3f0f2423f61f997fb2f29aa3 after #836.

All six C12 destination blobs are exactly #749 head
2ab6d3bf4092e1bc0f1fe2885cb200b0b5fdae42, including the exact planned T35/T36
publisher file; its old test/plan path is removed. There is no new declaration,
version bump, export, lifecycle meaning, test amendment or shipped byte beyond
what #749 already proposed. This record supplies the current Change envelope.

The approved C15 PLAN and its unenrolled delivery cases remain intact. C16 #838
continues separately and must refresh its own provisional Change Record after
C12's actual integration. The published Foundation 0.0.1 artifact is untouched.

This branch is a reviewable refresh candidate, not #749's active head. Its
existing auto-merge must be disarmed before applying a refresh to #749. No
protected ref, PR approval, merge, SYNC, promotion or publication is authorized
by preparing this candidate. Fresh required CI and independent review remain.
