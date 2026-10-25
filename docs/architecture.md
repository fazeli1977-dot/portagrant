# Architecture

## Actors

- **Sponsor**: creates a grant and controls milestone approval.
- **Builder**: submits evidence references and receives released funds.
- **Portaldot contract**: holds escrow, records state, emits evidence/release events, and enforces authorization.

## Implemented local flow

```text
Browser dashboard -> in-memory simulated milestones and escrow
                     (no RPC calls, wallet signing or contract writes)
Node inspect helper -> configured RPC -> existing ink! contract reads
Node deploy helper -> network/budget gates -> preflight
                                         -> explicit broadcast -> finalized receipt
Rust unit tests -> ink! off-chain test environment
```

The dashboard is not connected to either helper. These paths require configuration
and do not establish that a live deployment exists.

## Planned browser integration (not implemented)

```text
Sponsor/Builder wallet
        │
        ▼
Frontend dashboard ── injected provider / RPC ──► PortaGrant ink! contract
                                                     │
                          ┌──────────────────────────┼──────────────────────────┐
                          ▼                          ▼                          ▼
                    Grant registry            Evidence records             Escrow release
```

## Invariants

1. `create_grant` accepts only matching non-empty title/amount arrays.
2. Every milestone amount is positive and the transferred value equals the checked total.
3. Only the builder can submit evidence for its grant.
4. Only the sponsor can approve a submitted milestone.
5. A milestone can be released once; the contract marks the grant `Completed` only after all releases.
6. No private key or seed phrase is handled by the frontend or committed to the repository.

## Read integration

`get_grant` returns the grant-level escrow state, while `get_milestones` returns every milestone in its stored order. The Node `npm run inspect` helper queries both methods and prints one JSON document, so dashboards and indexers do not need to infer the milestone count or issue one RPC call per milestone.

## Extension path

- Replace evidence strings with content-addressed hashes and optional IPFS/Arweave links.
- Add a token-asset escrow adapter for ERC-20-compatible assets.
- Add an EVM-facing adapter for Portaldot V3's dual execution environment.
- Add indexer-backed grant discovery and community voting without changing escrow rules.
