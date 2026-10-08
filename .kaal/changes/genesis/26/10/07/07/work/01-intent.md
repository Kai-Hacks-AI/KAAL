# Intent

Establish two optional KAAL Skills through which a KAAL client can deliberately communicate experience back toward KAAL:

* KAAL Incident — record that something involving the client's embedded KAAL happened that should not have happened or that expected KAAL behaviour failed.
* KAAL Request — record something the client wants from KAAL that is not presently available or sufficient.

These Skills are recommended capabilities for clients that want a structured communication channel with KAAL. They are not Core, are not required for a valid KAAL embedding, and must not be installed automatically merely because KAAL is embedded.
A client remains responsible for distinguishing its own Incidents and Requests from those it deliberately addresses to KAAL. Using these Skills means the carrier is addressed to KAAL; they do not replace or govern the client's own incident, defect, backlog, idea or request mechanisms.
The Skills shall record their carriers locally with the client's embedded KAAL so that the communication remains available for later collection by KAAL.
Do not establish transport, synchronization, GitHub Issues, automatic submission, central backlog behaviour, or a harvesting protocol in this Change. Creation and local carriage are the concern here; collection is a separate problem.
Do not encode Enercon or any other particular client into the capabilities.
The result should make this relationship possible:
`KAAL client → KAAL Incident / KAAL Request → locally carried with embedded KAAL → later harvestable by KAAL`
Let the Work determine the smallest forms and machinery necessary to establish those two capabilities without inventing a larger service-management model.
