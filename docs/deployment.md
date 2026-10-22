# Deployment record

## Repository and local build

- Public source: https://github.com/fazeli1977-dot/portagrant
- WASM artifact: contracts/portagrant/target/wasm32-unknown-unknown/release/portagrant.wasm
- Recompute SHA-256 after building: `Get-FileHash contracts/portagrant/target/wasm32-unknown-unknown/release/portagrant.wasm -Algorithm SHA256`
- Local build evidence is recorded in `docs/checkpoint-2-audit.md`; it is not a deployment receipt.

## Testnet deployment

**Not deployed or independently verified.** A compatible Portaldot RPC,
metadata-bearing contract bundle, and funded testnet signer are still required.

| Network | Contract address | Constructor tx | Finalized block | Explorer |
|---|---|---|---|---|
| Portaldot testnet | pending | pending | pending | pending |

## Interaction evidence

| UTC timestamp | Method | Signer | Transaction hash | Explorer |
|---|---|---|---|---|
| pending | create_grant | pending | pending | pending |
| pending | submit_evidence | pending | pending | pending |
| pending | approve_milestone | pending | pending | pending |

The deployment helper prints an address, transaction hash, finalized block,
local UTC observation time, and public signer only after finalization.
`DEPLOY_TIMEOUT_MS` bounds connection and finality waits (default 120000 ms each).
A timeout or dropped subscription does not prove non-execution: inspect the
chain before retrying to avoid deploying twice. Gas and storage-deposit limits
must be reviewed for the target runtime before sending a transaction.

Only replace pending values with real testnet evidence. Never invent addresses
or hashes or describe the browser simulation as an on-chain demonstration.
