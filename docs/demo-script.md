# Presentation script

## Available now: local simulation (90 seconds)

1. Introduce milestone-based grants and show the architecture document.
2. Open the dashboard and point out the persistent DEMO MODE label.
3. Simulate builder evidence for the first milestone, then sponsor approval.
4. Show remaining illustrative escrow decreasing from 1,200 to 600 POT.
5. Complete the second milestone and show DEMO COMPLETED and zero remaining escrow.
6. Reset the grant and check wallet detection; explain that it does not request
   account access, connect to a chain, sign, or transfer funds.
7. Show the passing test suite and source code. State that testnet deployment
   remains pending; do not display invented addresses or transaction hashes.

## After real deployment

Replace the simulation segment with actual create-grant, builder-evidence,
sponsor-approval, and completed-state operations using the configured contract
and a compatible signing interface. Show verified explorer records from
`docs/deployment.md`. The current browser dashboard does not implement signing.

Never include seed phrases, private keys, RPC credentials, or local `.env`
values in the recording.
