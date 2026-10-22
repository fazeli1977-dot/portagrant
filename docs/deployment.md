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

## Deployment safety gates

The helper now defaults to read-only preflight: it does not sign or broadcast
unless `DEPLOY_BROADCAST=yes` is explicitly configured. Preflight still needs
the configured local signer to derive its public address; never share its URI.
Pin `EXPECTED_GENESIS_HASH` using an independently verified testnet source.
A mismatch or a runtime without `contracts.instantiateWithCode` aborts.

Set positive integer `DEPLOY_GAS_REF_TIME`, `DEPLOY_GAS_PROOF_SIZE`,
`DEPLOY_STORAGE_LIMIT`, and `DEPLOY_MAX_ESTIMATED_FEE` after reviewing the
target runtime. Monetary limits use atomic units, not displayed token amounts.
No default network, unbounded storage deposit, or implicit broadcast is used.
The helper prints resource limits and the estimated fee before broadcasting;
estimates above the configured ceiling abort. This is an estimate, not an
on-chain fee cap or constructor execution dry-run. Runtime changes can affect
actual fees. Check constructor execution and available balance independently,
then explicitly approve broadcast. Connection/finality timeouts do not bound
the node's fee-estimation RPC response time.

The external deployment prerequisite remains unresolved: no verified testnet
RPC/genesis or funded testnet signer has been supplied. Browser signing is not
implemented. Neither local validation nor preflight proves a live deployment.
