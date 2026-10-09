# Defect

Claim: ids are not unique over the life of a ledger (append, append, retract the first, append gives two entries one id).
Affected: architecture.md 52b0f6f31827d9cf2cdce29ba84acdfb4a0f12e5b8482978b6adb189e67ee8c0 ; ledger.mjs bfeb6fc9d45ab96115ccb4b7615c289afbfa7e2a59d614960acda2a85a4f04fe (kept beside this file, because the red test imports it)
Violated: requirements.md 7cdadc4bb5309c1d28efb1ba558d96a0be764aeb16bdd5d6550cbbdccc523ac3, R1
Red test: ids-unique.red.mjs e3476331709fd28572c7ded5e9b40cf0306a89474cdd59df37da2f7f0db948cf
Reproduction: in this directory, node ids-unique.red.mjs . It must exit 1 and print an AssertionError whose message is: R1 violated: ids [2,2] . Any other failure (for example ERR_MODULE_NOT_FOUND) is not this Defect. Before running, check that ledger.mjs here has the identity above and that the red test has the identity above.
Observed: observed.txt
Validity: the Worker's position in dispositions.md (F2) and the round that said it stands, review/02.md ; the finding as first made is in review/01.md
Disposition: later
Reason: correcting it means revising architecture.md, outside the authorized scope of this Work (scope.md)
Established result: architecture.md 52b0f6f31827d9cf2cdce29ba84acdfb4a0f12e5b8482978b6adb189e67ee8c0 is unchanged
