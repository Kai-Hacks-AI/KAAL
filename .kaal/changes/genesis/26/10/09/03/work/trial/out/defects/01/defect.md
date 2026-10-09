# Defect

Claim: ids are not unique over the life of a ledger (append, append, retract the first, append gives two entries one id).
Affected: architecture.md 52b0f6f31827d9cf2cdce29ba84acdfb4a0f12e5b8482978b6adb189e67ee8c0 ; ledger.mjs bfeb6fc9d45ab96115ccb4b7615c289afbfa7e2a59d614960acda2a85a4f04fe
Violated: requirements.md 7cdadc4bb5309c1d28efb1ba558d96a0be764aeb16bdd5d6550cbbdccc523ac3, R1
Reproduction: from the directory holding ledger.mjs, node ids-unique.red.mjs ; it exits 1
Red test: ids-unique.red.mjs e3476331709fd28572c7ded5e9b40cf0306a89474cdd59df37da2f7f0db948cf ; its observed output is in observed.txt
Validity: reproduced by the Worker (dispositions.md F2) and stated to stand in review/02.md
Disposition: later
Reason: correction means revising architecture.md, outside the authorized scope of this Work
Established result: architecture.md 52b0f6f31827d9cf2cdce29ba84acdfb4a0f12e5b8482978b6adb189e67ee8c0 is unchanged
