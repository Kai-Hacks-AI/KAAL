---
id: release/CTL30
title: limit Act
description: It reveals an ACT pull request that writes a folder that the ACT route may not write.
type: detective
status: designed
has: [release/I59]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL30 limit Act

A detective control that is meant to become preventive. A pull request that changes a folder or a file that the ACT route writes, today the retros and the legacy `act.md` files, is an ACT, and it may change nothing outside them: once the station `23 - collecting` requires the check of release/A75 on pull requests into a collector, rewriting a Requirement, an Architecture element, source or a Case cannot pass as reflection. A pull request that changes no ACT folder is not asked for anything. It does not say whether the collector is ready (release/CTL24), whether the ACT is present before promotion (release/CTL29) or what the retro contains (`verify Act`). It has one Intent, release/I59, which holds the details with the Requirements and Architecture under it. It rolls out detective first: (1) its verdict is observed on real ACT pull requests without blocking; (2) it runs as an advisory CI check behind a feature flag and the evidence is collected; (3) only after validation and the Owner's explicit authorization is it declared on the station and loaded by the Owner, and from then on the control is preventive and its type changes in the Change that makes it so. The judge only judges; once the check is required UNKNOWN does not pass.
