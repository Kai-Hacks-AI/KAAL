---
name: Change Classification
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Change Classification

A Change is classified as Normal, Standard or Emergency. The class says how a Change is governed as a Change: how it is assessed, and how its authorization is reached. The class is not a state of the Change's lifecycle, and it is not where the Change lands.

A **Normal Change** is assessed and authorized on its own: its scope, risks and evidence are judged for this Change before it is accepted. It is the default class. Governance beyond the Change, such as a Project, may be added over one or more Normal Changes where it is warranted. No Normal Change needs it merely by being one.

A **Standard Change** follows a procedure that has already been assessed and authorized as a whole, for Changes that are recurrent, bounded and low in risk. Each Change that stays within the procedure is authorized by it, and one that leaves it is a Normal Change. Authorizing the procedure is itself a Normal Change.

An **Emergency Change** is one whose urgency decides that it cannot wait for the usual order of work. Urgency changes when and in what order it is assessed and authorized. It does not remove its assessment, authorization, verification or evidence, and it is reviewed afterwards like any other.

The class changes no control. Every class passes the same verification, which is Testing's, the same validation and approval, which are Review's, and the same integration gates, which are Engineering's. A class only says which path to authorization a Change takes. Change defines the classes; a repository that embeds KAAL chooses which of them it applies and how strictly. How a class is realized, such as an urgent correction taking Engineering's hotfix route, belongs to the capability that realizes it.
